<script>
export default {
  props: {
    stableId: String,
  },
  methods: {
    goToUpdateRecordPage() {
      this.$router.push(`/lgd/update/${this.stableId}`);
    },
    goToAddPublicationPage() {
      this.$router.push(`/lgd/add-publication/${this.stableId}`);
    },
    goToReviewMinedPublicationPage() {
      this.$router.push(`/lgd/review-mined-publication/${this.stableId}`);
    },
  },
};
</script>
<template>
  <div
    class="modal fade"
    id="update-record-modal"
    tabindex="-1"
    aria-labelledby="update-record-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="update-record-modal-label">
            Update record
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p>What would you like to do?</p>
          <div class="d-flex justify-content-center g-3 py-3">
            <button
              type="button"
              class="btn btn-primary me-3"
              data-bs-dismiss="modal"
              @click="goToUpdateRecordPage"
            >
              <i class="bi bi-pencil-square"></i> Update data
            </button>
            <button
              type="button"
              class="btn btn-primary me-3"
              data-bs-dismiss="modal"
              @click="goToAddPublicationPage"
            >
              <i class="bi bi-plus-circle-fill"></i> Add Publication(s)
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
              @click="goToReviewMinedPublicationPage"
            >
              <i class="bi bi-file-earmark-text-fill"></i>
              Review All Mined Publication(s)
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-primary"
            data-bs-dismiss="modal"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
