<script>
import {
  DOWNLOAD_PANEL_URL,
  PANEL_SUMMARY_URL,
  PANEL_URL,
} from "../utility/UrlConstants.js";
import BarChart from "../components/chart/BarChart.vue";
import { CONFIDENCE_COLOR_MAP, HELP_TEXT } from "../utility/Constants.js";
import ToolTip from "../components/tooltip/ToolTip.vue";
import api from "../services/api.js";
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";
import { trackPanelDownload } from "../utility/AnalyticsUtility.js";

export default {
  data() {
    return {
      isDataLoading: false,
      isDownloadAllDataLoading: false,
      panelData: null,
      panelSummaryData: null,
      errorMsg: null,
      downloadAllDataErrorMsg: null,
      CONFIDENCE_COLOR_MAP,
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
      { immediate: true }
    );
  },
  methods: {
    fetchData() {
      this.errorMsg = this.panelData = this.panelSummaryData = null;
      this.isDataLoading = true;
      Promise.all([
        api.get(PANEL_URL.replace(":panelname", this.$route.params.panel)),
        api.get(
          PANEL_SUMMARY_URL.replace(":panelname", this.$route.params.panel)
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
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch panel data. Please try again later."
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
          }
        )
        .then((response) => {
          const responseContentDisposition = response.headers.get(
            "Content-Disposition"
          );
          // get csv file name from response Content-Disposition header
          const regexMatch = responseContentDisposition.match(
            /attachment; filename="([^"]+)"/
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
            "Unable to download data. Please try again later."
          );
        })
        .finally(() => {
          this.isDownloadAllDataLoading = null;
        });
    },
  },
  components: {
    BarChart,
    ToolTip,
  },
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
                <ToolTip :toolTipText="HELP_TEXT.LGMDE_RECORD" />
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
      <h3 class="pt-5 pb-2">Last added/updated records</h3>
      <div
        class="d-flex justify-content-end mb-2"
        v-if="panelSummaryData.records_summary?.length > 0"
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
          v-if="panelSummaryData.records_summary?.length > 0"
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
              <td>{{ item.variant_type.join(", ") }}</td>
              <td>{{ item.molecular_mechanism }}</td>
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
              <td>{{ item.last_updated }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No Records found</p>
      </div>
      <p>
        <strong>Curators: </strong>
        Full list of expert curators is available
        <router-link to="/curators" style="text-decoration: none"
          >here</router-link
        >.
      </p>
      <p>
        <strong>Last Updated: </strong>
        <span v-if="panelData.last_updated">
          {{ panelData.last_updated }}
        </span>
        <span v-else style="color: grey">Not Available</span>
      </p>
    </div>
  </div>
</template>
<style scoped>
th {
  white-space: nowrap;
}
</style>
