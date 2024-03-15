<script>
export default {
  data() {
    return {
      isDataLoading: false,
      geneSummaryData: null,
      geneData: null,
      errorMsg: null,
      confidenceColorMap: {
        definitive: "green",
        strong: "green",
        moderate: "green",
        limited: "red",
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
      this.errorMsg = this.geneSummaryData = this.geneData = null;
      this.isDataLoading = true;
      Promise.all([
        fetch(`/gene2phenotype/api/gene/${this.$route.params.symbol}/summary/`),
        fetch(`/gene2phenotype/api/gene/${this.$route.params.symbol}/`),
      ])
        .then((responseArr) => {
          return Promise.all(
            responseArr.map((response) => {
              if (response.status === 200) {
                return response.json();
              } else {
                return Promise.reject(new Error("Unable to fetch gene data"));
              }
            })
          );
        })
        .then((responseJsonArr) => {
          const [geneSummaryData, geneData] = responseJsonArr;
          this.isDataLoading = false;
          this.geneData = geneData;
          this.geneSummaryData = geneSummaryData;
        })
        .catch((error) => {
          this.isDataLoading = false;
          this.errorMsg = error.message;
          console.log(error);
        });
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3">
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
        <p v-if="geneData.synonyms && geneData.synonyms.length > 0">
          {{ geneData.synonyms.join(", ") }}
        </p>
        <p v-else class="text-muted">Not Available</p>
      </div>
      <h4 class="py-3">Latest Records</h4>
      <div>
        <table
          class="table table-hover table-bordered"
          v-if="
            geneSummaryData.records_summary &&
            geneSummaryData.records_summary.length > 0
          "
        >
          <thead>
            <tr>
              <th>Disease</th>
              <th>Genotype</th>
              <th>Variant Consequence</th>
              <th>Variant Type</th>
              <th>Mechanism</th>
              <th>
                Confidence
                <a href="#"><i class="bi bi-question-circle-fill"></i></a>
              </th>
              <th>Panels</th>
              <th>Stable ID</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in geneSummaryData.records_summary">
              <td>{{ item.disease }}</td>
              <td>{{ item.genotype }}</td>
              <td>{{ item.variant_consequence.join(", ") }}</td>
              <td>{{ item.variant_type.join(", ") }}</td>
              <td>{{ item.molecular_mechanism.join(", ") }}</td>
              <td>
                <span
                  :style="{
                    color: confidenceColorMap[item.confidence.toLowerCase()],
                  }"
                  v-if="item.confidence"
                >
                  {{ item.confidence }}
                </span>
              </td>
              <td>{{ item.panels.join(", ") }}</td>
              <td>
                <router-link
                  :to="`/lgd/${item.stable_id}`"
                  style="text-decoration: none"
                  v-if="item.stable_id"
                >
                  {{ item.stable_id }}
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-muted">Not Available</p>
      </div>
      <h4 class="py-3">Additional Links</h4>
      <div class="row mx-3 pb-3">
        <ul>
          <li v-if="geneData.gene_symbol">
            <a
              v-bind:href="`https://www.deciphergenomics.org/gene/${geneData.gene_symbol}`"
              style="text-decoration: none"
            >
              View this gene or submit patient variants via DECIPHER
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
          <li v-if="geneData.ids?.Ensembl">
            <a
              v-bind:href="`https://www.ensembl.org/Homo_sapiens/Gene?g=${geneData.ids.Ensembl}`"
              style="text-decoration: none"
            >
              View this gene on Ensembl website
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
          <li v-if="geneData.ids?.HGNC">
            <a
              v-bind:href="`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${geneData.ids.HGNC}`"
              style="text-decoration: none"
            >
              View this gene on HGNC website
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
        </ul>
      </div>
      <p>
        <strong>Last Update: </strong>
        <span v-if="geneData.last_updated">
          {{ geneData.last_updated }}
        </span>
        <span v-else class="text-muted">Not Available</span>
      </p>
    </div>
  </div>
</template>
