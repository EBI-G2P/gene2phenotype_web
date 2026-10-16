<script>
import { GENE_URL, SEARCH_URL } from "../utility/UrlConstants.js";
import { HELP_TEXT, SEARCH_FILTER } from "../utility/Constants.js";
import ToolTip from "../components/tooltip/ToolTip.vue";
import api from "../services/api.js";
import {
  fetchAndLogApiResponseErrorMsg,
  logGeneralErrorMsg,
} from "../utility/ErrorUtility.js";
import PanelLinks from "../components/panel/PanelLinks.vue";
import ConfidenceBadge from "../components/confidence/ConfidenceBadge.vue";
export default {
  data() {
    return {
      isDataLoading: false,
      searchData: null,
      searchDataNotFoundMsg: null,
      routeQuery: null,
      errorMsg: null,
      geneData: null,
      mergedDataMsg: null,
      mergedStableId: null,
      HELP_TEXT,
      SEARCH_FILTER,
    };
  },
  created() {
    // Watch the route query to fetch data again when the search changes.
    this.$watch(
      () => this.$route.query,
      () => {
        this.fetchData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true },
    );
  },
  components: {
    ToolTip,
    PanelLinks,
    ConfidenceBadge,
  },
  methods: {
    fetchData(dataUrl) {
      this.searchData =
        this.searchDataNotFoundMsg =
        this.routeQuery =
        this.errorMsg =
        this.geneData =
        this.mergedDataMsg =
        this.mergedStableId =
          null;
      this.isDataLoading = true;
      let url = "";
      if (dataUrl) {
        try {
          const paginationUrl = new URL(dataUrl, window.location.origin);
          if (paginationUrl.pathname !== SEARCH_URL) {
            throw new Error("Unexpected search pagination URL");
          }
          url = `${paginationUrl.pathname}${paginationUrl.search}`;
        } catch (error) {
          logGeneralErrorMsg(error);
          this.errorMsg =
            "Unable to load this page of search results. Please try again.";
          this.isDataLoading = false;
          return;
        }
      } else {
        const { query, type, panel } = this.$route.query;
        const queryParams = new URLSearchParams();
        if (query) {
          queryParams.set("query", query);
        }
        if (type) {
          queryParams.set("type", type);
        }
        if (panel) {
          queryParams.set("panel", panel);
        }
        url = `${SEARCH_URL}?${queryParams.toString()}`;
      }
      api
        .get(url)
        .then((response) => {
          this.isDataLoading = false;
          this.routeQuery = this.$route.query;
          this.searchData = response.data;
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            this.routeQuery = this.$route.query;
            const searchDataNotFoundMsg = fetchAndLogApiResponseErrorMsg(
              error,
              error?.response?.data?.error,
              "No results found. Please try another search.",
            );
            const queryType = this.$route.query?.type;
            if (!queryType || queryType === SEARCH_FILTER.SEARCH_TYPE.GENE) {
              // if it is a general query or query for type "gene" and no search results are found
              // then call gene api to check if it is a valid gene
              this.fetchGeneData(searchDataNotFoundMsg);
            } else {
              // else display error message
              this.isDataLoading = false;
              this.searchDataNotFoundMsg = searchDataNotFoundMsg;
            }
          } else if (error.response?.status === 410) {
            this.routeQuery = this.$route.query;
            this.isDataLoading = false;
            logGeneralErrorMsg(error);
            this.mergedDataMsg = error.response.data?.message;
            this.mergedStableId = error.response.data?.stable_id;
          } else {
            this.isDataLoading = false;
            this.errorMsg = fetchAndLogApiResponseErrorMsg(
              error,
              error?.response?.data?.error,
              "Unable to fetch search results. Please try again later.",
              "Unable to fetch search results.",
            );
          }
        });
    },
    fetchGeneData(searchDataNotFoundMsg) {
      const searchQuery = this.$route.query?.query;
      api
        .get(GENE_URL.replace(":locus", searchQuery))
        .then((response) => {
          this.geneData = response.data;
        })
        .catch((error) => {
          logGeneralErrorMsg(error);
          this.searchDataNotFoundMsg = searchDataNotFoundMsg;
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
    nextPageClickHandler() {
      this.fetchData(this.searchData.next);
    },
    previousPageClickHandler() {
      this.fetchData(this.searchData.previous);
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-3">
      Search results
      <span v-if="routeQuery?.type || routeQuery?.query"> for </span>
      <span v-if="routeQuery?.type">
        <i>{{
          routeQuery.type === SEARCH_FILTER.SEARCH_TYPE.G2P_ID
            ? "G2P ID"
            : routeQuery.type
        }}</i>
      </span>
      <span v-if="routeQuery?.query"> '{{ routeQuery.query }}'</span>
      <span v-if="routeQuery?.panel">
        in <i>{{ routeQuery.panel }}</i> panel</span
      >
    </h2>
    <div
      v-if="isDataLoading"
      class="d-flex justify-content-center"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-if="errorMsg" class="alert alert-danger mt-3" role="alert">
      <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
    </div>
    <div
      v-if="searchDataNotFoundMsg"
      class="alert alert-danger mt-3"
      role="alert"
    >
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ searchDataNotFoundMsg }}
      </div>
    </div>
    <div v-if="geneData" class="alert alert-primary mt-3" role="alert">
      <div>
        <i class="bi bi-info-circle"></i>
        No G2P disease models are currently available for given gene, see here
        for details from other resources:
        <router-link
          v-if="geneData.gene_symbol"
          :to="`/gene/${geneData.gene_symbol}`"
          class="fw-bold"
        >
          {{ geneData.gene_symbol }}
        </router-link>
      </div>
    </div>
    <div v-if="mergedDataMsg" class="alert alert-primary mt-3" role="alert">
      <div>
        <i class="bi bi-info-circle"></i>
        {{ mergedDataMsg }} <br />
        <template v-if="mergedStableId">
          See the merged record here:
          <router-link :to="`/lgd/${mergedStableId}`" class="fw-bold">
            {{ mergedStableId }}
          </router-link>
        </template>
      </div>
    </div>
    <div v-if="searchData">
      <p class="mb-1">Total results: {{ searchData.count }}</p>
      <div class="table-responsive-xl">
        <table
          class="table table-hover table-bordered shadow-sm"
          v-if="searchData.results?.length > 0"
        >
          <thead>
            <tr>
              <th scope="col">
                G2P ID <ToolTip :toolTipText="HELP_TEXT.G2P_ID" />
              </th>
              <th scope="col">Gene</th>
              <th scope="col">Disease</th>
              <th scope="col">
                Allelic Requirement
                <ToolTip :toolTipText="HELP_TEXT.ALLELIC_REQUIREMENT" />
              </th>
              <th scope="col">
                Mechanism <ToolTip :toolTipText="HELP_TEXT.MECHANISM" />
              </th>
              <th scope="col">Panels</th>
              <th scope="col">
                Confidence <ToolTip :toolTipText="HELP_TEXT.CONFIDENCE" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in searchData.results" :key="item.stable_id">
              <td>
                <router-link
                  :to="`/lgd/${item.stable_id}`"
                  v-if="item.stable_id"
                  class="text-decoration-none"
                >
                  {{ item.stable_id }}
                </router-link>
              </td>
              <td>
                <router-link
                  v-if="item.gene"
                  :to="`/gene/${item.gene}`"
                  class="text-decoration-none"
                >
                  {{ item.gene }}
                </router-link>
              </td>
              <td>
                <router-link
                  v-if="item.disease"
                  :to="`/disease/${item.disease}`"
                  class="text-decoration-none"
                >
                  {{ item.disease }}
                </router-link>
              </td>
              <td>{{ item.genotype }}</td>
              <td>{{ item.mechanism }}</td>
              <td>
                <PanelLinks :panels="item.panel" />
              </td>
              <td>
                <ConfidenceBadge :confidence="item.confidence" />
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-muted">Not Available</p>
      </div>
      <div class="d-flex my-3">
        <button
          v-if="searchData.previous"
          type="button"
          class="btn btn-primary me-auto"
          @click="previousPageClickHandler"
        >
          <i class="bi bi-arrow-left"></i> Previous Page
        </button>
        <button
          v-if="searchData.next"
          type="button"
          class="btn btn-primary ms-auto"
          @click="nextPageClickHandler"
        >
          Next Page
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>
      <p>
        <i class="bi bi-info-circle"></i> G2P records are curated by experts on
        a gene-disease basis from publications and may not be a comprehensive
        record for any specific gene or disease. Please observe the 'last
        updated' dates on records.
      </p>
    </div>
  </div>
</template>
<style scoped>
th {
  white-space: nowrap;
}
</style>
