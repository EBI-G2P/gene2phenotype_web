<script>
import router from "@/router";

export default {
  data() {
    return {
      isDataLoading: false,
      panelData: null,
      errorMsg: null,
      searchInput: "",
      selectedSearchType: "all",
      selectedSearchPanel: "all",
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
    searchClickHandler() {
      if (this.searchInput) {
        let routeQuery = {
          query: this.searchInput,
          type:
            this.selectedSearchType === "all"
              ? undefined
              : this.selectedSearchType,
          panel:
            this.selectedSearchPanel === "all"
              ? undefined
              : this.selectedSearchPanel,
        };
        router.push({ path: "/search", query: routeQuery });
      }
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
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
        placeholder="Search G2P (Eg: CRYBA1 or Severe Neurodevelopmental Syndrome)"
        v-model="searchInput"
        id="search-input"
      />
      <select
        class="form-select"
        aria-label="Select search type"
        style="max-width: 18%"
        v-model="selectedSearchType"
        id="select-search-type"
      >
        <option value="all">Search by All Types</option>
        <option value="gene">Search by Gene</option>
        <option value="disease">Search by Disease</option>
        <option value="phenotype">Search by Phenotype</option>
        <option value="g2p_id">Search by G2P ID</option>
      </select>
      <select
        class="form-select"
        aria-label="Select search panel"
        style="max-width: 18%"
        v-model="selectedSearchPanel"
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
      <table class="table table-hover table-bordered w-50 mx-auto">
        <thead>
          <tr>
            <th scope="col" width="40%">Disorder Panel</th>
            <th scope="col" width="35%">
              Total LGMDE Records
              <span class="bi bi-info-circle custom-tooltip">
                <span class="custom-tooltip-text">
                  G2P records are Locus-Genotype-Mechanism-Disease-Evidence
                  (LGMDE) threads describing gene-disease associations
                </span>
              </span>
            </th>
            <th scope="col" width="25%">Total Genes</th>
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
                {{ item.description ? item.description : item.name }}
              </router-link>
            </td>
            <td>{{ item.stats?.total_records }}</td>
            <td>{{ item.stats?.total_genes }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped>
.custom-tooltip {
  position: relative;
  display: inline-block;
}

.custom-tooltip .custom-tooltip-text {
  visibility: hidden;
  width: 200px;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 5;
  bottom: 125%;
  left: 30%;
  margin-left: -97px;
  opacity: 0;
  transition: opacity 0.3s;
  background-color: #000;
  color: #fff;
  text-align: center;
  font-size: 12px;
}

.custom-tooltip .custom-tooltip-text::after {
  border-width: 5px;
  border-style: solid;
  border-color: #000 transparent transparent transparent;
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
}

.custom-tooltip:hover .custom-tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>
