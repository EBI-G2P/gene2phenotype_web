<script>
import {
  ADD_PUBLICATION_URL,
  HPO_SEARCH_API_URL,
  PUBLICATIONS_URL,
} from "../../utility/UrlConstants.js";
import {
  prepareInputForNewPublicationDataSubmission,
  getInitialInputForAddingNewPublicationData,
} from "../../utility/AddPublicationUtility.js";
import UpdatePublication from "./UpdatePublication.vue";
import RemovePublicationModal from "../modal/RemovePublicationModal.vue";
import UpdateVariantInformation from "./UpdateVariantInformation.vue";
import UpdatePhenotype from "./UpdatePhenotype.vue";
import UpdateMechanismEvidence from "./UpdateMechanismEvidence.vue";
import AddPublicationSuccessAlert from "../alert/AddPublicationSuccessAlert.vue";
import {
  updateHpoTermsInputHelperWithNewPublicationsData,
  updateHpoTermsInputHelperWithRemovedPublications,
  updateInputWithNewPublicationsData,
  updateInputWithRemovedPublications,
} from "../../utility/CurationUtility.js";
import {
  fetchAndLogApiResponseErrorMsg,
  fetchAndLogGeneralErrorMsg,
} from "../../utility/ErrorUtility.js";
import axios from "axios";
import api from "../../services/api.js";
export default {
  props: {
    stableId: String,
    locusGeneDiseaseData: Object,
    publicationQueryParam: String,
  },
  components: {
    UpdatePublication,
    UpdateVariantInformation,
    UpdatePhenotype,
    RemovePublicationModal,
    UpdateMechanismEvidence,
    AddPublicationSuccessAlert,
  },
  data() {
    return {
      isUpdateApiCallLoading: false,
      updateDataErrorMsg: null,
      isUpdateDataSuccess: false,
      updateDataSuccessMsg: null,
      input: getInitialInputForAddingNewPublicationData(
        this.locusGeneDiseaseData
      ),
      hpoTermsInputHelper: {},
      publicationsApiErrorMsg: null,
      isPublicationsDataLoading: false,
      inputPmids: this.publicationQueryParam ? this.publicationQueryParam : "",
      isInputPmidsValid: true,
      inputPmidsInvalidMsg: "",
    };
  },
  methods: {
    updateData() {
      this.updateDataErrorMsg = this.updateDataSuccessMsg = null;
      this.isUpdateDataSuccess = false;
      this.isUpdateApiCallLoading = true;
      const requestBody = prepareInputForNewPublicationDataSubmission(
        this.input,
        this.locusGeneDiseaseData
      );
      api
        .post(
          ADD_PUBLICATION_URL.replace(":stableid", this.stableId),
          requestBody
        )
        .then((response) => {
          this.isUpdateDataSuccess = true;
          this.updateDataSuccessMsg = response.data.message;
        })
        .catch((error) => {
          this.updateDataErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to add new publications. Please try again later.",
            "Unable to add new publications."
          );
        })
        .finally(() => {
          this.isUpdateApiCallLoading = false;
        });
    },
    validateInputPmids() {
      // check if inputPmids is empty string
      if (this.inputPmids.trim() === "") {
        this.inputPmidsInvalidMsg = "Input is empty";
        return false;
      }

      // convert inputPmids string to list of pmids
      // Eg: "1;2;3;" => ["1","2","3"]
      const inputPmidsList = this.inputPmids
        .trim()
        .split(";")
        .filter((item) => item);

      // check for duplicate input publications
      const duplicatePmidsList = inputPmidsList.filter(
        (item, index) => inputPmidsList.indexOf(item) !== index
      );
      if (duplicatePmidsList.length > 0) {
        this.inputPmidsInvalidMsg = `Duplicate publication(s): ${duplicatePmidsList.join(
          ", "
        )}`;
        return false;
      }

      // check if any input publication exists in current publications
      const currentPmidsList = this.locusGeneDiseaseData.publications.map(
        (item) => item.publication.pmid.toString()
      );
      const pmidsAlreadyExistingList = inputPmidsList.filter((item) =>
        currentPmidsList.includes(item)
      );
      if (pmidsAlreadyExistingList.length > 0) {
        this.inputPmidsInvalidMsg = `Publication(s) already exist(s): ${pmidsAlreadyExistingList.join(
          ", "
        )}`;
        return false;
      }

      // check if any input publication has already been added in new publications
      const addedPmidsList = Object.keys(this.input.publications);
      const pmidsAlreadyAddedList = inputPmidsList.filter((item) =>
        addedPmidsList.includes(item)
      );
      if (pmidsAlreadyAddedList.length > 0) {
        this.inputPmidsInvalidMsg = `Publication(s) already added: ${pmidsAlreadyAddedList.join(
          ", "
        )}`;
        return false;
      }

      // if inputPmids passed all above checks, then it is valid
      return true;
    },
    removePublication(removedPmidList) {
      this.input = updateInputWithRemovedPublications(
        this.input,
        removedPmidList
      );
      this.hpoTermsInputHelper =
        updateHpoTermsInputHelperWithRemovedPublications(
          this.hpoTermsInputHelper,
          removedPmidList
        );
    },
    fetchPublications() {
      // if inputPmids is invalid then set isInputPmidsValid to false and dont continue further
      if (!this.validateInputPmids()) {
        this.isInputPmidsValid = false;
        return;
      }
      // if inputPmids is valid then continue further
      this.isInputPmidsValid = true;
      this.inputPmidsInvalidMsg = "";
      this.publicationsApiErrorMsg = null;
      this.isPublicationsDataLoading = true;
      let pmidListStr = this.inputPmids
        .trim()
        .split(";")
        .filter((item) => item)
        .join(",");
      api
        .get(PUBLICATIONS_URL.replace(":pmids", pmidListStr))
        .then((response) => {
          const publicationsData = response.data;
          if (publicationsData?.results) {
            this.input = updateInputWithNewPublicationsData(
              this.input,
              publicationsData
            );
            let pmidList = publicationsData.results.map((item) => item.pmid);
            this.hpoTermsInputHelper =
              updateHpoTermsInputHelperWithNewPublicationsData(
                this.hpoTermsInputHelper,
                pmidList
              );
            // clear inputPmids
            this.inputPmids = "";
          }
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            this.publicationsApiErrorMsg = fetchAndLogApiResponseErrorMsg(
              error,
              error?.response?.data?.error,
              "Unable to fetch publications data. Please try again later.",
              "Unable to fetch publications data."
            );
          } else {
            this.publicationsApiErrorMsg = fetchAndLogGeneralErrorMsg(
              error,
              "Unable to fetch publications data. Please try again later."
            );
          }
        })
        .finally(() => {
          this.isPublicationsDataLoading = false;
        });
    },
    fetchAndSearchHPO(pmid, inputValue) {
      this.hpoTermsInputHelper[pmid].searchTerm = inputValue;
      this.hpoTermsInputHelper[pmid].HPOsearchResponseJson = [];
      this.hpoTermsInputHelper[pmid].HPOAPIerrormsg = null;

      if (!inputValue || inputValue.length < 3) {
        this.hpoTermsInputHelper[pmid].isLoadingValue = false;
        return;
      }

      this.hpoTermsInputHelper[pmid].isLoadingValue = true;
      axios
        .get(`${HPO_SEARCH_API_URL}?q=${inputValue}&page=0&limit=10`)
        .then((response) => {
          if (response.data?.terms?.length > 0) {
            this.hpoTermsInputHelper[pmid].HPOsearchResponseJson =
              response.data.terms;
          } else {
            const errorMsg = "No results found. Try another term.";
            this.hpoTermsInputHelper[pmid].HPOAPIerrormsg = errorMsg;
            console.log(errorMsg);
          }
        })
        .catch((error) => {
          this.hpoTermsInputHelper[pmid].HPOAPIerrormsg =
            fetchAndLogGeneralErrorMsg(
              error,
              "Failed to fetch HPO data. Please try again later."
            );
        })
        .finally(() => {
          this.hpoTermsInputHelper[pmid].isLoadingValue = false;
        });
    },
  },
};
</script>
<template>
  <div
    v-if="isUpdateApiCallLoading"
    class="d-flex justify-content-center"
    style="margin-top: 122px; margin-bottom: 122px"
  >
    <div class="spinner-border text-secondary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <AddPublicationSuccessAlert
    v-else-if="isUpdateDataSuccess"
    :stableId="stableId"
    :successMsg="updateDataSuccessMsg"
  />
  <div v-else>
    <div>
      <div class="row py-3">
        <div class="col-auto">
          <label for="publications-input" class="col-form-label">
            Publication(s)<span class="text-danger">*</span>
          </label>
        </div>
        <div class="col-4">
          <textarea
            :class="
              isInputPmidsValid ? 'form-control' : 'form-control is-invalid'
            "
            id="publications-input"
            v-model="inputPmids"
            rows="3"
            aria-describedby="invalid-publications-input-feedback"
          >
          </textarea>
          <div
            id="invalid-publications-input-feedback"
            class="invalid-feedback"
          >
            {{ inputPmidsInvalidMsg }}
          </div>
          <div class="form-text" id="publications-input-help-text">
            For multiple entries, separate by semicolon
          </div>
        </div>
        <div class="col-auto">
          <button
            type="button"
            class="btn btn-primary mb-3"
            @click="fetchPublications"
          >
            <i class="bi bi-plus-circle-fill"></i> Add
          </button>
        </div>
      </div>
      <div
        v-if="isPublicationsDataLoading"
        class="d-flex justify-content-center"
        style="margin-top: 20px; margin-bottom: 20px"
      >
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div
        v-else-if="publicationsApiErrorMsg"
        class="alert alert-danger mt-3"
        role="alert"
      >
        <div>
          <i class="bi bi-exclamation-circle-fill"></i>
          {{ publicationsApiErrorMsg }}
        </div>
      </div>
      <p v-else>
        <i class="bi bi-info-circle"></i> Please enter Publication(s) and click
        <b>Add</b> to proceed further.
      </p>
    </div>
    <div
      v-if="input?.publications && Object.keys(input.publications).length > 0"
    >
      <div class="d-flex justify-content-between mb-3">
        <h5>
          Add data for new Publication(s):
          {{ Object.keys(input.publications).join(", ") }}
        </h5>
        <button
          class="btn btn-outline-danger"
          data-bs-toggle="modal"
          data-bs-target="#remove-publication-modal"
        >
          <i class="bi bi-trash-fill"></i> Remove Publication(s)
        </button>
      </div>
      <UpdatePublication
        v-model:publications="input.publications"
        :currentPublications="locusGeneDiseaseData.publications"
      />
      <UpdatePhenotype
        :currentPhenotypes="locusGeneDiseaseData.phenotypes"
        v-model:clinical-phenotype="input.phenotypes"
        v-model:hpo-terms-input-helper="hpoTermsInputHelper"
        :fetchAndSearchHPO="fetchAndSearchHPO"
      />
      <UpdateVariantInformation
        :publicationsData="Object.keys(input.publications)"
        :variantTypes="input.variant_types"
        @update-variant-types="
          (updatedVariantTypes) => (input.variant_types = updatedVariantTypes)
        "
        v-model:variant-descriptions="input.variant_descriptions"
        :currentVariantDescription="locusGeneDiseaseData.variant_description"
        :currentVariantTypes="locusGeneDiseaseData.variant_type"
      />
      <UpdateMechanismEvidence
        :currentMechanism="locusGeneDiseaseData.molecular_mechanism"
        v-model:molecular-mechanism="input.molecular_mechanism.name"
        v-model:molecular-mechanism-support="input.molecular_mechanism.support"
        v-model:mechanism-synopsis="input.mechanism_synopsis.name"
        v-model:mechanism-synopsis-support="input.mechanism_synopsis.support"
        :mechanismEvidence="input.mechanism_evidence"
        @update-mechanism-evidence="
          (updatedMechanismEvidence) =>
            (input.mechanism_evidence = updatedMechanismEvidence)
        "
      />
      <button class="btn btn-primary my-3" @click="updateData" type="button">
        <i class="bi bi-send-fill"></i> Submit
      </button>
    </div>
  </div>
  <div v-if="updateDataErrorMsg" class="alert alert-danger mt-3" role="alert">
    <div>
      <i class="bi bi-exclamation-circle-fill"></i>
      {{ updateDataErrorMsg }}
    </div>
  </div>
  <RemovePublicationModal
    :pmidList="Object.keys(input.publications)"
    @removePublication="(pmid) => removePublication(pmid)"
  />
</template>
