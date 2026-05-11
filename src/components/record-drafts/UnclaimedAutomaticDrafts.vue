<script>
export default {
  props: {
    unclaimedAutomaticDrafts: Array,
  },
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
        <td class="text-nowrap">
          <button
            type="button"
            class="btn btn-link p-0"
            style="text-decoration: none"
            @click="claimDraft(item.stable_id)"
          >
            Claim <i class="bi bi-plus-circle"></i>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
  <p class="text-dark" v-else>You currently have no saved drafts.</p>
</template>
<style scoped>
table th {
  /* Keep header text on one line */
  white-space: nowrap;
}
</style>
