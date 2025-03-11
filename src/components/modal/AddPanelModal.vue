<script>
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";
import { ADD_PANEL_URL } from "../../utility/UrlConstants.js";
import api from "../../services/api.js";

export default {
  props: {
    stableId: String,
    userPanels: Array,
  },
  emits: ["refreshpage"],
  data() {
    return {
      addPanelErrorMsg: null,
      addPanelSuccessMsg: null,
      isAddPanelSuccess: false,
      isAddPanelApiCallLoading: false,
      panelToAdd: "",
    };
  },
  methods: {
    addPanel() {
      this.addPanelErrorMsg = this.addPanelSuccessMsg = null;
      this.isAddPanelSuccess = false;
      this.isAddPanelApiCallLoading = true;

      const requestBody = {
        name: this.panelToAdd.name,
      };
      api
        .post(ADD_PANEL_URL.replace(":stableid", this.stableId), requestBody)
        .then((response) => {
          this.isAddPanelSuccess = true;
          this.addPanelSuccessMsg = response.data.message;
        })
        .catch((error) => {
          this.addPanelErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to add panel. Please try again later.",
            "Unable to add panel."
          );
        })
        .finally(() => {
          this.isAddPanelApiCallLoading = false;
        });
    },
  },
};
</script>
<template>
  <div
    class="modal fade"
    id="add-panel-modal"
    tabindex="-1"
    aria-labelledby="add-panel-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="add-panel-modal-label">
            Add to another panel
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div
            class="d-flex justify-content-center"
            v-if="isAddPanelApiCallLoading"
            style="margin-top: 27px; margin-bottom: 27px"
          >
            <div class="spinner-border text-secondary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div
            class="row g-3 pt-4 pb-4 ps-3"
            v-if="!isAddPanelApiCallLoading && !isAddPanelSuccess"
          >
            <label for="add-panel-input" class="col-lg-2 col-form-label">
              Panel
            </label>
            <div class="col-lg-7">
              <select
                id="add-panel-input"
                class="form-select"
                v-model="panelToAdd"
              >
                <option value="">Select</option>
                <option v-for="item in userPanels" :value="item">
                  {{ item.description }}
                </option>
              </select>
            </div>
          </div>
          <div
            class="alert alert-danger mt-3"
            role="alert"
            v-if="addPanelErrorMsg"
          >
            <div>
              <i class="bi bi-exclamation-circle-fill"></i>
              {{ addPanelErrorMsg }}
            </div>
          </div>
          <div
            class="alert alert-success mt-3"
            role="alert"
            v-if="isAddPanelSuccess"
          >
            <div>
              <i class="bi bi-check-circle-fill"></i>
              {{ addPanelSuccessMsg }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="!isAddPanelSuccess"
            type="button"
            class="btn btn-outline-primary"
            data-bs-dismiss="modal"
          >
            Close
          </button>
          <button
            v-if="!isAddPanelSuccess"
            :disabled="isAddPanelApiCallLoading"
            type="button"
            class="btn btn-primary"
            @click="addPanel"
          >
            <i class="bi bi-plus-circle-fill"></i> Add to panel
          </button>
          <button
            v-if="isAddPanelSuccess"
            type="button"
            class="btn btn-success"
            @click="$emit('refreshpage')"
            data-bs-dismiss="modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
