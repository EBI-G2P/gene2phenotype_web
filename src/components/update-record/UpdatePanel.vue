<script>
import {
  fetchAndLogApiResponseErrorMsg,
  fetchAndLogGeneralErrorMsg,
} from "../../utility/ErrorUtility.js";
import { ADD_PANEL_URL, USER_PANELS_URL } from "../../utility/UrlConstants.js";
import api from "../../services/api.js";

export default {
  props: {
    stableId: String,
    currentPanels: Array,
  },
  data() {
    return {
      panels: this.currentPanels,
      userPanels: null,
      userPanelsErrorMsg: null,
      isUserPanelsDataLoading: false,
      isAddPanelApiCallLoading: false,
      addPanelErrorMsg: null,
      isAddPanelSuccess: false,
      addPanelSuccessMsg: null,
      panelToAdd: "",
      userPanelOptionsToAdd: null,
    };
  },
  created() {
    this.fetchUserPanels();
  },
  methods: {
    fetchUserPanels() {
      this.userPanelsErrorMsg = this.userPanels = null;
      this.isUserPanelsDataLoading = true;
      api
        .get(USER_PANELS_URL)
        .then((response) => {
          if (response.data?.length > 0) {
            this.userPanels = response.data;
            this.setUserPanelOptionsToAdd(this.panels, this.userPanels);
          }
        })
        .catch((error) => {
          this.userPanelsErrorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch user panels. Please try again later."
          );
        })
        .finally(() => {
          this.isUserPanelsDataLoading = false;
        });
    },
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
          this.panels.push(this.panelToAdd);
          this.panelToAdd = "";
          this.setUserPanelOptionsToAdd(this.panels, this.userPanels);
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
    setUserPanelOptionsToAdd(panels, userPanels) {
      let userPanelOptions = [];
      // identify user panels which are not part of the record panels
      userPanels.forEach((userPanelItem) => {
        if (
          !panels.some(
            (panelItem) => panelItem.description === userPanelItem.description
          )
        ) {
          userPanelOptions.push(userPanelItem);
        }
      });
      this.userPanelOptionsToAdd = userPanelOptions;
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="update-panel-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#update-panel-section-body"
          aria-expanded="false"
          aria-controls="update-panel-section-body"
        >
          Panel(s)
          <span
            class="badge rounded-pill text-bg-success mx-2"
            v-if="isAddPanelSuccess"
          >
            <i class="bi bi-check-circle-fill"></i> Updated
          </span>
        </button>
      </h2>
      <div id="update-panel-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <div class="row g-3 p-2">
            <h5>Panel(s)</h5>
            <div
              class="d-flex justify-content-center"
              v-if="isUserPanelsDataLoading || isAddPanelApiCallLoading"
              style="margin-top: 122px; margin-bottom: 122px"
            >
              <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else>
              <table class="table table-bordered" style="width: 30%">
                <thead>
                  <tr>
                    <th>Current panel(s)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in panels">
                    <td>{{ item.description }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="userPanelOptionsToAdd?.length > 0">
                <hr />
                <h5 class="mb-0">Add to panel</h5>
                <div class="row py-4 w-50">
                  <label
                    for="add-panel-select-input"
                    class="col-lg-2 col-form-label"
                  >
                    Panel
                  </label>
                  <div class="col-lg-7">
                    <select
                      id="add-panel-select-input"
                      class="form-select"
                      v-model="panelToAdd"
                    >
                      <option value="">Select</option>
                      <option
                        v-for="item in userPanelOptionsToAdd"
                        :value="item"
                      >
                        {{ item.description }}
                      </option>
                    </select>
                  </div>
                </div>
                <button class="btn btn-primary" @click="addPanel" type="button">
                  <i class="bi bi-plus-circle-fill"></i> Add to panel
                </button>
              </div>
              <p v-else>
                <i class="bi bi-info-circle"></i> All of your panels are already
                part of the panel(s) list. No panels left to add.
              </p>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-if="userPanelsErrorMsg || addPanelErrorMsg"
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ userPanelsErrorMsg || addPanelErrorMsg }}
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
        </div>
      </div>
    </div>
  </div>
</template>
