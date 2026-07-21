<script>
import JuniorManualDrafts from "./JuniorManualDrafts.vue";
import UnclaimedAutomaticDrafts from "./UnclaimedAutomaticDrafts.vue";
import UserAutomaticDrafts from "./UserAutomaticDrafts.vue";
import UserManualDrafts from "./UserManualDrafts.vue";

export default {
  props: {
    userManualDrafts: Array,
    userAutomaticDrafts: Array,
    unclaimedAutomaticDrafts: Array,
    juniorManualDrafts: Array,
    isClaimDraftLoading: Boolean,
    claimDraftStableId: String,
    isDeleteDraftLoading: Boolean,
    deleteDraftStableId: String,
    isJuniorCuratorUser: Boolean,
  },
  emits: ["claimDraft", "deleteDraft"],
  data() {
    return {
      activeTab: "user-manual-drafts",
    };
  },
  computed: {
    tabs() {
      const tabs = [
        {
          name: "user-manual-drafts",
          label: "My manual drafts",
        },
        {
          name: "user-automatic-drafts",
          label: "My automatic drafts",
        },
        {
          name: "unclaimed-automatic-drafts",
          label: "Unclaimed automatic drafts",
        },
      ];
      // Only display 'Manual drafts pending expert review' tab for non-junior curators
      if (this.isJuniorCuratorUser === false) {
        tabs.push({
          name: "junior-manual-drafts",
          label: "Manual drafts pending expert review",
        });
      }
      return tabs;
    },
  },
  components: {
    UserManualDrafts,
    UserAutomaticDrafts,
    UnclaimedAutomaticDrafts,
    JuniorManualDrafts,
  },
  methods: {
    setActiveTab(tabName) {
      const tab = this.tabs.find((t) => t.name === tabName);
      if (tab) {
        this.activeTab = tabName;
      }
    },
    handleClaimDraft(stableId) {
      this.$emit("claimDraft", stableId);
    },
    handleDeleteDraft(stableId) {
      this.$emit("deleteDraft", stableId);
    },
  },
};
</script>
<template>
  <nav>
    <div class="nav nav-tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        class="nav-link"
        :class="{ active: activeTab === tab.name }"
        type="button"
        @click="setActiveTab(tab.name)"
      >
        {{ tab.label }}
      </button>
    </div>
  </nav>
  <div class="tab-content mt-4">
    <UserManualDrafts
      v-show="activeTab === 'user-manual-drafts'"
      :user-manual-drafts="userManualDrafts"
      :is-delete-draft-loading="isDeleteDraftLoading"
      :delete-draft-stable-id="deleteDraftStableId"
      @deleteDraft="handleDeleteDraft"
    />
    <UserAutomaticDrafts
      v-show="activeTab === 'user-automatic-drafts'"
      :user-automatic-drafts="userAutomaticDrafts"
    />
    <UnclaimedAutomaticDrafts
      v-show="activeTab === 'unclaimed-automatic-drafts'"
      :unclaimed-automatic-drafts="unclaimedAutomaticDrafts"
      :is-claim-draft-loading="isClaimDraftLoading"
      :claim-draft-stable-id="claimDraftStableId"
      @claimDraft="handleClaimDraft"
    />
    <JuniorManualDrafts
      v-show="activeTab === 'junior-manual-drafts'"
      :junior-manual-drafts="juniorManualDrafts"
    />
  </div>
</template>
