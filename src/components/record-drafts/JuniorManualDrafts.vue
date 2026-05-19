<script>
export default {
  props: {
    juniorManualDrafts: Array,
  },
  methods: {
    getCuratorName(item) {
      return [item.curator_first_name, item.curator_last_name]
        .filter(Boolean)
        .join(" ");
    },
  },
};
</script>
<template>
  <div v-if="juniorManualDrafts?.length > 0" class="table-responsive-xl">
    <table class="table table-hover table-bordered">
      <thead>
        <tr>
          <th>G2P ID</th>
          <th>Gene</th>
          <th>Disease</th>
          <th>Allelic Requirement</th>
          <th>Mechanism</th>
          <th>Panels</th>
          <th>Curator</th>
          <th>Last Updated</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in juniorManualDrafts" :key="item.stable_id">
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
          <td>
            <div v-if="getCuratorName(item)">
              {{ getCuratorName(item) }}
            </div>
            <a
              v-if="item.curator_email"
              :href="`mailto:${item.curator_email}`"
              style="text-decoration: none"
            >
              {{ item.curator_email }}
            </a>
          </td>
          <td>{{ item.last_update }}</td>
          <td class="text-nowrap">
            <router-link
              v-if="item.stable_id"
              :to="`/lgd/update-draft/${item.stable_id}`"
              style="text-decoration: none"
            >
              Publish <i class="bi bi-send"></i>
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="alert alert-secondary" role="status">
    <i class="bi bi-info-circle-fill"></i>
    There are currently no manual drafts pending review.
  </div>
</template>
<style scoped>
table th {
  /* Keep header text on one line */
  white-space: nowrap;
}
</style>
