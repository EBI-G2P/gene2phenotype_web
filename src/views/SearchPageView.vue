<script>
import { checkLogInAndAppendAuthHeaders } from "../utility/AuthenticationUtility.js";

export default {
  data() {
    return {
      isDataLoading: false,
      searchData: null,
      searchDataNotFoundMsg: null,
      routeQuery: null,
      errorMsg: null,
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
  methods: {
    fetchData(dataUrl) {
      this.errorMsg =
        this.searchData =
        this.searchDataNotFoundMsg =
        this.routeQuery =
          null;
      this.isDataLoading = true;
      let isSearchDataFound = false;
      let url = "";
      if (dataUrl) {
        url = dataUrl.replace(/^.*\/\/[^\/]+/, ""); // remove domain from url
      } else {
        url = "/gene2phenotype/api/search/?";
        const { query, type, panel } = this.$route.query;
        let queryParamsArr = [];
        if (this.$route.query.query) {
          queryParamsArr.push(`query=${query}`);
        }
        if (this.$route.query.type) {
          queryParamsArr.push(`type=${type}`);
        }
        if (this.$route.query.panel) {
          queryParamsArr.push(`panel=${panel}`);
        }
        url += queryParamsArr.join("&");
      }
      const apiHeaders = checkLogInAndAppendAuthHeaders({
        "Content-Type": "application/json",
      });
      fetch(url, {
        method: "GET",
        headers: apiHeaders,
      })
        .then((response) => {
          if (response.status === 200) {
            isSearchDataFound = true;
            return response.json();
          } else if (response.status === 404) {
            isSearchDataFound = false;
            return response.json();
          } else {
            isSearchDataFound = false;
            return Promise.reject(new Error("Unable to fetch search results"));
          }
        })
        .then((responseJson) => {
          this.routeQuery = this.$route.query;
          if (isSearchDataFound) {
            this.isDataLoading = false;
            this.searchData = responseJson;
          } else {
            this.isDataLoading = false;
            this.searchDataNotFoundMsg = responseJson.message;
          }
        })
        .catch((error) => {
          this.isDataLoading = false;
          this.errorMsg = error.message;
          console.log(error);
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
    <h2>
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
    <div v-if="searchData">
      <div class="row mx-1 pt-3">
        <table
          class="table table-hover table-bordered"
          v-if="searchData.results && searchData.results.length > 0"
        >
          <thead>
            <tr>
              <th>G2P ID</th>
              <th>Gene</th>
              <th>Disease</th>
              <th>Allelic Requirement</th>
              <th>Panels</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in searchData.results">
              <td>
                <router-link
                  :to="`/lgd/${item.id}`"
                  v-if="item.id"
                  style="text-decoration: none"
                >
                  {{ item.id }}
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
              <td>
                <span
                  v-if="item.panel && item.panel.length > 0"
                  v-for="(panelName, index) in item.panel"
                >
                  <router-link
                    :to="`/panel/${panelName}`"
                    style="text-decoration: none"
                  >
                    {{ panelName }} </router-link
                  ><span v-if="index < item.panel.length - 1">, </span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color: grey">Not Available</p>
      </div>
      <div class="row mx-1 justify-content-between">
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
    </div>
  </div>
</template>
