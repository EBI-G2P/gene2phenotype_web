<script>
import api from "../../services/api.js";
import { UPDATE_DISEASE_NAME_URL } from "../../utility/UrlConstants.js";
import { fetchAndLogApiResponseErrorListObjectMsg } from "../../utility/ErrorUtility.js";
import { useAuthStore } from "../../store/auth.js";
import { mapState } from "pinia";

export default {
  props: {
    diseaseId: Number,
    currentDiseaseName: String,
  },
  data() {
    return {
      diseaseName: this.currentDiseaseName,
      inputDiseaseName: this.currentDiseaseName,
      isUpdating: false,
      isUpdateApiCallLoading: false,
      updateDiseaseNameErrorMsg: null,
      isUpdateDiseaseNameSuccess: false,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["isSuperUser"]),
  },
  methods: {
    updateDiseaseName() {
      this.updateDiseaseNameErrorMsg = null;
      this.isUpdateDiseaseNameSuccess = false;
      this.isUpdateApiCallLoading = true;
      const requestBody = [
        {
          id: this.diseaseId,
          name: this.inputDiseaseName,
          add_synonym: true,
        },
      ];
      api
        .post(UPDATE_DISEASE_NAME_URL, requestBody)
        .then(() => {
          this.isUpdateDiseaseNameSuccess = true;
          this.isUpdating = false;
          this.diseaseName = this.inputDiseaseName;
        })
        .catch((error) => {
          this.updateDiseaseNameErrorMsg =
            fetchAndLogApiResponseErrorListObjectMsg(
              error,
              "Unable to update disease name. Please try again later.",
              "Unable to update disease name."
            );
        })
        .finally(() => {
          this.isUpdateApiCallLoading = false;
        });
    },
    cancelClickHandler() {
      this.isUpdating = false;
      this.inputDiseaseName = this.diseaseName;
      this.updateDiseaseNameErrorMsg = null;
      this.isUpdateDiseaseNameSuccess = false;
    },
    updateNameClickHandler() {
      this.isUpdating = true;
      this.updateDiseaseNameErrorMsg = null;
      this.isUpdateDiseaseNameSuccess = false;
    },
  },
};
</script>
<template>
  <h5>Disease Name</h5>
  <div
    v-if="isUpdateApiCallLoading"
    class="d-flex justify-content-center"
    style="margin-top: 15px; margin-bottom: 15px"
  >
    <div class="spinner-border text-secondary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div v-else class="mt-0 pt-0">
    <div v-if="isUpdating" class="input-group">
      <input
        id="disease-name-input"
        class="form-control"
        v-model.trim="inputDiseaseName"
      />
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="cancelClickHandler"
      >
        Cancel
      </button>
      <button type="button" class="btn btn-primary" @click="updateDiseaseName">
        Update
      </button>
    </div>
    <div v-else class="d-flex justify-content-between align-items-center">
      <span>
        <a
          v-if="diseaseName"
          :href="`/gene2phenotype/disease/${diseaseName}`"
          style="text-decoration: none"
          target="_blank"
          class="pt-0 mt-0"
        >
          {{ diseaseName }}
        </a>
        <p v-else class="text-muted pt-0 mt-0">Not Available</p>
      </span>
      <button
        v-if="isSuperUser"
        type="button"
        class="btn btn-outline-primary"
        @click="updateNameClickHandler"
      >
        <i class="bi bi-pencil-square"></i> Update name
      </button>
    </div>
  </div>
  <div
    v-if="updateDiseaseNameErrorMsg"
    class="alert alert-danger mb-0"
    role="alert"
  >
    <div>
      <i class="bi bi-exclamation-circle-fill"></i>
      {{ updateDiseaseNameErrorMsg }}
    </div>
  </div>
  <div
    v-if="isUpdateDiseaseNameSuccess"
    class="alert alert-success mb-0"
    role="alert"
  >
    <div>
      <i class="bi bi-check-circle-fill"></i>
      Disease name successfully updated.
    </div>
  </div>
</template>
