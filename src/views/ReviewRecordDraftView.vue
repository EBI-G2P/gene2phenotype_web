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
import Comment from "../components/curation/Comment.vue";
import SaveSuccessAlert from "../components/alert/SaveSuccessAlert.vue";
import RemovePublicationModal from "../components/modal/RemovePublicationModal.vue";
import CurationGuidelinesModals from "../components/modal/CurationGuidelinesModals.vue";
import ConfirmSaveDraftModal from "../components/modal/ConfirmSaveDraftModal.vue";
import {
  ATTRIBS_URL,
  GENE_DISEASE_URL,
  GENE_FUNCTION_URL,
  GENE_URL,
  HPO_SEARCH_API_URL,
  PUBLICATIONS_URL,
  SAVED_DRAFT_DATA_URL,
  UPDATE_SAVED_DRAFT_URL,
  USER_PANELS_URL,
} from "../utility/UrlConstants.js";
import {
  fetchAndLogApiResponseErrorMsg,
  fetchAndLogGeneralErrorMsg,
} from "../utility/ErrorUtility.js";
import {
  prepareInputForUpdating,
  prepareInputForDataSubmission,
  updateInputWithNewPublicationsData,
  updateInputWithRemovedPublications,
  updateHpoTermsInputHelperWithNewPublicationsData,
  updateHpoTermsInputHelperWithRemovedPublications,
} from "../utility/CurationUtility.js";
import api from "../services/api.js";
import axios from "axios";

export default {
  created() {
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchDraftData();
      },
      { immediate: true },
    );
  },
  data() {
    return {
      stableId: null,
      draftInput: null,
      isDraftDataLoading: false,
      errorMsg: null,
      locusMismatchMsg: null,
      hpoTermsInputHelper: {},
      isGeneDataLoading: false,
      isGeneDiseaseDataLoading: false,
      geneData: null,
      geneDiseaseData: null,
      geneFunctionData: null,
      attributesData: null,
      geneErrorMsg: null,
      geneDiseaseErrorMsg: null,
      isSubmitDataLoading: false,
      submitErrorMsg: null,
      isSubmitSuccess: false,
      submitSuccessMsg: null,
      publicationsErrorMsg: null,
      isPublicationsDataLoading: false,
      inputPmids: "",
      isInputPmidsValid: true,
      inputPmidsInvalidMsg: "",
      panelErrorMsg: null,
      isPanelDataLoading: false,
      panelData: null,
    };
  },
  beforeRouteLeave(to, from) {
    if (this.geneData && !this.isSubmitSuccess && to?.path !== "/login") {
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
    Comment,
    SaveSuccessAlert,
    RemovePublicationModal,
    CurationGuidelinesModals,
    ConfirmSaveDraftModal,
  },
  methods: {
    fetchDraftData() {
      this.isDraftDataLoading = true;
      this.draftInput = this.errorMsg = null;
      this.stableId = this.$route.params.stableId;
      api
        .get(SAVED_DRAFT_DATA_URL.replace(":stableid", this.stableId))
        .then((response) => {
          this.draftInput = prepareInputForUpdating(response.data?.data);
          let pmidList = Object.keys(this.draftInput.publications);
          this.hpoTermsInputHelper =
            updateHpoTermsInputHelperWithNewPublicationsData(
              this.hpoTermsInputHelper,
              pmidList,
            );
          const inputLocus = this.draftInput.locus;
          this.fetchGeneInformation(inputLocus);
          this.fetchGeneDiseaseInformation(inputLocus);
          this.fetchPanels();
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch draft data. Please try again later.",
            "Unable to fetch draft data.",
          );
        })
        .finally(() => {
          this.isDraftDataLoading = false;
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

          // Check if there is mismatch between draftInput gene symbol and latest gene symbol
          if (
            latestGeneSymbol?.toUpperCase() !== inputLocus.trim().toUpperCase()
          ) {
            // If there is a mismatch
            // Then display mismatch msg
            this.locusMismatchMsg = `Note: '${latestGeneSymbol}' is the latest gene symbol of '${inputLocus}'. The 'Gene Information' and 'Disease Name' sections have been updated to use '${latestGeneSymbol}'.`;
            // And set draftInput.locus to the latest gene symbol fetched from the database
            this.draftInput.locus = latestGeneSymbol;
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
            this.draftInput = updateInputWithNewPublicationsData(
              this.draftInput,
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
      const addedPmidsList = Object.keys(this.draftInput.publications);
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
      this.draftInput = updateInputWithRemovedPublications(
        this.draftInput,
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
    saveDraft() {
      this.submitErrorMsg = this.submitSuccessMsg = null;
      this.isSubmitSuccess = false;
      this.isSubmitDataLoading = true;

      const preparedInput = prepareInputForDataSubmission(this.draftInput);
      const requestBody = {
        json_data: preparedInput,
      };

      api
        .put(
          UPDATE_SAVED_DRAFT_URL.replace(":stableid", this.stableId),
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
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2>Review draft for record</h2>
    <div
      v-if="isDraftDataLoading || isGeneDataLoading || isSubmitDataLoading"
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
        {{ errorMsg || geneErrorMsg }}
      </div>
    </div>
    <div v-if="geneData && !isSubmitDataLoading && !isSubmitSuccess">
      <dl class="row pb-0 mb-0 mt-3">
        <dt class="col-auto">Draft name</dt>
        <dd class="col mb-0">
          {{ draftInput?.session_name }}
        </dd>
      </dl>
      <div
        v-if="locusMismatchMsg"
        class="alert alert-warning mt-3"
        role="alert"
      >
        <div>
          <i class="bi bi-info-circle"></i>
          {{ locusMismatchMsg }}
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
        v-model:publications="draftInput.publications"
        v-model:input-pmids="inputPmids"
        :isInputPmidsValid="isInputPmidsValid"
        :inputPmidsInvalidMsg="inputPmidsInvalidMsg"
      />
      <ClinicalPhenotype
        v-model:clinical-phenotype="draftInput.phenotypes"
        v-model:hpo-terms-input-helper="hpoTermsInputHelper"
        :fetchAndSearchHPO="fetchAndSearchHPO"
      />
      <Genotype
        :attributesData="attributesData"
        v-model:allelic-requirement="draftInput.allelic_requirement"
        v-model:cross-cutting-modifiers="draftInput.cross_cutting_modifier"
      />
      <VariantInformation
        :pmidList="Object.keys(draftInput.publications)"
        :variantTypes="draftInput.variant_types"
        @update-variant-types="
          (updatedVariantTypes) =>
            (draftInput.variant_types = updatedVariantTypes)
        "
        v-model:variant-descriptions="draftInput.variant_descriptions"
        :variantConsequences="draftInput.variant_consequences"
        @update-variant-consequences="
          (updatedVariantConsequences) =>
            (draftInput.variant_consequences = updatedVariantConsequences)
        "
      />
      <Mechanism
        v-model:molecular-mechanism="draftInput.molecular_mechanism.name"
        v-model:molecular-mechanism-support="
          draftInput.molecular_mechanism.support
        "
        :mechanismSynopsis="draftInput.mechanism_synopsis"
        @update-mechanism-synopsis="
          (updatedMechanismSynopsis) =>
            (draftInput.mechanism_synopsis = updatedMechanismSynopsis)
        "
        :mechanismEvidence="draftInput.mechanism_evidence"
        @update-mechanism-evidence="
          (updatedMechanismEvidence) =>
            (draftInput.mechanism_evidence = updatedMechanismEvidence)
        "
        :mechanismGeneStats="geneFunctionData.gene_stats"
        :sourceData="draftInput.source_data"
      />
      <Disease
        :inputGeneSymbol="draftInput.locus"
        :geneDiseaseData="geneDiseaseData"
        :isGeneDiseaseDataLoading="isGeneDiseaseDataLoading"
        :geneDiseaseErrorMsg="geneDiseaseErrorMsg"
        v-model:disease-name="draftInput.disease.disease_name"
        v-model:disease-cross-references="draftInput.disease.cross_references"
        :sourceData="draftInput.source_data"
      />
      <Panel
        :panelData="panelData"
        :isPanelDataLoading="isPanelDataLoading"
        :panelErrorMsg="panelErrorMsg"
        v-model:panels="draftInput.panels"
      />
      <Confidence
        :attributesData="attributesData"
        :inputPublications="draftInput.publications"
        v-model:confidence="draftInput.confidence"
        :geneData="geneData"
      />
      <Comment
        v-model:private-comment="draftInput.private_comment"
        v-model:public-comment="draftInput.public_comment"
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
      v-if="geneData && !isSubmitDataLoading && !isSubmitSuccess"
      class="d-flex justify-content-between py-3"
    >
      <router-link class="btn btn-outline-primary" to="/draft-records">
        <i class="bi bi-arrow-left-circle"></i> Exit
      </router-link>
      <button
        class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#confirm-save-draft-modal"
      >
        <i class="bi bi-floppy-fill"></i> Save Draft
      </button>
    </div>
    <SaveSuccessAlert
      v-if="!isSubmitDataLoading && isSubmitSuccess"
      :successMsg="submitSuccessMsg"
      :show-add-button="false"
    />
    <ConfirmSaveDraftModal @savedraft="saveDraft" />
    <RemovePublicationModal
      :pmidList="Object.keys(draftInput?.publications || {})"
      @removePublication="(pmid) => removePublication(pmid)"
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
