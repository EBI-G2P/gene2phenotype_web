<script>
export default {
  props: {
    userManualDrafts: Object,
  },
};
</script>
<template>
  <table
    v-if="userManualDrafts?.count > 0"
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
        <th>Created On</th>
        <th>Last Updated</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in userManualDrafts.results" :key="item.stable_id">
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
        <td>{{ item.created_on }}</td>
        <td>{{ item.last_update }}</td>
        <td class="text-nowrap">
          <router-link
            v-if="item.session_name"
            :to="`/lgd/update-draft/${item.stable_id}`"
            style="text-decoration: none"
          >
            Update <i class="bi bi-pencil-square"></i>
          </router-link>
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
