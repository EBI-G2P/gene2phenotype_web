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
import {
  updateInputWithPublicationsData,
  prepareInputForDataSubmission,
  prepareInputForUpdating,
  appendObjectToPublications,
} from "../utility/CurationUtility.js";
import SaveSuccessAlert from "../components/curation/SaveSuccessAlert.vue";

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
      input: prepareInputForDataSubmission,
      isPreviousInputDataLoading: false,
      oldJSON: null,
      session: null,
      errorMsg: null,
      isGeneDataLoading: false,
      isGeneDiseaseDataLoading: false,
      isSubmitDataLoading: false,
      geneData: null,
      geneFunctionData: null,
      attributesData: null,
      geneErrorMsg: null,
      submitErrorMsg: null,
      isSubmitSuccess: false,
      publicationsErrorMsg: null,
      isPublicationsDataLoading: false,
      publicationsData: null,
      panelErrorMsg: null,
      isPanelDataLoading: false,
      panelData: null,
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
    SaveSuccessAlert,
  },
  methods: {
    fetchPreviousCurationInput() {
      this.isPreviousInputDataLoading = true;
      this.oldJSON = null;
      const stableID = this.$route.params.stableID;
      fetch(`/gene2phenotype/api/curation/${stableID}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Unable to fetch curation information");
          }
        })
        .then((responseJson) => {
          const responseData = responseJson.data;
          const session_name = responseJson.session_name;
          this.session = session_name;
          this.oldJSON = prepareInputForUpdating(responseData);
          console.log(this.oldJSON);
          this.fetchGeneInformation();
          this.fetchGeneDiseaseInformation();
          this.fetchPanels();
          this.fetchPublications(
            Object.keys(this.oldJSON.publications).join(";")
          );
          this.isPreviousInputDataLoading = false;
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
        fetch(`/gene2phenotype/api/gene/${this.oldJSON.locus}/function/`),
        fetch(`/gene2phenotype/api/gene/${this.oldJSON.locus}/`),
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
      fetch(`/gene2phenotype/api/gene/${this.oldJSON.locus}/disease`)
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
    fetchPublications(inputPmids) {
      this.publicationsErrorMsg = this.publicationsData = null;
      this.isPublicationsDataLoading = true;
      let pmidListStr = inputPmids
        .split(";")
        .filter((item) => item)
        .join(",");
      fetch(`/gene2phenotype/api/publication/${pmidListStr}/`)
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            return Promise.reject(
              new Error("Unable to fetch publications data")
            );
          }
        })
        .then((responseJson) => {
          this.isPublicationsDataLoading = false;
          this.publicationsData = responseJson;
          this.publicationsData = appendObjectToPublications(
            this.publicationsData,
            this.oldJSON.publications
          );
          if (this.publicationsData && this.publicationsData.results) {
            this.oldJSON = updateInputWithPublicationsData(
              this.oldJSON,
              this.publicationsData
            );
          }
        })
        .catch((error) => {
          this.isPublicationsDataLoading = false;
          this.publicationsErrorMsg = error.message;
          console.log(error);
        });
    },
    saveDraft() {
      this.submitErrorMsg = null;
      this.isSubmitSuccess = false;
      this.isSubmitDataLoading = true;
      console.log(this.oldJSON);
      const preparedInput = prepareInputForDataSubmission(this.oldJSON);
      const stableID = this.$route.params.stableID;
      const requestBody = {
        json_data: preparedInput,
      };
      let responseStatus = null;
      fetch(`/gene2phenotype/api/curation/${stableID}/update/`, {
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
    <div v-if="geneData">
      <GeneInformation
        :geneData="geneData"
        :geneFunctionData="geneFunctionData"
      />
      <Publication
        :fetchPublications="fetchPublications"
        :publicationsData="publicationsData"
        :isPublicationsDataLoading="isPublicationsDataLoading"
        :publicationsErrorMsg="publicationsErrorMsg"
        v-model:publications="oldJSON.publications"
      />
      <ClinicalPhenotype v-model:clinical-phenotype="oldJSON.phenotypes" />
      <Genotype
        :attributesData="attributesData"
        v-model:allelic-requirement="oldJSON.allelic_requirement"
        v-model:cross-cutting-modifiers="oldJSON.cross_cutting_modifier"
      />
      <VariantInformation
        :publicationsData="publicationsData"
        :variantTypes="oldJSON.variant_types"
        @update-variant-types="
          (updatedVariantTypes) => (oldJSON.variant_types = updatedVariantTypes)
        "
        v-model:variant-descriptions="oldJSON.variant_descriptions"
        :variantConsequences="oldJSON.variant_consequences"
        @update-variant-consequences="
          (updatedVariantConsequences) =>
            (oldJSON.variant_consequences = updatedVariantConsequences)
        "
      />
      <Mechanism
        v-model:molecular-mechanism="oldJSON.molecular_mechanism.name"
        v-model:molecular-mechanism-support="
          oldJSON.molecular_mechanism.support
        "
        v-model:mechanism-synopsis="oldJSON.mechanism_synopsis.name"
        v-model:mechanism-synopsis-support="oldJSON.mechanism_synopsis.support"
        :mechanismEvidence="oldJSON.mechanism_evidence"
        @update-mechanism-evidence="
          (updatedMechanismEvidence) =>
            (oldJSON.mechanism_evidence = updatedMechanismEvidence)
        "
      />
      <Disease
        :inputGeneSymbol="oldJSON.locus"
        :geneDiseaseData="geneDiseaseData"
        :isGeneDiseaseDataLoading="isGeneDiseaseDataLoading"
        :geneDiseaseErrorMsg="geneDiseaseErrorMsg"
        v-model:disease-name="oldJSON.disease.disease_name"
        v-model:disease-cross-references="oldJSON.disease.cross_references"
      />
      <Panel
        :panelData="panelData"
        :isPanelDataLoading="isPanelDataLoading"
        :panelErrorMsg="panelErrorMsg"
        v-model:panels="oldJSON.panels"
      />
      <Confidence
        :attributesData="attributesData"
        :inputPublications="oldJSON.publications"
        v-model:justification="oldJSON.confidence.justification"
        v-model:level="oldJSON.confidence.level"
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
      <button
        class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#save-draft-modal"
      >
        <i class="bi bi-floppy-fill"></i> Save Draft
      </button>
      <button class="btn btn-primary">
        <i class="bi bi-send-fill"></i> Publish
      </button>
    </div>
    <SaveSuccessAlert v-if="isSubmitSuccess" />
    <SaveDraftModal v-model:sessionname="session" @savedraft="saveDraft" />
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