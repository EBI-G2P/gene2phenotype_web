<script>
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";
import { ALL_PANELS_URL, DOWNLOAD_PANEL_URL } from "../utility/UrlConstants.js";
import api from "../services/api.js";

export default {
  data() {
    return {
      isDataLoading: false,
      panelData: [],
      panelErrorMsg: null,
      dataDownloadErrorMsg: null,
    };
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchPanels();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  methods: {
    fetchPanels() {
      this.panelData = [];
      this.panelErrorMsg = null;
      this.isDataLoading = true;
      api
        .get(ALL_PANELS_URL)
        .then((response) => {
          if (response?.data?.results?.length > 0) {
            this.panelData = response.data.results;
          }
        })
        .catch((error) => {
          this.panelErrorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch panels data. Please try again later."
          );
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
    downloadPanelData(panelName) {
      this.dataDownloadErrorMsg = null;
      this.isDataLoading = true;
      api
        .get(DOWNLOAD_PANEL_URL.replace(":panelname", panelName), {
          headers: {
            "Content-Type": "text/csv;charset=UTF-8",
          },
          responseType: "text",
        })
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
          this.dataDownloadErrorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to download data. Please try again later."
          );
        })
        .finally(() => {
          this.isDataLoading = null;
        });
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-2">Download G2P data</h2>
    <div
      class="d-flex justify-content-center"
      v-if="isDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-if="panelErrorMsg">
      <div>
        <i class="bi bi-exclamation-circle-fill"></i> {{ panelErrorMsg }}
      </div>
    </div>
    <div v-if="!isDataLoading">
      <ul class="list-unstyled">
        <li>
          <button
            @click="downloadPanelData('all')"
            type="button"
            class="btn btn-link"
            style="margin: 0; padding: 0; text-decoration: none"
          >
            <i class="bi bi-cloud-arrow-down-fill fs-5"></i>
            All data
          </button>
        </li>
        <li v-for="item in panelData" :key="item.name">
          <button
            @click="downloadPanelData(item.name)"
            type="button"
            class="btn btn-link"
            style="margin: 0; padding: 0; text-decoration: none"
          >
            <i class="bi bi-cloud-arrow-down-fill fs-5"></i>
            {{ item.description ? item.description : item.name }} gene-disease
            pairs and attributes
          </button>
        </li>
      </ul>
    </div>
    <div
      class="alert alert-danger mt-3"
      role="alert"
      v-if="dataDownloadErrorMsg"
    >
      <div>
        <i class="bi bi-exclamation-circle-fill"></i> {{ dataDownloadErrorMsg }}
      </div>
    </div>
    <div v-if="!isDataLoading">
      <p>
        Download format is available
        <a
          href="https://ftp.ebi.ac.uk/pub/databases/gene2phenotype/G2P_data_downloads/DataDownloadFormat202501.txt"
          target="_blank"
          style="text-decoration: none"
          >here</a
        >.
      </p>
      <p>
        Downloads are created on the fly to provide the latest information. For
        static release files see the
        <a
          href="http://ftp.ebi.ac.uk/pub/databases/gene2phenotype/"
          target="_blank"
          style="text-decoration: none"
          >FTP site</a
        >.
      </p>
      <p>
        The gene2phenotype dataset (G2P) integrates data on genes, variants and
        phenotypes for example relating to developmental disorders. It is
        constructed from published literature, and is primarily an inclusion
        list to allow targeted filtering of genome-wide data for diagnostic
        purposes. Each entry associates a gene with a disease phenotype via an
        evidence level, inheritance mechanism and mutation consequence. Some
        genes therefore appear in the database more than once, where different
        genetic mechanisms result in different phenotypes.
      </p>
      <p>
        G2P is produced and curated by UK disease domain experts and consultant
        clinical geneticists. It is regularly updated. Caution should therefore
        be exercised in its application. The data from G2P is freely available
        and interested parties can get in touch via
        <a href="mailto:g2p-help@ebi.ac.uk" style="text-decoration: none"
          >g2p-help@ebi.ac.uk</a
        >
        for further information.
      </p>
      <p>
        If you use these data in your work please cite the data version and
        Thorman et al 2019 (<a
          href="https://www.nature.com/articles/s41467-019-10016-3"
          target="_blank"
          style="text-decoration: none"
          >https://www.nature.com/articles/s41467-019-10016-3</a
        >)
      </p>
    </div>
  </div>
</template>
