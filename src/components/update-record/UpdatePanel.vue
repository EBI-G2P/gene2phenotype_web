<script>
import LoginErrorAlert from "../alert/LoginErrorAlert.vue";
import {
  isUserLoggedIn,
  logOutUser,
  appendAuthenticationHeaders,
} from "../../utility/AuthenticationUtility";
import { ADD_PANEL_URL, USER_PANELS_URL } from "../../utility/UrlConstants";

export default {
  props: {
    stableId: String,
    currentPanels: Array,
  },
  components: {
    LoginErrorAlert,
  },
  data() {
    return {
      panels: this.currentPanels,
      userPanels: null,
      userPanelsErrorMsg: null,
      isUserPanelsDataLoading: false,
      isLogInSessionExpired: false,
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
      const apiHeaders = appendAuthenticationHeaders({
        "Content-Type": "application/json",
      });
      fetch(USER_PANELS_URL, {
        method: "GET",
        headers: apiHeaders,
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            return Promise.reject(
              new Error(
                "Unable to fetch user panels at the moment. Please try again later."
              )
            );
          }
        })
        .then((responseJson) => {
          this.isUserPanelsDataLoading = false;
          if (responseJson && responseJson.length > 0) {
            this.userPanels = responseJson;
            this.setUserPanelOptionsToAdd(this.panels, this.userPanels);
          }
        })
        .catch((error) => {
          this.isUserPanelsDataLoading = false;
          this.userPanelsErrorMsg = error.message;
          console.log(error);
        });
    },
    addPanel() {
      if (!isUserLoggedIn()) {
        logOutUser();
        this.isLogInSessionExpired = true;
        return;
      }

      this.addPanelErrorMsg = this.addPanelSuccessMsg = null;
      this.isAddPanelSuccess = false;
      this.isAddPanelApiCallLoading = true;

      const requestBody = {
        name: this.panelToAdd.name,
      };
      let responseStatus = null;
      let apiHeaders = appendAuthenticationHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
      });
      fetch(ADD_PANEL_URL.replace(":stableid", this.stableId), {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: apiHeaders,
      })
        .then((response) => {
          responseStatus = response.status;
          return response.json();
        })
        .then((responseJson) => {
          this.isAddPanelApiCallLoading = false;
          if (responseStatus === 201) {
            this.isAddPanelSuccess = true;
            this.addPanelSuccessMsg = responseJson.message;
            this.panels.push(this.panelToAdd);
            this.panelToAdd = "";
            this.setUserPanelOptionsToAdd(this.panels, this.userPanels);
          } else {
            let errorMsg = "Unable to add panel. Please try again later.";
            if (
              responseJson.errors?.message &&
              responseJson.errors?.message.length > 0
            ) {
              errorMsg =
                "Unable to add panel. Error: " + responseJson.errors.message[0];
            }
            this.addPanelErrorMsg = errorMsg;
            console.log(errorMsg);
          }
        })
        .catch((error) => {
          this.isAddPanelApiCallLoading = false;
          this.addPanelErrorMsg =
            "Unable to add panel. Please try again later.";
          console.log(error);
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
              <div
                v-if="userPanelOptionsToAdd && userPanelOptionsToAdd.length > 0"
              >
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
            <LoginErrorAlert v-if="isLogInSessionExpired" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
