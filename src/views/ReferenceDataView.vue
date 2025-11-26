<script>
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";
import { REFERENCE_DATA_URL } from "../utility/UrlConstants.js";
import api from "../services/api.js";

export default {
  data() {
    return {
      isDataLoading: false,
      referenceData: null,
      errorMsg: null,
    };
  },
  created() {
    // watch the params of this route to fetch this data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchData();
      },
      { immediate: true }
    );
  },
  methods: {
    fetchData() {
      this.errorMsg = this.curationEntries = null;
      this.isDataLoading = true;
      api
        .get(REFERENCE_DATA_URL)
        .then((response) => {
          this.referenceData = this.getReferenceDataFromResponse(response.data);
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch reference data. Please try again later."
          );
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
    getReferenceDataFromResponse(response) {
      let referenceData = {};

      const geneReferenceData = response.find(
        (item) => item.key === "locus_gene_update"
      );
      if (geneReferenceData) {
        referenceData["geneData"] = geneReferenceData;
      }
      const geneSymbolReferenceData = response.find(
        (item) => item.key === "locus_gene_symbol_update"
      );
      if (geneSymbolReferenceData) {
        referenceData["geneSymbolData"] = geneSymbolReferenceData;
      }
      const geneFunctionReferenceData = response.find(
        (item) => item.key === "import_uniprot"
      );
      if (geneFunctionReferenceData) {
        referenceData["geneFunctionData"] = geneFunctionReferenceData;
      }
      const omimReferenceData = response.find(
        (item) => item.key === "import_gene_disease_omim"
      );
      if (omimReferenceData) {
        referenceData["omimData"] = omimReferenceData;
      }
      const mondoReferenceData = response.find(
        (item) => item.key === "import_gene_disease_mondo"
      );
      if (mondoReferenceData) {
        referenceData["mondoData"] = mondoReferenceData;
      }

      return referenceData;
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-3">Reference data</h2>
    <p>
      G2P evidence-based gene-disease models are curated from the literature by
      experts. The diseases names assigned in G2P records use the dyadic format
      and are based on existing OMIM or MONDO names for the same/related
      conditions where possible.
    </p>
    <p>
      Publications in the 'Mined Publications' table have been identified by
      filtering the scientific literature for relevant reports using a new ML
      pipeline. See
      <a
        href="https://doi.org/10.1101/2025.11.24.25340871"
        target="_blank"
        style="text-decoration: none"
        >Yates et al</a
      >
    </p>
    <p>
      The following additional reference data, is used to supplement G2P
      records:
    </p>
    <div
      class="d-flex justify-content-center"
      v-if="isDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-else-if="errorMsg">
      <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
    </div>
    <div class="row" v-else>
      <div class="col-xl-6" v-if="referenceData">
        <table class="table table-hover table-bordered shadow-sm">
          <thead>
            <tr>
              <th>Information</th>
              <th>Source</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gene location in GRCh38</td>
              <td>{{ referenceData.geneData?.source }}</td>
              <td>{{ referenceData.geneData?.version }}</td>
            </tr>
            <tr>
              <td>Gene names/ HGNC ids/ OMIM ids</td>
              <td>{{ referenceData.geneSymbolData?.source }}</td>
              <td>{{ referenceData.geneSymbolData?.version }}</td>
            </tr>
            <tr>
              <td>Gene Function</td>
              <td>{{ referenceData.geneFunctionData?.source }}</td>
              <td>{{ referenceData.geneFunctionData?.version }}</td>
            </tr>
            <tr>
              <td>OMIM disease names</td>
              <td>{{ referenceData.omimData?.source }}</td>
              <td>{{ referenceData.omimData?.version }}</td>
            </tr>
            <tr>
              <td>MONDO disease names</td>
              <td>{{ referenceData.mondoData?.source }}</td>
              <td>{{ referenceData.mondoData?.version }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-muted" v-else>Data currently not available.</p>
    </div>
  </div>
</template>
