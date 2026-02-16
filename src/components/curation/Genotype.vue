<script>
import kebabCase from "lodash/kebabCase";
export default {
  props: {
    attributesData: Object,
    allelicRequirement: String,
    crossCuttingModifiers: Array,
  },
  emits: ["update:allelicRequirement", "update:crossCuttingModifiers"],
  methods: {
    checkboxHandler(crossCuttingModifier, checked) {
      let updatedCrossCuttingModifiers = [...this.crossCuttingModifiers];
      if (checked) {
        updatedCrossCuttingModifiers.push(crossCuttingModifier);
      } else {
        updatedCrossCuttingModifiers.splice(
          updatedCrossCuttingModifiers.indexOf(crossCuttingModifier),
          1,
        );
      }
      this.$emit("update:crossCuttingModifiers", updatedCrossCuttingModifiers);
    },
    kebabCase,
  },
};
</script>
<template>
  <div class="accordion py-1" id="genotype-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#genotype-section-body"
          aria-expanded="false"
          aria-controls="genotype-section-body"
        >
          Genotype
        </button>
      </h2>
      <div id="genotype-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <form class="row g-3">
            <div class="row g-3">
              <div class="col-auto">
                <label for="allelic-requirement-input" class="col-form-label">
                  Allelic Requirement<span class="text-danger">*</span>
                </label>
              </div>
              <div class="col-3">
                <select
                  id="allelic-requirement-input"
                  class="form-select"
                  :value="allelicRequirement"
                  @input="
                    $emit('update:allelicRequirement', $event.target.value)
                  "
                >
                  <option value="">Select</option>
                  <option v-for="item in attributesData.genotype" :value="item">
                    {{ item }}
                  </option>
                </select>
              </div>
            </div>
            <div class="row g-3 mt-0">
              <div class="col-auto mt-0">
                <button
                  type="button"
                  class="btn btn-link m-0 p-0"
                  style="text-decoration: none"
                  data-bs-toggle="modal"
                  data-bs-target="#allelic-requirement-guidelines-modal"
                >
                  Guidelines
                  <i class="bi bi-file-earmark-text"></i>
                </button>
              </div>
            </div>
            <fieldset class="row g-3 mt-0">
              <legend class="col-form-label col-auto">
                Cross Cutting Modifier(s)
              </legend>
              <div class="col-9">
                <div
                  class="form-check"
                  v-for="item in attributesData.cross_cutting_modifier"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`cross-cutting-modifiers-input-${kebabCase(item)}`"
                    :checked="crossCuttingModifiers.includes(item)"
                    @input="checkboxHandler(item, $event.target.checked)"
                  />
                  <label
                    class="form-check-label"
                    :for="`cross-cutting-modifiers-input-${kebabCase(item)}`"
                  >
                    {{ item }}
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
