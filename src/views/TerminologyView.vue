<script>
import {
  ATTRIBS_DESCRIPTION_URL,
  MECHANISMS_URL,
  VARIANT_TYPES_URL,
} from "../utility/UrlConstants.js";
import api from "../services/api.js";
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";
import TerminologyDisplay from "../components/terminology/TerminologyDisplay.vue";
export default {
  data() {
    return {
      isDataLoading: false,
      terminologyDescriptionData: null,
      molecularDescriptionData: null,
      variantDescriptionData: null,
      errorMsg: null,
    };
  },
  components: {
    TerminologyDisplay,
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.errorMsg =
        this.terminologyDescriptionData =
        this.molecularDescriptionData =
        this.variantDescriptionData =
          null;
      this.isDataLoading = true;
      Promise.all([
        api.get(ATTRIBS_DESCRIPTION_URL),
        api.get(MECHANISMS_URL),
        api.get(VARIANT_TYPES_URL),
      ])
        .then(([response1, response2, response3]) => {
          this.terminologyDescriptionData = response1.data;
          this.molecularDescriptionData = response2.data;
          this.variantDescriptionData = response3.data;
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch terminology data. Please try again later."
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
    <div class="alert alert-danger mt-3" role="alert" v-else-if="errorMsg">
      <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
    </div>
    <TerminologyDisplay
      v-else
      :terminologyDescriptionData="terminologyDescriptionData"
      :molecularDescriptionData="molecularDescriptionData"
      :variantDescriptionData="variantDescriptionData"
    />
  </div>
</template>
