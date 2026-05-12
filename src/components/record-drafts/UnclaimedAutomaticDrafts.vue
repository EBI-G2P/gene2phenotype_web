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
  <table
    v-if="unclaimedAutomaticDrafts?.length > 0"
    class="table table-hover table-bordered"
  >
    <thead>
      <tr>
        <th>Session Name</th>
        <th>G2P ID</th>
        <th>Gene</th>
        <th>Disease</th>
        <th>Allelic Requirement</th>
        <th>Mechanism</th>
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
        <td>{{ item.disease }}</td>
        <td>{{ item.allelic_requirement }}</td>
        <td>{{ item.molecular_mechanism }}</td>
        <td>
          <span v-if="item.panels?.length > 0">
            <template v-for="(panel, index) in item.panels" :key="panel">
              <router-link
                :to="`/panel/${panel}`"
                style="text-decoration: none"
              >
                {{ panel }}
              </router-link>
              <span v-if="index !== item.panels.length - 1">, </span>
            </template>
          </span>
        </td>
        <td>{{ item.last_update }}</td>
        <td class="text-nowrap text-center">
          <button
            type="button"
            class="btn btn-link p-0 d-inline-flex align-items-center justify-content-center claim-draft-button"
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
        </td>
      </tr>
    </tbody>
  </table>
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
