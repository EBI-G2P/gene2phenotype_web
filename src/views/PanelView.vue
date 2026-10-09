<script>
import {
  DOWNLOAD_PANEL_URL,
  PANEL_SUMMARY_URL,
  PANEL_URL,
} from "../utility/UrlConstants.js";
import BarChart from "../components/chart/BarChart.vue";
import { HELP_TEXT } from "../utility/Constants.js";
import ToolTip from "../components/tooltip/ToolTip.vue";
import api from "../services/api.js";
import {
  fetchAndLogGeneralErrorMsg,
  fetchAndLogApiResponseErrorMsg,
} from "../utility/ErrorUtility.js";
import { trackPanelDownload } from "../utility/AnalyticsUtility.js";
import ConfidenceBadge from "../components/confidence/ConfidenceBadge.vue";

export default {
  data() {
    return {
      isDataLoading: false,
      isDownloadAllDataLoading: false,
      panelData: null,
      panelSummaryData: null,
      errorMsg: null,
      downloadAllDataErrorMsg: null,
      HELP_TEXT,
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
      { immediate: true },
    );
  },
  computed: {
    panelTitle() {
      const { name, description } = this.panelData ?? {};

      if (description && name) {
        return `${description} panel (${name})`;
      }

      return `${description || name} panel`;
    },
    hasRecordsByConfidence() {
      const recordsByConfidence = this.panelData?.stats?.by_confidence;

      return Boolean(
        recordsByConfidence && Object.keys(recordsByConfidence).length > 0,
      );
    },
  },
  methods: {
    fetchData() {
      this.errorMsg = this.panelData = this.panelSummaryData = null;
      this.isDataLoading = true;
      Promise.all([
        api.get(PANEL_URL.replace(":panelname", this.$route.params.panel)),
        api.get(
          PANEL_SUMMARY_URL.replace(":panelname", this.$route.params.panel),
        ),
      ])
        .then(([response1, response2]) => {
          this.panelData = response1.data;
          this.panelSummaryData = response2.data;
          this.chartData = {
            labels: ["Definitive", "Strong", "Moderate", "Limited"],
            datasets: [
              {
                label: "Panel Records",
                data: [
                  this.panelData?.stats?.by_confidence?.definitive,
                  this.panelData?.stats?.by_confidence?.strong,
                  this.panelData?.stats?.by_confidence?.moderate,
                  this.panelData?.stats?.by_confidence?.limited,
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
          this.errorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch panel data. Please try again later.",
            "Unable to fetch panel data.",
          );
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
    downloadAllData() {
      trackPanelDownload(this.$route.params.panel);
      this.downloadAllDataErrorMsg = null;
      this.isDownloadAllDataLoading = true;
      api
        .get(
          DOWNLOAD_PANEL_URL.replace(":panelname", this.$route.params.panel),
          {
            headers: {
              "Content-Type": "text/csv;charset=UTF-8",
            },
            responseType: "text",
          },
        )
        .then((response) => {
          const responseContentDisposition = response.headers.get(
            "Content-Disposition",
          );
          // get csv file name from response Content-Disposition header
          const regexMatch = responseContentDisposition.match(
            /attachment; filename="([^"]+)"/,
          ); // Eg responseContentDisposition value: attachment; filename="some_file_name.csv"
          let csvFileName = "data.csv"; // default csv file name
          if (regexMatch?.length > 0 && regexMatch[1]) {
            csvFileName = regexMatch[1];
          }
          // download csv data to file
          const csvDataText = response.data;
          const anchor = document.createElement("a");
          anchor.href =
            "data:text/csv;charset=utf-8," + encodeURIComponent(csvDataText);
          anchor.target = "_blank";
          anchor.download = csvFileName;
          anchor.click();
          anchor.remove();
        })
        .catch((error) => {
          this.downloadAllDataErrorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to download data. Please try again later.",
          );
        })
        .finally(() => {
          this.isDownloadAllDataLoading = false;
        });
    },
  },
  components: {
    BarChart,
    ToolTip,
    ConfidenceBadge,
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
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
    <div v-if="panelData && panelSummaryData">
      <h2 v-if="panelData.name || panelData.description">{{ panelTitle }}</h2>
      <h2 v-else>Not Available</h2>
      <div class="row g-3 pt-4 justify-content-center">
        <div class="col-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle summary-card-subtitle mb-2 text-muted">
                Total LGMDE Records
                <ToolTip :toolTipText="HELP_TEXT.LGMDE_RECORD" />
              </h6>
              <h4
                v-if="panelData.stats?.total_records != null"
                class="card-title"
              >
                {{ panelData.stats.total_records.toLocaleString() }}
              </h4>
              <h4 v-else class="card-title text-secondary">Not Available</h4>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle summary-card-subtitle mb-2 text-muted">
                Total Genes
              </h6>
              <h4
                v-if="panelData.stats?.total_genes != null"
                class="card-title"
              >
                {{ panelData.stats.total_genes.toLocaleString() }}
              </h4>
              <h4 v-else class="card-title text-secondary">Not Available</h4>
            </div>
          </div>
        </div>
      </div>
      <template v-if="hasRecordsByConfidence">
        <h5 class="pt-4 text-center">Records per confidence class</h5>
        <div class="chart-container mx-auto">
          <BarChart :chartData="chartData" :chartOptions="chartOptions" />
        </div>
      </template>
      <h3 class="pt-5 pb-2">Last added/updated records</h3>
      <div
        v-if="panelSummaryData.records_summary?.length > 0"
        class="d-flex justify-content-end mb-2"
      >
        <button
          v-if="!isDownloadAllDataLoading"
          type="button"
          class="btn btn-outline-primary"
          @click="downloadAllData"
        >
          <i class="bi bi-cloud-arrow-down-fill"></i> Download panel
          <ToolTip :toolTipText="HELP_TEXT.DOWNLOAD_ALL_DATA" />
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
        v-if="downloadAllDataErrorMsg"
        class="alert alert-danger mt-3"
        role="alert"
      >
        <div>
          <i class="bi bi-exclamation-circle-fill"></i>
          {{ downloadAllDataErrorMsg }}
        </div>
      </div>
      <div class="table-responsive-xl">
        <table
          v-if="panelSummaryData.records_summary?.length > 0"
          class="table table-hover table-bordered shadow-sm"
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
              <th>
                Variant Type <ToolTip :toolTipText="HELP_TEXT.VARIANT_TYPE" />
              </th>
              <th>Mechanism <ToolTip :toolTipText="HELP_TEXT.MECHANISM" /></th>
              <th>
                Confidence <ToolTip :toolTipText="HELP_TEXT.CONFIDENCE" />
              </th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in panelSummaryData.records_summary"
              :key="item.stable_id"
            >
              <td>
                <router-link
                  v-if="item.stable_id"
                  :to="`/lgd/${item.stable_id}`"
                  class="text-decoration-none"
                >
                  {{ item.stable_id }}
                </router-link>
              </td>
              <td>
                <router-link
                  v-if="item.locus"
                  :to="`/gene/${item.locus}`"
                  class="text-decoration-none"
                >
                  {{ item.locus }}
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
              <td>{{ item.variant_type?.join(", ") }}</td>
              <td>{{ item.molecular_mechanism }}</td>
              <td>
                <ConfidenceBadge :confidence="item.confidence" />
              </td>
              <td>{{ item.last_updated }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No records found</p>
      </div>
      <p>
        <strong>Curators: </strong>
        Full list of expert curators is available
        <router-link to="/curators" class="text-decoration-none"
          >here</router-link
        >.
      </p>
      <p>
        <strong>Last Updated: </strong>
        <span v-if="panelData.last_updated">
          {{ panelData.last_updated }}
        </span>
        <span v-else class="text-secondary">Not Available</span>
      </p>
    </div>
  </div>
</template>
<style scoped>
.chart-container {
  width: 100%;
}

@media (max-width: 767.98px) {
  .summary-card-subtitle {
    font-size: 0.85rem;
  }
}

@media (min-width: 768px) {
  .chart-container {
    width: 75%;
  }
}

@media (min-width: 992px) {
  .chart-container {
    width: 50%;
  }
}

th {
  white-space: nowrap;
}
</style>
