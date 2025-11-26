<script>
import {
  GENE_FUNCTION_URL,
  GENE_SUMMARY_URL,
  GENE_URL,
  HGNC_URL,
  OMIM_URL,
  PANELAPP_URL,
  UNIPROT_URL,
  DECIPHER_URL,
  ENSEMBL_GENE_URL,
  GENCC_URL,
  CLINGEN_URL,
} from "../utility/UrlConstants.js";
import {
  CONFIDENCE_COLOR_MAP,
  HELP_TEXT,
  MARSH_PROBABILITY_THRESHOLD,
} from "../utility/Constants.js";
import ToolTip from "../components/tooltip/ToolTip.vue";
import api from "../services/api.js";
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";
import GeneFunction from "../components/text/GeneFunction.vue";
export default {
  data() {
    return {
      isDataLoading: false,
      geneSummaryData: null,
      geneData: null,
      geneFunctionData: null,
      errorMsg: null,
      CONFIDENCE_COLOR_MAP,
      HELP_TEXT,
      DECIPHER_URL,
      ENSEMBL_GENE_URL,
      GENCC_URL,
      HGNC_URL,
      OMIM_URL,
      PANELAPP_URL,
      UNIPROT_URL,
      CLINGEN_URL,
      MARSH_PROBABILITY_THRESHOLD,
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
  components: { ToolTip, GeneFunction },
  methods: {
    fetchData() {
      this.errorMsg =
        this.geneSummaryData =
        this.geneFunctionData =
        this.geneData =
          null;
      this.isDataLoading = true;
      const geneSymbol = this.$route.params.symbol;
      Promise.all([
        api.get(GENE_SUMMARY_URL.replace(":locus", geneSymbol)),
        api.get(GENE_FUNCTION_URL.replace(":locus", geneSymbol)),
        api.get(GENE_URL.replace(":locus", geneSymbol)),
      ])
        .then(([response1, response2, response3]) => {
          this.geneSummaryData = response1.data;
          this.geneFunctionData = response2.data;
          this.geneData = response3.data;
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch gene data. Please try again later."
          );
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
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
    <div v-if="geneData && geneSummaryData">
      <h2 v-if="geneData.gene_symbol">{{ geneData.gene_symbol }}</h2>
      <h2 v-else class="text-muted">Not Available</h2>
      <h4 class="py-3">Synonyms</h4>
      <div class="row">
        <p v-if="geneData.synonyms?.length > 0">
          {{ geneData.synonyms.join(", ") }}
        </p>
        <p v-else class="text-muted">Not Available</p>
      </div>
      <h4 class="py-3">Function</h4>
      <div class="row">
        <GeneFunction
          v-if="geneFunctionData?.function?.protein_function"
          :geneFunctionText="geneFunctionData.function.protein_function"
          :uniprotAccession="geneFunctionData.function.uniprot_accession"
        />
        <p v-else class="text-muted mb-0">Not Available</p>
      </div>
      <h4 class="py-3">G2P records</h4>
      <div class="table-responsive-xl">
        <table
          class="table table-hover table-bordered shadow-sm"
          v-if="geneSummaryData.records_summary?.length > 0"
        >
          <thead>
            <tr>
              <th>G2P ID <ToolTip :toolTipText="HELP_TEXT.G2P_ID" /></th>
              <th>Disease</th>
              <th>
                Allelic Requirement
                <ToolTip :toolTipText="HELP_TEXT.ALLELIC_REQUIREMENT" />
              </th>
              <th>
                Variant Consequence
                <ToolTip :toolTipText="HELP_TEXT.VARIANT_CONSEQUENCE" />
              </th>
              <th>
                Variant Type <ToolTip :toolTipText="HELP_TEXT.VARIANT_TYPE" />
              </th>
              <th>Mechanism <ToolTip :toolTipText="HELP_TEXT.MECHANISM" /></th>
              <th>
                Confidence <ToolTip :toolTipText="HELP_TEXT.CONFIDENCE" />
              </th>
              <th>Panels</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in geneSummaryData.records_summary"
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
                  :to="`/disease/${item.disease}`"
                  v-if="item.disease"
                  style="text-decoration: none"
                >
                  {{ item.disease }}
                </router-link>
              </td>
              <td>{{ item.genotype }}</td>
              <td>{{ item.variant_consequence.join(", ") }}</td>
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
              <td>
                <span v-if="item.panels?.length > 0">
                  <span v-for="(panelName, index) in item.panels">
                    <span v-if="index < item.panels.length - 1">
                      <router-link
                        :to="`/panel/${panelName}`"
                        style="text-decoration: none"
                      >
                        {{ panelName }} </router-link
                      >,
                    </span>
                    <router-link
                      :to="`/panel/${panelName}`"
                      style="text-decoration: none"
                      v-else
                    >
                      {{ panelName }}
                    </router-link>
                  </span>
                </span>
              </td>
              <td>{{ item.last_updated }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-muted">
          No G2P disease models are currently available.
        </p>
      </div>
      <div
        v-if="
          geneSummaryData.records_summary?.length === 0 &&
          geneFunctionData.gene_stats
        "
      >
        <h4 class="py-3">Predictions of likely gene-disease mechanism</h4>
        <p>
          These values predict likely mechanism if changes in the gene can be
          disease-causing. See
          <a
            href="https://europepmc.org/article/MED/39172982"
            target="_blank"
            style="text-decoration: none"
            >Badonyi and Marsh, 2024</a
          >
        </p>
        <div class="row">
          <div class="col-12 col-md-6 col-lg-5 col-xl-4">
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <td style="width: 75%">
                    Gain of Function (pGOF)
                    <ToolTip :toolTipText="HELP_TEXT.GAIN_OF_FUNCTION" />
                  </td>
                  <td style="width: 25%">
                    <span
                      v-if="
                        geneFunctionData.gene_stats.gain_of_function_mp >
                        MARSH_PROBABILITY_THRESHOLD.GAIN_OF_FUNCTION
                      "
                      class="badge red-text-box"
                    >
                      {{ geneFunctionData.gene_stats.gain_of_function_mp }}
                    </span>
                    <span
                      v-else-if="
                        geneFunctionData.gene_stats.gain_of_function_mp <=
                        MARSH_PROBABILITY_THRESHOLD.GAIN_OF_FUNCTION
                      "
                      class="badge green-text-box"
                    >
                      {{ geneFunctionData.gene_stats.gain_of_function_mp }}
                    </span>
                    <span v-else class="text-muted">Not Available</span>
                  </td>
                </tr>
                <tr>
                  <td style="width: 75%">
                    Loss of Function (pLOF)
                    <ToolTip :toolTipText="HELP_TEXT.LOSS_OF_FUNCTION" />
                  </td>
                  <td style="width: 25%">
                    <span
                      v-if="
                        geneFunctionData.gene_stats.loss_of_function_mp >
                        MARSH_PROBABILITY_THRESHOLD.LOSS_OF_FUNCTION
                      "
                      class="badge red-text-box"
                    >
                      {{ geneFunctionData.gene_stats.loss_of_function_mp }}
                    </span>
                    <span
                      v-else-if="
                        geneFunctionData.gene_stats.loss_of_function_mp <=
                        MARSH_PROBABILITY_THRESHOLD.LOSS_OF_FUNCTION
                      "
                      class="badge green-text-box"
                    >
                      {{ geneFunctionData.gene_stats.loss_of_function_mp }}
                    </span>
                    <span v-else class="text-muted">Not Available</span>
                  </td>
                </tr>
                <tr>
                  <td style="width: 75%">
                    Dominant Negative (pDN)
                    <ToolTip :toolTipText="HELP_TEXT.DOMINANT_NEGATIVE" />
                  </td>
                  <td style="width: 25%">
                    <span
                      v-if="
                        geneFunctionData.gene_stats.dominant_negative_mp >
                        MARSH_PROBABILITY_THRESHOLD.DOMINANT_NEGATIVE
                      "
                      class="badge red-text-box"
                    >
                      {{ geneFunctionData.gene_stats.dominant_negative_mp }}
                    </span>
                    <span
                      v-else-if="
                        geneFunctionData.gene_stats.dominant_negative_mp <=
                        MARSH_PROBABILITY_THRESHOLD.DOMINANT_NEGATIVE
                      "
                      class="badge green-text-box"
                    >
                      {{ geneFunctionData.gene_stats.dominant_negative_mp }}
                    </span>
                    <span v-else class="text-muted">Not Available</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <h4 class="py-3">gnomAD constraint metrics</h4>
        <p>
          These values predict the likelihood that the gene is tolerant to
          change. See
          <a
            href="https://gnomad.broadinstitute.org/downloads#v4-constraint"
            target="_blank"
            style="text-decoration: none"
            >here</a
          >
          for more information.
        </p>
        <div class="row">
          <div class="col-12 col-md-6 col-lg-5 col-xl-4">
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <td style="width: 75%">
                    pLI (probability of being loss-of-function intolerant)
                  </td>
                  <td style="width: 25%">
                    <span
                      v-if="
                        geneFunctionData.gene_stats.pli_gnomAD != null &&
                        geneFunctionData.gene_stats.pli_gnomAD !== ''
                      "
                    >
                      {{ geneFunctionData.gene_stats.pli_gnomAD }}
                    </span>
                    <span v-else class="text-muted">Not Available</span>
                  </td>
                </tr>
                <tr>
                  <td style="width: 75%">
                    LOEUF (loss-of-function observed/expected upper bound
                    fraction)
                  </td>
                  <td style="width: 25%">
                    <span
                      v-if="
                        geneFunctionData.gene_stats.loeuf_gnomAD != null &&
                        geneFunctionData.gene_stats.loeuf_gnomAD !== ''
                      "
                    >
                      {{ geneFunctionData.gene_stats.loeuf_gnomAD }}
                    </span>
                    <span v-else class="text-muted">Not Available</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <h4 class="py-3">External Links</h4>
      <div class="row mx-3 pb-3">
        <ul>
          <li v-if="geneData.gene_symbol">
            <a
              :href="DECIPHER_URL + geneData.gene_symbol"
              style="text-decoration: none"
              target="_blank"
            >
              View this gene or submit patient variants via DECIPHER
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
          <li v-if="geneData.ids?.OMIM">
            <a
              :href="OMIM_URL + geneData.ids.OMIM"
              style="text-decoration: none"
              target="_blank"
            >
              OMIM
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
          <li v-if="geneData.ids?.Ensembl">
            <a
              :href="ENSEMBL_GENE_URL + geneData.ids.Ensembl"
              style="text-decoration: none"
              target="_blank"
            >
              Ensembl
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
          <li v-if="geneData.ids?.HGNC">
            <a
              :href="HGNC_URL + geneData.ids.HGNC"
              style="text-decoration: none"
              target="_blank"
            >
              HGNC
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
          <li v-if="geneFunctionData?.function?.uniprot_accession">
            <a
              :href="UNIPROT_URL + geneFunctionData.function.uniprot_accession"
              style="text-decoration: none"
              target="_blank"
            >
              UniProt
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
          <li v-if="geneData.gene_symbol">
            <a
              :href="PANELAPP_URL + geneData.gene_symbol"
              style="text-decoration: none"
              target="_blank"
            >
              PanelApp
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
          <li v-if="geneData.ids?.HGNC">
            <a
              :href="GENCC_URL + geneData.ids.HGNC"
              style="text-decoration: none"
              target="_blank"
            >
              GenCC
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
          <li v-if="geneData.ids?.HGNC">
            <a
              :href="CLINGEN_URL + geneData.ids.HGNC"
              style="text-decoration: none"
              target="_blank"
            >
              ClinGen
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
        </ul>
      </div>
      <p>
        <strong>Last Updated: </strong>
        <span v-if="geneData.last_updated">
          {{ geneData.last_updated }}
        </span>
        <span v-else class="text-muted">Not Available</span>
      </p>
    </div>
  </div>
</template>
<style scoped>
th {
  white-space: nowrap;
}
.red-text-box {
  color: white;
  background-color: rgb(255, 21, 0);
}
.green-text-box {
  color: black;
  background-color: rgb(0, 243, 148);
}
</style>
