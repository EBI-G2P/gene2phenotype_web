<script>
import { fetchAndLogApiResponseErrorMsg } from "../utility/ErrorUtility.js";
import { CLAIM_DRAFT_URL, RECORD_DRAFTS_URL } from "../utility/UrlConstants.js";
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
      claimDraftErrorMsg: null,
      claimDraftSuccessMsg: null,
      isClaimDraftLoading: false,
      claimDraftStableId: null,
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
    async claimDraft(stableId) {
      if (!stableId) {
        return;
      }

      this.claimDraftErrorMsg = this.claimDraftSuccessMsg = null;
      this.isClaimDraftLoading = true;
      this.claimDraftStableId = stableId;

      let claimDraftResponse = null;
      // Claim the draft first; Only continue to refresh automatic drafts after a successful claim
      try {
        claimDraftResponse = await api.patch(
          CLAIM_DRAFT_URL.replace(":stableid", stableId),
        );
      } catch (error) {
        this.claimDraftErrorMsg = fetchAndLogApiResponseErrorMsg(
          error,
          error?.response?.data?.error,
          "Unable to claim draft. Please try again later.",
          "Unable to claim draft.",
        );
        this.isClaimDraftLoading = false;
        this.claimDraftStableId = null;
        return;
      }

      // Refresh automatic drafts so the UI reflects server state
      try {
        await this.fetchAutomaticDrafts();
        const successMessage =
          claimDraftResponse?.data?.message || "Draft claimed successfully.";
        this.claimDraftSuccessMsg = `${successMessage} It is now available in the 'My automatic drafts' tab.`;
      } catch (error) {
        this.claimDraftErrorMsg = fetchAndLogApiResponseErrorMsg(
          error,
          error?.response?.data?.error,
          "Draft claimed, but unable to refresh automatic drafts. Please reload the page.",
          "Draft claimed, but unable to refresh automatic drafts.",
        );
      } finally {
        this.isClaimDraftLoading = false;
        this.claimDraftStableId = null;
      }
    },
    async fetchAutomaticDrafts() {
      // Fetch user and unclaimed automatic drafts
      // Loading and error states are handled by the 'claimDraft' method

      const userAutomaticDraftsURL = `${RECORD_DRAFTS_URL}?type=automatic`;
      const unclaimedAutomaticsDraftsURL = `${RECORD_DRAFTS_URL}?type=automatic&scope=unclaimed`;

      const [response1, response2] = await Promise.all([
        api.get(userAutomaticDraftsURL),
        api.get(unclaimedAutomaticsDraftsURL),
      ]);

      this.userAutomaticDrafts = response1.data?.results;
      this.unclaimedAutomaticDrafts = response2.data?.results;
    },
    fetchData() {
      this.errorMsg =
        this.claimDraftErrorMsg =
        this.claimDraftSuccessMsg =
        this.userManualDrafts =
        this.userAutomaticDrafts =
        this.unclaimedAutomaticDrafts =
          null;
      this.isClaimDraftLoading = false;
      this.claimDraftStableId = null;
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
          this.userManualDrafts = response1.data?.results;
          this.userAutomaticDrafts = response2.data?.results;
          this.unclaimedAutomaticDrafts = response3.data?.results;
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
      <div v-if="claimDraftErrorMsg" class="alert alert-danger" role="alert">
        <div>
          <i class="bi bi-exclamation-circle-fill"></i>
          {{ claimDraftErrorMsg }}
        </div>
      </div>
      <div v-if="claimDraftSuccessMsg" class="alert alert-success" role="alert">
        <div>
          <i class="bi bi-check-circle-fill"></i>
          {{ claimDraftSuccessMsg }}
        </div>
      </div>
      <RecordDraftsDisplay
        :userManualDrafts="userManualDrafts"
        :userAutomaticDrafts="userAutomaticDrafts"
        :unclaimedAutomaticDrafts="unclaimedAutomaticDrafts"
        :is-claim-draft-loading="isClaimDraftLoading"
        :claim-draft-stable-id="claimDraftStableId"
        @claimDraft="claimDraft"
      />
    </div>
  </div>
</template>
