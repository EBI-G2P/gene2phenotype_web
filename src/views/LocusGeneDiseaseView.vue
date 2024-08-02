<script>
export default {
  data() {
    return {
      isDataLoading: false,
      locusGeneDiseaseData: null,
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
      this.errorMsg = this.locusGeneDiseaseData = null;
      this.isDataLoading = true;
      fetch(`/gene2phenotype/api/lgd/${this.$route.params.stableId}/`)
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            return Promise.reject(
              new Error("Unable to fetch locus gene disease data")
            );
          }
        })
        .then((responseJson) => {
          this.isDataLoading = false;
          this.locusGeneDiseaseData = responseJson;
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
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ errorMsg }}
      </div>
    </div>
    <div v-if="locusGeneDiseaseData">
      <h2 v-if="locusGeneDiseaseData.disease?.name">
        {{ locusGeneDiseaseData.disease.name }}
      </h2>
      <h2 v-else class="text-muted">Disease Name Not Available</h2>
      <table class="table table-borderless my-3">
        <tbody>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Allelic Requirement</h4>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.genotype">
                {{ locusGeneDiseaseData.genotype }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Cross Cutting Modifier</h4>
            </td>
            <td class="w-75">
              <p
                v-if="
                  locusGeneDiseaseData.cross_cutting_modifier &&
                  locusGeneDiseaseData.cross_cutting_modifier.length > 0
                "
              >
                {{
                  locusGeneDiseaseData.cross_cutting_modifier
                    .map((item) => item.term)
                    .join(", ")
                }}
              </p>
              <p v-else class="text-muted">Not Assigned</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Variant Information</h4>
            </td>
            <td></td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>Variant Types</h6>
            </td>
            <td class="w-75">
              <table
                class="table table-bordered"
                v-if="
                  locusGeneDiseaseData.variant_type &&
                  locusGeneDiseaseData.variant_type.length > 0
                "
              >
                <thead>
                  <tr>
                    <th style="width: 20%">Accesssion</th>
                    <th style="width: 80%">Term</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in locusGeneDiseaseData.variant_type">
                    <td style="width: 20%">
                      <a
                        v-bind:href="`http://www.sequenceontology.org/browser/current_release/term/${item.accession}`"
                        style="text-decoration: none"
                        v-if="item.accession"
                        target="_blank"
                      >
                        {{ item.accession }}
                      </a>
                    </td>
                    <td style="width: 80%">
                      {{ item.term }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>Variant Consequences</h6>
            </td>
            <td class="w-75">
              <table
                class="table table-bordered"
                v-if="
                  locusGeneDiseaseData.variant_consequence &&
                  locusGeneDiseaseData.variant_consequence.length > 0
                "
              >
                <thead>
                  <tr>
                    <th style="width: 20%">Variant Consequence</th>
                    <th style="width: 10%">Support</th>
                    <th style="width: 20%">Publication</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in locusGeneDiseaseData.variant_consequence">
                    <td style="width: 20%">
                      {{ item.variant_consequence }}
                    </td>
                    <td style="width: 10%">
                      {{ item.support }}
                    </td>
                    <td style="width: 20%">
                      {{ item.publication }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h4>Mechanism</h4>
            </td>
            <td class="w-75">
              <table
                class="table table-bordered"
                v-if="
                  locusGeneDiseaseData.molecular_mechanism &&
                  locusGeneDiseaseData.molecular_mechanism.length > 0
                "
              >
                <thead>
                  <tr>
                    <th style="width: 20%">Mechanism</th>
                    <th style="width: 10%">Support</th>
                    <th style="width: 20%">Publication</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in locusGeneDiseaseData.molecular_mechanism">
                    <td style="width: 20%">
                      {{ item.mechanism }}
                    </td>
                    <td style="width: 10%">
                      {{ item.support }}
                    </td>
                    <td style="width: 20%">
                      {{ item.publication }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h4>Phenotypic Features</h4>
            </td>
            <td class="w-75">
              <button
                class="btn btn-primary"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapsiblePhenotypicFeaturesTable"
                aria-expanded="false"
                aria-controls="collapsiblePhenotypicFeaturesTable"
              >
                View Phenotypic Features
              </button>
              <div class="collapse" id="collapsiblePhenotypicFeaturesTable">
                <table
                  class="table table-bordered mt-2"
                  v-if="
                    locusGeneDiseaseData.phenotypes &&
                    locusGeneDiseaseData.phenotypes.length > 0
                  "
                >
                  <thead>
                    <tr>
                      <th style="width: 20%">Accession</th>
                      <th style="width: 80%">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in locusGeneDiseaseData.phenotypes"
                      :key="item.accession"
                    >
                      <td style="width: 20%">
                        <a
                          :href="`https://hpo.jax.org/app/browse/term/${item.accession}`"
                          style="text-decoration: none"
                          v-if="item.accession"
                          target="_blank"
                        >
                          {{ item.accession }}
                        </a>
                      </td>
                      <td style="width: 80%">
                        {{ item.name }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-muted">Not Available</p>
              </div>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>
                Confidence
                <a href="#"><i class="bi bi-question-circle-fill"></i></a>
              </h4>
            </td>
            <td class="w-75">
              <p
                :style="{
                  color:
                    confidenceColorMap[
                      locusGeneDiseaseData.confidence.toLowerCase()
                    ],
                  fontWeight: 'bold',
                }"
                v-if="locusGeneDiseaseData.confidence"
              >
                {{ locusGeneDiseaseData.confidence.toUpperCase() }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h4>Evidence</h4>
            </td>
            <td></td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>Publications</h6>
            </td>
            <td class="w-75">
              <button
                class="btn btn-primary"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapsiblePublicationsTable"
                aria-expanded="false"
                aria-controls="collapsiblePublicationsTable"
              >
                View publications
              </button>
              <div class="collapse" id="collapsiblePublicationsTable">
                <table
                  class="table table-bordered mt-2"
                  v-if="
                    locusGeneDiseaseData.publications &&
                    locusGeneDiseaseData.publications.length > 0
                  "
                >
                  <thead>
                    <tr>
                      <th style="width: 10%">PMID</th>
                      <th style="width: 80%">Title</th>
                      <th style="width: 10%">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in locusGeneDiseaseData.publications">
                      <td style="width: 10%">
                        <a
                          v-bind:href="`https://europepmc.org/article/MED/${item.publication.pmid}`"
                          style="text-decoration: none"
                          v-if="item.publication.pmid"
                          target="_blank"
                        >
                          {{ item.publication.pmid }}
                        </a>
                      </td>
                      <td style="width: 80%">
                        {{ item.publication.title }}
                      </td>
                      <td style="width: 10%">
                        {{ item.publication.year }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-muted">Not Available</p>
              </div>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Panels</h4>
            </td>
            <td class="w-75">
              <span
                v-if="
                  locusGeneDiseaseData.panels &&
                  locusGeneDiseaseData.panels.length > 0
                "
              >
                <span v-for="(item, index) in locusGeneDiseaseData.panels">
                  <span v-if="index < locusGeneDiseaseData.panels.length - 1">
                    <router-link
                      :to="`/panel/${item.name}`"
                      style="text-decoration: none"
                    >
                      {{ item.description ? item.description : item.name }}
                    </router-link>
                    ,
                  </span>
                  <router-link
                    :to="`/panel/${item.name}`"
                    v-else
                    style="text-decoration: none"
                  >
                    {{ item.description ? item.description : item.name }}
                  </router-link>
                </span>
              </span>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h4>Gene Information</h4>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Gene Symbol</h6>
            </td>
            <td>
              <router-link
                :to="`/gene/${locusGeneDiseaseData.locus.gene_symbol}`"
                v-if="locusGeneDiseaseData.locus.gene_symbol"
                style="text-decoration: none"
              >
                {{ locusGeneDiseaseData.locus.gene_symbol }}
              </router-link>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Synonyms</h6>
            </td>
            <td>
              <p
                v-if="
                  locusGeneDiseaseData.locus.synonyms &&
                  locusGeneDiseaseData.locus.synonyms.length > 0
                "
              >
                {{ locusGeneDiseaseData.locus.synonyms.join(", ") }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Location</h6>
            </td>
            <td>
              <a
                v-bind:href="`https://www.ensembl.org/Homo_sapiens/Location/View?r=${locusGeneDiseaseData.locus.sequence}:${locusGeneDiseaseData.locus.start}-${locusGeneDiseaseData.locus.end}`"
                style="text-decoration: none"
                target="_blank"
              >
                {{ locusGeneDiseaseData.locus.sequence }}:{{
                  locusGeneDiseaseData.locus.start
                }}-{{ locusGeneDiseaseData.locus.end }}:{{
                  locusGeneDiseaseData.locus.strand
                }}
              </a>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>OMIM</h6>
            </td>
            <td>
              <a
                v-bind:href="`https://www.omim.org/entry/${locusGeneDiseaseData.locus.ids.OMIM}`"
                style="text-decoration: none"
                v-if="locusGeneDiseaseData.locus.ids.OMIM"
                target="_blank"
              >
                {{ locusGeneDiseaseData.locus.ids.OMIM }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Ensembl ID</h6>
            </td>
            <td>
              <a
                v-bind:href="`https://www.ensembl.org/Homo_sapiens/Gene?g=${locusGeneDiseaseData.locus.ids.Ensembl}`"
                style="text-decoration: none"
                v-if="locusGeneDiseaseData.locus.ids.Ensembl"
                target="_blank"
              >
                {{ locusGeneDiseaseData.locus.ids.Ensembl }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>HGNC ID</h6>
            </td>
            <td>
              <a
                v-bind:href="`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${locusGeneDiseaseData.locus.ids.HGNC}`"
                style="text-decoration: none"
                v-if="locusGeneDiseaseData.locus.ids.HGNC"
                target="_blank"
              >
                {{ locusGeneDiseaseData.locus.ids.HGNC }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h4>Disease Information</h4>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Disease Name</h6>
            </td>
            <td>
              <router-link
                :to="`/disease/${locusGeneDiseaseData.disease.name}`"
                v-if="locusGeneDiseaseData.disease.name"
                style="text-decoration: none"
              >
                {{ locusGeneDiseaseData.disease.name }}
              </router-link>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>

          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>MONDO</h6>
            </td>
            <td>
              <a
                v-bind:href="`https://monarchinitiative.org/${locusGeneDiseaseData.disease.ontology_terms[0].accession}`"
                style="text-decoration: none"
                v-if="
                  locusGeneDiseaseData.disease.ontology_terms &&
                  locusGeneDiseaseData.disease.ontology_terms.length > 0
                "
                target="_blank"
              >
                {{ locusGeneDiseaseData.disease.ontology_terms[0].accession }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>OMIM</h6>
            </td>
            <td>
              <a
                v-bind:href="`https://www.omim.org/entry/${locusGeneDiseaseData.disease.mim}`"
                style="text-decoration: none"
                v-if="locusGeneDiseaseData.disease.mim"
                target="_blank"
              >
                {{ locusGeneDiseaseData.disease.mim }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h4>Curation Information</h4>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Curators</h6>
            </td>
            <td class="w-75">
              <p class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Created On</h6>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.date_created">
                {{ locusGeneDiseaseData.date_created }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Last Updated On</h6>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.last_updated">
                {{ locusGeneDiseaseData.last_updated }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped>
h6 {
  font-weight: bold;
}

h4,
h6,
p {
  margin-bottom: 0;
}
</style>
