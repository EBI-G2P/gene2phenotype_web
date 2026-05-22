<script>
export default {
  emits: ["savedraft"],
};
</script>
<template>
  <div
    class="modal fade"
    id="confirm-save-draft-modal"
    tabindex="-1"
    aria-labelledby="confirm-save-draft-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="confirm-save-draft-modal-label">
            Confirm save draft
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row g-3 py-3">
            <p>
              You are about to save this draft. It will be converted to a manual
              draft. Have you reviewed everything and do you want to proceed?
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            <i class="bi bi-x-circle-fill"></i> Close
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="$emit('savedraft')"
            data-bs-dismiss="modal"
          >
            <i class="bi bi-floppy-fill"></i> Save draft
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
