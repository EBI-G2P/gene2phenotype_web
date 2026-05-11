<script>
import { fetchAndLogApiResponseErrorMsg } from "../utility/ErrorUtility.js";
import { RECORD_DRAFTS_URL } from "../utility/UrlConstants.js";
import api from "../services/api.js";
import RecordDraftsDisplay from "../components/record-drafts/RecordDraftsDisplay.vue";

export default {
  data() {
    return {
      isDataLoading: false,
      userManualDrafts: null,
      userAutomaticDrafts: null,
      unclaimedAutomaticDrafts: null,
      errorMsg: null,
    };
  },
  created() {
    // watch the params of this route to fetch this data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchData();
      },
      { immediate: true },
    );
  },
  components: {
    RecordDraftsDisplay,
  },
  methods: {
    fetchData() {
      this.errorMsg =
        this.userManualDrafts =
        this.userAutomaticDrafts =
        this.unclaimedAutomaticDrafts =
          null;
      this.isDataLoading = true;
      const userManualDraftsURL = RECORD_DRAFTS_URL;
      const userAutomaticDraftsURL = `${RECORD_DRAFTS_URL}?type=automatic`;
      const unclaimedAutomaticsDraftsURL = `${RECORD_DRAFTS_URL}?type=automatic&scope=unclaimed`;
      Promise.all([
        api.get(userManualDraftsURL),
        api.get(userAutomaticDraftsURL),
        api.get(unclaimedAutomaticsDraftsURL),
      ])
        .then(([response1, response2, response3]) => {
          this.userManualDrafts = response1.data;
          this.userAutomaticDrafts = response2.data;
          this.unclaimedAutomaticDrafts = response3.data;
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch record drafts. Please try again later.",
            "Unable to fetch record drafts.",
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
    <h2>Record drafts</h2>
    <div
      v-if="isDataLoading"
      class="d-flex justify-content-center"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="errorMsg" class="alert alert-danger mt-3" role="alert">
      <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
    </div>
    <div v-else class="py-3">
      <RecordDraftsDisplay
        :userManualDrafts="userManualDrafts"
        :userAutomaticDrafts="userAutomaticDrafts"
        :unclaimedAutomaticDrafts="unclaimedAutomaticDrafts"
      />
    </div>
  </div>
</template>
