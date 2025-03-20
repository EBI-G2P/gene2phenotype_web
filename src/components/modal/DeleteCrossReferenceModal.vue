<script>
export default {
  props: {
    accession: String,
  },
  emits: ["delete", "cancel"],
};
</script>
<template>
  <div
    class="modal fade"
    id="delete-cross-reference-modal"
    tabindex="-1"
    aria-labelledby="delete-cross-reference-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5
            class="modal-title"
            id="delete-cross-reference-modal-label"
            style="color: #dc3545"
          >
            <i class="bi bi-exclamation-triangle"></i> Caution
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            @click="$emit('cancel')"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row g-3 py-3">
            <p>
              Are you sure you want to delete the following Cross Reference?
            </p>
            <p class="fw-bold">{{ accession }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            @click="$emit('cancel')"
            data-bs-dismiss="modal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            @click="$emit('delete')"
            data-bs-dismiss="modal"
          >
            <i class="bi bi-trash-fill"></i> Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
