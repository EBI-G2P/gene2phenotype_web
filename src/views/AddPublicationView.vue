<script>
import { LGD_RECORD_URL } from "../utility/UrlConstants.js";
import { appendAuthenticationHeaders } from "../utility/AuthenticationUtility.js";
import AddPublication from "../components/add-publication/AddPublication.vue";

export default {
  data() {
    return {
      isApiCallLoading: false,
      locusGeneDiseaseData: null,
      errorMsg: null,
      stableId: null,
    };
  },
  components: {
    AddPublication,
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchRecordData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  methods: {
    fetchRecordData() {
      this.stableId = this.$route.params.stableId;
      this.errorMsg = this.locusGeneDiseaseData = null;
      this.isApiCallLoading = true;
      const apiHeaders = appendAuthenticationHeaders({
        "Content-Type": "application/json",
      });
      fetch(LGD_RECORD_URL.replace(":stableid", this.stableId), {
        method: "GET",
        headers: apiHeaders,
      })
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
          this.isApiCallLoading = false;
          this.locusGeneDiseaseData = responseJson;
        })
        .catch((error) => {
          this.isApiCallLoading = false;
          this.errorMsg = error.message;
          console.log(error);
        });
    },
    goToRecordPage() {
      this.$router.push(`/lgd/${this.stableId}`);
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <div class="d-flex justify-content-between pb-2">
      <h2>Add Publication(s) to G2P Record</h2>
      <button class="btn btn-outline-primary" @click="goToRecordPage">
        Go to record page
      </button>
    </div>
    <div
      class="d-flex justify-content-center"
      v-if="isApiCallLoading"
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
      <h4 v-if="locusGeneDiseaseData.disease?.name" class="pb-2">
        {{ locusGeneDiseaseData.disease.name }}
      </h4>
      <h4 v-else class="text-muted pb-2">Disease Name Not Available</h4>
      <AddPublication
        :stableId="stableId"
        :locusGeneDiseaseData="locusGeneDiseaseData"
      />
    </div>
  </div>
</template>
