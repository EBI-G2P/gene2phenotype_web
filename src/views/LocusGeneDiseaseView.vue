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
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';

export default {
  data() {
    return {
      isDataLoading: false,
      locusGeneDiseaseData: null,
      errorMsg: null,
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
    this.fetchRecordData();
  },
  methods: {
    fetchRecordData() {
      this.stableId = this.$route.params.stableId;
      this.errorMsg = this.locusGeneDiseaseData = null;
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
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch record data. Please try again later."
          );
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
    exportToPDF() {
      const element = document.getElementById("lgd-data");

      // Add a temporary CSS class to tweak layout for export if needed
      element.classList.add("pdf-export");

      const opt = {
        margin:       0.5,  // in inches
        filename:     `${this.stableId}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  {
          scale: 2,          // improves resolution
          useCORS: true      // enables loading external assets like Bootstrap
        },
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']  // avoid cutting elements
        }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        // Clean up the temporary class after export
        element.classList.remove("pdf-export");
      });
    }
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <div
      class="d-flex justify-content-center"
      v-if="isDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-if="errorMsg">
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ errorMsg }}
      </div>
    </div>
    <div id="lgd-data" v-if="locusGeneDiseaseData">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
        <button @click="exportToPDF">Export to PDF</button>
      </div>
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
