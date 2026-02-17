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
  updateInputWithNewPublicationsData,
  prepareInputForDataSubmission,
  prepareInputForUpdating,
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
  SAVED_DRAFT_DATA_URL,
  UPDATE_SAVED_DRAFT_URL,
  USER_PANELS_URL,
} from "../utility/UrlConstants.js";
import Comment from "../components/curation/Comment.vue";
import {
  fetchAndLogApiResponseErrorMsg,
  fetchAndLogGeneralErrorMsg,
} from "../utility/ErrorUtility.js";
import api from "../services/api.js";
import axios from "axios";
import RecordWarningModal from "../components/modal/RecordWarningModal.vue";
import CurationGuidelinesModals from "../components/modal/CurationGuidelinesModals.vue";

export default {
  created() {
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchPreviousCurationInput();
      },
      { immediate: true },
    );
  },
  data() {
    return {
      isPreviousInputDataLoading: false,
      previousInput: null,
      errorMsg: null,
      userLocusMismatchMsg: null,
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
      stableID: null,
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
    Comment,
    RecordWarningModal,
    CurationGuidelinesModals,
  },
  methods: {
    fetchPreviousCurationInput() {
      this.isPreviousInputDataLoading = true;
      this.previousInput = this.errorMsg = null;
      this.stableID = this.$route.params.stableID;
      api
        .get(SAVED_DRAFT_DATA_URL.replace(":stableid", this.stableID))
        .then((response) => {
          this.previousInput = prepareInputForUpdating(response.data.data);
          let pmidList = Object.keys(this.previousInput.publications);
          this.hpoTermsInputHelper =
            updateHpoTermsInputHelperWithNewPublicationsData(
              this.hpoTermsInputHelper,
              pmidList,
            );
          const inputLocus = this.previousInput.locus;
          this.fetchGeneInformation(inputLocus);
          this.fetchGeneDiseaseInformation(inputLocus);
          this.fetchPanels();
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch curation data. Please try again later.",
            "Unable to fetch curation data.",
          );
        })
        .finally(() => {
          this.isPreviousInputDataLoading = false;
        });
    },
    fetchGeneInformation(inputLocus) {
      this.geneErrorMsg =
        this.geneFunctionData =
        this.geneData =
        this.attributesData =
          null;
      this.isGeneDataLoading = true;
      Promise.all([
        api.get(GENE_FUNCTION_URL.replace(":locus", inputLocus)),
        api.get(GENE_URL.replace(":locus", inputLocus)),
        api.get(ATTRIBS_URL),
      ])
        .then(([response1, response2, response3]) => {
          this.geneFunctionData = response1.data;
          this.geneData = response2.data;
          this.attributesData = response3.data;

          const latestGeneSymbol = response2.data?.gene_symbol;

          // Check if there is mismatch between previousInput gene symbol and latest gene symbol
          if (
            latestGeneSymbol?.toUpperCase() !== inputLocus.trim().toUpperCase()
          ) {
            // If there is a mismatch
            // Then display mismatch msg
            this.userLocusMismatchMsg = `Note: '${latestGeneSymbol}' is the latest gene symbol of '${inputLocus}'. The 'Gene Information' and 'Disease Name' sections have been updated to use '${latestGeneSymbol}'.`;
            // And set previousInput.locus to the latest gene symbol fetched from the database
            this.previousInput.locus = latestGeneSymbol;
          }
        })
        .catch((error) => {
          this.geneErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch gene data. Please try again later.",
            "Unable to fetch gene data.",
          );
        })
        .finally(() => {
          this.isGeneDataLoading = false;
        });
    },
    fetchGeneDiseaseInformation(inputLocus) {
      this.geneDiseaseErrorMsg = this.geneDiseaseData = null;
      this.isGeneDiseaseDataLoading = true;
      api
        .get(GENE_DISEASE_URL.replace(":locus", inputLocus))
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
            this.previousInput = updateInputWithNewPublicationsData(
              this.previousInput,
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
      const addedPmidsList = Object.keys(this.previousInput.publications);
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
      this.previousInput = updateInputWithRemovedPublications(
        this.previousInput,
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
        this.previousInput.confidence,
        this.previousInput.publications,
        this.previousInput.variant_consequences,
        this.previousInput.variant_types,
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
    saveDraft() {
      this.publishErrorMsg =
        this.publishSucessMsg =
        this.saveBeforePublishErrorMsg =
          null;
      this.isPublishSuccess = this.isSaveBeforePublishSuccess = false;

      this.submitErrorMsg = this.submitSuccessMsg = null;
      this.isSubmitSuccess = false;

      this.isSubmitDataLoading = true;

      const preparedUpdatedInput = prepareInputForDataSubmission(
        this.previousInput,
      );

      const requestBody = {
        json_data: preparedUpdatedInput,
      };
      api
        .put(
          UPDATE_SAVED_DRAFT_URL.replace(":stableid", this.stableID),
          requestBody,
        )
        .then((response) => {
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

      // Save and publish scenarios:
      // 1. IF Save fails THEN saveBeforePublishErrorMsg=<error msg>, publishErrorMsg=publishSucessMsg=null, isSaveBeforePublishSuccess=isPublishSuccess=false
      // 2. IF Save succeeds but Publish fails THEN publishErrorMsg=<error msg>, saveBeforePublishErrorMsg=publishSucessMsg=null, isSaveBeforePublishSuccess=true, isPublishSuccess=false
      // 3. IF Save and Publish both succeed THEN publishSucessMsg=<success msg>, saveBeforePublishErrorMsg=publishErrorMsg=null, isSaveBeforePublishSuccess=isPublishSuccess=true

      const preparedInput = prepareInputForDataSubmission(this.previousInput);
      const requestBody = { json_data: preparedInput };

      try {
        // Call API to Save draft
        await api.put(
          UPDATE_SAVED_DRAFT_URL.replace(":stableid", this.stableID),
          requestBody,
        );

        this.isSaveBeforePublishSuccess = true;

        // Call API to Publish Data
        const publishResponse = await api.post(
          PUBLISH_URL.replace(":stableid", this.stableID),
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
    <h2>Update G2P Record Draft</h2>
    <div
      v-if="
        isPreviousInputDataLoading || isGeneDataLoading || isSubmitDataLoading
      "
      class="d-flex justify-content-center"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div
      v-if="errorMsg || geneErrorMsg"
      class="alert alert-danger mt-3"
      role="alert"
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
      <div
        v-if="userLocusMismatchMsg"
        class="alert alert-warning mt-3"
        role="alert"
      >
        <div>
          <i class="bi bi-info-circle"></i>
          {{ userLocusMismatchMsg }}
        </div>
      </div>
      <div class="my-3">
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
        v-model:publications="previousInput.publications"
        v-model:input-pmids="inputPmids"
        :isInputPmidsValid="isInputPmidsValid"
        :inputPmidsInvalidMsg="inputPmidsInvalidMsg"
      />
      <ClinicalPhenotype
        v-model:clinical-phenotype="previousInput.phenotypes"
        v-model:hpo-terms-input-helper="hpoTermsInputHelper"
        :fetchAndSearchHPO="fetchAndSearchHPO"
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
        :mechanismSynopsis="previousInput.mechanism_synopsis"
        @update-mechanism-synopsis="
          (updatedMechanismSynopsis) =>
            (previousInput.mechanism_synopsis = updatedMechanismSynopsis)
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
        v-model:confidence="previousInput.confidence"
        :geneData="geneData"
      />
      <Comment
        v-model:private-comment="previousInput.private_comment"
        v-model:public-comment="previousInput.public_comment"
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
        <i class="bi bi-exclamation-circle-fill"></i> {{ submitErrorMsg }}
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
      <button type="button" class="btn btn-primary" @click="saveDraft">
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
    <RemovePublicationModal
      :pmidList="Object.keys(previousInput?.publications || {})"
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
