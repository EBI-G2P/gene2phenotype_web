<script>
import { ALL_PANELS_URL, DOWNLOAD_PANEL_URL } from "../utility/UrlConstants.js";
import HomeSearch from "../components/search/HomeSearch.vue";
import ToolTip from "../components/tooltip/ToolTip.vue";
import api from "../services/api.js";
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";
import { HELP_TEXT } from "../utility/Constants.js";
import { trackPanelDownload } from "../utility/AnalyticsUtility.js";

export default {
  data() {
    return {
      isDataLoading: false,
      panelData: null,
      activeDownloadPanelName: null,
      errorMsg: null,
      dataDownloadErrorMsg: null,
      isMaintenance: false,
      homeCards: [
        {
          title: "G2P API",
          text: "Programmatically access G2P data using the REST API.",
          route: "/g2p-api-info",
          buttonText: "G2P API documentation",
          icon: "bi-laptop-fill",
        },
        {
          title: "Download data",
          text: "Download G2P data in bulk.",
          route: "/download",
          buttonText: "Download CSV files",
          icon: "bi-cloud-arrow-down-fill",
        },
        {
          title: "Variant prioritisation",
          text: "Use the Ensembl VEP-G2P extension to filter variants and identify likely causative genes.",
          route: "/variant-filtering",
          buttonText: "Plugin documentation",
          icon: "bi-funnel-fill",
        },
        {
          title: "Citing G2P",
          text: "If you use G2P data in your work, please cite us.",
          route: "/publications",
          buttonText: "Citing G2P",
          icon: "bi-book-fill",
        },
      ],
      HELP_TEXT,
    };
  },
  created() {
    this.fetchPanelData();
  },
  components: {
    HomeSearch,
    ToolTip,
  },
  methods: {
    fetchPanelData() {
      this.errorMsg = this.panelData = null;
      this.isDataLoading = true;
      api
        .get(ALL_PANELS_URL)
        .then((response) => {
          this.panelData = response.data;
        })
        .catch((error) => {
          if (error.status === 503 || error.status === 500) {
            this.isMaintenance = true;
          }
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch panel data. Please try again later.",
          );
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
    downloadPanelData(panelName) {
      trackPanelDownload(panelName);
      this.dataDownloadErrorMsg = null;
      // before fetching panel data for download, activeDownloadPanelName is set to panelName
      // after fetching data, it is set to null
      this.activeDownloadPanelName = panelName;
      api
        .get(DOWNLOAD_PANEL_URL.replace(":panelname", panelName), {
          headers: {
            "Content-Type": "text/csv;charset=UTF-8",
          },
          responseType: "text",
        })
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
          this.dataDownloadErrorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to download data. Please try again later.",
          );
        })
        .finally(() => {
          this.activeDownloadPanelName = null;
        });
    },
  },
};
</script>
<template>
  <div style="min-height: 60vh">
    <div class="bg-primary bg-opacity-10">
      <div class="container p-4">
        <div class="row flex-lg-row align-items-center g-3 py-3">
          <div class="col-10 col-sm-8 col-lg-3">
            <img
              src="../assets/G2P-logo.png"
              class="d-block mx-lg-auto img-fluid g2p-logo-img"
              alt="G2P logo"
              loading="lazy"
            />
          </div>
          <div class="col-lg-9">
            <h1 class="display-5 fw-bold text-body-emphasis lh-1 mb-3">
              Gene2Phenotype (G2P)
            </h1>
            <h5 class="fw-bold lh-1 mb-3">
              Accelerating genomic medicine with high confidence evidence based
              gene disease models
            </h5>
            <p class="lead g2p-description-text">
              Browse, search and download detailed gene-disease associations
              with information on allelic requirement, observed variant classes
              and disease mechanism.
            </p>
            <HomeSearch
              v-if="!isMaintenance"
              :panels="panelData?.results || []"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="container p-4">
      <h1 class="pb-3 text-center">Browse panels</h1>
      <div
        v-if="errorMsg || dataDownloadErrorMsg"
        class="alert alert-danger mx-auto col-lg-6"
        role="alert"
      >
        <div>
          <i class="bi bi-exclamation-circle-fill"></i>
          {{ errorMsg || dataDownloadErrorMsg }}
        </div>
      </div>
      <div
        v-if="isDataLoading"
        class="col-xl-8 mx-auto table-responsive-sm"
        aria-live="polite"
        aria-busy="true"
      >
        <table
          class="table table-bordered shadow-sm panels-loading-table"
          aria-hidden="true"
        >
          <thead>
            <tr>
              <th scope="col">Disorder Panel</th>
              <th scope="col">
                Total LGMDE Records
                <ToolTip :toolTipText="HELP_TEXT.LGMDE_RECORD" />
              </th>
              <th scope="col">Total Genes</th>
              <th scope="col">Last Updated</th>
              <th scope="col">Download</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in 6" :key="row" class="placeholder-glow">
              <td>
                <span
                  class="placeholder rounded panel-placeholder"
                  style="width: 75%"
                ></span>
              </td>
              <td>
                <span
                  class="placeholder rounded panel-placeholder"
                  style="width: 4.5rem"
                ></span>
              </td>
              <td>
                <span
                  class="placeholder rounded panel-placeholder"
                  style="width: 4.5rem"
                ></span>
              </td>
              <td>
                <span
                  class="placeholder rounded panel-placeholder"
                  style="width: 6rem"
                ></span>
              </td>
              <td>
                <span
                  class="placeholder rounded panel-placeholder"
                  style="width: 3rem"
                ></span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="visually-hidden" role="status">Loading panel data</div>
      </div>
      <div
        v-else-if="panelData?.results?.length > 0"
        class="col-xl-8 mx-auto table-responsive-sm"
      >
        <table class="table table-hover table-bordered shadow-sm">
          <thead>
            <tr>
              <th scope="col">Disorder Panel</th>
              <th scope="col">
                Total LGMDE Records
                <ToolTip :toolTipText="HELP_TEXT.LGMDE_RECORD" />
              </th>
              <th scope="col">Total Genes</th>
              <th scope="col">Last Updated</th>
              <th scope="col">Download</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in panelData.results" :key="item.name">
              <td>
                <router-link
                  v-if="item.name"
                  :to="`/panel/${item.name}`"
                  class="text-decoration-none"
                >
                  {{ item.description || item.name }}
                </router-link>
              </td>
              <td>{{ item.stats?.total_records?.toLocaleString() }}</td>
              <td>{{ item.stats?.total_genes?.toLocaleString() }}</td>
              <td>{{ item.last_updated }}</td>
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
                    :aria-label="`Downloading ${item.description || item.name}`"
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
                    :aria-label="`Download ${item.description || item.name}`"
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
    <div class="container p-4">
      <div
        class="row g-3 px-0 px-md-5 pb-4 row-cols-1 row-cols-md-2 row-cols-xl-4"
      >
        <div v-for="card in homeCards" :key="card.route" class="col">
          <div class="home-card d-flex flex-column h-100">
            <div class="home-card-header d-flex align-items-center">
              <div
                class="icon-square d-inline-flex align-items-center justify-content-center flex-shrink-0 me-2"
                aria-hidden="true"
              >
                <i :class="['bi', card.icon]"></i>
              </div>
              <h3 class="home-card-title text-body-emphasis">
                {{ card.title }}
              </h3>
            </div>
            <p class="home-card-text">
              {{ card.text }}
            </p>
            <router-link
              :to="card.route"
              class="btn btn-primary mt-auto align-self-start"
            >
              {{ card.buttonText }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.g2p-logo-img {
  width: 240px;
  height: auto;
}

.panels-loading-table th,
.panels-loading-table td {
  vertical-align: middle;
}

.panel-placeholder {
  display: inline-block;
  height: 1rem;
}

.home-card {
  padding: 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.7rem;
  background-color: #fff;
}

.home-card-header {
  margin-bottom: 0.9rem;
}

.home-card-title {
  margin-bottom: 0;
  font-size: 1.3rem;
  line-height: 1.2;
}

.home-card-text {
  text-align: left;
  margin-bottom: 1rem;
}

.icon-square {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 0.55rem;
  background-color: rgba(var(--bs-primary-rgb), 0.12);
  color: var(--bs-primary);
  font-size: 0.95rem;
}

@media (max-width: 992px) {
  .g2p-logo-img {
    width: 160px;
  }
}

@media (max-width: 576px) {
  .g2p-description-text {
    font-size: 16px;
  }
}
</style>
