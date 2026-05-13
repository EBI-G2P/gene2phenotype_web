<script>
export default {
  props: {
    userAutomaticDrafts: Array,
  },
};
</script>
<template>
  <table
    v-if="userAutomaticDrafts?.length > 0"
    class="table table-hover table-bordered"
  >
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
      <tr v-for="item in userAutomaticDrafts" :key="item.stable_id">
        <td>
          {{ item.session_name }}
        </td>
        <td>{{ item.stable_id }}</td>
        <td>{{ item.locus }}</td>
        <td>{{ item.allelic_requirement }}</td>
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
  <div v-else class="alert alert-secondary" role="status">
    <i class="bi bi-info-circle-fill"></i>
    You currently have no automatic drafts.
  </div>
</template>
<style scoped>
table th {
  /* Keep header text on one line */
  white-space: nowrap;
}
</style>
