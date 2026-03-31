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
      expandedSummaryIds: {},
    };
  },
  computed: {
    sortedResults() {
      if (!this.reviewQueue?.results) return [];
      return [...this.reviewQueue.results].sort((a, b) => {
        const statusCompare = (a.status || "").localeCompare(b.status || "");
        if (statusCompare !== 0) return statusCompare;
        return (a.stable_id || "").localeCompare(b.stable_id || "");
      });
    },
    activeResults() {
      return this.sortedResults.filter((item) => item.status !== "resolved");
    },
    underReviewResults() {
      return this.sortedResults.filter((item) => item.status === "under_review");
    },
    openResults() {
      return this.sortedResults.filter((item) => item.status === "open");
    },
    resolvedResults() {
      return this.sortedResults.filter((item) => item.status === "resolved");
    },
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
    isSummaryExpanded(id) {
      return !!this.expandedSummaryIds[id];
    },
    toggleSummary(id) {
      this.expandedSummaryIds = {
        ...this.expandedSummaryIds,
        [id]: !this.expandedSummaryIds[id],
      };
    },
    isSummaryTruncated(summary) {
      if (!summary) return false;
      return String(summary).length > 50;
    },
    truncateSummary(summary) {
      if (!summary) return "";
      const text = String(summary);
      return text.length > 50 ? `${text.slice(0, 50)}...` : text;
    },
    listComponents(items) {
      if (!Array.isArray(items) || items.length === 0) return "";
      const names = items
        .filter((item) => item?.status !== "resolved")
        .map((item) => item?.component)
        .filter((component) => component);
      if (names.length === 0) return "";
      return Array.from(new Set(names));
    },
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
    <div class="d-flex justify-content-between align-items-start pb-2">
      <h2>Review Records</h2>
      <router-link class="btn btn-outline-primary" to="/record-review-create">
        <i class="bi bi-plus-circle"></i> Create case
      </router-link>
    </div>
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
      <h5>Open</h5>
      <table
        class="table table-hover table-bordered"
        v-if="openResults.length > 0"
      >
        <thead>
          <tr>
            <th>Case ID</th>
            <th>G2P ID</th>
            <th>Summary</th>
            <th>Data to update</th>
            <th>Status</th>
            <th>Created by</th>
            <th>Date created</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in openResults" :key="item.id">
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
            <td>
              <span v-if="!item.summary"></span>
              <span v-else-if="isSummaryExpanded(item.id)">
                {{ item.summary }}
                <button
                  v-if="isSummaryTruncated(item.summary)"
                  type="button"
                  class="btn btn-link p-0 align-baseline"
                  style="text-decoration: none"
                  @click="toggleSummary(item.id)"
                >
                  Show less
                  <i class="bi bi-dash-circle"></i>
                </button>
              </span>
              <span v-else>
                {{ truncateSummary(item.summary) }}
                <button
                  v-if="isSummaryTruncated(item.summary)"
                  type="button"
                  class="btn btn-link p-0 align-baseline"
                  style="text-decoration: none"
                  @click="toggleSummary(item.id)"
                >
                  Show more
                  <i class="bi bi-plus-circle"></i>
                </button>
              </span>
            </td>
            <td>
              <div
                v-if="listComponents(item.items).length > 0"
                class="d-flex flex-wrap gap-1"
              >
                <span
                  v-for="component in listComponents(item.items)"
                  :key="component"
                  class="badge bg-secondary"
                >
                  {{ component }}
                </span>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ item.status }}</td>
            <td>{{ item.created_by }}</td>
            <td>{{ item.date_created }}</td>
            <td>{{ item.date_last_update }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-dark" v-else>No open records in the review queue.</p>

      <h5 class="mt-4">Under Review</h5>
      <table
        class="table table-hover table-bordered"
        v-if="underReviewResults.length > 0"
      >
        <thead>
          <tr>
            <th>Case ID</th>
            <th>G2P ID</th>
            <th>Summary</th>
            <th>Data to update</th>
            <th>Status</th>
            <th>Created by</th>
            <th>Date created</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in underReviewResults" :key="item.id">
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
            <td>
              <span v-if="!item.summary"></span>
              <span v-else-if="isSummaryExpanded(item.id)">
                {{ item.summary }}
                <button
                  v-if="isSummaryTruncated(item.summary)"
                  type="button"
                  class="btn btn-link p-0 align-baseline"
                  style="text-decoration: none"
                  @click="toggleSummary(item.id)"
                >
                  Show less
                  <i class="bi bi-dash-circle"></i>
                </button>
              </span>
              <span v-else>
                {{ truncateSummary(item.summary) }}
                <button
                  v-if="isSummaryTruncated(item.summary)"
                  type="button"
                  class="btn btn-link p-0 align-baseline"
                  style="text-decoration: none"
                  @click="toggleSummary(item.id)"
                >
                  Show more
                  <i class="bi bi-plus-circle"></i>
                </button>
              </span>
            </td>
            <td>
              <div
                v-if="listComponents(item.items).length > 0"
                class="d-flex flex-wrap gap-1"
              >
                <span
                  v-for="component in listComponents(item.items)"
                  :key="component"
                  class="badge bg-secondary"
                >
                  {{ component }}
                </span>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ item.status }}</td>
            <td>{{ item.created_by }}</td>
            <td>{{ item.date_created }}</td>
            <td>{{ item.date_last_update }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-dark" v-else>No records under review.</p>

      <h5 class="mt-4">Resolved</h5>
      <table
        class="table table-hover table-bordered"
        v-if="resolvedResults.length > 0"
      >
        <thead>
          <tr>
            <th>Case ID</th>
            <th>G2P ID</th>
            <th>Summary</th>
            <th>Data to update</th>
            <th>Status</th>
            <th>Created by</th>
            <th>Date created</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in resolvedResults" :key="item.id">
            <td>
              <router-link
                :to="`/record-review-update/${item.id}`"
                style="text-decoration: none"
                class="text-muted"
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
                class="text-muted"
              >
                {{ item.stable_id }}
              </a>
            </td>
            <td class="text-muted">
              <span v-if="!item.summary"></span>
              <span v-else-if="isSummaryExpanded(item.id)">
                {{ item.summary }}
                <button
                  v-if="isSummaryTruncated(item.summary)"
                  type="button"
                  class="btn btn-link p-0 align-baseline text-muted"
                  style="text-decoration: none"
                  @click="toggleSummary(item.id)"
                >
                  Show less
                  <i class="bi bi-dash-circle"></i>
                </button>
              </span>
              <span v-else>
                {{ truncateSummary(item.summary) }}
                <button
                  v-if="isSummaryTruncated(item.summary)"
                  type="button"
                  class="btn btn-link p-0 align-baseline text-muted"
                  style="text-decoration: none"
                  @click="toggleSummary(item.id)"
                >
                  Show more
                  <i class="bi bi-plus-circle"></i>
                </button>
              </span>
            </td>
            <td class="text-muted">
              <div
                v-if="listComponents(item.items).length > 0"
                class="d-flex flex-wrap gap-1"
              >
                <span
                  v-for="component in listComponents(item.items)"
                  :key="component"
                  class="badge bg-secondary"
                >
                  {{ component }}
                </span>
              </div>
              <span v-else>-</span>
            </td>
            <td class="text-muted">{{ item.status }}</td>
            <td class="text-muted">{{ item.created_by }}</td>
            <td class="text-muted">{{ item.date_created }}</td>
            <td class="text-muted">{{ item.date_last_update }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-dark" v-else>No resolved records.</p>
    </div>
  </div>
</template>
