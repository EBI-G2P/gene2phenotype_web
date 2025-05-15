<script>
import { GENE_URL, SEARCH_URL } from "../utility/UrlConstants.js";
import { CONFIDENCE_COLOR_MAP, HELP_TEXT } from "../utility/Constants.js";
import ToolTip from "../components/tooltip/ToolTip.vue";
import api from "../services/api.js";
import {
  fetchAndLogGeneralErrorMsg,
  fetchAndLogApiResponseErrorMsg,
} from "../utility/ErrorUtility.js";

export default {
  data() {
    return {
      isDataLoading: false,
      searchData: null,
      searchDataNotFoundMsg: null,
      routeQuery: null,
      errorMsg: null,
      geneData: null,
      CONFIDENCE_COLOR_MAP,
      HELP_TEXT,
    };
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  components: {
    ToolTip,
  },
  methods: {
    fetchData(dataUrl) {
      this.searchData =
        this.searchDataNotFoundMsg =
        this.routeQuery =
        this.errorMsg =
        this.geneData =
          null;
      this.isDataLoading = true;
      let url = "";
      if (dataUrl) {
        url = dataUrl.replace(/^.*\/\/[^\/]+/, ""); // remove domain from url
      } else {
        url = `${SEARCH_URL}?`;
        const { query, type, panel } = this.$route.query;
        let queryParamsArr = [];
        if (query) {
          queryParamsArr.push(`query=${query}`);
        }
        if (type) {
          queryParamsArr.push(`type=${type}`);
        }
        if (panel) {
          queryParamsArr.push(`panel=${panel}`);
        }
        url += queryParamsArr.join("&");
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
              "No results found. Please try another search."
            );
            const queryType = this.$route.query?.type;
            if (!queryType || queryType === "gene") {
              // if it is a general query or query for type "gene" and no search results are found then call gene api to check if it is a valid gene
              this.fetchGeneData(searchDataNotFoundMsg);
            } else {
              // else display error message
              this.isDataLoading = false;
              this.searchDataNotFoundMsg = searchDataNotFoundMsg;
            }
          } else {
            this.isDataLoading = false;
            this.errorMsg = fetchAndLogGeneralErrorMsg(
              error,
              "Unable to fetch search results. Please try again later."
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
          fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch gene data. Please try again later."
          );
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
        <i>{{ routeQuery.type === "g2p_id" ? "G2P ID" : routeQuery.type }}</i>
      </span>
      <span v-if="routeQuery?.query"> '{{ routeQuery.query }}'</span>
      <span v-if="routeQuery?.panel">
        in <i>{{ routeQuery.panel }}</i> panel</span
      >
    </h2>
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
    <div v-if="searchData">
      <p class="mb-1">Total results: {{ searchData.count }}</p>
      <div class="table-responsive-xl">
        <table
          class="table table-hover table-bordered shadow-sm"
          v-if="searchData.results?.length > 0"
        >
          <thead>
            <tr>
              <th>G2P ID <ToolTip :toolTipText="HELP_TEXT.G2P_ID" /></th>
              <th>Gene</th>
              <th>Disease</th>
              <th>
                Allelic Requirement
                <ToolTip :toolTipText="HELP_TEXT.ALLELIC_REQUIREMENT" />
              </th>
              <th>Mechanism <ToolTip :toolTipText="HELP_TEXT.MECHANISM" /></th>
              <th>Panels</th>
              <th>
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
                  style="text-decoration: none"
                >
                  {{ item.stable_id }}
                </router-link>
              </td>
              <td>
                <router-link
                  v-if="item.gene"
                  :to="`/gene/${item.gene}`"
                  style="text-decoration: none"
                >
                  {{ item.gene }}
                </router-link>
              </td>
              <td>
                <router-link
                  v-if="item.disease"
                  :to="`/disease/${item.disease}`"
                  style="text-decoration: none"
                >
                  {{ item.disease }}
                </router-link>
              </td>
              <td>{{ item.genotype }}</td>
              <td>{{ item.mechanism }}</td>
              <td>
                <span v-if="item.panel?.length > 0">
                  <span v-for="(panelName, index) in item.panel">
                    <span v-if="index < item.panel.length - 1">
                      <router-link
                        :to="`/panel/${panelName}`"
                        style="text-decoration: none"
                      >
                        {{ panelName }} </router-link
                      >,
                    </span>
                    <router-link
                      :to="`/panel/${panelName}`"
                      style="text-decoration: none"
                      v-else
                    >
                      {{ panelName }}
                    </router-link>
                  </span>
                </span>
              </td>
              <td>
                <span
                  v-if="item.confidence"
                  class="badge text-white"
                  :style="{
                    backgroundColor:
                      CONFIDENCE_COLOR_MAP[item.confidence.toLowerCase()],
                  }"
                >
                  {{ item.confidence }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color: grey">Not Available</p>
      </div>
      <div class="row mx-1 justify-content-between mb-3">
        <div class="col-2 px-0">
          <button
            type="button"
            class="btn btn-primary"
            style="float: left"
            @click="previousPageClickHandler"
            v-if="searchData.previous"
          >
            <i class="bi bi-arrow-left"></i> Previous Page
          </button>
        </div>
        <div class="col-2 px-0">
          <button
            type="button"
            class="btn btn-primary"
            style="float: right"
            @click="nextPageClickHandler"
            v-if="searchData.next"
          >
            Next Page
            <i class="bi bi-arrow-right"></i>
          </button>
        </div>
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
