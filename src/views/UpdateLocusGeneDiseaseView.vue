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
import SaveDraftModal from "../components/curation/SaveDraftModal.vue";
import PublishModal from "../components/curation/PublishModal.vue";
import PublishSuccessAlert from "../components/curation/PublishSuccessAlert.vue";
import SaveNotPublishSuccessAlert from "../components/curation/SaveNotPublishSuccessAlert.vue";
import {
  updateInputWithPublicationsData,
  prepareInputForDataSubmission,
  prepareInputForUpdating,
  updateHpoTermsInputHelperWithPublicationsData,
} from "../utility/CurationUtility.js";
import SaveSuccessAlert from "../components/curation/SaveSuccessAlert.vue";
import AlertModal from "../components/curation/AlertModal.vue";

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
      isGeneDataLoading: false,
      isGeneDiseaseDataLoading: false,
      isSubmitDataLoading: false,
      hpoTermsInputHelper: {},
      geneData: null,
      geneFunctionData: null,
      attributesData: null,
      geneErrorMsg: null,
      submitErrorMsg: null,
      isSubmitSuccess: false,
      submitSuccessMsg: null,
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
  },
  methods: {
    fetchPreviousCurationInput() {
      this.isPreviousInputDataLoading = true;
      this.previousInput = this.errorMsg = null;
      this.stableID = this.$route.params.stableID;
      fetch(`/gene2phenotype/api/curation/${this.stableID}`)
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
      Promise.all([
        fetch(`/gene2phenotype/api/gene/${this.previousInput.locus}/function/`),
        fetch(`/gene2phenotype/api/gene/${this.previousInput.locus}/`),
        fetch("/gene2phenotype/api/attribs/"),
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
      fetch(`/gene2phenotype/api/gene/${this.previousInput.locus}/disease`)
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
      fetch("/gene2phenotype/api/panels/")
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
      fetch(`/gene2phenotype/api/publication/${pmidListStr}/`)
        .then((response) => {
          responseStatus = response.status;
          return response.json();
        })
        .then((responseJson) => {
          this.isPublicationsDataLoading = false;
          if (responseStatus === 200) {
            const publicationsData = responseJson;
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
    fetchHpoTerms(pmid) {
      // if hpoTermsInput is empty then set isHpoTermsValid to false and dont continue further
      if (this.hpoTermsInputHelper[pmid].hpoTermsInput.trim() === "") {
        this.hpoTermsInputHelper[pmid].isHpoTermsValid = false;
        return;
      }
      // if hpoTermsInput is not empty then continue further
      this.hpoTermsInputHelper[pmid].isHpoTermsValid = true;
      this.hpoTermsInputHelper[pmid].hpoTermsErrorMsg = "";
      this.hpoTermsInputHelper[pmid].isHpoTermsDataLoading = true;
      let hpoTermsListStr = this.hpoTermsInputHelper[pmid].hpoTermsInput
        .trim()
        .split(";")
        .filter((item) => item.trim())
        .map((item) => item.trim())
        .join(",");
      let responseStatus = null;
      fetch(`/gene2phenotype/api/phenotype/${hpoTermsListStr}/`)
        .then((response) => {
          responseStatus = response.status;
          return response.json();
        })
        .then((responseJson) => {
          this.hpoTermsInputHelper[pmid].isHpoTermsDataLoading = false;
          if (responseStatus === 200 && responseJson && responseJson.results) {
            this.previousInput.phenotypes[pmid].hpo_terms =
              responseJson.results;
          } else if (responseStatus === 404) {
            this.hpoTermsInputHelper[pmid].hpoTermsErrorMsg =
              responseJson.detail
                ? responseJson.detail
                : "Unable to fetch hpo terms";
            console.log(this.hpoTermsInputHelper[pmid].hpoTermsErrorMsg);
          } else {
            this.hpoTermsInputHelper[pmid].hpoTermsErrorMsg =
              "Unable to fetch hpo terms";
            console.log(this.hpoTermsInputHelper[pmid].hpoTermsErrorMsg);
          }
        })
        .catch((error) => {
          this.hpoTermsInputHelper[pmid].isHpoTermsDataLoading = false;
          this.hpoTermsInputHelper[pmid].hpoTermsErrorMsg =
            "Unable to fetch hpo terms";
          console.log(error);
        });
    },
    saveDraft() {
      this.submitErrorMsg = this.submitSuccessMsg = null;
      this.isSubmitSuccess = false;
      this.isSubmitDataLoading = true;
      const preparedUpdatedInput = prepareInputForDataSubmission(
        this.previousInput
      );
      // const stableID = this.$route.params.stableID;
      const requestBody = {
        json_data: preparedUpdatedInput,
      };
      let responseStatus = null;
      fetch(`/gene2phenotype/api/curation/${this.stableID}/update/`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
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
            let errorMsg = "Unable to submit data. Please try again later.";
            if (
              responseJson.errors?.message &&
              responseJson.errors?.message.length > 0
            ) {
              errorMsg = "Error: " + responseJson.errors.message[0];
            }
            this.submitErrorMsg = errorMsg;
            console.log(errorMsg);
          }
        })
        .catch((error) => {
          this.isSubmitDataLoading = false;
          this.submitErrorMsg =
            "Unable to submit data. Please try again later.";
          console.log(error);
        });
    },
    async publishEntry() {
      this.publishErrorMsg =
        this.publishSucessMsg =
        this.submitErrorMsg =
        this.submitSuccessMsg =
          null;
      this.isPublishSuccess = this.isSubmitSuccess = false;
      this.isPublishDataLoading = this.isSubmitDataLoading = true;
      this.stableId = null;

      const preparedInput = prepareInputForDataSubmission(this.previousInput);
      const requestBody = { json_data: preparedInput };

      try {
        // Updating Data
        const submitResponse = await fetch(
          `/gene2phenotype/api/curation/${this.stableID}/update/`,
          {
            method: "PUT",
            body: JSON.stringify(requestBody),
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        const submitResponseJson = await submitResponse.json();
        this.isSubmitDataLoading = false;

        if (submitResponse.status === 200) {
          this.isSubmitSuccess = true;
          this.submitSuccessMsg = submitResponseJson.message;
          this.isSubmitSuccess = false;
        } else {
          let errorMsg = "Unable to submit data. Please try again later.";
          if (
            submitResponse.errors?.message &&
            submitResponseJson.errors?.message.length > 0
          ) {
            errorMsg = "Error: " + submitResponseJson.errors.message[0];
          }
          this.submitErrorMsg = errorMsg;
          console.log(errorMsg);
        }

        // Publishing Data
        if ((this.submitSuccess = true && this.stableID)) {
          const publishResponse = await fetch(
            `/gene2phenotype/api/curation/publish/${this.stableID}/`,
            {
              method: "POST",
              headers: {
                "Content-Length": 0,
              },
            }
          );

          const publishResponseJson = await publishResponse.json();
          this.isPublishDataLoading = false;
          if (publishResponse.status === 201) {
            this.isPublishSuccess = true;
            this.publishSuccessMsg = publishResponseJson.message;
          } else {
            let errorMsg = "Unable to publish data.";
            errorMsg += publishResponseJson.message;
            this.publishErrorMsg = errorMsg;
          }
        }
      } catch (error) {
        this.isSubmitDataLoading = this.isPublishDataLoading = false;
        this.submitErrorMsg = this.publishErrorMsg =
          "Unable to submit data. Please try again later.";
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
    <h2>Update G2P Record</h2>
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
    <div v-if="geneData && !isSubmitDataLoading && !isSubmitSuccess">
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
        :fetchHpoTerms="fetchHpoTerms"
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
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-if="submitErrorMsg">
      <div>
        <i class="bi bi-exclamation-circle-fill"></i> {{ submitErrorMsg }}
      </div>
    </div>
    <div
      class="d-flex justify-content-between py-3"
      v-if="geneData && !isSubmitDataLoading && !isSubmitSuccess"
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
    <SaveNotPublishSuccessAlert
      v-if="submitSuccessMsg && publishErrorMsg"
      :errorMsg="publishErrorMsg"
      :stableId="stableID"
    />
    <SaveSuccessAlert v-if="isSubmitSuccess" :successMsg="submitSuccessMsg" />
    <PublishModal @publish="publishEntry" />
    <PublishSuccessAlert
      v-if="isPublishSuccess"
      :successMsg="publishSuccessMsg"
      :stableId="stableID"
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
