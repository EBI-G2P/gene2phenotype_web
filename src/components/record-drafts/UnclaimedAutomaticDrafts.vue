<script>
export default {
  props: {
    unclaimedAutomaticDrafts: Array,
    isClaimDraftLoading: Boolean,
    claimDraftStableId: String,
  },
  emits: ["claimDraft"],
};
</script>
<template>
  <div v-if="unclaimedAutomaticDrafts?.length > 0" class="table-responsive-xl">
    <table class="table table-hover table-bordered">
      <thead>
        <tr>
          <th>Session Name</th>
          <th>G2P ID</th>
          <th>Gene</th>
          <th>Allelic Requirement</th>
          <th>Panels</th>
          <th>Last Updated</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in unclaimedAutomaticDrafts" :key="item.stable_id">
          <td>
            {{ item.session_name }}
          </td>
          <td>{{ item.stable_id }}</td>
          <td>{{ item.locus }}</td>
          <td>{{ item.allelic_requirement }}</td>
          <td>
            <span v-if="item.panels?.length > 0">
              <template v-for="(panel, index) in item.panels" :key="panel">
                {{ panel }}
                <span v-if="index !== item.panels.length - 1">, </span>
              </template>
            </span>
          </td>
          <td>{{ item.last_update }}</td>
          <td class="text-nowrap text-center">
            <button
              type="button"
              class="btn btn-link p-0 mb-1 d-inline-flex align-items-center justify-content-center claim-draft-button"
              style="text-decoration: none"
              :disabled="isClaimDraftLoading"
              @click="$emit('claimDraft', item.stable_id)"
            >
              <span
                v-if="claimDraftStableId === item.stable_id"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span v-else>Claim <i class="bi bi-plus-circle"></i></span>
            </button>
            <br />
            <router-link
              v-if="item.stable_id"
              :to="`/lgd/review-draft/${item.stable_id}`"
              style="text-decoration: none"
            >
              Review <i class="bi bi-file-earmark-text"></i>
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="alert alert-secondary" role="status">
    <i class="bi bi-info-circle-fill"></i>
    There are currently no unclaimed automatic drafts.
  </div>
</template>
<style scoped>
table th {
  /* Keep header text on one line */
  white-space: nowrap;
}

.claim-draft-button {
  min-width: 64px;
}
</style>
