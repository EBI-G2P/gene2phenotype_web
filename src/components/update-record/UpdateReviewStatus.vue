<script>
import api from "../../services/api.js";
import { UPDATE_REVIEW_STATUS_URL } from "../../utility/UrlConstants.js";
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";

export default {
  props: {
    stableId: String,
    currentReviewStatus: Boolean,
  },
  data() {
    return {
      reviewStatus: this.currentReviewStatus,
      isUpdateApiCallLoading: false,
      updateReviewStatusErrorMsg: null,
      isUpdateReviewStatusSuccess: false,
      updateReviewStatusSuccessMsg: null,
    };
  },
  methods: {
    updateReviewStatus() {
      this.updateReviewStatusErrorMsg = this.updateReviewStatusSuccessMsg =
        null;
      this.isUpdateReviewStatusSuccess = false;
      this.isUpdateApiCallLoading = true;
      const requestBody = {
        is_reviewed: this.reviewStatus,
      };
      api
        .post(
          UPDATE_REVIEW_STATUS_URL.replace(":stableid", this.stableId),
          requestBody
        )
        .then((response) => {
          this.isUpdateReviewStatusSuccess = true;
          this.updateReviewStatusSuccessMsg = response.data.message;
        })
        .catch((error) => {
          this.updateReviewStatusErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to update review status. Please try again later.",
            "Unable to update review status."
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
  <div class="accordion py-1" id="update-review-status-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#update-review-status-section-body"
          aria-expanded="false"
          aria-controls="update-review-status-section-body"
        >
          Review Status
          <span
            class="badge rounded-pill text-bg-success mx-2"
            v-if="isUpdateReviewStatusSuccess"
          >
            <i class="bi bi-check-circle-fill"></i> Updated
          </span>
        </button>
      </h2>
      <div
        id="update-review-status-section-body"
        class="accordion-collapse collapse"
      >
        <div class="accordion-body">
          <div class="row g-3 p-2">
            <h5>Record review status</h5>
            <div
              class="d-flex justify-content-center"
              v-if="isUpdateApiCallLoading"
              style="margin-top: 122px; margin-bottom: 122px"
            >
              <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-else-if="reviewStatus !== true && reviewStatus !== false"
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                Review status is not defined for this record. To change the
                review status, please contact Admin at g2p-help@ebi.ac.uk
              </div>
            </div>
            <div v-else>
              <div class="row pb-4 w-50">
                <label
                  for="update-review-status-level-input"
                  class="col-lg-2 col-form-label"
                >
                  Status<span class="text-danger">*</span>
                </label>
                <div class="col-lg-7">
                  <select
                    id="update-review-status-level-input"
                    class="form-select"
                    v-model="reviewStatus"
                  >
                    <option :value="true">reviewed</option>
                    <option :value="false">under review</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-primary"
                @click="updateReviewStatus"
              >
                <i class="bi bi-pencil-square"></i> Update review status
              </button>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-if="updateReviewStatusErrorMsg"
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ updateReviewStatusErrorMsg }}
              </div>
            </div>
            <div v-if="isUpdateReviewStatusSuccess">
              <div class="alert alert-success mt-3" role="alert">
                <div>
                  <i class="bi bi-check-circle-fill"></i>
                  {{ updateReviewStatusSuccessMsg }}
                </div>
              </div>
              <p class="mb-2">
                <i class="bi bi-info-circle"></i> Please provide additional
                comments to justify the change in review status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
