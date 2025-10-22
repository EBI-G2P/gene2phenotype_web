<script>
export default {
  props: {
    recordWarnings: Array,
  },
  emits: ["confirmClickHandler"],
};
</script>
<template>
  <div
    class="modal fade"
    id="record-warning-modal"
    tabindex="-1"
    aria-labelledby="record-warning-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-warning" id="record-warning-modal-label">
            <i class="bi bi-exclamation-triangle"></i> Warning
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row p-2">
            <p>
              This record has the following warnings. Are you sure you want to
              proceed?
            </p>
            <ol class="mx-3">
              <li v-for="text in recordWarnings" :key="text">
                {{ text }}
              </li>
            </ol>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-warning"
            @click="$emit('confirmClickHandler')"
          >
            I understand, proceed
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
