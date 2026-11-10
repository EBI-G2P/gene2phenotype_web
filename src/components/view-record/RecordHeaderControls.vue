<script>
import ConfidenceBadge from "../confidence/ConfidenceBadge.vue";

export default {
  components: {
    ConfidenceBadge,
  },
  props: {
    locusGeneDiseaseData: {
      type: Object,
      required: true,
    },
    userPanels: {
      type: Array,
      default: () => [],
    },
    isPanelDataLoading: Boolean,
    isAuthenticated: Boolean,
    isRecordPartOfUserPanels: Boolean,
  },
  data() {
    return {
      isPdfDownloading: false,
    };
  },
  computed: {
    canAddToPanel() {
      return (
        !this.isPanelDataLoading &&
        this.userPanels?.length > 0 &&
        this.isAuthenticated &&
        !this.isRecordPartOfUserPanels
      );
    },
    canUpdateRecord() {
      return (
        !this.isPanelDataLoading &&
        this.isAuthenticated &&
        this.isRecordPartOfUserPanels
      );
    },
  },
  methods: {
    async exportRecordPdf() {
      if (this.isPdfDownloading) {
        return;
      }

      this.isPdfDownloading = true;

      try {
        const { exportRecordPdf } =
          await import("../../utility/DownloadUtility.js");
        exportRecordPdf(this.locusGeneDiseaseData, this.isAuthenticated);
      } finally {
        this.isPdfDownloading = false;
      }
    },
  },
};
</script>

<template>
  <div class="row g-2 align-items-start">
    <div class="col-12 col-md-auto d-flex flex-wrap align-items-center gap-1">
      <ConfidenceBadge
        :confidence="locusGeneDiseaseData.confidence"
        class="fs-6"
      />
      <span
        v-if="locusGeneDiseaseData.under_review"
        class="badge text-white fs-6 text-bg-warning"
      >
        Under review
      </span>
    </div>
    <div
      class="col-12 col-md d-flex flex-wrap justify-content-start justify-content-md-end gap-1"
    >
      <button
        v-if="canAddToPanel"
        class="btn btn-outline-primary"
        data-bs-toggle="modal"
        data-bs-target="#add-panel-modal"
      >
        <i class="bi bi-plus-circle-fill"></i> Add to another panel
      </button>
      <button
        v-if="canUpdateRecord"
        class="btn btn-outline-primary"
        data-bs-toggle="modal"
        data-bs-target="#update-record-modal"
      >
        <i class="bi bi-pencil-square"></i> Update record
      </button>
      <div
        v-if="isPanelDataLoading && isAuthenticated"
        class="my-auto"
        role="status"
      >
        <span
          class="spinner-border spinner-border-sm text-primary"
          aria-hidden="true"
        ></span>
        <span class="visually-hidden">Loading panel data...</span>
      </div>
      <button
        class="btn btn-outline-primary"
        type="button"
        :disabled="isPdfDownloading"
        :aria-busy="isPdfDownloading"
        @click="exportRecordPdf"
      >
        <span
          v-if="isPdfDownloading"
          class="spinner-border spinner-border-sm me-1"
          aria-hidden="true"
        ></span>
        <i
          v-else
          class="bi bi-file-earmark-arrow-down me-1"
          aria-hidden="true"
        ></i>
        {{ isPdfDownloading ? "Downloading" : "Download PDF" }}
      </button>
    </div>
  </div>
</template>
