<script>
import { checkLogInAndAppendAuthHeaders } from "../utility/AuthenticationUtility.js";

export default {
  data() {
    return {
      isDataLoading: false,
      panelData: null,
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
      this.panelErrorMsg = this.panelData = null;
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
              new Error("Unable to fetch panels data. Please try again later.")
            );
          }
        })
        .then((responseJson) => {
          this.isDataLoading = false;
          this.panelData = responseJson;
        })
        .catch((error) => {
          this.isDataLoading = false;
          this.panelErrorMsg = error.message;
          console.log(error);
        });
    },
    downloadPanelData(panelName) {
      let responseContentDisposition = null;
      this.dataDownloadErrorMsg = null;
      this.isDataLoading = true;
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
          this.isDataLoading = false;
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
          this.isDataLoading = false;
          this.dataDownloadErrorMsg =
            error.message || "Unable to download data. Please try again later.";
          console.log(error);
        });
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-2">Download G2P data by disorder panel</h2>
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
    <div
      v-if="
        !isDataLoading &&
        panelData &&
        panelData.results &&
        panelData.results.length > 0
      "
    >
      <ul class="list-unstyled">
        <li v-for="item in panelData.results">
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
        <a href="" target="_blank" style="text-decoration: none">here</a>.
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
