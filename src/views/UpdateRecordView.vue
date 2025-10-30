<script>
import { ATTRIBS_URL, LGD_RECORD_URL } from "../utility/UrlConstants.js";
import UpdateConfidence from "../components/update-record/UpdateConfidence.vue";
import UpdatePanel from "../components/update-record/UpdatePanel.vue";
import UpdateMechanism from "../components/update-record/UpdateMechanism.vue";
import api from "../services/api.js";
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";
import AddComment from "../components/update-record/AddComment.vue";
import UpdatePhenotype from "../components/update-record/UpdatePhenotype.vue";
import UpdateVariantConsequences from "../components/update-record/UpdateVariantConsequences.vue";
import UpdateVariantTypes from "../components/update-record/UpdateVariantTypes.vue";
import UpdateDisease from "../components/update-record/UpdateDisease.vue";
import UpdateReviewStatus from "../components/update-record/UpdateReviewStatus.vue";
import UpdateComment from "../components/update-record/UpdateComment.vue";
import { mapState } from "pinia";
import { useAuthStore } from "../store/auth.js";

export default {
  data() {
    return {
      isApiCallLoading: false,
      locusGeneDiseaseData: null,
      attributesData: null,
      errorMsg: null,
      stableId: null,
    };
  },
  components: {
    UpdateConfidence,
    UpdatePanel,
    UpdateMechanism,
    AddComment,
    UpdatePhenotype,
    UpdateVariantConsequences,
    UpdateVariantTypes,
    UpdateDisease,
    UpdateReviewStatus,
    UpdateComment,
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchLGDAndAttribsData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  methods: {
    fetchLGDAndAttribsData() {
      this.stableId = this.$route.params.stableId;
      this.errorMsg = this.locusGeneDiseaseData = this.attributesData = null;
      this.isApiCallLoading = true;
      Promise.all([
        api.get(ATTRIBS_URL),
        api.get(LGD_RECORD_URL.replace(":stableid", this.stableId)),
      ])
        .then(([response1, response2]) => {
          this.attributesData = response1.data;
          this.locusGeneDiseaseData = response2.data;
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch record data. Please try again later."
          );
        })
        .finally(() => {
          this.isApiCallLoading = false;
        });
    },
  },
  computed: {
    ...mapState(useAuthStore, ["isSuperUser"]),
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <div class="d-flex justify-content-between align-items-start pb-2">
      <h2>Update G2P Record</h2>
      <router-link class="btn btn-outline-primary" :to="`/lgd/${stableId}`">
        <i class="bi bi-arrow-left-circle"></i> Return to record
      </router-link>
    </div>
    <div
      class="d-flex justify-content-center"
      v-if="isApiCallLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-if="errorMsg">
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ errorMsg }}
      </div>
    </div>
    <div v-if="locusGeneDiseaseData">
      <h4 v-if="locusGeneDiseaseData.disease?.name" class="pb-2">
        {{ locusGeneDiseaseData.disease.name }}
      </h4>
      <h4 v-else class="text-muted pb-2">Disease Name Not Available</h4>
      <p class="mb-2">
        <i class="bi bi-info-circle"></i> For this record, only these sections
        can be updated:
        <b v-if="isSuperUser">
          Phenotypic features, Variant types, Variant consequences, Mechanism,
          Disease, Panel, Confidence, Review status
        </b>
        <b v-else>
          Phenotypic features, Variant types, Variant consequences, Mechanism,
          Disease, Panel, Confidence
        </b>
      </p>
      <UpdatePhenotype
        :stableId="stableId"
        :currentPublications="locusGeneDiseaseData.publications"
        :currentPhenotypes="locusGeneDiseaseData.phenotypes"
        :currentPhenotypeSummary="locusGeneDiseaseData.phenotype_summary"
      />
      <UpdateVariantTypes
        :stableId="stableId"
        :currentPublications="locusGeneDiseaseData.publications"
        :currentVariantTypes="locusGeneDiseaseData.variant_type"
      />
      <UpdateVariantConsequences
        :stableId="stableId"
        :currentVariantConsequences="locusGeneDiseaseData.variant_consequence"
      />
      <UpdateMechanism
        :stableId="stableId"
        :currentPublications="locusGeneDiseaseData.publications"
        :currentMechanism="locusGeneDiseaseData.molecular_mechanism"
      />
      <UpdateDisease
        :stableId="stableId"
        :gene="locusGeneDiseaseData.locus?.gene_symbol"
        :diseaseName="locusGeneDiseaseData.disease?.name"
        :diseaseId="locusGeneDiseaseData.disease?.id"
        :currentCrossReferences="locusGeneDiseaseData.disease?.ontology_terms"
      />
      <UpdatePanel
        :stableId="stableId"
        :currentPanels="locusGeneDiseaseData.panels"
      />
      <UpdateConfidence
        :stableId="stableId"
        :attributesData="attributesData"
        :currentConfidence="locusGeneDiseaseData.confidence"
      />
      <UpdateReviewStatus
        v-if="isSuperUser"
        :stableId="stableId"
        :currentUnderReviewStatus="locusGeneDiseaseData.under_review"
      />
      <UpdateComment
        :stableId="stableId"
        :currentComments="locusGeneDiseaseData.comments"
      />
      <AddComment :stableId="stableId" />
    </div>
  </div>
</template>
