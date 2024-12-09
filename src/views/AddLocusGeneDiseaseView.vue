<script>
import GeneInformation from "../components/curation/GeneInformation.vue";
import Publication from "../components/curation/Publication.vue";
import ClinicalPhenotype from "../components/curation/ClinicalPhenotype.vue";
import Genotype from "../components/curation/Genotype.vue";
import VariantInformation from "../components/curation/VariantInformation.vue";
import Mechanism from "../components/curation/Mechanism.vue";
import Disease from "../components/curation/Disease.vue";
import Panel from "../components/curation/Panel.vue";
import Confidence from "../components/curation/Confidence.vue";
import SaveDraftModal from "../components/modal/SaveDraftModal.vue";
import PublishModal from "../components/modal/PublishModal.vue";
import PublishSuccessAlert from "../components/alert/PublishSuccessAlert.vue";
import SaveNotPublishSuccessAlert from "../components/alert/SaveNotPublishSuccessAlert.vue";
import {
  getInitialInputForNewCuration,
  updateInputWithPublicationsData,
  prepareInputForDataSubmission,
  updateHpoTermsInputHelperWithPublicationsData,
  appendObjectToPublications,
} from "../utility/CurationUtility.js";
import SaveSuccessAlert from "../components/alert/SaveSuccessAlert.vue";
import AlertModal from "../components/modal/AlertModal.vue";
import cloneDeep from "lodash/cloneDeep";
import {
  appendAuthenticationHeaders,
  checkLogInAndAppendAuthHeaders,
  isUserLoggedIn,
  logOutUser,
} from "../utility/AuthenticationUtility.js";
import LoginErrorAlert from "../components/alert/LoginErrorAlert.vue";
import {
  ATTRIBS_URL,
  GENE_DISEASE_URL,
  GENE_FUNCTION_URL,
  GENE_URL,
  PUBLICATIONS_URL,
  PUBLISH_URL,
  SAVE_DRAFT_URL,
  USER_PANELS_URL,
} from "../utility/UrlConstants.js";
import ExistingGeneInformation from "../components/curation/ExistingGeneInformation.vue";

export default {
  data() {
    return {
      input: getInitialInputForNewCuration(),
      isInputLocusValid: true,
      hpoTermsInputHelper: {},
      isGeneDataLoading: false,
      isGeneDiseaseDataLoading: false,
      geneData: null,
      geneFunctionData: null,
      attributesData: null,
      geneErrorMsg: null,
      geneDiseaseErrorMsg: null,
      isSubmitDataLoading: false,
      submitErrorMsg: null,
      isSubmitSuccess: false,
      submitSuccessMsg: null,
      isSaveBeforePublishSuccess: false,
      saveBeforePublishErrorMsg: null,
      isPublishSuccess: false,
      publishSuccessMsg: null,
      publishErrorMsg: null,
      publicationsErrorMsg: null,
      isPublicationsDataLoading: false,
      inputPmids: "",
      isInputPmidsValid: true,
      panelErrorMsg: null,
      isPanelDataLoading: false,
      panelData: null,
      stableId: null,
      isLogInSessionExpired: false,
      isDisplayGeneExistingData: false, // variable used to display ExistingGeneInformation component
      notifyExistingGeneInformation: false, // variable used to notify ExistingGeneInformation component to fetch existing data for gene
    };
  },
  components: {
    GeneInformation,
    Publication,
    ClinicalPhenotype,
    Genotype,
    VariantInformation,
    Mechanism,
    Disease,
    Panel,
    Confidence,
    SaveDraftModal,
    PublishModal,
    PublishSuccessAlert,
    SaveNotPublishSuccessAlert,
    SaveSuccessAlert,
    AlertModal,
    LoginErrorAlert,
    ExistingGeneInformation,
  },
  methods: {
    geneSearchBtnClickHandler() {
      if (this.input.locus !== "") {
        this.isInputLocusValid = true;
        if (isUserLoggedIn()) {
          // Do not display ExistingGeneInformation component
          this.isDisplayGeneExistingData = false;
          // Fetch relevant data
          this.fetchGeneInformation();
          this.fetchGeneDiseaseInformation();
          this.fetchPanels();
        } else {
          logOutUser();
          this.isLogInSessionExpired = true;
        }
      } else {
        this.isInputLocusValid = false;
      }
    },
    existingGeneDataSearchHandler() {
      if (this.input.locus !== "") {
        this.isInputLocusValid = true;
        if (isUserLoggedIn()) {
          if (this.geneData) {
            // if fetching data for another gene and data of current gene exists then reset data variables of current gene
            this.resetData();
          }
          // Display ExistingGeneInformation component
          this.isDisplayGeneExistingData = true;
          // Notify ExistingGeneInformation component to fetch existing data for gene
          this.notifyExistingGeneInformation = true;
        } else {
          logOutUser();
          this.isLogInSessionExpired = true;
        }
      } else {
        this.isInputLocusValid = false;
      }
    },
    resetData() {
      // if we are fetching data for another gene then we retain value of locus key and reset other keys of input obj
      const resetInput = getInitialInputForNewCuration();
      this.input = { ...cloneDeep(resetInput), locus: this.input.locus };

      // these variables wont be part of reset logic in this function:
      // stableId, isLogInSessionExpired, isDisplayGeneExistingData, notifyExistingGeneInformation

      // other data variables have to be reset
      this.hpoTermsInputHelper = {};
      this.isSubmitDataLoading = false;
      this.submitErrorMsg = null;
      this.isSubmitSuccess = false;
      this.submitSuccessMsg = null;
      this.publishErrorMsg = null;
      this.isPublishSuccess = false;
      this.publishSuccessMsg = null;
      this.publicationsErrorMsg = null;
      this.isPublicationsDataLoading = false;
      this.inputPmids = "";
      this.isInputPmidsValid = true;
      this.isSaveBeforePublishSuccess = false;
      this.saveBeforePublishErrorMsg = null;
      this.geneErrorMsg = null;
      this.geneFunctionData = null;
      this.geneData = null;
      this.attributesData = null;
      this.isGeneDataLoading = false;
      this.geneDiseaseErrorMsg = null;
      this.geneDiseaseData = null;
      this.isGeneDiseaseDataLoading = false;
      this.panelErrorMsg = null;
      this.panelData = null;
      this.isPanelDataLoading = false;
    },
    fetchGeneInformation() {
      this.geneErrorMsg =
        this.geneFunctionData =
        this.geneData =
        this.attributesData =
          null;
      this.isGeneDataLoading = true;
      const apiHeaders = checkLogInAndAppendAuthHeaders({
        "Content-Type": "application/json",
      });
      Promise.all([
        fetch(GENE_FUNCTION_URL.replace(":locus", this.input.locus), {
          method: "GET",
          headers: apiHeaders,
        }),
        fetch(GENE_URL.replace(":locus", this.input.locus), {
          method: "GET",
          headers: apiHeaders,
        }),
        fetch(ATTRIBS_URL, {
          method: "GET",
          headers: apiHeaders,
        }),
      ])
        .then((responseArr) => {
          return Promise.all(
            responseArr.map((response) => {
              if (response.status === 200) {
                return response.json();
              } else {
                return Promise.reject(new Error("Unable to fetch gene data"));
              }
            })
          );
        })
        .then((responseJsonArr) => {
          const [geneFunctionData, geneData, attributesData] = responseJsonArr;
          this.isGeneDataLoading = false;
          this.geneData = geneData;
          this.geneFunctionData = geneFunctionData;
          this.attributesData = attributesData;
        })
        .catch((error) => {
          this.isGeneDataLoading = false;
          this.geneErrorMsg = error.message;
          console.log(error);
        });
    },
    fetchGeneDiseaseInformation() {
      this.geneDiseaseErrorMsg = this.geneDiseaseData = null;
      this.isGeneDiseaseDataLoading = true;
      const apiHeaders = checkLogInAndAppendAuthHeaders({
        "Content-Type": "application/json",
      });
      fetch(GENE_DISEASE_URL.replace(":locus", this.input.locus), {
        method: "GET",
        headers: apiHeaders,
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            return Promise.reject(
              new Error("Unable to fetch gene disease data")
            );
          }
        })
        .then((responseJson) => {
          this.isGeneDiseaseDataLoading = false;
          this.geneDiseaseData = responseJson;
        })
        .catch((error) => {
          this.isGeneDiseaseDataLoading = false;
          this.geneDiseaseErrorMsg = error.message;
          console.log(error);
        });
    },
    fetchPanels() {
      this.panelErrorMsg = this.panelData = null;
      this.isPanelDataLoading = true;
      const apiHeaders = appendAuthenticationHeaders({
        "Content-Type": "application/json",
      });
      fetch(USER_PANELS_URL, {
        method: "GET",
        headers: apiHeaders,
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            return Promise.reject(new Error("Unable to fetch panel data"));
          }
        })
        .then((responseJson) => {
          this.isPanelDataLoading = false;
          this.panelData = responseJson;
        })
        .catch((error) => {
          this.isPanelDataLoading = false;
          this.panelErrorMsg = error.message;
          console.log(error);
        });
    },
    fetchPublications() {
      // if inputPmids is empty then set isInputPmidsValid to false and dont continue further
      if (this.inputPmids.trim() === "") {
        this.isInputPmidsValid = false;
        return;
      }
      // if inputPmids is not empty then continue further
      this.isInputPmidsValid = true;
      this.publicationsErrorMsg = null;
      this.isPublicationsDataLoading = true;
      let pmidListStr = this.inputPmids
        .trim()
        .split(";")
        .filter((item) => item)
        .join(",");
      let responseStatus = null;
      const apiHeaders = checkLogInAndAppendAuthHeaders({
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
            let publicationsData = responseJson;
            publicationsData = appendObjectToPublications(
              publicationsData,
              this.input
            );
            if (publicationsData && publicationsData.results) {
              this.input = updateInputWithPublicationsData(
                this.input,
                publicationsData
              );
              let pmidList = publicationsData.results.map((item) => item.pmid);
              this.hpoTermsInputHelper =
                updateHpoTermsInputHelperWithPublicationsData(pmidList);
            }
          } else if (responseStatus === 404) {
            this.publicationsErrorMsg = responseJson.detail
              ? responseJson.detail
              : "Unable to fetch publications data.";
            console.log(this.publicationsErrorMsg);
          } else {
            this.publicationsErrorMsg = "Unable to fetch publications data.";
            console.log(this.publicationsErrorMsg);
          }
        })
        .catch((error) => {
          this.isPublicationsDataLoading = false;
          this.publicationsErrorMsg = "Unable to fetch publications data.";
          console.log(error);
        });
    },
    saveDraft() {
      if (!isUserLoggedIn()) {
        logOutUser();
        this.isLogInSessionExpired = true;
        return;
      }

      this.publishErrorMsg =
        this.publishSucessMsg =
        this.saveBeforePublishErrorMsg =
          null;
      this.isPublishSuccess = this.isSaveBeforePublishSuccess = false;

      this.submitErrorMsg = this.submitSuccessMsg = null;
      this.isSubmitSuccess = false;

      this.isSubmitDataLoading = true;
      const preparedInput = prepareInputForDataSubmission(this.input);
      const requestBody = {
        json_data: preparedInput,
      };
      let responseStatus = null;
      let apiHeaders = appendAuthenticationHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
      });
      fetch(SAVE_DRAFT_URL, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: apiHeaders,
      })
        .then((response) => {
          responseStatus = response.status;
          return response.json();
        })
        .then((responseJson) => {
          this.isSubmitDataLoading = false;
          this.stableId = null;
          this.stableId = responseJson.result;
          if (responseStatus === 200) {
            this.isSubmitSuccess = true;
            this.submitSuccessMsg = responseJson.message;
          } else {
            let errorMsg = "Unable to save draft. Please try again later.";
            if (
              responseJson.errors?.message &&
              responseJson.errors?.message.length > 0
            ) {
              errorMsg =
                "Unable to save draft. Error: " +
                responseJson.errors.message[0];
            }
            this.submitErrorMsg = errorMsg;
            console.log(errorMsg);
          }
        })
        .catch((error) => {
          this.isSubmitDataLoading = false;
          this.submitErrorMsg = "Unable to save draft. Please try again later.";
          console.log(error);
        });
    },
    async saveAndPublishEntry() {
      if (!isUserLoggedIn()) {
        logOutUser();
        this.isLogInSessionExpired = true;
        return;
      }

      this.submitErrorMsg = this.submitSuccessMsg = null;
      this.isSubmitSuccess = false;

      this.publishErrorMsg =
        this.publishSucessMsg =
        this.saveBeforePublishErrorMsg =
          null;
      this.isPublishSuccess = this.isSaveBeforePublishSuccess = false;

      this.isSubmitDataLoading = true;
      this.stableId = null;

      // Save and publish scenarios:
      // 1. IF Save fails THEN saveBeforePublishErrorMsg=<error msg>, publishErrorMsg=publishSucessMsg=null, isSaveBeforePublishSuccess=isPublishSuccess=false
      // 2. IF Save succeeds but Publish fails THEN publishErrorMsg=<error msg>, saveBeforePublishErrorMsg=publishSucessMsg=null, isSaveBeforePublishSuccess=true, isPublishSuccess=false
      // 3. IF Save and Publish both succeed THEN publishSucessMsg=<success msg>, saveBeforePublishErrorMsg=publishErrorMsg=null, isSaveBeforePublishSuccess=isPublishSuccess=true
      const preparedInput = prepareInputForDataSubmission(this.input);
      const requestBody = { json_data: preparedInput };

      try {
        // Call API to Save draft
        let submitApiHeaders = appendAuthenticationHeaders({
          Accept: "application/json",
          "Content-Type": "application/json",
        });
        const submitResponse = await fetch(SAVE_DRAFT_URL, {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: submitApiHeaders,
        });
        const submitResponseJson = await submitResponse.json();

        if (submitResponse.status === 200) {
          this.isSaveBeforePublishSuccess = true;
          this.stableId = submitResponseJson.result;
        } else {
          this.isSubmitDataLoading = false;
          let errorMsg =
            "Unable to save and publish data. Please try again later.";
          if (
            submitResponseJson.errors?.message &&
            submitResponseJson.errors?.message.length > 0
          ) {
            errorMsg =
              "Unable to save and publish data. Error: " +
              submitResponseJson.errors.message[0];
          }
          this.saveBeforePublishErrorMsg = errorMsg;
          console.log(errorMsg);
        }

        // Call API to Publish Data
        if (this.isSaveBeforePublishSuccess) {
          let publishApiHeaders = appendAuthenticationHeaders({
            "Content-Length": 0,
          });
          const publishResponse = await fetch(
            PUBLISH_URL.replace(":stableid", this.stableId),
            {
              method: "POST",
              headers: publishApiHeaders,
            }
          );

          const publishResponseJson = await publishResponse.json();
          this.isSubmitDataLoading = false;

          if (publishResponse.status === 201) {
            this.isPublishSuccess = true;
            this.publishSuccessMsg = publishResponseJson.message;
          } else {
            let errorMsg =
              "Saved draft but unable to publish data. Please try again later.";
            if (publishResponseJson.message) {
              errorMsg =
                "Saved draft but unable to publish data. Error: " +
                publishResponseJson.message;
            }
            this.publishErrorMsg = errorMsg;
            console.log(errorMsg);
          }
        }
      } catch (error) {
        this.isSubmitDataLoading = false;
        if (this.isSaveBeforePublishSuccess) {
          this.publishErrorMsg =
            "Saved draft but unable to publish data. Please try again later.";
        } else {
          this.saveBeforePublishErrorMsg =
            "Unable to save and publish data. Please try again later.";
        }
        console.log("Error:", error);
      }
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2>Add New G2P Record</h2>
    <div
      class="row g-3 pt-3 pb-1"
      v-if="
        !isSubmitDataLoading &&
        !isSubmitSuccess &&
        !isSaveBeforePublishSuccess &&
        !isPublishSuccess
      "
    >
      <div class="col-auto">
        <label for="gene-symbol-input" class="col-form-label">
          Gene<span class="text-danger">*</span>
        </label>
      </div>
      <div class="col-3">
        <input
          :class="
            isInputLocusValid ? 'form-control' : 'form-control is-invalid'
          "
          id="gene-symbol-input"
          v-model.trim="input.locus"
          aria-describedby="invalid-gene-symbol-input-feedback"
          @keyup.enter="existingGeneDataSearchHandler"
        />
        <div id="invalid-gene-symbol-input-feedback" class="invalid-feedback">
          Please enter a valid Gene.
        </div>
      </div>
      <div class="col-auto">
        <!-- TODO: Handle logic to disable below btns when fetching existing gene data is loading -->
        <button
          v-if="geneData"
          :disabled="isGeneDataLoading"
          type="button"
          class="btn btn-primary mb-3"
          data-bs-toggle="modal"
          data-bs-target="#all-input-alert-modal"
        >
          <i class="bi bi-search"></i> Search
        </button>
        <button
          v-else
          :disabled="isGeneDataLoading"
          type="button"
          class="btn btn-primary mb-3"
          @click="existingGeneDataSearchHandler"
        >
          <i class="bi bi-search"></i> Search
        </button>
      </div>
    </div>
    <p v-if="!isGeneDataLoading && !geneData && !isDisplayGeneExistingData">
      <i class="bi bi-info-circle"></i> Please enter Gene and click Search to
      proceed further.
    </p>
    <div
      class="d-flex justify-content-center"
      v-if="isGeneDataLoading || isSubmitDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-if="geneErrorMsg">
      <div>
        <i class="bi bi-exclamation-circle-fill"></i> {{ geneErrorMsg }}
      </div>
    </div>
    <ExistingGeneInformation
      v-if="isDisplayGeneExistingData"
      :gene="input.locus"
      :geneSearchBtnClickHandler="geneSearchBtnClickHandler"
      :notifyExistingGeneInformation="notifyExistingGeneInformation"
      @setNotifyExistingGeneInformation="
        (value) => (notifyExistingGeneInformation = value)
      "
    />
    <div
      id="curation-form-section"
      v-if="
        geneData &&
        !isSubmitDataLoading &&
        !isSubmitSuccess &&
        !isSaveBeforePublishSuccess &&
        !isPublishSuccess
      "
    >
      <GeneInformation
        :geneData="geneData"
        :geneFunctionData="geneFunctionData"
      />
      <Publication
        :fetchPublications="fetchPublications"
        :isPublicationsDataLoading="isPublicationsDataLoading"
        :publicationsErrorMsg="publicationsErrorMsg"
        v-model:publications="input.publications"
        v-model:input-pmids="inputPmids"
        :isInputPmidsValid="isInputPmidsValid"
      />
      <ClinicalPhenotype
        v-model:clinical-phenotype="input.phenotypes"
        v-model:hpo-terms-input-helper="hpoTermsInputHelper"
      />
      <Genotype
        :attributesData="attributesData"
        v-model:allelic-requirement="input.allelic_requirement"
        v-model:cross-cutting-modifiers="input.cross_cutting_modifier"
      />
      <VariantInformation
        :publicationsData="Object.keys(input.publications)"
        :variantTypes="input.variant_types"
        @update-variant-types="
          (updatedVariantTypes) => (input.variant_types = updatedVariantTypes)
        "
        v-model:variant-descriptions="input.variant_descriptions"
        :variantConsequences="input.variant_consequences"
        @update-variant-consequences="
          (updatedVariantConsequences) =>
            (input.variant_consequences = updatedVariantConsequences)
        "
      />
      <Mechanism
        v-model:molecular-mechanism="input.molecular_mechanism.name"
        v-model:molecular-mechanism-support="input.molecular_mechanism.support"
        v-model:mechanism-synopsis="input.mechanism_synopsis.name"
        v-model:mechanism-synopsis-support="input.mechanism_synopsis.support"
        :mechanismEvidence="input.mechanism_evidence"
        @update-mechanism-evidence="
          (updatedMechanismEvidence) =>
            (input.mechanism_evidence = updatedMechanismEvidence)
        "
        :mechanismGeneStats="geneFunctionData.gene_stats"
      />
      <Disease
        :inputGeneSymbol="input.locus"
        :geneDiseaseData="geneDiseaseData"
        :isGeneDiseaseDataLoading="isGeneDiseaseDataLoading"
        :geneDiseaseErrorMsg="geneDiseaseErrorMsg"
        v-model:disease-name="input.disease.disease_name"
        v-model:disease-cross-references="input.disease.cross_references"
      />
      <Panel
        :panelData="panelData"
        :isPanelDataLoading="isPanelDataLoading"
        :panelErrorMsg="panelErrorMsg"
        v-model:panels="input.panels"
      />
      <Confidence
        :attributesData="attributesData"
        :inputPublications="input.publications"
        v-model:justification="input.confidence.justification"
        v-model:level="input.confidence.level"
      />
      <p class="pt-2">
        <span class="text-danger">*</span> mandatory fields to publish
      </p>
    </div>
    <div
      class="alert alert-danger mt-3"
      role="alert"
      v-if="!isSubmitDataLoading && submitErrorMsg"
    >
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ submitErrorMsg }}
      </div>
    </div>
    <div
      class="alert alert-danger mt-3"
      role="alert"
      v-if="!isSubmitDataLoading && saveBeforePublishErrorMsg"
    >
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ saveBeforePublishErrorMsg }}
      </div>
    </div>
    <LoginErrorAlert v-if="isLogInSessionExpired" />
    <div
      class="d-flex justify-content-between py-3"
      v-if="
        geneData &&
        !isSubmitDataLoading &&
        !isSubmitSuccess &&
        !isSaveBeforePublishSuccess &&
        !isPublishSuccess
      "
    >
      <button
        class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#save-draft-modal"
      >
        <i class="bi bi-floppy-fill"></i> Save Draft
      </button>
      <button
        class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#publish-entry-modal"
      >
        <i class="bi bi-floppy-fill"></i> Save and Publish
      </button>
    </div>
    <SaveSuccessAlert
      v-if="!isSubmitDataLoading && isSubmitSuccess"
      :successMsg="submitSuccessMsg"
    />
    <SaveNotPublishSuccessAlert
      v-if="
        !isSubmitDataLoading && isSaveBeforePublishSuccess && !isPublishSuccess
      "
      :errorMsg="publishErrorMsg"
      :stableId="stableId"
    />
    <PublishSuccessAlert
      v-if="
        !isSubmitDataLoading && isSaveBeforePublishSuccess && isPublishSuccess
      "
      :successMsg="publishSuccessMsg"
      :stableId="stableId"
    />
    <SaveDraftModal
      v-model:sessionname="input.session_name"
      @savedraft="saveDraft"
    />
    <PublishModal @publish="saveAndPublishEntry" />
    <AlertModal
      modalId="all-input-alert-modal"
      alertText="The data you have input will be lost. Are you sure you want to proceed?"
      @confirm-click-handler="existingGeneDataSearchHandler"
    />
    <AlertModal
      modalId="publications-input-alert-modal"
      alertText="The data you have input under Publications, Phenotypic Features, Variant Types, Variant Description, and Mechanism Evidence will be lost. Are you sure you want to proceed?"
      @confirm-click-handler="fetchPublications"
    />
  </div>
</template>
<style scoped>
h5 {
  font-weight: bold;
}
h6 {
  font-weight: bold;
}
</style>
