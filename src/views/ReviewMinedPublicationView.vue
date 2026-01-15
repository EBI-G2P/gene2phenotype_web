<script>
import { LGD_RECORD_URL } from "../utility/UrlConstants.js";
import api from "../services/api.js";
import { fetchAndLogApiResponseErrorMsg } from "../utility/ErrorUtility.js";
import ReviewMinedPublication from "../components/review-mined-publication/ReviewMinedPublication.vue";

export default {
  data() {
    return {
      isApiCallLoading: false,
      locusGeneDiseaseData: null,
      errorMsg: null,
      stableId: null,
    };
  },
  components: {
    ReviewMinedPublication,
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchRecordData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  methods: {
    fetchRecordData() {
      this.stableId = this.$route.params.stableId;
      this.errorMsg = this.locusGeneDiseaseData = null;
      this.isApiCallLoading = true;
      api
        .get(LGD_RECORD_URL.replace(":stableid", this.stableId))
        .then((response) => {
          this.locusGeneDiseaseData = response.data;
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch record data. Please try again later.",
            "Unable to fetch record data."
          );
        })
        .finally(() => {
          this.isApiCallLoading = false;
        });
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <div class="d-flex justify-content-between align-items-start pb-2">
      <h2>Review mined publications</h2>
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
      <ReviewMinedPublication
        :stableId="stableId"
        :currentMinedPublications="locusGeneDiseaseData.mined_publications"
      />
    </div>
  </div>
</template>
