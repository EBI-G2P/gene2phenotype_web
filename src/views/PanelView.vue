<script>
import BarChart from "../components/chart/BarChart.vue";
export default {
  data() {
    return {
      isDataLoading: false,
      panelData: null,
      panelSummaryData: null,
      errorMsg: null,
      confidenceColorMap: {
        definitive: "green",
        strong: "green",
        moderate: "green",
        limited: "red",
      },
      chartData: {},
      chartOptions: {
        responsive: true,
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
        fetch(`/gene2phenotype/api/panel/${this.$route.params.panel}/`),
        fetch(`/gene2phenotype/api/panel/${this.$route.params.panel}/summary/`),
      ])
        .then((responseArr) => {
          return Promise.all(
            responseArr.map((response) => {
              if (response.status === 200) {
                return response.json();
              } else {
                return Promise.reject(new Error("Unable to fetch panel data"));
              }
            })
          );
        })
        .then((responseJsonArr) => {
          const [panelData, panelSummaryData] = responseJsonArr;
          this.isDataLoading = false;
          this.panelData = panelData;
          this.panelSummaryData = panelSummaryData;
          this.chartData = {
            labels: ["Definitive", "Strong", "Moderate", "Limited"],
            datasets: [
              {
                label: "Panel Records",
                data: [
                  panelData?.stats?.by_confidence?.definitive,
                  panelData?.stats?.by_confidence?.strong,
                  panelData?.stats?.by_confidence?.moderate,
                  panelData?.stats?.by_confidence?.limited,
                ],
                backgroundColor: [
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(255, 99, 132, 0.2)",
                ],
                borderColor: [
                  "rgb(75, 192, 192)",
                  "rgb(75, 192, 192)",
                  "rgb(75, 192, 192)",
                  "rgb(255, 99, 132)",
                ],
                borderWidth: 1,
              },
            ],
          };
        })
        .catch((error) => {
          this.isDataLoading = false;
          this.errorMsg = error.message;
          console.log(error);
        });
    },
  },
  components: { BarChart },
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
    <div v-if="panelData && panelSummaryData">
      <h2 v-if="panelData.name || panelData.description">
        {{ panelData.description }} panel ({{ panelData.name }})
      </h2>
      <h2 v-else>Not Available</h2>
      <div class="row pt-3">
        <div class="col">
          <div class="card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Total Records</h6>
              <h4 class="card-title" v-if="panelData.stats?.total_records">
                {{ panelData.stats.total_records.toLocaleString() }}
              </h4>
              <h4 class="card-title" v-else style="color: grey">
                Not Available
              </h4>
            </div>
          </div>
        </div>
        <div class="col">
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
        <div class="col">
          <div class="card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Total Diseases</h6>
              <h4 class="card-title" v-if="panelData.stats?.total_diseases">
                {{ panelData.stats.total_diseases.toLocaleString() }}
              </h4>
              <h4 class="card-title" v-else style="color: grey">
                Not Available
              </h4>
            </div>
          </div>
        </div>
      </div>
      <h4 class="py-3">Records Per Confidence Class</h4>
      <div>
        <BarChart
          :chartData="chartData"
          :chartOptions="chartOptions"
          v-if="panelData.stats.by_confidence"
          class="w-50 mx-auto"
        />
      </div>
      <h4 class="py-3">Latest Records</h4>
      <div>
        <table
          class="table table-hover table-bordered"
          v-if="
            panelSummaryData.records_summary &&
            panelSummaryData.records_summary.length > 0
          "
        >
          <thead>
            <tr>
              <th style="width: 8%">Gene</th>
              <th style="width: 10%">Disease</th>
              <th style="width: 10%">Allelic Requirement</th>
              <th style="width: 10%">Variant Consequence</th>
              <th style="width: 10%">Variant Type</th>
              <th style="width: 12%">Mechanism</th>
              <th style="width: 12%">
                Confidence
                <a href="#"><i class="bi bi-question-circle-fill"></i></a>
              </th>
              <th style="width: 10%">Stable ID</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in panelSummaryData.records_summary">
              <td>{{ item.locus }}</td>
              <td>{{ item.disease }}</td>
              <td>{{ item.genotype }}</td>
              <td>
                {{ item.variant_consequence.join(", ") }}
              </td>
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
        <p v-else style="color: grey">Not Available</p>
      </div>
      <h4 class="py-3">Curators</h4>
      <div class="row mx-3">
        <ul v-if="panelData.curators && panelData.curators.length > 0">
          <li v-for="curator in panelData.curators">
            {{ curator }}
          </li>
        </ul>
        <p v-else style="color: grey">Not Available</p>
      </div>
      <p>
        <strong>Last Update: </strong>
        <span v-if="panelData.last_updated">
          {{ panelData.last_updated }}
        </span>
        <span v-else style="color: grey">Not Available</span>
      </p>
    </div>
  </div>
</template>
