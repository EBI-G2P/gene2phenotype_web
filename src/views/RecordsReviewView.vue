<script>
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";
import { REVIEW_QUEUE_URL } from "../utility/UrlConstants.js";
import api from "../services/api.js";

export default {
  data() {
    return {
      isDataLoading: false,
      reviewQueue: null,
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
      this.errorMsg = this.reviewQueue = null;
      this.isDataLoading = true;
      api
        .get(REVIEW_QUEUE_URL)
        .then((response) => {
          this.reviewQueue = response.data;
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch review queue. Please try again later."
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
    <h2>Records Review</h2>
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
        v-if="reviewQueue && reviewQueue.count > 0"
      >
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Stable ID</th>
            <th>Status</th>
            <th>Created by</th>
            <th>Date created</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reviewQueue.results" :key="item.id">
            <td>
              <router-link
                :to="`/record-review-update/${item.id}`"
                style="text-decoration: none"
              >
                {{ item.id }}
              </router-link>
            </td>
            <td>
              <a
                :href="`/gene2phenotype/lgd/${item.stable_id}`"
                style="text-decoration: none"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ item.stable_id }}
              </a>
            </td>
            <td>{{ item.status }}</td>
            <td>{{ item.created_by }}</td>
            <td>{{ item.date_created}}</td>
            <td>{{ item.date_last_update }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-dark" v-else>No records currently in the review queue.</p>
    </div>
  </div>
</template>
