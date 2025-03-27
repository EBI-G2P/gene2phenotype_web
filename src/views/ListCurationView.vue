<script>
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";
import { ALL_SAVED_DRAFTS_URL } from "../utility/UrlConstants.js";
import api from "../services/api.js";

export default {
  data() {
    return {
      isDataLoading: false,
      curationEntries: null,
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
      this.errorMsg = this.curationEntries = null;
      this.isDataLoading = true;
      api
        .get(ALL_SAVED_DRAFTS_URL)
        .then((response) => {
          this.curationEntries = response.data;
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch Curation entries. Please try again later."
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
    <h2>Saved Curation Entries</h2>
    <div
      class="d-flex justify-content-center"
      v-if="isDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-else-if="errorMsg">
      <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
    </div>
    <div class="py-3" v-else>
      <table
        class="table table-hover table-bordered"
        v-if="curationEntries && curationEntries.count > 0"
      >
        <thead>
          <tr>
            <th>Session Name</th>
            <th>G2P ID</th>
            <th>Locus</th>
            <th>Created On</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in curationEntries.results" :key="item.stable_id">
            <td>
              <router-link
                :to="`/lgd/update-draft/${item.stable_id}`"
                style="text-decoration: none"
                v-if="item.session_name"
              >
                {{ item.session_name }}
              </router-link>
            </td>
            <td>{{ item.stable_id }}</td>
            <td>{{ item.locus }}</td>
            <td>{{ item.created_on }}</td>
            <td>{{ item.last_update }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-dark" v-else>You currently have no saved drafts.</p>
    </div>
  </div>
</template>
