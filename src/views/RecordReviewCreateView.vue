<script>
import { fetchAndLogApiResponseErrorMsg } from "../utility/ErrorUtility.js";
import {
  REVIEW_COMPONENT_OPTIONS,
  REVIEW_STATUS,
  REVIEW_STATUS_OPTIONS,
} from "../utility/ReviewConstants.js";
import { REVIEW_QUEUE_URL } from "../utility/UrlConstants.js";
import api from "../services/api.js";

export default {
  data() {
    return {
      isSaving: false,
      errorMsg: null,
      successMsg: null,
      stableId: "",
      summary: "",
      assignedTo: "",
      selectedComponents: [],
      items: [],
      itemStatusOptions: REVIEW_STATUS_OPTIONS,
      componentOptions: REVIEW_COMPONENT_OPTIONS,
    };
  },
  watch: {
    selectedComponents() {
      this.syncItemsFromSelection();
    },
  },
  methods: {
    parseDetailsInput(rawDetails) {
      if (rawDetails == null || rawDetails === "") {
        return { valid: true, value: "" };
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
    syncItemsFromSelection() {
      const selected = new Set(this.selectedComponents);
      this.items = [
        ...this.items.filter((item) => selected.has(item.component)),
      ];
      this.selectedComponents.forEach((component) => {
        if (!this.items.find((item) => item.component === component)) {
          this.items.push({
            component,
            status: REVIEW_STATUS.OPEN,
            comment: "",
            details: "",
          });
        }
      });
    },
    submitForm() {
      this.errorMsg = this.successMsg = null;
      if (!this.stableId?.trim()) {
        this.errorMsg = "Stable ID is required.";
        return;
      }
      if (this.items.length === 0) {
        this.errorMsg = "Please select at least one item.";
        return;
      }
      const parsedItems = [];
      for (const item of this.items) {
        const parsedDetails = this.parseDetailsInput(item.details);
        if (!parsedDetails.ok) {
          this.errorMsg = `Invalid details for "${item.component}". ${parsedDetails.error}`;
          return;
        }
        parsedItems.push({
          component: item.component,
          status: item.status,
          comment: item.comment,
          details: parsedDetails.value,
        });
      }

      this.isSaving = true;
      const payload = {
        stable_id: this.stableId.trim(),
        summary: this.summary || null,
        assigned_to: this.assignedTo || null,
        items: parsedItems,
      };
      api
        .post(REVIEW_QUEUE_URL, payload)
        .then((response) => {
          this.successMsg = "Review case created successfully.";
          this.$router.push("/records-review");
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to create review case. Please try again later.",
            "Unable to create review case."
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
      <h2>Create Review Case</h2>
      <router-link class="btn btn-outline-primary" to="/records-review">
        <i class="bi bi-arrow-left-circle"></i> Return to review list
      </router-link>
    </div>

    <div class="alert alert-success mt-2" role="alert" v-if="successMsg">
      <div><i class="bi bi-check-circle-fill"></i> {{ successMsg }}</div>
    </div>
    <div class="alert alert-danger mt-2" role="alert" v-if="errorMsg">
      <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
    </div>

    <div class="mt-2 mb-2">
      <div class="row align-items-center w-75">
        <label class="col-lg-2 col-form-label fw-bold text-nowrap">
          G2P ID<span class="text-danger">*</span>
        </label>
        <div class="col-lg-10">
          <input
            class="form-control"
            type="text"
            v-model="stableId"
            placeholder="e.g. G2P00001"
          />
        </div>
      </div>
    </div>

    <div class="mb-2">
      <div class="row align-items-start w-75">
        <label class="col-lg-2 col-form-label fw-bold text-nowrap">
          Summary
        </label>
        <div class="col-lg-10">
          <textarea class="form-control" rows="4" v-model="summary"></textarea>
        </div>
      </div>
    </div>

    <div class="mb-2">
      <div class="row align-items-center w-75">
        <label class="col-lg-2 col-form-label fw-bold text-nowrap">
          Assigned To
        </label>
        <div class="col-lg-10">
          <input
            class="form-control"
            type="email"
            v-model="assignedTo"
            placeholder="user@example.org"
          />
        </div>
      </div>
    </div>

    <div class="mt-3">
      <h5>Items<span class="text-danger">*</span></h5>
      <div class="mb-3 w-75">
        <label class="form-label fw-bold">Select components</label>
        <div class="row">
          <div
            class="col-md-6"
            v-for="option in componentOptions"
            :key="option.value"
          >
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :id="`component-${option.value}`"
                :value="option.value"
                v-model="selectedComponents"
              />
              <label
                class="form-check-label"
                :for="`component-${option.value}`"
              >
                {{ option.label }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <table
        class="table table-hover table-bordered"
        v-if="items.length > 0"
      >
        <thead>
          <tr>
            <th>Data to update</th>
            <th>Details (JSON)</th>
            <th>Status</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.component">
            <td>{{ item.component }}</td>
            <td>
              <textarea class="form-control" rows="2" v-model="item.details">
              </textarea>
            </td>
            <td>
              <select class="form-select" v-model="item.status">
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
              <textarea class="form-control" rows="2" v-model="item.comment">
              </textarea>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="text-dark" v-else>Select at least one item.</p>
    </div>

    <div class="d-flex justify-content-end pt-3">
      <button
        class="btn btn-primary"
        type="button"
        :disabled="isSaving"
        @click="submitForm"
      >
        <span
          class="spinner-border spinner-border-sm me-2"
          role="status"
          v-if="isSaving"
        ></span>
        Create case
      </button>
    </div>
  </div>
</template>
