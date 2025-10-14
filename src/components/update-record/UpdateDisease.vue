<script>
import {
  fetchAndLogApiResponseErrorMsg,
  fetchAndLogGeneralErrorMsg,
} from "../../utility/ErrorUtility.js";
import {
  CROSS_REFERENCE_URL,
  GENE_DISEASE_URL,
  MONDO_URL,
  OMIM_URL,
  UPDATE_CROSS_REFERENCE_URL,
} from "../../utility/UrlConstants.js";
import api from "../../services/api.js";
import DeleteCrossReferenceModal from "../modal/DeleteCrossReferenceModal.vue";
import { mapState } from "pinia";
import { useAuthStore } from "../../store/auth.js";

export default {
  props: {
    stableId: String,
    gene: String,
    diseaseName: String,
    currentCrossReferences: Array,
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchGeneDiseaseData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  data() {
    return {
      crossReferences: this.currentCrossReferences,
      crossReferenceToDelete: null,
      selectedCrossReferenceIds: [],
      // allSuggestedCrossReferences keeps track of all suggested cross references provided by API
      allSuggestedCrossReferences: [],
      // filteredSuggestedCrossReferences keeps track of filtered suggested cross references based on user actions
      filteredSuggestedCrossReferences: [],
      fetchedInputCrossReferences: [],
      inputCrossReferencesStr: "",
      isInputCrossReferencesStrValid: true,
      inputCrossReferencesStrInvalidMsg: null,
      isGeneDiseaseDataLoading: false,
      geneDiseaseErrorMsg: null,
      addApiCallErrorMsg: null,
      isAddApiCallLoading: false,
      isAddApiCallSuccess: false,
      addApiCallSuccessMsg: null,
      deleteApiCallErrorMsg: null,
      isDeleteApiCallLoading: false,
      isDeleteApiCallSuccess: false,
      deleteApiCallSuccessMsg: null,
      isFetchInputCrossReferencesApiCallLoading: false,
      fetchInputCrossReferencesApiCallErrorMsg: null,
      addInputCrossReferencesApiCallErrorMsg: null,
      isAddInputCrossReferencesApiCallLoading: false,
      isAddInputCrossReferencesApiCallSuccess: false,
      addInputCrossReferencesApiCallSuccessMsg: null,
      OMIM_URL,
      MONDO_URL,
    };
  },
  components: {
    DeleteCrossReferenceModal,
  },
  computed: {
    ...mapState(useAuthStore, ["isSuperUser"]),
  },
  methods: {
    fetchGeneDiseaseData() {
      this.geneDiseaseErrorMsg = null;
      this.allSuggestedCrossReferences = [];
      this.filteredSuggestedCrossReferences = [];
      this.isGeneDiseaseDataLoading = true;
      api
        .get(GENE_DISEASE_URL.replace(":locus", this.gene))
        .then((response) => {
          if (response.data?.results) {
            /*
              Transform API response format to required format:
              API response format:
              [
                {
                  identifier: "...",
                  source: "...",
                  disease_name: "...",
                  original_disease_name: "...",
                },
              ]
              Required format:
              [
                {
                  accession: "...",
                  source: "...",
                  term: "...",
                  description: "...",
                }
              ]
            */
            let crossReferencesResponse = [];
            response.data.results.forEach((item) => {
              crossReferencesResponse.push({
                accession: item.identifier,
                source: item.source,
                term: item.disease_name,
                description: item.disease_name,
              });
            });
            this.allSuggestedCrossReferences = crossReferencesResponse;
            // filter out existing cross references from allSuggestedCrossReferences list
            this.filteredSuggestedCrossReferences =
              this.getFilteredSuggestedCrossReferences();
          }
        })
        .catch((error) => {
          if (error.response?.status !== 404) {
            this.geneDiseaseErrorMsg = fetchAndLogGeneralErrorMsg(
              error,
              "Unable to fetch cross references. Please try again later."
            );
          }
          /*
            IF API response gives 404 status,
            THEN no changes required 
            because allSuggestedCrossReferences and filteredSuggestedCrossReferences are already set to empty lists 
            before calling the API
          */
        })
        .finally(() => {
          this.isGeneDiseaseDataLoading = false;
        });
    },
    resetApiCallVariables() {
      this.addApiCallErrorMsg = null;
      this.addApiCallSuccessMsg = null;
      this.isAddApiCallSuccess = false;
      this.deleteApiCallErrorMsg = null;
      this.deleteApiCallSuccessMsg = null;
      this.isDeleteApiCallSuccess = false;
      this.fetchInputCrossReferencesApiCallErrorMsg = null;
      this.addInputCrossReferencesApiCallErrorMsg = null;
      this.addInputCrossReferencesApiCallSuccessMsg = null;
      this.isAddInputCrossReferencesApiCallSuccess = false;
    },
    addSelectedCrossReferences() {
      this.resetApiCallVariables();
      this.isAddApiCallLoading = true;
      /*
       Logic to prepare request body for API call:
       selectedCrossReferenceIds only has the selected accessions
       so get the full objects of the selected accessions from allSuggestedCrossReferences list
      */
      let selectedCrossReferenceObjList = [];
      this.allSuggestedCrossReferences.forEach((item) => {
        if (this.selectedCrossReferenceIds.includes(item.accession)) {
          selectedCrossReferenceObjList.push(item);
        }
      });
      const requestBody = {
        disease_ontologies: selectedCrossReferenceObjList,
      };
      api
        .post(
          UPDATE_CROSS_REFERENCE_URL.replace(":diseasename", this.diseaseName),
          requestBody
        )
        .then((response) => {
          this.isAddApiCallSuccess = true;
          this.addApiCallSuccessMsg = response.data.message;
          // Add the selected cross references to crossReferences list
          this.crossReferences.push(...selectedCrossReferenceObjList);
          // Since crossReferences list has been updated, filter out updated crossReferences list
          this.filteredSuggestedCrossReferences =
            this.getFilteredSuggestedCrossReferences();
          // Clear selectedCrossReferenceIds list
          this.selectedCrossReferenceIds = [];
        })
        .catch((error) => {
          this.addApiCallErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to add cross references. Please try again later.",
            "Unable to add cross references."
          );
        })
        .finally(() => {
          this.isAddApiCallLoading = false;
        });
    },
    deleteCrossReference() {
      if (!this.crossReferenceToDelete) {
        return;
      }
      this.resetApiCallVariables();
      this.isDeleteApiCallLoading = true;
      /*
      The DELETE API expects the following request body json:
      {
        accession: "..."
      }
      However, to send a request body for a DELETE API call using Axios, the Axios instance expects the following json:
      {
        data: 
          {
            accession: "..."
          }
      }
     */
      const requestBody = {
        data: {
          accession: this.crossReferenceToDelete,
        },
      };
      api
        .delete(
          UPDATE_CROSS_REFERENCE_URL.replace(":diseasename", this.diseaseName),
          requestBody
        )
        .then((response) => {
          this.isDeleteApiCallSuccess = true;
          this.deleteApiCallSuccessMsg = response.data.message;
          // Remove the deleted cross reference from crossReferences list
          this.crossReferences = this.crossReferences.filter(
            (item) => item.accession !== this.crossReferenceToDelete
          );
          // Since crossReferences list has been updated, filter out updated crossReferences list
          this.filteredSuggestedCrossReferences =
            this.getFilteredSuggestedCrossReferences();
          // Clear crossReferenceToDelete
          this.clearCrossReferenceToDelete();
        })
        .catch((error) => {
          this.deleteApiCallErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to delete cross reference. Please try again later.",
            "Unable to delete cross reference."
          );
        })
        .finally(() => {
          this.isDeleteApiCallLoading = false;
        });
    },
    setCrossReferenceToDelete(accession) {
      // Set crossReferenceToDelete
      this.crossReferenceToDelete = accession;
    },
    clearCrossReferenceToDelete() {
      // Clear crossReferenceToDelete
      this.crossReferenceToDelete = null;
    },
    getFilteredSuggestedCrossReferences() {
      // Filter out items in crossReferences list from allSuggestedCrossReferences list
      const existingCrossReferenceIds = this.crossReferences.map(
        (item) => item.accession
      );
      return this.allSuggestedCrossReferences.filter(
        (item) => !existingCrossReferenceIds.includes(item.accession)
      );
    },
    validateInputCrossReferences() {
      // check if inputCrossReferencesStr is empty string
      if (this.inputCrossReferencesStr.trim() === "") {
        this.inputCrossReferencesStrInvalidMsg = "Input is empty";
        return false;
      }

      // convert inputCrossReferencesStr string to list of pmids
      // Eg: "1;2;3;" => ["1","2","3"]
      const inputCrossReferencesList = this.inputCrossReferencesStr
        .trim()
        .split(";")
        .filter((item) => item);

      // check for format of input cross references
      // Currently, only MONDO terms are supported, so the format must be MONDO:#######
      // TODO: Remove this check, when OMIM terms are also supported
      const invalidFormatCrossReferencesList = inputCrossReferencesList.filter(
        (item) => !item.startsWith("MONDO:")
      );
      if (invalidFormatCrossReferencesList.length > 0) {
        this.inputCrossReferencesStrInvalidMsg = `Invalid format for term(s): ${invalidFormatCrossReferencesList.join(
          ", "
        )}. Expected format MONDO:#######`;
        return false;
      }

      // check for duplicate input cross references
      const duplicateCrossReferencesList = inputCrossReferencesList.filter(
        (item, index) => inputCrossReferencesList.indexOf(item) !== index
      );
      if (duplicateCrossReferencesList.length > 0) {
        this.inputCrossReferencesStrInvalidMsg = `Duplicate term(s): ${duplicateCrossReferencesList.join(
          ", "
        )}`;
        return false;
      }

      // check if any input cross reference exists in fetched cross references
      const fetchedInputCrossReferencesAccessionList =
        this.fetchedInputCrossReferences.map((item) =>
          item.accession.toString()
        );
      const crossReferencesExistingFetchedList =
        inputCrossReferencesList.filter((item) =>
          fetchedInputCrossReferencesAccessionList.includes(item)
        );
      if (crossReferencesExistingFetchedList.length > 0) {
        this.inputCrossReferencesStrInvalidMsg = `Term(s) already fetched below: ${crossReferencesExistingFetchedList.join(
          ", "
        )}`;
        return false;
      }

      // check if any input cross reference exists in current cross references
      const currentCrossReferencesList = this.crossReferences.map((item) =>
        item.accession.toString()
      );
      const crossReferencesAlreadyExistingList =
        inputCrossReferencesList.filter((item) =>
          currentCrossReferencesList.includes(item)
        );
      if (crossReferencesAlreadyExistingList.length > 0) {
        this.inputCrossReferencesStrInvalidMsg = `Term(s) already exist(s): ${crossReferencesAlreadyExistingList.join(
          ", "
        )}`;
        return false;
      }

      // check if any input cross reference exists in suggested cross references
      const suggestedCrossReferencesList =
        this.filteredSuggestedCrossReferences.map((item) =>
          item.accession.toString()
        );
      const crossReferencesAlreadySuggestedList =
        inputCrossReferencesList.filter((item) =>
          suggestedCrossReferencesList.includes(item)
        );
      if (crossReferencesAlreadySuggestedList.length > 0) {
        this.inputCrossReferencesStrInvalidMsg = `Term(s) already suggested above: ${crossReferencesAlreadySuggestedList.join(
          ", "
        )}`;
        return false;
      }

      // if inputCrossReferencesStr passed all above checks, then it is valid
      return true;
    },
    fetchInputCrossReferences() {
      // if inputCrossReferencesStr is invalid then set isInputCrossReferencesStrValid to false and dont continue further
      if (!this.validateInputCrossReferences()) {
        this.isInputCrossReferencesStrValid = false;
        return;
      }
      // if inputCrossReferencesStr is valid then continue further
      this.isInputCrossReferencesStrValid = true;
      this.inputCrossReferencesStrInvalidMsg = "";
      this.resetApiCallVariables();
      this.isFetchInputCrossReferencesApiCallLoading = true;
      const crossReferencesListStr = this.inputCrossReferencesStr
        .trim()
        .split(";")
        .filter((item) => item)
        .join(",");
      api
        .get(
          CROSS_REFERENCE_URL.replace(
            ":crossreferences",
            crossReferencesListStr
          )
        )
        .then((response) => {
          if (response.data?.results) {
            /*
              Transform API response format to required format:
              API response format:
              [
                {
                  identifier: "...",
                  source: "...",
                  disease: "..."
                },
              ]
              Required format:
              [
                {
                  accession: "...",
                  source: "...",
                  term: "...",
                  description: "...",
                }
              ]
            */
            let crossReferencesResponse = [];
            response.data.results.forEach((item) => {
              crossReferencesResponse.push({
                accession: item.identifier,
                source: item.source,
                term: item.disease,
                description: item.disease,
              });
            });
            this.fetchedInputCrossReferences.push(...crossReferencesResponse);
            // clear inputCrossReferencesStr
            this.inputCrossReferencesStr = "";
          }
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            this.fetchInputCrossReferencesApiCallErrorMsg =
              fetchAndLogApiResponseErrorMsg(
                error,
                error?.response?.data?.error,
                "Unable to fetch cross references data. Please try again later.",
                "Unable to fetch cross references data."
              );
          } else {
            this.fetchInputCrossReferencesApiCallErrorMsg =
              fetchAndLogGeneralErrorMsg(
                error,
                "Unable to fetch cross references data. Please try again later."
              );
          }
        })
        .finally(() => {
          this.isFetchInputCrossReferencesApiCallLoading = false;
        });
    },
    addInputCrossReferences() {
      this.resetApiCallVariables();
      this.isAddInputCrossReferencesApiCallLoading = true;

      const requestBody = {
        disease_ontologies: this.fetchedInputCrossReferences,
      };
      api
        .post(
          UPDATE_CROSS_REFERENCE_URL.replace(":diseasename", this.diseaseName),
          requestBody
        )
        .then((response) => {
          this.isAddInputCrossReferencesApiCallSuccess = true;
          this.addInputCrossReferencesApiCallSuccessMsg = response.data.message;
          // Add the fetchedInputCrossReferences to crossReferences list
          this.crossReferences.push(...this.fetchedInputCrossReferences);
          // Clear fetchedInputCrossReferences list
          this.fetchedInputCrossReferences = [];
        })
        .catch((error) => {
          this.addInputCrossReferencesApiCallErrorMsg =
            fetchAndLogApiResponseErrorMsg(
              error,
              error?.response?.data?.error,
              "Unable to add cross references. Please try again later.",
              "Unable to add cross references."
            );
        })
        .finally(() => {
          this.isAddInputCrossReferencesApiCallLoading = false;
        });
    },
    removeInputCrossReference(accessionToRemove) {
      this.fetchedInputCrossReferences =
        this.fetchedInputCrossReferences.filter(
          (item) => item.accession !== accessionToRemove
        );
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="update-disease-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#update-disease-section-body"
          aria-expanded="false"
          aria-controls="update-disease-section-body"
        >
          Disease Cross References
          <span
            class="badge rounded-pill text-bg-success mx-2"
            v-if="isAddApiCallSuccess || isDeleteApiCallSuccess"
          >
            <i class="bi bi-check-circle-fill"></i> Updated
          </span>
        </button>
      </h2>
      <div id="update-disease-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <div class="row g-3 p-2">
            <h5>Disease Name</h5>
            <a
              v-if="diseaseName"
              :href="`/gene2phenotype/disease/${diseaseName}`"
              style="text-decoration: none"
              target="_blank"
              class="pt-0 mt-0"
            >
              {{ diseaseName }}
            </a>
            <p v-else class="text-muted pt-0 mt-0">Not Available</p>
            <div
              class="d-flex justify-content-center"
              v-if="
                isGeneDiseaseDataLoading ||
                isAddApiCallLoading ||
                isDeleteApiCallLoading ||
                isFetchInputCrossReferencesApiCallLoading ||
                isAddInputCrossReferencesApiCallLoading
              "
              style="margin-top: 122px; margin-bottom: 122px"
            >
              <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else>
              <h5>Current Cross Reference(s)</h5>
              <table
                v-if="crossReferences.length > 0"
                class="table table-bordered"
              >
                <thead>
                  <tr>
                    <th>Accession</th>
                    <th>Term</th>
                    <th>Source</th>
                    <th v-if="isSuperUser">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in crossReferences" :key="item.accession">
                    <td>
                      <a
                        v-if="item.source === 'OMIM'"
                        :href="OMIM_URL + item.accession"
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ item.accession }}
                      </a>
                      <a
                        v-else-if="item.source === 'Mondo'"
                        :href="MONDO_URL + item.accession"
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ item.accession }}
                      </a>
                      <span v-else>{{ item.accession }}</span>
                    </td>
                    <td>{{ item.term }}</td>
                    <td>{{ item.source }}</td>
                    <td v-if="isSuperUser">
                      <button
                        class="btn btn-outline-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#delete-cross-reference-modal"
                        @click="setCrossReferenceToDelete(item.accession)"
                      >
                        <i class="bi bi-trash-fill"></i> Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else>
                <i class="bi bi-info-circle"></i> No Cross Reference available
                for this disease.
              </p>
              <div
                class="alert alert-danger mt-3"
                role="alert"
                v-if="deleteApiCallErrorMsg"
              >
                <div>
                  <i class="bi bi-exclamation-circle-fill"></i>
                  {{ deleteApiCallErrorMsg }}
                </div>
              </div>
              <div
                class="alert alert-success mt-3"
                role="alert"
                v-if="isDeleteApiCallSuccess"
              >
                <div>
                  <i class="bi bi-check-circle-fill"></i>
                  {{ deleteApiCallSuccessMsg }}
                </div>
              </div>
              <hr />
              <h5 class="mb-3">Add New Cross Reference(s)</h5>
              <div
                v-if="
                  !geneDiseaseErrorMsg &&
                  filteredSuggestedCrossReferences?.length > 0
                "
              >
                <h6 class="mb-3">Suggested Cross Reference(s)</h6>
                <table class="table table-hover table-bordered">
                  <thead>
                    <tr>
                      <th style="width: 5%">Link</th>
                      <th>Accession</th>
                      <th>Term</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in filteredSuggestedCrossReferences"
                      :key="item.accession"
                    >
                      <td class="text-center" style="width: 5%">
                        <input
                          type="checkbox"
                          :id="`cross-reference-link-input-${item.accession}`"
                          :value="item.accession"
                          v-model="selectedCrossReferenceIds"
                        />
                      </td>
                      <td>
                        <a
                          :href="OMIM_URL + item.accession"
                          style="text-decoration: none"
                          v-if="item.source === 'OMIM'"
                          target="_blank"
                        >
                          {{ item.accession }}
                        </a>
                        <a
                          :href="MONDO_URL + item.accession"
                          style="text-decoration: none"
                          v-else-if="item.source === 'Mondo'"
                          target="_blank"
                        >
                          {{ item.accession }}
                        </a>
                        <span v-else>{{ item.accession }}</span>
                      </td>
                      <td>{{ item.term }}</td>
                      <td>{{ item.source }}</td>
                    </tr>
                  </tbody>
                </table>
                <button
                  type="button"
                  :class="
                    selectedCrossReferenceIds?.length === 0
                      ? 'btn btn-secondary'
                      : 'btn btn-primary'
                  "
                  @click="addSelectedCrossReferences"
                  :disabled="selectedCrossReferenceIds?.length === 0"
                >
                  <i class="bi bi-plus-circle-fill"></i> Add cross references
                </button>
              </div>
              <div
                class="alert alert-danger mt-3"
                role="alert"
                v-else-if="geneDiseaseErrorMsg"
              >
                <div>
                  <i class="bi bi-exclamation-circle-fill"></i>
                  {{ geneDiseaseErrorMsg }}
                </div>
              </div>
              <p v-else>
                <i class="bi bi-info-circle"></i> No Cross Reference is
                available to add.
              </p>
              <div
                class="alert alert-danger mt-3"
                role="alert"
                v-if="addApiCallErrorMsg"
              >
                <div>
                  <i class="bi bi-exclamation-circle-fill"></i>
                  {{ addApiCallErrorMsg }}
                </div>
              </div>
              <div
                class="alert alert-success mt-3"
                role="alert"
                v-if="isAddApiCallSuccess"
              >
                <div>
                  <i class="bi bi-check-circle-fill"></i>
                  {{ addApiCallSuccessMsg }}
                </div>
              </div>
              <hr />
              <h5>Add Other Mondo Term(s)</h5>
              <div class="row g-3 py-3">
                <div class="col-auto">
                  <label for="cross-references-input" class="col-form-label">
                    Mondo Term(s)
                  </label>
                </div>
                <div class="col-4">
                  <textarea
                    :class="
                      isInputCrossReferencesStrValid
                        ? 'form-control'
                        : 'form-control is-invalid'
                    "
                    id="cross-references-input"
                    v-model="inputCrossReferencesStr"
                    rows="3"
                    aria-describedby="invalid-cross-references-input-feedback"
                  >
                  </textarea>
                  <div
                    id="invalid-cross-references-input-feedback"
                    class="invalid-feedback"
                  >
                    {{ inputCrossReferencesStrInvalidMsg }}
                  </div>
                  <div class="form-text" id="cross-references-input-help-text">
                    For multiple entries, separate by semicolon
                  </div>
                </div>
                <div class="col-auto">
                  <button
                    type="button"
                    class="btn btn-primary mb-3"
                    @click="fetchInputCrossReferences"
                  >
                    <i class="bi bi-search"></i> Search
                  </button>
                </div>
              </div>
              <div
                class="alert alert-danger mt-3"
                role="alert"
                v-if="fetchInputCrossReferencesApiCallErrorMsg"
              >
                <div>
                  <i class="bi bi-exclamation-circle-fill"></i>
                  {{ fetchInputCrossReferencesApiCallErrorMsg }}
                </div>
              </div>
              <div v-if="fetchedInputCrossReferences?.length > 0">
                <p class="mb-3">
                  <i class="bi bi-info-circle"></i> Verify the following Mondo
                  term(s) and click <b>Add Mondo Terms</b> to add them.
                </p>
                <h6 class="mb-3">Fetched Mondo Term(s)</h6>
                <table class="table table-hover table-bordered">
                  <thead>
                    <tr>
                      <th>Accession</th>
                      <th>Term</th>
                      <th>Source</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in fetchedInputCrossReferences"
                      :key="item.accession"
                    >
                      <td>
                        <a
                          :href="OMIM_URL + item.accession"
                          style="text-decoration: none"
                          v-if="item.source === 'OMIM'"
                          target="_blank"
                        >
                          {{ item.accession }}
                        </a>
                        <a
                          :href="MONDO_URL + item.accession"
                          style="text-decoration: none"
                          v-else-if="item.source === 'Mondo'"
                          target="_blank"
                        >
                          {{ item.accession }}
                        </a>
                        <span v-else>{{ item.accession }}</span>
                      </td>
                      <td>{{ item.term }}</td>
                      <td>{{ item.source }}</td>
                      <td>
                        <button
                          type="button"
                          class="btn btn-outline-danger"
                          @click="removeInputCrossReference(item.accession)"
                        >
                          <i class="bi bi-trash-fill"></i> Remove
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="addInputCrossReferences"
                >
                  <i class="bi bi-plus-circle-fill"></i> Add Mondo Terms
                </button>
              </div>
              <div
                class="alert alert-danger mt-3"
                role="alert"
                v-if="addInputCrossReferencesApiCallErrorMsg"
              >
                <div>
                  <i class="bi bi-exclamation-circle-fill"></i>
                  {{ addInputCrossReferencesApiCallErrorMsg }}
                </div>
              </div>
              <div
                class="alert alert-success mt-3"
                role="alert"
                v-if="isAddInputCrossReferencesApiCallSuccess"
              >
                <div>
                  <i class="bi bi-check-circle-fill"></i>
                  {{ addInputCrossReferencesApiCallSuccessMsg }}
                </div>
              </div>
            </div>
          </div>
          <DeleteCrossReferenceModal
            :accession="crossReferenceToDelete"
            @cancel="clearCrossReferenceToDelete"
            @delete="deleteCrossReference"
          />
        </div>
      </div>
    </div>
  </div>
</template>
