<script>
export default {
  data() {
    return {
      isDataLoading: false,
      diseaseSummaryData: null,
      diseaseData: null,
      errorMsg: null,
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
      { immediate: true }
    );
  },
  //adding methods
  methods: {
    fetchData() {
      this.errorMsg = this.diseaseSummaryData = this.diseaseData = null; // initializing all the values to null
      this.isDataLoading = true;
      const diseaseID = this.$route.params.id;
      Promise.all([
        fetch(`/gene2phenotype/api/disease/${diseaseID}/summary`),
        fetch(`/gene2phenotype/api/disease/${diseaseID}`),
      ])
        .then((responseArr) => {
          return Promise.all(
            responseArr.map((response) => {
              if (response.status === 200) {
                return response.json();
              } else {
                return Promise.reject(
                  new Error(
                    `Unable to fetch Disease information for ${diseaseID}`
                  )
                );
              }
            })
          );
        })
        .then((responseJsonArr) => {
          const [diseaseSummaryData, diseaseData] = responseJsonArr;
          this.isDataLoading = false;
          this.diseaseData = diseaseData;
          this.diseaseSummaryData = diseaseSummaryData;
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
      <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
    </div>
    <!-- v.if is a directive to check the if the value is true or False -->
    <div v-if="diseaseData && diseaseSummaryData">
      <h2 v-if="diseaseData.name">{{ diseaseData.name }}</h2>
      <h2 v-else class="text-muted">Not Available</h2>
      <div class="pt-3">
        <p v-for="item in diseaseData.ontology_terms">
          {{ item.description }}
        </p>
      </div>
      <!-- v.else is a directive to do if v-if is  not True -->
      <p v-if="diseaseData.mim" class="pt-3">
        <strong>OMIM: </strong>
        <a
          :href="`https://omim.org/entry/${diseaseData.mim}`"
          target="_blank"
          style="text-decoration: none"
        >
          {{ diseaseData.mim }}
        </a>
      </p>
      <h4 class="py-3">Latest Records</h4>
      <div class="table-responsive-xl">
        <table
          class="table table-hover table-bordered"
          v-if="
            diseaseSummaryData.records_summary &&
            diseaseSummaryData.records_summary.length > 0
          "
        >
          <thead>
            <tr>
              <th>G2P ID</th>
              <th>Genotype</th>
              <th>Variant Consequence</th>
              <th>Variant Type</th>
              <th>Mechanism</th>
              <th>Panels</th>
            </tr>
          </thead>
          <tbody>
            <tr
              style="
                max-width: 150px;
                overflow: hidden;
                text-overflow: ellipsis;
              "
              v-for="item in diseaseSummaryData.records_summary"
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
              <td
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                {{ item.genotype }}
              </td>
              <td
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
                v-if="Array.isArray(item.variant_consequence)"
              >
                {{ item.variant_consequence.join(",") }}
              </td>
              <td
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
                v-else
              >
                {{ item.variant_consequence }}
              </td>
              <td
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
                v-if="Array.isArray(item.variant_type)"
              >
                {{ item.variant_type.join(",") }}
              </td>
              <td
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
                v-else
              >
                {{ item.variant_type }}
              </td>
              <td
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
                v-if="Array.isArray(item.molecular_mehanism)"
              >
                {{ item.molecular_mehanism.join(",") }}
              </td>
              <td
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
                v-else
              >
                {{ item.molecular_mehanism }}
              </td>
              <td
                style="
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                <span
                  v-if="item.panels && item.panels.length > 0"
                  v-for="(panelName, index) in item.panels"
                >
                  <router-link
                    :to="`/panel/${panelName}`"
                    style="text-decoration: none"
                  >
                    {{ panelName }} </router-link
                  ><span v-if="index < item.panels.length - 1">, </span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>No Records found</p>
      </div>
      <h4
        v-if="
          diseaseData.ontology_terms && diseaseData.ontology_terms.length > 0
        "
        class="py-3"
      >
        Cross references
      </h4>
      <table
        class="table table-bordered w-50"
        v-if="
          diseaseData.ontology_terms && diseaseData.ontology_terms.length > 0
        "
        width="50%"
      >
        <thead>
          <tr>
            <th>Accession</th>
            <th>Term</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in diseaseData.ontology_terms">
            <td>
              <a
                v-bind:href="`https://www.omim.org/entry/${item.accession}`"
                v-if="item.source === 'OMIM'"
                target="_blank"
                style="text-decoration: none"
              >
                {{ item.accession }}
              </a>
              <a
                v-bind:href="`https://monarchinitiative.org/${item.accession}`"
                v-else-if="item.source === 'Mondo'"
                target="_blank"
                style="text-decoration: none"
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
      <h4
        v-if="diseaseData.publications && diseaseData.publications.length > 0"
        class="py-3"
      >
        Publications
      </h4>
      <ul
        v-for="item in diseaseData.publications"
        v-if="diseaseData.publications && diseaseData.publications.length > 0"
      >
        <li>
          <a
            :href="`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}`"
            target="_blank"
          >
            {{ item.title }}
          </a>
        </li>
      </ul>
      <p>
        <strong>Last Update: </strong>
        <span v-if="diseaseData.last_updated && diseaseData.last_updated != ''">
          {{ diseaseData.last_updated }}
        </span>
        <span v-else class="text-muted">Not Available</span>
      </p>
    </div>
  </div>
</template>
