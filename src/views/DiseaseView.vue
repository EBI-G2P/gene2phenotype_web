<script>
import {
  DISEASE_SUMMARY_URL,
  DISEASE_URL,
  MONDO_URL,
  OMIM_URL,
} from "../utility/UrlConstants.js";
import { HELP_TEXT } from "../utility/Constants.js";
import ToolTip from "../components/tooltip/ToolTip.vue";
import api from "../services/api.js";
import { fetchAndLogApiResponseErrorMsg } from "../utility/ErrorUtility.js";
import PanelLinks from "../components/panel/PanelLinks.vue";
import ConfidenceBadge from "../components/confidence/ConfidenceBadge.vue";
export default {
  data() {
    return {
      isDataLoading: false,
      diseaseSummaryData: null,
      diseaseData: null,
      errorMsg: null,
      HELP_TEXT,
      OMIM_URL,
      MONDO_URL,
    };
  },
  created() {
    //watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchData();
      },
      // fetch this data when the view is created and the data is already being observed
      { immediate: true },
    );
  },
  components: { ToolTip, PanelLinks, ConfidenceBadge },
  methods: {
    fetchData() {
      this.errorMsg = this.diseaseSummaryData = this.diseaseData = null;
      this.isDataLoading = true;
      const diseaseName = this.$route.params.name;
      Promise.all([
        api.get(DISEASE_SUMMARY_URL.replace(":diseasename", diseaseName)),
        api.get(DISEASE_URL.replace(":diseasename", diseaseName)),
      ])
        .then(([response1, response2]) => {
          this.diseaseSummaryData = response1.data;
          this.diseaseData = response2.data;
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch disease data. Please try again later.",
            "Unable to fetch disease data.",
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
    <div v-if="diseaseData && diseaseSummaryData">
      <h2 v-if="diseaseData.name">{{ diseaseData.name }}</h2>
      <h2 v-else class="text-muted">Not Available</h2>
      <h4 class="py-3">Previous G2P names</h4>
      <div>
        <ul v-if="diseaseData.synonyms?.length > 0">
          <li
            v-for="(item, index) in diseaseData.synonyms"
            :key="`${item}-${index}`"
          >
            {{ item }}
          </li>
        </ul>
        <p v-else class="text-muted">Not Available</p>
      </div>
      <h4 class="py-3">G2P records</h4>
      <div class="table-responsive-xl">
        <table
          v-if="diseaseSummaryData.records_summary?.length > 0"
          class="table table-hover table-bordered shadow-sm"
        >
          <thead>
            <tr>
              <th scope="col">
                G2P ID <ToolTip :toolTipText="HELP_TEXT.G2P_ID" />
              </th>
              <th scope="col">Gene</th>
              <th scope="col">
                Allelic Requirement
                <ToolTip :toolTipText="HELP_TEXT.ALLELIC_REQUIREMENT" />
              </th>
              <th scope="col">
                Variant Consequence
                <ToolTip :toolTipText="HELP_TEXT.VARIANT_CONSEQUENCE" />
              </th>
              <th scope="col">
                Variant Type <ToolTip :toolTipText="HELP_TEXT.VARIANT_TYPE" />
              </th>
              <th scope="col">
                Mechanism <ToolTip :toolTipText="HELP_TEXT.MECHANISM" />
              </th>
              <th scope="col">
                Confidence <ToolTip :toolTipText="HELP_TEXT.CONFIDENCE" />
              </th>
              <th scope="col">Panels</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in diseaseSummaryData.records_summary"
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
                {{ item.genotype }}
              </td>
              <td>
                {{
                  Array.isArray(item.variant_consequence)
                    ? item.variant_consequence.join(", ")
                    : item.variant_consequence
                }}
              </td>
              <td>
                {{
                  Array.isArray(item.variant_type)
                    ? item.variant_type.join(", ")
                    : item.variant_type
                }}
              </td>
              <td>
                {{ item.molecular_mechanism }}
              </td>
              <td>
                <ConfidenceBadge :confidence="item.confidence" />
              </td>
              <td>
                <PanelLinks :panels="item.panels" />
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>No Records found</p>
      </div>
      <h4 v-if="diseaseData.ontology_terms?.length > 0" class="py-3">
        Cross references <ToolTip :toolTipText="HELP_TEXT.CROSS_REFERENCES" />
      </h4>
      <div v-if="diseaseData.ontology_terms?.length > 0" class="row">
        <div class="col-12 col-md-6">
          <div class="table-responsive">
            <table class="table table-bordered table-hover shadow-sm">
              <thead>
                <tr>
                  <th scope="col">Accession</th>
                  <th scope="col">Term</th>
                  <th scope="col">Source</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in diseaseData.ontology_terms"
                  :key="`${item.source}-${item.accession}-${index}`"
                >
                  <td>
                    <a
                      v-if="item.source === 'OMIM'"
                      :href="OMIM_URL + item.accession"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-decoration-none"
                    >
                      {{ item.accession }}
                    </a>
                    <a
                      v-else-if="item.source === 'Mondo'"
                      :href="MONDO_URL + item.accession"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-decoration-none"
                    >
                      {{ item.accession }}
                    </a>
                    <span v-else>{{ item.accession }}</span>
                  </td>
                  <td>{{ item.term }}</td>
                  <td>{{ item.source }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p>
        <strong>Last Updated: </strong>
        <span v-if="diseaseData.last_updated">
          {{ diseaseData.last_updated }}
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
</style>
