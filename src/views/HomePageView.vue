<script>
import router from "@/router";
import { checkLogInAndAppendAuthHeaders } from "../utility/AuthenticationUtility.js";

export default {
  data() {
    return {
      isDataLoading: false,
      panelData: null,
      activeDownloadPanelName: null,
      errorMsg: null,
      dataDownloadErrorMsg: null,
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
        this.fetchPanelData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  methods: {
    fetchPanelData() {
      this.errorMsg = this.panelData = null;
      this.isDataLoading = true;
      const apiHeaders = checkLogInAndAppendAuthHeaders({
        "Content-Type": "application/json",
      });
      fetch("/gene2phenotype/api/panels/", {
        method: "GET",
        headers: apiHeaders,
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            return Promise.reject(
              new Error("Unable to fetch panel data. Please try again later.")
            );
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
    downloadPanelData(panelName) {
      let responseContentDisposition = null;
      this.dataDownloadErrorMsg = null;
      // before fetching panel data for download, activeDownloadPanelName is set to panelName
      // after fetching data, it is set to null
      this.activeDownloadPanelName = panelName;
      const apiHeaders = checkLogInAndAppendAuthHeaders({
        "Content-Type": "text/gzip",
      });
      fetch(`/gene2phenotype/api/panel/${panelName}/download`, {
        method: "GET",
        headers: apiHeaders,
      })
        .then((response) => {
          responseContentDisposition = response.headers.get(
            "Content-Disposition"
          );
          if (response.status === 200) {
            return response.blob();
          } else {
            return Promise.reject(
              new Error("Unable to download data. Please try again later.")
            );
          }
        })
        .then((responseBlob) => {
          this.activeDownloadPanelName = null;
          // get gzip file name from response Content-Disposition header
          const regexMatch = responseContentDisposition.match(
            /attachment; filename="([^"]+)"/
          ); // Eg responseContentDisposition value: attachment; filename="some_file_name.csv.gz"
          let gzipFileName = "data.csv.gz"; // default gzip file name
          if (regexMatch && regexMatch.length > 0 && regexMatch[1]) {
            gzipFileName = regexMatch[1];
          }
          // download gzip file
          const objectUrl = URL.createObjectURL(responseBlob);
          const anchor = document.createElement("a");
          anchor.href = objectUrl;
          anchor.target = "_blank";
          anchor.download = gzipFileName;
          anchor.click();
          URL.revokeObjectURL(objectUrl);
          anchor.remove();
        })
        .catch((error) => {
          this.activeDownloadPanelName = null;
          this.dataDownloadErrorMsg =
            error.message || "Unable to download data. Please try again later.";
          console.log(error);
        });
    },
  },
};
</script>
<template>
  <div style="min-height: 60vh">
    <div class="container col-xxl-8 px-4">
      <div class="row flex-lg-row align-items-center py-5">
        <div class="col-10 col-sm-8 col-lg-4">
          <img
            src="../assets/G2P-logo.png"
            class="d-block mx-lg-auto img-fluid"
            alt="G2P logo"
            width="280"
            height="auto"
            loading="lazy"
          />
        </div>
        <div class="col-lg-8">
          <h1 class="display-5 fw-bold lh-1 mb-3">Gene2Phenotype (G2P)</h1>
          <h5 class="fw-bold lh-1 mb-3">
            Accelerating genomic medicine with high confidence evidence based
            gene disease models
          </h5>
          <p class="lead">
            Browse, search and download detailed gene-disease associations with
            information on allelic requirement, observed variant classes and
            disease mechanism.
          </p>
        </div>
      </div>
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
    <div v-else>
      <div class="p-5 text-center bg-body-tertiary">
        <div class="container pt-0 px-3 pb-3">
          <h1 class="pb-5">Search G2P</h1>
          <div class="col-lg-8 mx-auto">
            <div class="input-group shadow-sm">
              <input
                type="text"
                class="form-control"
                aria-label="Search text input"
                placeholder="Eg: CRYBA1 or Severe Neurodevelopmental Syndrome"
                v-model="searchInput"
                id="search-input"
                @keyup.enter="searchClickHandler"
              />
              <button
                class="btn btn-primary dropdown-toggle"
                style="border-right: solid"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Filter
              </button>
              <div class="dropdown-menu dropdown-menu-end p-3">
                <p class="fw-bold mb-1">Filter by type</p>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    value="all"
                    v-model="selectedSearchType"
                    id="filter-input-type-all"
                  />
                  <label class="form-check-label" for="filter-input-type-all">
                    All
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    value="gene"
                    v-model="selectedSearchType"
                    id="filter-input-type-gene"
                  />
                  <label class="form-check-label" for="filter-input-type-gene">
                    Gene
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    value="disease"
                    v-model="selectedSearchType"
                    id="filter-input-type-disease"
                  />
                  <label
                    class="form-check-label"
                    for="filter-input-type-disease"
                  >
                    Disease
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    value="phenotype"
                    v-model="selectedSearchType"
                    id="filter-input-type-phenotype"
                  />
                  <label
                    class="form-check-label"
                    for="filter-input-type-phenotype"
                  >
                    Phenotype
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    value="g2p_id"
                    v-model="selectedSearchType"
                    id="filter-input-type-g2p-id"
                  />
                  <label
                    class="form-check-label"
                    for="filter-input-type-g2p-id"
                  >
                    G2P ID
                  </label>
                </div>
                <div
                  v-if="
                    panelData &&
                    panelData.results &&
                    panelData.results.length > 0
                  "
                >
                  <hr class="dropdown-divider" />
                  <p class="fw-bold mb-1">Filter by panel</p>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      value="all"
                      v-model="selectedSearchPanel"
                      id="filter-input-panel-all"
                    />
                    <label
                      class="form-check-label"
                      for="filter-input-panel-all"
                    >
                      All
                    </label>
                  </div>
                  <div class="form-check" v-for="item in panelData.results">
                    <input
                      class="form-check-input"
                      type="radio"
                      :value="item.name.toLowerCase()"
                      v-model="selectedSearchPanel"
                      :id="`filter-input-panel-${item.name}`"
                    />
                    <label
                      class="form-check-label"
                      :for="`filter-input-panel-${item.name}`"
                    >
                      {{ item.description ? item.description : item.name }}
                    </label>
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-primary"
                @click="searchClickHandler"
              >
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="container p-5">
        <h1 class="pb-5 text-center">Browse disorder panels</h1>
        <div
          class="alert alert-danger mx-auto col-lg-6"
          role="alert"
          v-if="errorMsg || dataDownloadErrorMsg"
        >
          <div>
            <i class="bi bi-exclamation-circle-fill"></i>
            {{ errorMsg || dataDownloadErrorMsg }}
          </div>
        </div>
        <div
          v-if="panelData && panelData.results && panelData.results.length > 0"
          class="col-lg-6 mx-auto"
        >
          <table class="table table-hover table-bordered shadow-sm">
            <thead>
              <tr>
                <th scope="col" width="35%">Disorder Panel</th>
                <th scope="col" width="37%">
                  Total LGMDE Records
                  <span class="bi bi-info-circle custom-tooltip">
                    <span class="custom-tooltip-text">
                      G2P records are Locus-Genotype-Mechanism-Disease-Evidence
                      (LGMDE) threads describing gene-disease associations
                    </span>
                  </span>
                </th>
                <th scope="col" width="20%">Total Genes</th>
                <th scope="col" width="8%">Download</th>
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
                <td>{{ item.stats?.total_records.toLocaleString() }}</td>
                <td>{{ item.stats?.total_genes.toLocaleString() }}</td>
                <td class="p-0">
                  <div class="d-flex justify-content-center">
                    <button
                      v-if="
                        activeDownloadPanelName &&
                        activeDownloadPanelName === item.name
                      "
                      disabled
                      class="btn btn-link p-0 mt-2"
                      type="button"
                    >
                      <span
                        class="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    </button>
                    <button
                      v-else
                      type="button"
                      class="btn btn-link p-0"
                      @click="downloadPanelData(item.name)"
                      :disabled="
                        activeDownloadPanelName &&
                        activeDownloadPanelName !== item.name
                      "
                    >
                      <i class="bi bi-cloud-arrow-down-fill fs-4"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.custom-tooltip {
  position: relative;
  display: inline-block;
  color: #0d6efd;
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
