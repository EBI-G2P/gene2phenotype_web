<script>
import { fetchAndLogApiResponseErrorMsg } from "../utility/ErrorUtility.js";
import {
  CLAIM_DRAFT_URL,
  DELETE_DRAFT_URL,
  RECORD_DRAFTS_URL,
} from "../utility/UrlConstants.js";
import api from "../services/api.js";
import RecordDraftsDisplay from "../components/record-drafts/RecordDraftsDisplay.vue";
import { mapState } from "pinia";
import { useAuthStore } from "../store/auth.js";

export default {
  data() {
    return {
      isDataLoading: false,
      userManualDrafts: null,
      userAutomaticDrafts: null,
      unclaimedAutomaticDrafts: null,
      juniorManualDrafts: null,
      errorMsg: null,
      claimDraftErrorMsg: null,
      claimDraftSuccessMsg: null,
      isClaimDraftLoading: false,
      claimDraftStableId: null,
      deleteDraftErrorMsg: null,
      deleteDraftSuccessMsg: null,
      isDeleteDraftLoading: false,
      deleteDraftStableId: null,
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
  computed: {
    ...mapState(useAuthStore, ["isJuniorCuratorUser"]),
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
    deleteDraft(stableId) {
      if (!stableId) {
        return;
      }

      this.deleteDraftErrorMsg = this.deleteDraftSuccessMsg = null;
      this.isDeleteDraftLoading = true;
      this.deleteDraftStableId = stableId;

      api
        .delete(DELETE_DRAFT_URL.replace(":stableid", stableId))
        .then((response) => {
          this.deleteDraftSuccessMsg =
            response?.data?.message || "Draft deleted successfully.";
          // Remove the deleted draft from userManualDrafts list
          this.userManualDrafts = (this.userManualDrafts || []).filter(
            (item) => item.stable_id !== stableId,
          );
        })
        .catch((error) => {
          this.deleteDraftErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to delete draft. Please try again later.",
            "Unable to delete draft.",
          );
        })
        .finally(() => {
          this.isDeleteDraftLoading = false;
          this.deleteDraftStableId = null;
        });
    },
    fetchData() {
      this.errorMsg =
        this.claimDraftErrorMsg =
        this.claimDraftSuccessMsg =
        this.deleteDraftErrorMsg =
        this.deleteDraftSuccessMsg =
        this.userManualDrafts =
        this.userAutomaticDrafts =
        this.unclaimedAutomaticDrafts =
        this.juniorManualDrafts =
          null;
      this.isClaimDraftLoading = false;
      this.claimDraftStableId = null;
      this.isDeleteDraftLoading = false;
      this.deleteDraftStableId = null;
      this.isDataLoading = true;
      const userManualDraftsURL = RECORD_DRAFTS_URL;
      const userAutomaticDraftsURL = `${RECORD_DRAFTS_URL}?type=automatic`;
      const unclaimedAutomaticsDraftsURL = `${RECORD_DRAFTS_URL}?type=automatic&scope=unclaimed`;
      const juniorManualDraftsURL = `${RECORD_DRAFTS_URL}?type=manual&scope=junior`;
      const draftRequests = [
        api.get(userManualDraftsURL),
        api.get(userAutomaticDraftsURL),
        api.get(unclaimedAutomaticsDraftsURL),
      ];
      // Only fetch manual drafts (assigned to junior curators) for non-junior curators
      if (this.isJuniorCuratorUser === false) {
        draftRequests.push(api.get(juniorManualDraftsURL));
      }
      Promise.all(draftRequests)
        .then(([response1, response2, response3, response4]) => {
          this.userManualDrafts = response1.data?.results;
          this.userAutomaticDrafts = response2.data?.results;
          this.unclaimedAutomaticDrafts = response3.data?.results;
          if (response4) {
            this.juniorManualDrafts = response4.data?.results;
          }
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
    <h2>Draft records</h2>
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
      <div
        v-if="claimDraftErrorMsg || deleteDraftErrorMsg"
        class="alert alert-danger"
        role="alert"
      >
        <div>
          <i class="bi bi-exclamation-circle-fill"></i>
          {{ claimDraftErrorMsg || deleteDraftErrorMsg }}
        </div>
      </div>
      <div
        v-if="claimDraftSuccessMsg || deleteDraftSuccessMsg"
        class="alert alert-success"
        role="alert"
      >
        <div>
          <i class="bi bi-check-circle-fill"></i>
          {{ claimDraftSuccessMsg || deleteDraftSuccessMsg }}
        </div>
      </div>
      <RecordDraftsDisplay
        :userManualDrafts="userManualDrafts"
        :userAutomaticDrafts="userAutomaticDrafts"
        :unclaimedAutomaticDrafts="unclaimedAutomaticDrafts"
        :juniorManualDrafts="juniorManualDrafts"
        :is-junior-curator-user="isJuniorCuratorUser"
        :is-claim-draft-loading="isClaimDraftLoading"
        :claim-draft-stable-id="claimDraftStableId"
        @claimDraft="claimDraft"
        :is-delete-draft-loading="isDeleteDraftLoading"
        :delete-draft-stable-id="deleteDraftStableId"
        @deleteDraft="deleteDraft"
      />
    </div>
  </div>
</template>
