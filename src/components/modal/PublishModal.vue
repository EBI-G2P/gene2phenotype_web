<script>
export default {
  emits: ["publish"],
};
</script>
<template>
  <div
    class="modal fade"
    id="publish-entry-modal"
    tabindex="-1"
    aria-labelledby="publish-entry-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal=title" id="publish-entry-modal-label">
            Publish Record
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
            <p>You are about to publish this record. Do you want to proceed?</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-success"
            @click="$emit('publish')"
            data-bs-dismiss="modal"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
