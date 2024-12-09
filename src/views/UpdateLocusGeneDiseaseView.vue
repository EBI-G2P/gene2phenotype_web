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
  updateInputWithPublicationsData,
  prepareInputForDataSubmission,
  prepareInputForUpdating,
  updateHpoTermsInputHelperWithPublicationsData,
  appendObjectToPublications,
} from "../utility/CurationUtility.js";
import SaveSuccessAlert from "../components/alert/SaveSuccessAlert.vue";
import AlertModal from "../components/modal/AlertModal.vue";
import {
  appendAuthenticationHeaders,
  checkLogInAndAppendAuthHeaders,
  isUserLoggedIn,
  logOutUser,
} from "../utility/AuthenticationUtility.js";
import LoginErrorAlert from "@/components/alert/LoginErrorAlert.vue";
import {
  ATTRIBS_URL,
  GENE_DISEASE_URL,
  GENE_FUNCTION_URL,
  GENE_URL,
  PUBLICATIONS_URL,
  PUBLISH_URL,
  SAVED_DRAFT_DATA_URL,
  UPDATE_SAVED_DRAFT_URL,
  USER_PANELS_URL,
} from "../utility/UrlConstants";
import { compileScript } from "vue/compiler-sfc";

export default {
  created() {
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchPreviousCurationInput();
      },
      { immediate: true }
    );
  },
  data() {
    return {
      isPreviousInputDataLoading: false,
      previousInput: null,
      errorMsg: null,
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
      stableID: null,
      isLogInSessionExpired: false,
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
  },
  methods: {
    fetchPreviousCurationInput() {
      if (!isUserLoggedIn()) {
        logOutUser();
        this.isLogInSessionExpired = true;
        return;
      }

      this.isPreviousInputDataLoading = true;
      this.previousInput = this.errorMsg = null;
      this.stableID = this.$route.params.stableID;
      let apiHeaders = appendAuthenticationHeaders({
        "Content-Type": "application/json",
      });
      fetch(SAVED_DRAFT_DATA_URL.replace(":stableid", this.stableID), {
        method: "GET",
        headers: apiHeaders,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Unable to fetch curation information");
          }
        })
        .then((responseJson) => {
          this.isPreviousInputDataLoading = false;
          this.previousInput = prepareInputForUpdating(responseJson.data);
          let pmidList = Object.keys(this.previousInput.publications);
          this.hpoTermsInputHelper =
            updateHpoTermsInputHelperWithPublicationsData(pmidList);
          this.fetchGeneInformation();
          this.fetchGeneDiseaseInformation();
          this.fetchPanels();
        })
        .catch((error) => {
          this.isPreviousInputDataLoading = false;
          this.errorMsg = error.message;
          console.log(error);
        });
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
        fetch(GENE_FUNCTION_URL.replace(":locus", this.previousInput.locus), {
          method: "GET",
          headers: apiHeaders,
        }),
        fetch(GENE_URL.replace(":locus", this.previousInput.locus), {
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
      fetch(GENE_DISEASE_URL.replace(":locus", this.previousInput.locus), {
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
              this.previousInput
            );
            if (publicationsData && publicationsData.results) {
              this.previousInput = updateInputWithPublicationsData(
                this.previousInput,
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

      const preparedUpdatedInput = prepareInputForDataSubmission(
        this.previousInput
      );

      const requestBody = {
        json_data: preparedUpdatedInput,
      };
      let responseStatus = null;
      let apiHeaders = appendAuthenticationHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
      });
      fetch(UPDATE_SAVED_DRAFT_URL.replace(":stableid", this.stableID), {
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers: apiHeaders,
      })
        .then((response) => {
          responseStatus = response.status;
          return response.json();
        })
        .then((responseJson) => {
          this.isSubmitDataLoading = false;
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

      // Save and publish scenarios:
      // 1. IF Save fails THEN saveBeforePublishErrorMsg=<error msg>, publishErrorMsg=publishSucessMsg=null, isSaveBeforePublishSuccess=isPublishSuccess=false
      // 2. IF Save succeeds but Publish fails THEN publishErrorMsg=<error msg>, saveBeforePublishErrorMsg=publishSucessMsg=null, isSaveBeforePublishSuccess=true, isPublishSuccess=false
      // 3. IF Save and Publish both succeed THEN publishSucessMsg=<success msg>, saveBeforePublishErrorMsg=publishErrorMsg=null, isSaveBeforePublishSuccess=isPublishSuccess=true

      const preparedInput = prepareInputForDataSubmission(this.previousInput);
      const requestBody = { json_data: preparedInput };

      try {
        // Call API to Save draft
        let submitApiHeaders = appendAuthenticationHeaders({
          Accept: "application/json",
          "Content-Type": "application/json",
        });
        const submitResponse = await fetch(
          UPDATE_SAVED_DRAFT_URL.replace(":stableid", this.stableID),
          {
            method: "PUT",
            body: JSON.stringify(requestBody),
            headers: submitApiHeaders,
          }
        );

        const submitResponseJson = await submitResponse.json();

        if (submitResponse.status === 200) {
          this.isSaveBeforePublishSuccess = true;
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
            PUBLISH_URL.replace(":stableid", this.stableID),
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
  <div
    class="container px-5 py-3"
    style="min-height: 60vh"
    id="curation-form-section"
  >
    <h2>Update G2P Record Draft</h2>
    <div
      class="d-flex justify-content-center"
      v-if="
        isPreviousInputDataLoading || isGeneDataLoading || isSubmitDataLoading
      "
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div
      class="alert alert-danger mt-3"
      role="alert"
      v-if="errorMsg || geneErrorMsg"
    >
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ errorMsg ? errorMsg : geneErrorMsg }}
      </div>
    </div>
    <div
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
        v-model:publications="previousInput.publications"
        v-model:input-pmids="inputPmids"
        :isInputPmidsValid="isInputPmidsValid"
      />
      <ClinicalPhenotype
        v-model:clinical-phenotype="previousInput.phenotypes"
        v-model:hpo-terms-input-helper="hpoTermsInputHelper"
      />
      <Genotype
        :attributesData="attributesData"
        v-model:allelic-requirement="previousInput.allelic_requirement"
        v-model:cross-cutting-modifiers="previousInput.cross_cutting_modifier"
      />
      <VariantInformation
        :publicationsData="Object.keys(previousInput.publications)"
        :variantTypes="previousInput.variant_types"
        @update-variant-types="
          (updatedVariantTypes) =>
            (previousInput.variant_types = updatedVariantTypes)
        "
        v-model:variant-descriptions="previousInput.variant_descriptions"
        :variantConsequences="previousInput.variant_consequences"
        @update-variant-consequences="
          (updatedVariantConsequences) =>
            (previousInput.variant_consequences = updatedVariantConsequences)
        "
      />
      <Mechanism
        v-model:molecular-mechanism="previousInput.molecular_mechanism.name"
        v-model:molecular-mechanism-support="
          previousInput.molecular_mechanism.support
        "
        v-model:mechanism-synopsis="previousInput.mechanism_synopsis.name"
        v-model:mechanism-synopsis-support="
          previousInput.mechanism_synopsis.support
        "
        :mechanismEvidence="previousInput.mechanism_evidence"
        @update-mechanism-evidence="
          (updatedMechanismEvidence) =>
            (previousInput.mechanism_evidence = updatedMechanismEvidence)
        "
        :mechanismGeneStats="geneFunctionData.gene_stats"
      />
      <Disease
        :inputGeneSymbol="previousInput.locus"
        :geneDiseaseData="geneDiseaseData"
        :isGeneDiseaseDataLoading="isGeneDiseaseDataLoading"
        :geneDiseaseErrorMsg="geneDiseaseErrorMsg"
        v-model:disease-name="previousInput.disease.disease_name"
        v-model:disease-cross-references="
          previousInput.disease.cross_references
        "
      />
      <Panel
        :panelData="panelData"
        :isPanelDataLoading="isPanelDataLoading"
        :panelErrorMsg="panelErrorMsg"
        v-model:panels="previousInput.panels"
      />
      <Confidence
        :attributesData="attributesData"
        :inputPublications="previousInput.publications"
        v-model:justification="previousInput.confidence.justification"
        v-model:level="previousInput.confidence.level"
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
        <i class="bi bi-exclamation-circle-fill"></i> {{ submitErrorMsg }}
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
      <button type="button" class="btn btn-primary" @click="saveDraft">
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
      :stableId="stableID"
    />
    <PublishSuccessAlert
      v-if="
        !isSubmitDataLoading && isSaveBeforePublishSuccess && isPublishSuccess
      "
      :successMsg="publishSuccessMsg"
      :stableId="stableID"
    />
    <PublishModal @publish="saveAndPublishEntry" />
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
