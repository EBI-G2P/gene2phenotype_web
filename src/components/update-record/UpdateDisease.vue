<script>
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";
import {
  CROSS_REFERENCES_URL,
  UPDATE_CROSS_REFERENCE_URL,
} from "../../utility/UrlConstants.js";
import api from "../../services/api.js";
import ToolTip from "../tooltip/ToolTip.vue";
import { HELP_TEXT } from "../../utility/Constants.js";

export default {
  props: {
    stableId: String,
    diseaseName: String,
    currentCrossReferences: Array,
  },
  data() {
    return {
      crossReferences: this.currentCrossReferences,
      inputCrossReferences: "",
      isInputCrossReferencesValid: true,
      inputCrossReferencesInvalidMsg: null,
      newCrossReferences: [],
      fetchApiCallErrorMsg: null,
      isFetchApiCallLoading: false,
      addApiCallErrorMsg: null,
      isAddApiCallLoading: false,
      isAddApiCallSuccess: false,
      addApiCallSuccessMsg: null,
      deleteApiCallErrorMsg: null,
      isDeleteApiCallLoading: false,
      isDeleteApiCallSuccess: false,
      deleteApiCallSuccessMsg: null,
      HELP_TEXT,
    };
  },
  components: {
    ToolTip,
  },
  methods: {
    resetApiCallVariables() {
      this.fetchApiCallErrorMsg = null;
      this.addApiCallErrorMsg = null;
      this.addApiCallSuccessMsg = null;
      this.isAddApiCallSuccess = false;
      this.deleteApiCallErrorMsg = null;
      this.deleteApiCallSuccessMsg = null;
      this.isDeleteApiCallSuccess = false;
    },
    fetchCrossReferences() {
      // if inputCrossReferences is invalid then set isInputCrossReferencesValid to false and dont continue further
      if (!this.validateInputCrossReferences()) {
        this.isInputCrossReferencesValid = false;
        return;
      }
      // if inputCrossReferences is valid then continue further
      this.isInputCrossReferencesValid = true;
      this.inputCrossReferencesInvalidMsg = "";
      this.resetApiCallVariables();
      this.isFetchApiCallLoading = true;
      let crossReferencesListStr = this.inputCrossReferences
        .trim()
        .split(";")
        .filter((item) => item)
        .join(",");
      api
        .get(CROSS_REFERENCES_URL.replace(":ids", crossReferencesListStr))
        .then((response) => {
          if (response.data?.results) {
            // Transform fetched cross references into required format
            // Cross reference API response format:
            // [
            //   {
            //     disease: "...",
            //     identifier: "...",
            //     source: "...",
            //   },
            // ]
            // Required format:
            // [
            //   {
            //     term: "...",
            //     description: "...",
            //     accession: "...",
            //     source: "...",
            //   }
            // ]
            let crossReferencesResponse = [];
            response.data.results.forEach((item) => {
              crossReferencesResponse.push({
                accession: item.identifier,
                source: item.source,
                term: item.disease,
                description: item.disease,
              });
            });
            this.newCrossReferences = crossReferencesResponse;
            // clear inputCrossReferences
            this.inputCrossReferences = "";
          }
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            this.fetchApiCallErrorMsg = fetchAndLogApiResponseErrorMsg(
              error,
              error?.response?.data?.error,
              "Unable to fetch cross references. Please try again later.",
              "Unable to fetch cross references."
            );
          } else {
            this.fetchApiCallErrorMsg = fetchAndLogGeneralErrorMsg(
              error,
              "Unable to fetch cross references. Please try again later."
            );
          }
        })
        .finally(() => {
          this.isFetchApiCallLoading = false;
        });
    },
    validateInputCrossReferences() {
      // check if inputCrossReferences is empty string
      if (this.inputCrossReferences.trim() === "") {
        this.inputCrossReferencesInvalidMsg = "Input is empty";
        return false;
      }

      // convert inputCrossReferences string to list of cross references
      // Eg: "1;2;3;" => ["1","2","3"]
      const inputCrossReferencesList = this.inputCrossReferences
        .trim()
        .split(";")
        .filter((item) => item);

      // check for duplicate input cross references
      const duplicateCrossReferencesList = inputCrossReferencesList.filter(
        (item, index) => inputCrossReferencesList.indexOf(item) !== index
      );
      if (duplicateCrossReferencesList.length > 0) {
        this.inputCrossReferencesInvalidMsg = `Duplicate cross references(s): ${duplicateCrossReferencesList.join(
          ", "
        )}`;
        return false;
      }

      // check if any input publication exists in current publications
      const currentCrossReferencesList = this.crossReferences.map((item) =>
        item.accession.toString()
      );
      const crossReferencesAlreadyExistingList =
        inputCrossReferencesList.filter((item) =>
          currentCrossReferencesList.includes(item)
        );
      if (crossReferencesAlreadyExistingList.length > 0) {
        this.inputCrossReferencesInvalidMsg = `Cross reference(s) already exist(s): ${crossReferencesAlreadyExistingList.join(
          ", "
        )}`;
        return false;
      }

      // if inputCrossReferences passed all above checks, then it is valid
      return true;
    },
    addCrossReferences() {
      this.resetApiCallVariables();
      this.isAddApiCallLoading = true;
      const requestBody = {
        disease_ontologies: this.newCrossReferences,
      };
      api
        .post(
          UPDATE_CROSS_REFERENCE_URL.replace(":diseasename", this.diseaseName),
          requestBody
        )
        .then((response) => {
          this.isAddApiCallSuccess = true;
          this.addApiCallSuccessMsg = response.data.message;
          // Add the new cross references to crossReferences list
          this.crossReferences.push(...this.newCrossReferences);
          // Clear newCrossReferences list
          this.newCrossReferences = [];
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
    deleteCrossReference(accessionToDelete) {
      this.resetApiCallVariables();
      this.isDeleteApiCallLoading = true;
      const requestBody = {
        data: {
          accession: accessionToDelete,
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
            (item) => item.accession !== accessionToDelete
          );
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
            <router-link
              v-if="diseaseName"
              :to="`/disease/${diseaseName}`"
              style="text-decoration: none"
            >
              {{ diseaseName }}
            </router-link>
            <p v-else class="text-muted">Not Available</p>
            <div
              class="d-flex justify-content-center"
              v-if="
                isFetchApiCallLoading ||
                isAddApiCallLoading ||
                isDeleteApiCallLoading
              "
              style="margin-top: 122px; margin-bottom: 122px"
            >
              <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else>
              <h5>Current Cross Reference(s)</h5>
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Accession</th>
                    <th>Term</th>
                    <th>Source</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ontologyTerm in crossReferences">
                    <td>
                      <a
                        v-if="ontologyTerm.source === 'OMIM'"
                        :href="`https://www.omim.org/entry/${ontologyTerm.accession}`"
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ ontologyTerm.accession }}
                      </a>
                      <a
                        v-else-if="ontologyTerm.source === 'Mondo'"
                        :href="`https://monarchinitiative.org/${ontologyTerm.accession}`"
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ ontologyTerm.accession }}
                      </a>
                      <span v-else>{{ ontologyTerm.accession }}</span>
                    </td>
                    <td>{{ ontologyTerm.term }}</td>
                    <td>{{ ontologyTerm.source }}</td>
                    <td>
                      <button
                        class="btn btn-outline-danger"
                        @click="deleteCrossReference(ontologyTerm.accession)"
                      >
                        <i class="bi bi-trash-fill"></i> Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
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
              <h5 class="mb-0">Add New Cross Reference(s)</h5>
              <div class="row py-3">
                <div class="col-auto">
                  <label for="cross-references-input" class="col-form-label">
                    Cross Reference(s)<span class="text-danger">*</span>

                    <ToolTip :toolTipText="HELP_TEXT.INPUT_CROSS_REFERENCES" />
                  </label>
                </div>
                <div class="col-4">
                  <textarea
                    :class="
                      isInputCrossReferencesValid
                        ? 'form-control'
                        : 'form-control is-invalid'
                    "
                    id="cross-references-input"
                    v-model="inputCrossReferences"
                    rows="3"
                    aria-describedby="invalid-cross-references-input-feedback"
                  >
                  </textarea>
                  <div
                    id="invalid-cross-references-input-feedback"
                    class="invalid-feedback"
                  >
                    {{ inputCrossReferencesInvalidMsg }}
                  </div>
                  <div class="form-text" id="cross-references-input-help-text">
                    For multiple entries, separate by semicolon
                  </div>
                </div>
                <div class="col-auto">
                  <button
                    type="button"
                    class="btn btn-primary mb-3"
                    @click="fetchCrossReferences"
                  >
                    <i class="bi bi-search"></i> Fetch
                  </button>
                </div>
              </div>
              <div v-if="newCrossReferences?.length > 0">
                <p>
                  <i class="bi bi-info-circle"></i> Verify fetched Cross
                  Reference(s) and click <b>Add cross references</b> to add them
                  to disease.
                </p>
                <h6>Fetched Cross Reference(s)</h6>
                <table class="table table-bordered">
                  <thead>
                    <tr>
                      <th>Accession</th>
                      <th>Term</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ontologyTerm in newCrossReferences">
                      <td>
                        <a
                          v-if="ontologyTerm.source === 'OMIM'"
                          :href="`https://www.omim.org/entry/${ontologyTerm.accession}`"
                          style="text-decoration: none"
                          target="_blank"
                        >
                          {{ ontologyTerm.accession }}
                        </a>
                        <a
                          v-else-if="ontologyTerm.source === 'Mondo'"
                          :href="`https://monarchinitiative.org/${ontologyTerm.accession}`"
                          style="text-decoration: none"
                          target="_blank"
                        >
                          {{ ontologyTerm.accession }}
                        </a>
                        <span v-else>{{ ontologyTerm.accession }}</span>
                      </td>
                      <td>{{ ontologyTerm.term }}</td>
                      <td>{{ ontologyTerm.source }}</td>
                    </tr>
                  </tbody>
                </table>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="addCrossReferences"
                >
                  <i class="bi bi-plus-circle-fill"></i> Add cross references
                </button>
              </div>
              <p v-else>
                <i class="bi bi-info-circle"></i> Please enter Cross
                Reference(s) and click <b>Fetch</b> to proceed further.
              </p>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-if="fetchApiCallErrorMsg || addApiCallErrorMsg"
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ fetchApiCallErrorMsg || addApiCallErrorMsg }}
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
