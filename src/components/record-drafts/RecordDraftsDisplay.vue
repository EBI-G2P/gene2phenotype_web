<script>
import UnclaimedAutomaticDrafts from "./UnclaimedAutomaticDrafts.vue";
import UserAutomaticDrafts from "./UserAutomaticDrafts.vue";
import UserManualDrafts from "./UserManualDrafts.vue";

export default {
  props: {
    userManualDrafts: Object,
    userAutomaticDrafts: Object,
    unclaimedAutomaticDrafts: Object,
  },
  data() {
    return {
      activeTab: "user-manual-drafts",
      tabs: [
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
      ],
    };
  },
  components: {
    UserManualDrafts,
    UserAutomaticDrafts,
    UnclaimedAutomaticDrafts,
  },
  methods: {
    setActiveTab(tabName) {
      const tab = this.tabs.find((t) => t.name === tabName);
      if (tab) {
        this.activeTab = tabName;
      }
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
    />
    <UserAutomaticDrafts
      v-show="activeTab === 'user-automatic-drafts'"
      :user-automatic-drafts="userAutomaticDrafts"
    />
    <UnclaimedAutomaticDrafts
      v-show="activeTab === 'unclaimed-automatic-drafts'"
      :unclaimed-automatic-drafts="unclaimedAutomaticDrafts"
    />
  </div>
</template>
