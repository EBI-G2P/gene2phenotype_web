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
  updateInputWithNewPublicationsData,
  prepareInputForDataSubmission,
  updateHpoTermsInputHelperWithNewPublicationsData,
  updateInputWithRemovedPublications,
  updateHpoTermsInputHelperWithRemovedPublications,
} from "../utility/CurationUtility.js";
import SaveSuccessAlert from "../components/alert/SaveSuccessAlert.vue";
import AlertModal from "../components/modal/AlertModal.vue";
import RemovePublicationModal from "../components/modal/RemovePublicationModal.vue";
import cloneDeep from "lodash/cloneDeep";
import {
  ATTRIBS_URL,
  GENE_DISEASE_URL,
  GENE_FUNCTION_URL,
  GENE_URL,
  HPO_SEARCH_API_URL,
  PUBLICATIONS_URL,
  PUBLISH_URL,
  SAVE_DRAFT_URL,
  USER_PANELS_URL,
} from "../utility/UrlConstants.js";
import ExistingGeneInformation from "../components/curation/ExistingGeneInformation.vue";
import Comment from "../components/curation/Comment.vue";
import api from "../services/api.js";
import axios from "axios";
import {
  fetchAndLogApiResponseErrorListMsg,
  fetchAndLogApiResponseErrorMsg,
  fetchAndLogGeneralErrorMsg,
} from "../utility/ErrorUtility.js";

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
      inputPmidsInvalidMsg: "",
      panelErrorMsg: null,
      isPanelDataLoading: false,
      panelData: null,
      stableId: null,
      isDisplayGeneExistingData: false, // variable used to display ExistingGeneInformation component
      notifyExistingGeneInformation: false, // variable used to notify ExistingGeneInformation component to fetch existing data for gene
    };
  },
  beforeRouteLeave(to, from) {
    if (
      this.geneData &&
      !this.isSubmitSuccess &&
      !this.isSaveBeforePublishSuccess &&
      !this.isPublishSuccess &&
      to?.path !== "/login"
    ) {
      const answer = window.confirm(
        "Are you sure you want to leave? You have unsaved changes which will be lost. Consider saving your changes before leaving."
      );
      if (!answer) return false;
    }
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
    RemovePublicationModal,
    ExistingGeneInformation,
    Comment,
  },
  methods: {
    geneSearchBtnClickHandler() {
      if (this.input.locus !== "") {
        this.isInputLocusValid = true;
        // Do not display ExistingGeneInformation component
        this.isDisplayGeneExistingData = false;
        // Fetch relevant data
        this.fetchGeneInformation();
        this.fetchGeneDiseaseInformation();
        this.fetchPanels();
      } else {
        this.isInputLocusValid = false;
      }
    },
    existingGeneDataSearchHandler() {
      if (this.input.locus !== "") {
        this.isInputLocusValid = true;

        // Reset data variables of current gene before fetching data for another gene
        this.resetData();

        // Display ExistingGeneInformation component
        this.isDisplayGeneExistingData = true;
        // Notify ExistingGeneInformation component to fetch existing data for gene
        this.notifyExistingGeneInformation = true;
      } else {
        this.isInputLocusValid = false;
      }
    },
    resetData() {
      // if we are fetching data for another gene then we retain value of locus key and reset other keys of input obj
      const resetInput = getInitialInputForNewCuration();
      this.input = { ...cloneDeep(resetInput), locus: this.input.locus };

      // these variables wont be part of reset logic in this function:
      // isInputLocusValid, stableId, isDisplayGeneExistingData, notifyExistingGeneInformation

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
      this.inputPmidsInvalidMsg = "";
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
      Promise.all([
        api.get(GENE_FUNCTION_URL.replace(":locus", this.input.locus)),
        api.get(GENE_URL.replace(":locus", this.input.locus)),
        api.get(ATTRIBS_URL),
      ])
        .then(([response1, response2, response3]) => {
          this.geneFunctionData = response1.data;
          this.geneData = response2.data;
          this.attributesData = response3.data;
        })
        .catch((error) => {
          this.geneErrorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch gene data. Please check the gene name is correct and contact us at g2p-help@ebi.ac.uk if the problem continues."
          );
        })
        .finally(() => {
          this.isGeneDataLoading = false;
        });
    },
    fetchGeneDiseaseInformation() {
      this.geneDiseaseErrorMsg = this.geneDiseaseData = null;
      this.isGeneDiseaseDataLoading = true;
      api
        .get(GENE_DISEASE_URL.replace(":locus", this.input.locus))
        .then((response) => {
          this.geneDiseaseData = response.data;
        })
        .catch((error) => {
          this.geneDiseaseErrorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch gene disease data. Please try again later."
          );
        })
        .finally(() => {
          this.isGeneDiseaseDataLoading = false;
        });
    },
    fetchPanels() {
      this.panelErrorMsg = this.panelData = null;
      this.isPanelDataLoading = true;
      api
        .get(USER_PANELS_URL)
        .then((response) => {
          this.panelData = response.data;
        })
        .catch((error) => {
          this.panelErrorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch panel data. Please try again later."
          );
        })
        .finally(() => {
          this.isPanelDataLoading = false;
        });
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
      this.publicationsErrorMsg = null;
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
            this.publicationsErrorMsg = fetchAndLogApiResponseErrorMsg(
              error,
              error?.response?.data?.error,
              "Unable to fetch publications data."
            );
          } else {
            this.publicationsErrorMsg = fetchAndLogGeneralErrorMsg(
              error,
              "Unable to fetch publications data. Please try again later."
            );
          }
        })
        .finally(() => {
          this.isPublicationsDataLoading = false;
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

      // check if any input publication has already been added
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
    saveDraft() {
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
      api
        .post(SAVE_DRAFT_URL, requestBody)
        .then((response) => {
          this.stableId = null;
          this.stableId = response.data.result;
          this.isSubmitSuccess = true;
          this.submitSuccessMsg = response.data.message;
        })
        .catch((error) => {
          this.submitErrorMsg = fetchAndLogApiResponseErrorListMsg(
            error,
            "Unable to save draft. Please try again later.",
            "Unable to save draft."
          );
        })
        .finally(() => {
          this.isSubmitDataLoading = false;
        });
    },
    async saveAndPublishEntry() {
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
        const submitResponse = await api.post(SAVE_DRAFT_URL, requestBody);
        const submitResponseJson = submitResponse.data;

        this.isSaveBeforePublishSuccess = true;
        this.stableId = submitResponseJson.result;

        // Call API to Publish Data
        const publishResponse = await api.post(
          PUBLISH_URL.replace(":stableid", this.stableId)
        );
        const publishResponseJson = publishResponse.data;

        this.isSubmitDataLoading = false;
        this.isPublishSuccess = true;
        this.publishSuccessMsg = publishResponseJson.message;
      } catch (error) {
        this.isSubmitDataLoading = false;
        if (this.isSaveBeforePublishSuccess) {
          this.publishErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Saved draft but unable to publish data. Please try again later.",
            "Saved draft but unable to publish data."
          );
        } else {
          this.saveBeforePublishErrorMsg = fetchAndLogApiResponseErrorListMsg(
            error,
            "Unable to save and publish data. Please try again later.",
            "Unable to save and publish data."
          );
        }
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
        :inputPmidsInvalidMsg="inputPmidsInvalidMsg"
      />
      <ClinicalPhenotype
        v-model:clinical-phenotype="input.phenotypes"
        v-model:hpo-terms-input-helper="hpoTermsInputHelper"
        :fetchAndSearchHPO="fetchAndSearchHPO"
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
        v-model:confidence="input.confidence"
      />
      <Comment
        v-model:private-comment="input.private_comment"
        v-model:public-comment="input.public_comment"
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
    <RemovePublicationModal
      :pmidList="Object.keys(input.publications)"
      @removePublication="(pmid) => removePublication(pmid)"
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
