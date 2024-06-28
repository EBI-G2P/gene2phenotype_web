<script>
export default {
  data() {
    return {
      isDataLoading: false,
      curationListData: null,
      errorMsg: null,
    };
  },
  created() {
    // watch the params of this route to fetch this data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchData();
      },
      { immediate: true }
    );
  },
  methods: {
    fetchData() {
      this.errorMsg = this.curationListData = null;
      this.isDataLoading = true;
      //not using promise.all because it is one endpoint
      fetch("/gene2phenotype/api/curations")
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Unable to fetch Curation entries");
          }
        })
        .then((responseJson) => {
          this.curationListData = responseJson;
          this.isDataLoading = false;
        })
        .catch((error) => {
          this.isDataLoading = false;
          this.errorMsg = error.message;
          console.log(error);
        });
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <div
      class="d-flex justify-content-center"
      v-if="isDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-if="errorMsg">
      <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
    </div>
    <div v-if="curationListData">
      <h2>Saved Curation Entries</h2>
      <div class="py-3">
        <table
          class="table table-hover table-bordered"
          v-if="curationListData && curationListData.count > 0"
        >
          <thead>
            <tr>
              <th>Session Name</th>
              <th>Locus</th>
              <th>G2P ID</th>
              <th>Date Created</th>
              <th>Date Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in curationListData.results">
              <td>{{ item.session_name }}</td>
              <td>{{ item.locus }}</td>
              <td>
                <router-link
                  :to="`/lgd/update/${item.stable_id}`"
                  style="text-decoration: none"
                  v-if="item.stable_id"
                >
                  {{ item.stable_id }}
                </router-link>
              </td>
              <td>{{ item.created_on }}</td>
              <td>{{ item.last_updated }}</td>
            </tr>
          </tbody>
        </table>
        <p class="text-danger" v-else>
          You do not have any saved drafts at this moment.
        </p>
      </div>
    </div>
  </div>
</template>
