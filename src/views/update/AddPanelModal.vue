<script>
import LoginErrorAlert from "@/components/alert/LoginErrorAlert.vue";
import {
  isUserLoggedIn,
  logOutUser,
  appendAuthenticationHeaders,
} from "@/utility/AuthenticationUtility";

export default {
  props: {
    stableId: String,
    userPanels: Array,
  },
  emits: ["refreshpage"],
  components: {
    LoginErrorAlert,
  },
  data() {
    return {
      addPanelErrorMsg: null,
      addPanelSuccessMsg: null,
      isAddPanelSuccess: false,
      isAddPanelApiCallLoading: false,
      panelToAdd: "",
      isLogInSessionExpired: false,
    };
  },
  methods: {
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
      fetch(`/gene2phenotype/api/lgd/${this.stableId}/panel/`, {
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
          <LoginErrorAlert v-if="isLogInSessionExpired" />
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
