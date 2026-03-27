<script>
import { fetchAndLogApiResponseErrorMsg } from "../utility/ErrorUtility.js";
import { REVIEW_QUEUE_DETAIL_URL } from "../utility/UrlConstants.js";
import api from "../services/api.js";

export default {
  data() {
    return {
      isDataLoading: false,
      isSaving: false,
      reviewCase: null,
      formData: null,
      errorMsg: null,
      saveErrorMsg: null,
      successMsg: null,
      statusOptions: ["open", "under_review", "resolved"],
      itemStatusOptions: ["open", "under_review", "resolved"],
    };
  },
  computed: {
    isResolvedLocked() {
      if (!this.formData) return false;
      if (this.formData.status !== "resolved") return false;
      return (this.formData.items || []).every(
        (item) => item.status === "resolved"
      );
    },
  },
  created() {
    this.$watch(
      () => this.$route.params.caseId,
      () => {
        this.fetchData();
      },
      { immediate: true }
    );
  },
  methods: {
    fetchData() {
      this.errorMsg = this.saveErrorMsg = this.successMsg = null;
      this.reviewCase = this.formData = null;
      this.isDataLoading = true;
      const caseId = this.$route.params.caseId;
      api
        .get(REVIEW_QUEUE_DETAIL_URL.replace(":caseid", caseId))
        .then((response) => {
          this.reviewCase = response.data;
          this.formData = {
            status: response.data.status,
            assigned_to: response.data.assigned_to,
            summary: response.data.summary,
            items: (response.data.items || []).map((item) => ({
              component: item.component,
              status: item.status,
              comment: item.comment,
              details: item.details,
            })),
          };
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to fetch review case. Please try again later.",
            "Unable to fetch review case."
          );
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
    saveChanges() {
      if (!this.formData) return;
      this.saveErrorMsg = this.successMsg = null;
      this.isSaving = true;
      const caseId = this.$route.params.caseId;
      const payload = {
        status: this.formData.status,
        assigned_to: this.formData.assigned_to || null,
        summary: this.formData.summary,
        items: (this.formData.items || []).map((item) => ({
          component: item.component,
          status: item.status,
          comment: item.comment,
          details: item.details,
        })),
      };
      api
        .patch(REVIEW_QUEUE_DETAIL_URL.replace(":caseid", caseId), payload)
        .then((response) => {
          this.reviewCase = response.data;
          this.formData = {
            status: response.data.status,
            assigned_to: response.data.assigned_to,
            summary: response.data.summary,
            items: (response.data.items || []).map((item) => ({
              component: item.component,
              status: item.status,
              comment: item.comment,
              details: item.details,
            })),
          };
          this.successMsg = "Review case updated successfully.";
        })
        .catch((error) => {
          this.saveErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to update review case. Please try again later.",
            "Unable to update review case."
          );
        })
        .finally(() => {
          this.isSaving = false;
        });
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <div class="d-flex justify-content-between align-items-start pb-2">
      <h2>Review record details</h2>
      <router-link class="btn btn-outline-primary" to="/records-review">
        <i class="bi bi-arrow-left-circle"></i> Return to review list
      </router-link>
    </div>
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
    <div class="py-3" v-else>
      <div v-if="reviewCase && formData">
        <div class="alert alert-success mt-2" role="alert" v-if="successMsg">
          <div><i class="bi bi-check-circle-fill"></i> {{ successMsg }}</div>
        </div>
        <div class="alert alert-danger mt-2" role="alert" v-if="saveErrorMsg">
          <div><i class="bi bi-exclamation-circle-fill"></i> {{ saveErrorMsg }}</div>
        </div>
        <div class="mb-2">
          <div class="row align-items-center w-75">
            <label class="col-lg-2 col-form-label fw-bold text-nowrap">
              G2P ID
            </label>
            <div class="col-lg-10">
              <a
                :href="`/gene2phenotype/lgd/${reviewCase.stable_id}`"
                style="text-decoration: none"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ reviewCase.stable_id }}
              </a>
            </div>
          </div>
        </div>
        <div class="mb-2">
          <div class="row align-items-center w-75">
            <label class="col-lg-2 col-form-label fw-bold text-nowrap">
              Status
            </label>
            <div class="col-lg-10">
              <select
                class="form-select"
                v-model="formData.status"
                :disabled="isResolvedLocked"
              >
                <option
                  v-for="option in statusOptions"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="mb-2">
          <div class="row align-items-center w-75">
            <label class="col-lg-2 col-form-label fw-bold text-nowrap">
              Assigned To
            </label>
            <div class="col-lg-10">
              {{ reviewCase.assigned_to || "Unassigned" }}
            </div>
          </div>
        </div>
        <div class="mb-2">
          <div class="row align-items-center w-75">
            <label class="col-lg-2 col-form-label fw-bold text-nowrap">
              Last Updated
            </label>
            <div class="col-lg-10">
              {{ reviewCase.date_last_update }}
            </div>
          </div>
        </div>
        <div class="mb-2">
          <div class="row align-items-start w-75">
            <label class="col-lg-2 col-form-label fw-bold text-nowrap">
              Summary
            </label>
            <div class="col-lg-10">
              <textarea
                class="form-control"
                rows="4"
                v-model="formData.summary"
                :disabled="isResolvedLocked"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="mt-3">
          <h5>Items</h5>
          <table
            class="table table-hover table-bordered"
            v-if="formData.items && formData.items.length > 0"
          >
            <thead>
              <tr>
                <th>Data to update</th>
                <th>Status</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in formData.items" :key="item.component">
                <td>{{ item.component }}</td>
                <td>
                  <select
                    class="form-select"
                    v-model="item.status"
                    :disabled="isResolvedLocked"
                  >
                    <option
                      v-for="option in itemStatusOptions"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </td>
                <td>
                  <textarea
                    class="form-control"
                    rows="3"
                    v-model="item.comment"
                    :disabled="isResolvedLocked"
                  ></textarea>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="text-dark" v-else>No items available for this case.</p>
        </div>
        <div class="d-flex justify-content-end pt-3" v-if="!isResolvedLocked">
          <button
            class="btn btn-primary"
            type="button"
            :disabled="isSaving"
            @click="saveChanges"
          >
            <span
              class="spinner-border spinner-border-sm me-2"
              role="status"
              v-if="isSaving"
            ></span>
            Save changes
          </button>
        </div>
      </div>
      <p class="text-dark" v-else>Review case not found.</p>
    </div>
  </div>
</template>
