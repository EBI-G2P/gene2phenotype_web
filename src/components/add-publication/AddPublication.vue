<script>
import {
  isUserLoggedIn,
  logOutUser,
  appendAuthenticationHeaders,
} from "../../utility/AuthenticationUtility";
import {
  ADD_PUBLICATION_URL,
  PUBLICATIONS_URL,
} from "../../utility/UrlConstants";
import {
  prepareInputForNewPublicationDataSubmission,
  getInitialInputForAddingNewPublicationData,
  updateInputWithNewPublicationsData,
  updateHpoTermsInputHelperWithNewPublicationsData,
  updateInputWithRemovedPublications,
  updateHpoTermsInputHelperWithRemovedPublications,
} from "../../utility/AddPublicationUtility.js";
import LoginErrorAlert from "../alert/LoginErrorAlert.vue";
import UpdatePublication from "./UpdatePublication.vue";
import RemovePublicationModal from "../modal/RemovePublicationModal.vue";
import UpdateVariantInformation from "./UpdateVariantInformation.vue";
import UpdatePhenotype from "./UpdatePhenotype.vue";
import UpdateMechanismEvidence from "./UpdateMechanismEvidence.vue";
import AddPublicationSuccessAlert from "../alert/AddPublicationSuccessAlert.vue";
export default {
  props: {
    stableId: String,
    locusGeneDiseaseData: Object,
  },
  components: {
    LoginErrorAlert,
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
      inputPmids: "",
      isInputPmidsValid: true,
      inputPmidsInvalidMsg: "",
      isLogInSessionExpired: false,
    };
  },
  methods: {
    updateData() {
      if (!isUserLoggedIn()) {
        logOutUser();
        this.isLogInSessionExpired = true;
        return;
      }

      this.updateDataErrorMsg = this.updateDataSuccessMsg = null;
      this.isUpdateDataSuccess = false;
      this.isUpdateApiCallLoading = true;

      const requestBody = prepareInputForNewPublicationDataSubmission(
        this.input,
        this.locusGeneDiseaseData
      );

      let responseStatus = null;
      let apiHeaders = appendAuthenticationHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
      });
      fetch(ADD_PUBLICATION_URL.replace(":stableid", this.stableId), {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: apiHeaders,
      })
        .then((response) => {
          responseStatus = response.status;
          return response.json();
        })
        .then((responseJson) => {
          this.isUpdateApiCallLoading = false;
          if (responseStatus === 201) {
            this.isUpdateDataSuccess = true;
            this.updateDataSuccessMsg = responseJson.message;
          } else {
            let errorMsg =
              "Unable to add new publications. Please try again later.";
            if (responseJson.error) {
              errorMsg =
                "Unable to add new publications. Error: " + responseJson.error;
            }
            this.updateDataErrorMsg = errorMsg;
            console.log(errorMsg);
          }
        })
        .catch((error) => {
          this.isUpdateApiCallLoading = false;
          this.updateDataErrorMsg =
            "Unable to add new publications. Please try again later.";
          console.log(error);
        });
    },
    validateInputPmids() {
      if (this.inputPmids.trim() === "") {
        this.inputPmidsInvalidMsg = "Input is empty.";
        return false;
      } else {
        // convert inpitPmids text to list of pmid strings
        const inputPmidsList = this.inputPmids
          .trim()
          .split(";")
          .filter((item) => item);
        // check if any input publication already exists in current publications
        if (
          inputPmidsList.some((item) =>
            this.locusGeneDiseaseData.publications
              .map((itemObj) => itemObj.publication.pmid.toString())
              .includes(item)
          )
        ) {
          this.inputPmidsInvalidMsg =
            "One or more publication(s) exist in current publication(s)";
          return false;
          // check if any input publication already exists in new publications
        } else if (
          inputPmidsList.some((item) =>
            Object.keys(this.input.publications).includes(item)
          )
        ) {
          this.inputPmidsInvalidMsg =
            "One or more publication(s) exist in new publication(s)";
          return false;
        }
      }
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
      if (!isUserLoggedIn()) {
        logOutUser();
        this.isLogInSessionExpired = true;
        return;
      }
      // if inputPmids is invalid then set isInputPmidsValid to false and dont continue further
      if (!this.validateInputPmids()) {
        this.isInputPmidsValid = false;
        return;
      }
      // if inputPmids is valid then continue further
      this.isInputPmidsValid = true;
      this.publicationsApiErrorMsg = null;
      this.isPublicationsDataLoading = true;
      let pmidListStr = this.inputPmids
        .trim()
        .split(";")
        .filter((item) => item)
        .join(",");
      let responseStatus = null;
      const apiHeaders = appendAuthenticationHeaders({
        "Content-Type": "application/json",
      });
      fetch(PUBLICATIONS_URL.replace(":pmids", pmidListStr), {
        method: "GET",
        headers: apiHeaders,
      })
        .then((response) => {
          responseStatus = response.status;
          return response.json();
        })
        .then((responseJson) => {
          this.isPublicationsDataLoading = false;
          if (responseStatus === 200) {
            const publicationsData = responseJson;
            if (publicationsData && publicationsData.results) {
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
          } else if (responseStatus === 404) {
            this.publicationsApiErrorMsg = responseJson.detail
              ? responseJson.detail
              : "Unable to fetch publications data.";
            console.log(this.publicationsApiErrorMsg);
          } else {
            this.publicationsApiErrorMsg = "Unable to fetch publications data.";
            console.log(this.publicationsApiErrorMsg);
          }
        })
        .catch((error) => {
          this.isPublicationsDataLoading = false;
          this.publicationsApiErrorMsg = "Unable to fetch publications data.";
          console.log(error);
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
        'Add' to proceed further.
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
  <LoginErrorAlert v-if="isLogInSessionExpired" />
  <RemovePublicationModal
    :pmidList="Object.keys(input.publications)"
    @removePublication="(pmid) => removePublication(pmid)"
  />
</template>
