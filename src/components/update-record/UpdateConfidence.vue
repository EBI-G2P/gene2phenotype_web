<script>
import api from "../../services/api.js";
import { ConfidenceAttribsOrder } from "../../utility/CurationConstants.js";
import { UPDATE_CONFIDENCE_URL } from "../../utility/UrlConstants.js";
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";

export default {
  props: {
    stableId: String,
    attributesData: Object,
    currentConfidence: String,
  },
  data() {
    return {
      confidence: this.currentConfidence,
      isUpdateApiCallLoading: false,
      updateConfidenceErrorMsg: null,
      isUpdateConfidenceSuccess: false,
      updateConfidenceSuccessMsg: null,
      sortedConfidenceCategoryList:
        this.attributesData?.confidence_category?.sort(
          (a, b) =>
            ConfidenceAttribsOrder.indexOf(a) -
            ConfidenceAttribsOrder.indexOf(b)
        ) || [],
    };
  },
  methods: {
    updateConfidence() {
      this.updateConfidenceErrorMsg = this.updateConfidenceSuccessMsg = null;
      this.isUpdateConfidenceSuccess = false;
      this.isUpdateApiCallLoading = true;
      const requestBody = {
        confidence: this.confidence,
      };
      api
        .put(
          UPDATE_CONFIDENCE_URL.replace(":stableid", this.stableId),
          requestBody
        )
        .then((response) => {
          this.isUpdateConfidenceSuccess = true;
          this.updateConfidenceSuccessMsg = response.data.message;
        })
        .catch((error) => {
          this.updateConfidenceErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to update confidence. Please try again later.",
            "Unable to update confidence."
          );
        })
        .finally(() => {
          this.isUpdateApiCallLoading = false;
        });
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="update-confidence-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#update-confidence-section-body"
          aria-expanded="false"
          aria-controls="update-confidence-section-body"
        >
          Confidence
          <span
            class="badge rounded-pill text-bg-success mx-2"
            v-if="isUpdateConfidenceSuccess"
          >
            <i class="bi bi-check-circle-fill"></i> Updated
          </span>
        </button>
      </h2>
      <div
        id="update-confidence-section-body"
        class="accordion-collapse collapse"
      >
        <div class="accordion-body">
          <div class="row g-3 p-2">
            <h5>Confidence</h5>
            <div
              class="d-flex justify-content-center"
              v-if="isUpdateApiCallLoading"
              style="margin-top: 122px; margin-bottom: 122px"
            >
              <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else>
              <div class="row pb-4 w-50">
                <label
                  for="update-confidence-level-input"
                  class="col-lg-2 col-form-label"
                >
                  Level<span class="text-danger">*</span>
                </label>
                <div class="col-lg-7">
                  <select
                    id="update-confidence-level-input"
                    class="form-select"
                    v-model="confidence"
                  >
                    <option
                      v-for="item in sortedConfidenceCategoryList"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-primary"
                @click="updateConfidence"
              >
                <i class="bi bi-pencil-square"></i> Update confidence
              </button>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-if="updateConfidenceErrorMsg"
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ updateConfidenceErrorMsg }}
              </div>
            </div>
            <div
              class="alert alert-success mt-3"
              role="alert"
              v-if="isUpdateConfidenceSuccess"
            >
              <div>
                <i class="bi bi-check-circle-fill"></i>
                {{ updateConfidenceSuccessMsg }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
