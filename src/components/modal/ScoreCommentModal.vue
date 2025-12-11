<script>
export default {
  props: {
    comment: String,
  },
  emits: ["close"],
};
</script>
<template>
  <div
    class="modal fade"
    id="score-comment-modal"
    tabindex="-1"
    aria-labelledby="score-comment-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal=title" id="score-comment-modal-label">
            Score justification
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            @click="$emit('close')"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row g-3 py-3">
            <p>{{ comment }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
            @click="$emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
