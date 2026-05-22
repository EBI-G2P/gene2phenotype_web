<script>
import kebabCase from "lodash/kebabCase";
export default {
  props: {
    panelData: Object,
    isPanelDataLoading: Boolean,
    panelErrorMsg: String,
    panels: Array,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:panels"],
  methods: {
    checkboxHandler(panel, checked) {
      let updatedPanels = [...this.panels];
      if (checked) {
        updatedPanels.push(panel);
      } else {
        updatedPanels.splice(updatedPanels.indexOf(panel), 1);
      }
      this.$emit("update:panels", updatedPanels);
    },
    kebabCase,
  },
};
</script>
<template>
  <div class="accordion py-1" id="panel-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#panel-section-body"
          aria-expanded="false"
          aria-controls="panel-section-body"
        >
          Panel
        </button>
      </h2>
      <div id="panel-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <div
            class="d-flex justify-content-center"
            v-if="isPanelDataLoading"
            style="margin-top: 20px; margin-bottom: 20px"
          >
            <div class="spinner-border text-secondary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div
            class="alert alert-danger mt-3"
            role="alert"
            v-if="panelErrorMsg"
          >
            <div>
              <i class="bi bi-exclamation-circle-fill"></i>
              {{ panelErrorMsg }}
            </div>
          </div>
          <form v-if="panelData?.length > 0">
            <fieldset class="row mb-3" :disabled="disabled">
              <legend class="col-form-label col-lg-1 pt-0">
                Panel(s)<span class="text-danger">*</span>
              </legend>
              <div class="col-lg-11">
                <div class="form-check" v-for="item in panelData">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`panel-input-${kebabCase(item.description)}`"
                    :checked="panels.includes(item.description)"
                    @input="
                      checkboxHandler(item.description, $event.target.checked)
                    "
                  />
                  <label
                    class="form-check-label"
                    :for="`panel-input-${kebabCase(item.description)}`"
                  >
                    {{ item.description }}
                  </label>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
