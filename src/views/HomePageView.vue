<script>
import router from "@/router";

export default {
  data() {
    return {
      isDataLoading: false,
      panelData: null,
      errorMsg: null,
      searchInput: "",
      selectedSearchType: "",
      selectedSearchPanel: "",
      defaultSearchType: "all",
      defaultSearchPanel: "all",
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
    fetchData() {
      this.errorMsg = this.panelData = null;
      this.isDataLoading = true;
      fetch("/gene2phenotype/api/panels/")
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            return Promise.reject(new Error("Unable to fetch panel data"));
          }
        })
        .then((responseJson) => {
          this.isDataLoading = false;
          this.panelData = responseJson;
        })
        .catch((error) => {
          this.isDataLoading = false;
          this.errorMsg = error.message;
          console.log(error);
        });
    },
    searchClickHandler(event) {
      if (this.searchInput) {
        let searchType = this.selectedSearchType
          ? this.selectedSearchType
          : this.defaultSearchType;
        let searchPanel = this.selectedSearchPanel
          ? this.selectedSearchPanel
          : this.defaultSearchPanel;
        let routeQuery = {
          query: this.searchInput,
          type: searchType === "all" ? undefined : searchType,
          panel: searchPanel === "all" ? undefined : searchPanel,
        };
        router.push({ path: "/search", query: routeQuery });
      }
    },
    searchTypeChangeHandler(event) {
      this.selectedSearchType = event.target.value;
    },
    searchPanelChangeHandler(event) {
      this.selectedSearchPanel = event.target.value;
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3">
    <div class="row py-3">
      <div class="col-2">
        <img
          alt="G2P logo"
          src="../assets/G2P-logo.png"
          width="80%"
          height="auto"
        />
      </div>
      <div class="col-10" style="vertical-align: middle">
        <h1>Gene2Phenotype (G2P)</h1>
        <h5>
          Accelerating diagnostic variant filtering with high-confidence
          evidence-based gene-disease models
        </h5>
      </div>
    </div>
    <div class="input-group" v-if="!isDataLoading">
      <input
        type="text"
        class="form-control"
        aria-label="Search text input"
        placeholder="Eg: CRYBA1 or Severe Neurodevelopmental Syndrome"
        v-model="searchInput"
        id="search-input"
      />
      <select
        class="form-select"
        aria-label="Select search type"
        style="max-width: 18%"
        @change="searchTypeChangeHandler"
        id="select-search-type"
      >
        <option value="all">Search by All Types</option>
        <option value="gene">Search by Gene</option>
        <option value="disease">Search by Disease</option>
        <option value="phenotype">Search by Phenotype</option>
      </select>
      <select
        class="form-select"
        aria-label="Select search panel"
        style="max-width: 18%"
        @change="searchPanelChangeHandler"
        v-if="panelData && panelData.results && panelData.results.length > 0"
        id="select-search-panel"
      >
        <option value="all">Search All Panels</option>
        <option
          v-for="item in panelData.results"
          :value="item.name.toLowerCase()"
        >
          Search {{ item.description }} panel
        </option>
      </select>
      <button type="button" class="btn btn-primary" @click="searchClickHandler">
        <i class="bi bi-search"></i>
      </button>
    </div>
    <div
      class="d-flex justify-content-center"
      v-if="isDataLoading"
      style="margin-top: 150px; margin-bottom: 150px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-if="errorMsg">
      <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
    </div>
    <div
      class="row py-4"
      v-if="panelData && panelData.results && panelData.results.length > 0"
    >
      <h4>Explore by Disorder Panel</h4>
    </div>
    <div
      class="pb-4"
      v-if="panelData && panelData.results && panelData.results.length > 0"
    >
      <table class="table table-hover table-bordered w-75 mx-auto">
        <thead>
          <tr>
            <th scope="col">Disorder Panel</th>
            <th scope="col">Total Records</th>
            <th scope="col">Total Genes</th>
            <th scope="col">Total Diseases</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in panelData.results">
            <td>
              <router-link
                :to="`/panel/${item.name}`"
                v-if="item.name"
                style="text-decoration: none"
              >
                {{ item.description }}
              </router-link>
            </td>
            <td>{{ item.stats?.total_records }}</td>
            <td>{{ item.stats?.total_genes }}</td>
            <td>{{ item.stats?.total_diseases }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
