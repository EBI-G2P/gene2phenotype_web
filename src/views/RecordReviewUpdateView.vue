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
      componentOptions: [
        { value: "disease", label: "Disease" },
        { value: "disease_cross_reference", label: "Disease cross reference" },
        { value: "mechanism", label: "Molecular mechanism" },
        { value: "genotype", label: "Allelic requirement" },
        { value: "confidence", label: "Confidence" },
        { value: "publications", label: "Publications" },
        { value: "mined_publications", label: "Mined publications" },
        { value: "phenotypes", label: "Phenotypes" },
        { value: "variant_type", label: "Variant type" },
        { value: "variant_consequence", label: "Variant consequence" },
        { value: "panel", label: "Panel" },
        { value: "duplicate", label: "Duplicate" },
        { value: "full_review", label: "Full review" },
        { value: "other", label: "Other" },
      ],
      newItemComponent: "",
      newItemDetails: "",
      newItemError: null,
    };
  },
  computed: {
    isResolvedLocked() {
      if (!this.reviewCase) return false;
      if (this.reviewCase.status !== "resolved") return false;
      return (this.reviewCase.items || []).every(
        (item) => item.status === "resolved"
      );
    },
    availableComponentOptions() {
      const existing = new Set(
        (this.formData?.items || []).map((item) => item.component)
      );
      return this.componentOptions.filter(
        (option) => !existing.has(option.value)
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
    normalizeDetails(details) {
      if (details == null || details === "") return [];
      if (typeof details === "object") {
        return Object.entries(details).map(([key, value]) => ({
          key,
          value,
        }));
      }
      if (typeof details === "string") {
        try {
          const parsed = JSON.parse(details);
          if (parsed && typeof parsed === "object") {
            return Object.entries(parsed).map(([key, value]) => ({
              key,
              value,
            }));
          }
        } catch (e) {
          // fall through to raw string rendering
        }
        return [{ key: "details", value: details }];
      }
      return [{ key: "details", value: String(details) }];
    },
    parseDetailsInput(rawDetails) {
      if (rawDetails == null || rawDetails === "") {
        return { ok: true, value: "" };
      }
      if (typeof rawDetails === "object") {
        return { ok: true, value: rawDetails };
      }
      if (typeof rawDetails === "string") {
        const trimmed = rawDetails.trim();
        if (!trimmed) return { ok: true, value: "" };
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === "object") {
            return { ok: true, value: parsed };
          }
          return { ok: false, error: "Details must be a JSON object or array." };
        } catch (e) {
          return { ok: false, error: "Details must be valid JSON." };
        }
      }
      return { ok: false, error: "Details must be valid JSON." };
    },
    addItem() {
      if (!this.formData || !this.newItemComponent) return;
      this.newItemError = null;
      const parsedDetails = this.parseDetailsInput(this.newItemDetails);
      if (!parsedDetails.ok) {
        this.newItemError = parsedDetails.error;
        return;
      }
      const exists = (this.formData.items || []).some(
        (item) => item.component === this.newItemComponent
      );
      if (exists) return;
      if (!this.formData.items) this.formData.items = [];
      this.formData.items.push({
        component: this.newItemComponent,
        status: "open",
        comment: "",
        details: parsedDetails.value,
      });
      this.newItemComponent = "";
      this.newItemDetails = "";
    },
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
      const items = this.formData.items || [];
      const parsedItems = [];
      for (const item of items) {
        const parsedDetails = this.parseDetailsInput(item.details);
        if (!parsedDetails.ok) {
          this.saveErrorMsg = `Invalid details for "${item.component}". ${parsedDetails.error}`;
          this.isSaving = false;
          return;
        }
        parsedItems.push({
          component: item.component,
          status: item.status,
          comment: item.comment,
          details: parsedDetails.value,
        });
      }
      const payload = {
        status: this.formData.status,
        assigned_to: this.formData.assigned_to || null,
        summary: this.formData.summary,
        items: parsedItems,
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
                <th class="component-col">Data to update</th>
                <th class="details-col">Details (JSON)</th>
                <th class="status-col">Status</th>
                <th class="comment-col">Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in formData.items" :key="item.component">
                <td class="component-col">{{ item.component }}</td>
                <td class="details-col">
                  <div
                    v-if="normalizeDetails(item.details).length > 0"
                    class="d-flex flex-column gap-2"
                  >
                    <div
                      v-for="detail in normalizeDetails(item.details)"
                      :key="detail.key"
                    >
                      <div class="fw-bold">{{ detail.key }}</div>
                      <div class="text-break">{{ detail.value }}</div>
                    </div>
                  </div>
                  <span v-else class="text-muted">No details</span>
                </td>
                <td class="status-col">
                  <select
                    class="form-select status-select"
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
                <td class="comment-col">
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
          <div class="mt-3" v-if="!isResolvedLocked">
            <label class="form-label fw-bold">Add item</label>
            <div class="d-flex gap-2 flex-wrap">
              <select
                class="form-select"
                v-model="newItemComponent"
                style="max-width: 320px"
              >
                <option value="">Select a component</option>
                <option
                  v-for="option in availableComponentOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <textarea
                class="form-control"
                rows="2"
                v-model="newItemDetails"
                placeholder="Details (JSON)"
                style="max-width: 420px"
              ></textarea>
              <button
                class="btn btn-outline-primary"
                type="button"
                :disabled="!newItemComponent"
                @click="addItem"
              >
                Add item
              </button>
            </div>
            <div class="text-danger mt-2" v-if="newItemError">
              {{ newItemError }}
            </div>
          </div>
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
<style scoped>
.component-col {
  width: 15%;
  max-width: 175px;
}
.details-col {
  width: 26%;
  max-width: 340px;
  font-size: 0.95rem;
}
.status-col {
  width: 12%;
  max-width: 140px;
}
.status-select {
  width: 100%;
  padding-right: 1.5rem;
}
.comment-col {
  width: 27%;
}
</style>
