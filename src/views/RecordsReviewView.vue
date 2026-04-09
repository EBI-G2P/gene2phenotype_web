<script>
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";
import { REVIEW_STATUS } from "../utility/ReviewConstants.js";
import { REVIEW_QUEUE_URL } from "../utility/UrlConstants.js";
import api from "../services/api.js";
import RecordReviewTable from "../components/record-review/RecordReviewTable.vue";

export default {
  components: {
    RecordReviewTable,
  },
  data() {
    return {
      isDataLoading: false,
      reviewQueue: null,
      errorMsg: null,
    };
  },
  computed: {
    sortedResults() {
      if (!this.reviewQueue?.results) return [];
      return [...this.reviewQueue.results].sort((a, b) => {
        const statusCompare = (a.status || "").localeCompare(b.status || "");
        if (statusCompare !== 0) return statusCompare;
        return (a.stable_id || "").localeCompare(b.stable_id || "");
      });
    },
    underReviewResults() {
      return this.sortedResults.filter(
        (item) => item.status === REVIEW_STATUS.UNDER_REVIEW
      );
    },
    openResults() {
      return this.sortedResults.filter(
        (item) => item.status === REVIEW_STATUS.OPEN
      );
    },
    resolvedResults() {
      return this.sortedResults.filter(
        (item) => item.status === REVIEW_STATUS.RESOLVED
      );
    },
  },
  created() {
    // watch the params of this route to fetch this data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchData();
      },
      { immediate: true }
    );
  },
  methods: {
    fetchData() {
      this.errorMsg = this.reviewQueue = null;
      this.isDataLoading = true;
      api
        .get(REVIEW_QUEUE_URL)
        .then((response) => {
          this.reviewQueue = response.data;
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch review queue. Please try again later."
          );
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <div class="d-flex justify-content-between align-items-start pb-2">
      <h2>Review Records</h2>
      <router-link class="btn btn-outline-primary" to="/record-review-create">
        <i class="bi bi-plus-circle"></i> Create case
      </router-link>
    </div>
    <div
      class="d-flex justify-content-center"
      v-if="isDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-else-if="errorMsg">
      <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
    </div>
    <div class="py-3" v-else>
      <h5>Open</h5>
      <RecordReviewTable
        :items="openResults"
        empty-message="No open records in the review queue."
      />

      <h5 class="mt-4">Under Review</h5>
      <RecordReviewTable
        :items="underReviewResults"
        empty-message="No records under review."
      />

      <h5 class="mt-4">Resolved</h5>
      <RecordReviewTable
        :items="resolvedResults"
        empty-message="No resolved records."
        muted
      />
    </div>
  </div>
</template>
