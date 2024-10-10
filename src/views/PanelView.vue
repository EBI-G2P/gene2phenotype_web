<script>
import BarChart from "../components/chart/BarChart.vue";
import { checkLogInAndAppendAuthHeaders } from "../utility/AuthenticationUtility.js";

export default {
  data() {
    return {
      isDataLoading: false,
      isDownloadAllDataLoading: false,
      panelData: null,
      panelSummaryData: null,
      errorMsg: null,
      downloadAllDataErrorMsg: null,
      confidenceColorMap: {
        definitive: "#276749",
        strong: "#38a169",
        moderate: "#68d391",
        limited: "#fc8181",
        disputed: "#e53e3e",
        refuted: "#9b2c2c",
      },
      chartData: {},
      chartOptions: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              text: "Confidence",
              display: true,
            },
          },
          y: {
            title: {
              text: "Number of Records",
              display: true,
            },
          },
        },
      },
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
      this.errorMsg = this.panelData = this.panelSummaryData = null;
      this.isDataLoading = true;
      const apiHeaders = checkLogInAndAppendAuthHeaders({
        "Content-Type": "application/json",
      });
      Promise.all([
        fetch(`/gene2phenotype/api/panel/${this.$route.params.panel}/`, {
          method: "GET",
          headers: apiHeaders,
        }),
        fetch(
          `/gene2phenotype/api/panel/${this.$route.params.panel}/summary/`,
          {
            method: "GET",
            headers: apiHeaders,
          }
        ),
      ])
        .then((responseArr) => {
          return Promise.all(
            responseArr.map((response) => {
              if (response.status === 200) {
                return response.json();
              } else {
                return Promise.reject(new Error("Unable to fetch panel data"));
              }
            })
          );
        })
        .then((responseJsonArr) => {
          const [panelData, panelSummaryData] = responseJsonArr;
          this.isDataLoading = false;
          this.panelData = panelData;
          this.panelSummaryData = panelSummaryData;
          this.chartData = {
            labels: ["Definitive", "Strong", "Moderate", "Limited"],
            datasets: [
              {
                label: "Panel Records",
                data: [
                  panelData?.stats?.by_confidence?.definitive,
                  panelData?.stats?.by_confidence?.strong,
                  panelData?.stats?.by_confidence?.moderate,
                  panelData?.stats?.by_confidence?.limited,
                ],
                backgroundColor: [
                  "rgb(39,103,73)",
                  "rgb(56,161,105)",
                  "rgb(104,211,145)",
                  "rgb(252,129,129)",
                ],
                borderColor: [
                  "rgb(39,103,73)",
                  "rgb(56,161,105)",
                  "rgb(104,211,145)",
                  "rgb(252,129,129)",
                ],
                borderWidth: 1,
              },
            ],
          };
        })
        .catch((error) => {
          this.isDataLoading = false;
          this.errorMsg = error.message;
          console.log(error);
        });
    },
    downloadAllData() {
      let responseContentDisposition = null;
      this.downloadAllDataErrorMsg = null;
      this.isDownloadAllDataLoading = true;
      const apiHeaders = checkLogInAndAppendAuthHeaders({
        "Content-Type": "text/gzip",
      });
      fetch(`/gene2phenotype/api/panel/${this.$route.params.panel}/download`, {
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
          this.isDownloadAllDataLoading = false;
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
          this.isDownloadAllDataLoading = false;
          this.downloadAllDataErrorMsg =
            error.message || "Unable to download data. Please try again later.";
          console.log(error);
        });
    },
  },
  components: { BarChart },
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
    <div v-if="panelData && panelSummaryData">
      <h2 v-if="panelData.name || panelData.description">
        {{ panelData.description }} panel ({{ panelData.name }})
      </h2>
      <h2 v-else>Not Available</h2>
      <div class="row pt-4 justify-content-md-center">
        <div class="col-4">
          <div class="card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">
                Total LGMDE Records
                <span class="bi bi-info-circle custom-tooltip">
                  <span class="custom-tooltip-text">
                    G2P records are Locus-Genotype-Mechanism-Disease-Evidence
                    (LGMDE) threads describing gene-disease associations
                  </span>
                </span>
              </h6>
              <h4 class="card-title" v-if="panelData.stats?.total_records">
                {{ panelData.stats.total_records.toLocaleString() }}
              </h4>
              <h4 class="card-title" v-else style="color: grey">
                Not Available
              </h4>
            </div>
          </div>
        </div>
        <div class="col-4">
          <div class="card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Total Genes</h6>
              <h4 class="card-title" v-if="panelData.stats?.total_genes">
                {{ panelData.stats.total_genes.toLocaleString() }}
              </h4>
              <h4 class="card-title" v-else style="color: grey">
                Not Available
              </h4>
            </div>
          </div>
        </div>
      </div>
      <h5 class="pt-5 text-center">Records per confidence class</h5>
      <div>
        <BarChart
          :chartData="chartData"
          :chartOptions="chartOptions"
          v-if="panelData.stats.by_confidence"
          class="w-50 mx-auto"
        />
      </div>
      <h3 class="pt-5 pb-2">Latest records</h3>
      <div class="d-flex justify-content-end mb-2">
        <button
          v-if="!isDownloadAllDataLoading"
          type="button"
          class="btn btn-outline-primary"
          @click="downloadAllData"
        >
          <i class="bi bi-cloud-arrow-down-fill"></i> Download all data
        </button>
        <button v-else disabled class="btn btn-outline-primary" type="button">
          <span
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Downloading...
        </button>
      </div>
      <div
        class="alert alert-danger mt-3"
        role="alert"
        v-if="downloadAllDataErrorMsg"
      >
        <div>
          <i class="bi bi-exclamation-circle-fill"></i>
          {{ downloadAllDataErrorMsg }}
        </div>
      </div>
      <div class="table-responsive-xl">
        <table
          class="table table-hover table-bordered shadow-sm"
          v-if="
            panelSummaryData.records_summary &&
            panelSummaryData.records_summary.length > 0
          "
        >
          <thead>
            <tr>
              <th
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                G2P ID
              </th>
              <th
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                Gene
              </th>
              <th
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                Disease
              </th>
              <th
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                Allelic Requirement
              </th>
              <th
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                Variant Consequence
              </th>
              <th
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                Variant Type
              </th>
              <th
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                Mechanism
              </th>
              <th
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                Confidence
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in panelSummaryData.records_summary">
              <td>
                <router-link
                  :to="`/lgd/${item.stable_id}`"
                  style="text-decoration: none"
                  v-if="item.stable_id"
                >
                  {{ item.stable_id }}
                </router-link>
              </td>
              <td>
                <router-link
                  :to="`/gene/${item.locus}`"
                  v-if="item.locus"
                  style="text-decoration: none"
                >
                  {{ item.locus }}
                </router-link>
              </td>
              <td>
                <router-link
                  :to="`/disease/${item.disease}`"
                  v-if="item.disease"
                  style="text-decoration: none"
                >
                  {{ item.disease }}
                </router-link>
              </td>
              <td>{{ item.genotype }}</td>
              <td>
                {{ item.variant_consequence.join(", ") }}
              </td>
              <td>{{ item.variant_type.join(", ") }}</td>
              <td>{{ item.molecular_mechanism.join(", ") }}</td>
              <td>
                <span
                  v-if="item.confidence"
                  class="badge text-white"
                  :style="{
                    backgroundColor:
                      confidenceColorMap[item.confidence.toLowerCase()],
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
      <h3 class="pt-3 pb-2">Curators</h3>
      <div class="row mx-3">
        <ul v-if="panelData.curators && panelData.curators.length > 0">
          <li v-for="curator in panelData.curators">
            {{ curator }}
          </li>
        </ul>
        <p v-else style="color: grey">Not Available</p>
      </div>
      <p>
        <strong>Last Update: </strong>
        <span v-if="panelData.last_updated">
          {{ panelData.last_updated }}
        </span>
        <span v-else style="color: grey">Not Available</span>
      </p>
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
