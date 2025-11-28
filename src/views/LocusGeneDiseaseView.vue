<script>
import { LGD_RECORD_URL, USER_PANELS_URL } from "../utility/UrlConstants.js";
import AddPanelModal from "../components/modal/AddPanelModal.vue";
import UpdateRecordModal from "../components/modal/UpdateRecordModal.vue";
import { mapState } from "pinia";
import { useAuthStore } from "../store/auth.js";
import api from "../services/api.js";
import {
  fetchAndLogGeneralErrorMsg,
  logGeneralErrorMsg,
} from "../utility/ErrorUtility.js";
import LocusGeneDiseaseDisplay from "../components/view-record/LocusGeneDiseaseDisplay.vue";

export default {
  data() {
    return {
      isDataLoading: false,
      locusGeneDiseaseData: null,
      errorMsg: null,
      mergedDataMsg: null,
      mergedStableId: null,
      isRecordPartOfUserPanels: false,
      stableId: null,
      userPanels: null,
      isPanelDataLoading: false,
    };
  },
  components: {
    AddPanelModal,
    UpdateRecordModal,
    LocusGeneDiseaseDisplay,
  },
  computed: {
    ...mapState(useAuthStore, ["isAuthenticated"]),
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params.stableId,
      (newStableId, oldStableId) => {
        if (newStableId !== oldStableId) {
          this.fetchRecordData();
        }
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  methods: {
    fetchRecordData() {
      this.stableId = this.$route.params.stableId;
      this.errorMsg =
        this.locusGeneDiseaseData =
        this.mergedDataMsg =
        this.mergedStableId =
          null;
      this.isDataLoading = true;
      api
        .get(LGD_RECORD_URL.replace(":stableid", this.stableId))
        .then((response) => {
          this.locusGeneDiseaseData = response.data;
          if (this.isAuthenticated) {
            this.fetchUserPanels();
          }
        })
        .catch((error) => {
          if (error?.response?.status === 410) {
            logGeneralErrorMsg(error);
            this.mergedDataMsg = error.response.data?.message;
            this.mergedStableId = error.response.data?.stable_id;
          } else {
            this.errorMsg = fetchAndLogGeneralErrorMsg(
              error,
              "Unable to fetch record data. Please try again later."
            );
          }
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
    fetchUserPanels() {
      this.userPanels = null;
      this.isPanelDataLoading = true;
      api
        .get(USER_PANELS_URL)
        .then((response) => {
          if (response.data?.length > 0) {
            this.userPanels = response.data;
            this.validateIsRecordPartOfUserPanels(
              this.locusGeneDiseaseData?.panels,
              this.userPanels
            );
          }
        })
        .catch((error) => {
          logGeneralErrorMsg(error);
        })
        .finally(() => {
          this.isPanelDataLoading = false;
        });
    },
    validateIsRecordPartOfUserPanels(recordPanels, userPanels) {
      // convert array of objects (name, description) to array of strings (description)
      const userPanelDescriptions = userPanels.map(
        (panelObj) => panelObj.description
      );
      // if any of the user panels exists in the g2p record panels list then true else false
      this.isRecordPartOfUserPanels = recordPanels.some((item) =>
        userPanelDescriptions.includes(item.description)
      );
    },
    refreshPage() {
      this.$router.go(); // refresh current page
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <div
      v-if="isDataLoading"
      class="d-flex justify-content-center"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-if="errorMsg" class="alert alert-danger mt-3" role="alert">
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ errorMsg }}
      </div>
    </div>
    <div v-if="mergedDataMsg" class="alert alert-primary mt-3" role="alert">
      <div>
        <i class="bi bi-info-circle"></i>
        {{ mergedDataMsg }} <br />
        <template v-if="mergedStableId">
          See the merged record here:
          <router-link :to="`/lgd/${mergedStableId}`" class="fw-bold">
            {{ mergedStableId }}
          </router-link>
        </template>
      </div>
    </div>
    <div v-if="locusGeneDiseaseData">
      <LocusGeneDiseaseDisplay
        :isRecordPartOfUserPanels="isRecordPartOfUserPanels"
        :locusGeneDiseaseData="locusGeneDiseaseData"
        :stableId="stableId"
        :userPanels="userPanels"
        :isPanelDataLoading="isPanelDataLoading"
        :isAuthenticated="isAuthenticated"
      />
      <AddPanelModal
        :stableId="stableId"
        :userPanels="userPanels"
        @refreshpage="refreshPage"
      />
      <UpdateRecordModal :stableId="stableId" />
    </div>
  </div>
</template>
