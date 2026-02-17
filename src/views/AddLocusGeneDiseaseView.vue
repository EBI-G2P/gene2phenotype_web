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
  checkRecordWarnings,
} from "../utility/CurationUtility.js";
import SaveSuccessAlert from "../components/alert/SaveSuccessAlert.vue";
import AlertModal from "../components/modal/AlertModal.vue";
import RemovePublicationModal from "../components/modal/RemovePublicationModal.vue";
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
  fetchAndLogApiResponseErrorMsg,
  fetchAndLogGeneralErrorMsg,
} from "../utility/ErrorUtility.js";
import RecordWarningModal from "../components/modal/RecordWarningModal.vue";
import CurationGuidelinesModals from "../components/modal/CurationGuidelinesModals.vue";

export default {
  data() {
    return {
      input: getInitialInputForNewCuration(),
      userLocus: "",
      userLocusMismatchMsg: null,
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
      recordWarnings: [],
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
        "Are you sure you want to leave? You have unsaved changes which will be lost. Consider saving your changes before leaving.",
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
    RecordWarningModal,
    CurationGuidelinesModals,
  },
  methods: {
    geneSearchBtnClickHandler() {
      if (this.userLocus !== "") {
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
      if (this.userLocus !== "") {
        this.isInputLocusValid = true;
        // Display ExistingGeneInformation component
        this.isDisplayGeneExistingData = true;
        // Notify ExistingGeneInformation component to fetch existing data for gene
        this.notifyExistingGeneInformation = true;
      } else {
        this.isInputLocusValid = false;
      }
    },
    fetchGeneInformation() {
      this.geneErrorMsg =
        this.geneFunctionData =
        this.geneData =
        this.attributesData =
          null;
      this.isGeneDataLoading = true;
      Promise.all([
        api.get(GENE_FUNCTION_URL.replace(":locus", this.userLocus)),
        api.get(GENE_URL.replace(":locus", this.userLocus)),
        api.get(ATTRIBS_URL),
      ])
        .then(([response1, response2, response3]) => {
          this.geneFunctionData = response1.data;
          this.geneData = response2.data;
          this.attributesData = response3.data;

          // Set input.locus to the latest gene symbol fetched from the database
          const latestGeneSymbol = response2.data?.gene_symbol;
          this.input.locus = latestGeneSymbol;

          // Check if there is mismatch between user given gene symbol and latest gene symbol
          if (
            latestGeneSymbol?.toUpperCase() !==
            this.userLocus.trim().toUpperCase()
          ) {
            // If there is a mismatch then display mismatch msg
            this.userLocusMismatchMsg = `Note: '${latestGeneSymbol}' is the latest gene symbol of '${this.userLocus}'. The 'Gene Information' and 'Disease Name' sections have been updated to use '${latestGeneSymbol}'.`;
          }
        })
        .catch((error) => {
          this.geneErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch gene data. Please check the gene name is correct and contact us at g2p-help@ebi.ac.uk if the problem continues.",
            "Unable to fetch gene data.",
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
        .get(GENE_DISEASE_URL.replace(":locus", this.userLocus))
        .then((response) => {
          this.geneDiseaseData = response.data;
        })
        .catch((error) => {
          this.geneDiseaseErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch gene disease data. Please try again later.",
            "Unable to fetch gene disease data.",
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
            "Unable to fetch panel data. Please try again later.",
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
              publicationsData,
            );
            let pmidList = publicationsData.results.map((item) => item.pmid);
            this.hpoTermsInputHelper =
              updateHpoTermsInputHelperWithNewPublicationsData(
                this.hpoTermsInputHelper,
                pmidList,
              );
            // clear inputPmids
            this.inputPmids = "";
          }
        })
        .catch((error) => {
          this.publicationsErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch publications. Please try again later.",
            "Unable to fetch publications.",
          );
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

      // check if inputPmidsList is empty list
      // Eg: ";;;" => []
      if (inputPmidsList.length === 0) {
        this.inputPmidsInvalidMsg = "Input is empty";
        return false;
      }

      // check for duplicate input publications
      const duplicatePmidsList = inputPmidsList.filter(
        (item, index) => inputPmidsList.indexOf(item) !== index,
      );
      if (duplicatePmidsList.length > 0) {
        this.inputPmidsInvalidMsg = `Duplicate publication(s): ${duplicatePmidsList.join(
          ", ",
        )}`;
        return false;
      }

      // check if any input publication has already been added
      const addedPmidsList = Object.keys(this.input.publications);
      const pmidsAlreadyAddedList = inputPmidsList.filter((item) =>
        addedPmidsList.includes(item),
      );
      if (pmidsAlreadyAddedList.length > 0) {
        this.inputPmidsInvalidMsg = `Publication(s) already added: ${pmidsAlreadyAddedList.join(
          ", ",
        )}`;
        return false;
      }

      // if inputPmids passed all above checks, then it is valid
      return true;
    },
    removePublication(removedPmidList) {
      this.input = updateInputWithRemovedPublications(
        this.input,
        removedPmidList,
      );
      this.hpoTermsInputHelper =
        updateHpoTermsInputHelperWithRemovedPublications(
          this.hpoTermsInputHelper,
          removedPmidList,
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
              "Failed to fetch HPO data. Please try again later.",
            );
        })
        .finally(() => {
          this.hpoTermsInputHelper[pmid].isLoadingValue = false;
        });
    },
    saveAndPublishClickHandler() {
      this.recordWarnings = checkRecordWarnings(
        this.input.confidence,
        this.input.publications,
        this.input.variant_consequences,
        this.input.variant_types,
      );
      const modalId = this.recordWarnings.length
        ? "record-warning-modal"
        : "publish-entry-modal";
      const modalElement = document.getElementById(modalId);
      let modal = bootstrap.Modal.getInstance(modalElement);
      if (!modal) {
        modal = new bootstrap.Modal(modalElement);
      }
      modal.show();
    },
    openPublishModal() {
      // Hide record-warning-modal
      const recordWarningModalElement = document.getElementById(
        "record-warning-modal",
      );
      const recordWarningModal = bootstrap.Modal.getInstance(
        recordWarningModalElement,
      );
      if (!recordWarningModal) {
        recordWarningModal = new bootstrap.Modal(recordWarningModalElement);
      }
      recordWarningModal.hide();

      // Wait for record-warning-modal to be hidden before showing publish-entry-modal
      recordWarningModalElement.addEventListener(
        "hidden.bs.modal",
        () => {
          const publishModalElement = document.getElementById(
            "publish-entry-modal",
          );
          let publishModal = bootstrap.Modal.getInstance(publishModalElement);
          if (!publishModal) {
            publishModal = new bootstrap.Modal(publishModalElement);
          }
          publishModal.show();
        },
        { once: true }, // ensure it only fires once
      );
    },
    refreshPage() {
      // Refresh current page
      this.$router.go();
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
          this.submitErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to save draft. Please try again later.",
            "Unable to save draft.",
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
          PUBLISH_URL.replace(":stableid", this.stableId),
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
            "Saved draft but unable to publish data.",
          );
        } else {
          this.saveBeforePublishErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to save and publish data. Please try again later.",
            "Unable to save and publish data.",
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
      v-if="
        !isSubmitDataLoading &&
        !isSubmitSuccess &&
        !isSaveBeforePublishSuccess &&
        !isPublishSuccess
      "
      class="row g-3 pt-3 pb-1"
    >
      <div class="col-auto">
        <label for="gene-symbol-input" class="col-form-label">
          Gene<span class="text-danger">*</span>
        </label>
      </div>
      <div class="col-3">
        <!-- TODO: Disable below input while also fetching existing gene data -->
        <input
          :class="
            isInputLocusValid ? 'form-control' : 'form-control is-invalid'
          "
          id="gene-symbol-input"
          v-model.trim="userLocus"
          aria-describedby="invalid-gene-symbol-input-feedback"
          @keyup.enter="existingGeneDataSearchHandler"
          :disabled="isGeneDataLoading || geneData || geneErrorMsg"
        />
        <div id="invalid-gene-symbol-input-feedback" class="invalid-feedback">
          Please enter a valid Gene.
        </div>
      </div>
      <div class="col-auto">
        <button
          v-if="geneData"
          type="button"
          class="btn btn-outline-danger mb-3"
          data-bs-toggle="modal"
          data-bs-target="#all-input-alert-modal"
        >
          <i class="bi bi-trash-fill"></i> Clear
        </button>
        <button
          v-else-if="geneErrorMsg"
          type="button"
          class="btn btn-outline-danger mb-3"
          @click="refreshPage"
        >
          <i class="bi bi-trash-fill"></i> Clear
        </button>
        <!-- TODO: Disable below button while also fetching existing gene data -->
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
    <p
      v-if="
        !isGeneDataLoading &&
        !geneData &&
        !isDisplayGeneExistingData &&
        !geneErrorMsg
      "
    >
      <i class="bi bi-info-circle"></i> Please enter Gene and click
      <b>Search</b> to proceed further.
    </p>
    <div
      v-if="isGeneDataLoading || isSubmitDataLoading"
      class="d-flex justify-content-center"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-if="geneErrorMsg" class="alert alert-danger mt-3" role="alert">
      <div>
        <i class="bi bi-exclamation-circle-fill"></i> {{ geneErrorMsg }}
      </div>
    </div>
    <ExistingGeneInformation
      v-if="isDisplayGeneExistingData"
      :gene="userLocus"
      :geneSearchBtnClickHandler="geneSearchBtnClickHandler"
      :notifyExistingGeneInformation="notifyExistingGeneInformation"
      @setNotifyExistingGeneInformation="
        (value) => (notifyExistingGeneInformation = value)
      "
    />
    <div
      v-if="
        geneData &&
        !isSubmitDataLoading &&
        !isSubmitSuccess &&
        !isSaveBeforePublishSuccess &&
        !isPublishSuccess
      "
    >
      <div v-if="userLocusMismatchMsg" class="alert alert-warning" role="alert">
        <div>
          <i class="bi bi-info-circle"></i>
          {{ userLocusMismatchMsg }}
        </div>
      </div>
      <div class="mb-3">
        <a
          href="https://ftp.ebi.ac.uk/pub/databases/gene2phenotype/curation_documentation/"
          style="text-decoration: none"
          target="_blank"
        >
          Full curation guidelines <i class="bi bi-box-arrow-up-right"></i>
        </a>
      </div>
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
        :mechanismSynopsis="input.mechanism_synopsis"
        @update-mechanism-synopsis="
          (updatedMechanismSynopsis) =>
            (input.mechanism_synopsis = updatedMechanismSynopsis)
        "
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
        :geneData="geneData"
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
      v-if="!isSubmitDataLoading && submitErrorMsg"
      class="alert alert-danger mt-3"
      role="alert"
    >
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ submitErrorMsg }}
      </div>
    </div>
    <div
      v-if="!isSubmitDataLoading && saveBeforePublishErrorMsg"
      class="alert alert-danger mt-3"
      role="alert"
    >
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ saveBeforePublishErrorMsg }}
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
      class="d-flex justify-content-between py-3"
    >
      <button
        class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#save-draft-modal"
      >
        <i class="bi bi-floppy-fill"></i> Save Draft
      </button>
      <button class="btn btn-primary" @click="saveAndPublishClickHandler">
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
      @confirm-click-handler="refreshPage"
    />
    <RemovePublicationModal
      :pmidList="Object.keys(input.publications)"
      @removePublication="(pmid) => removePublication(pmid)"
    />
    <RecordWarningModal
      :recordWarnings="recordWarnings"
      @confirm-click-handler="openPublishModal"
    />
    <CurationGuidelinesModals />
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
