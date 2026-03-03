<script>
import VariantTypes from "./VariantTypes.vue";
import VariantConsequences from "./VariantConsequences.vue";
export default {
  props: {
    pmidList: Array,
    variantTypes: Object,
    variantDescriptions: Object,
    variantConsequences: Object,
  },
  emits: [
    "updateVariantTypes",
    "update:variantDescriptions",
    "updateVariantConsequences",
  ],
  methods: {
    variantDescriptionsInputHandler(pmid, inputValue) {
      let updatedVariantDescriptions = { ...this.variantDescriptions };
      updatedVariantDescriptions[pmid].description = inputValue;
      this.$emit("update:variantDescriptions", updatedVariantDescriptions);
    },
  },
  components: { VariantTypes, VariantConsequences },
};
</script>
<template>
  <div class="accordion py-1" id="variant-info-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#variant-info-section-body"
          aria-expanded="false"
          aria-controls="variant-info-section-body"
        >
          Variant Information
        </button>
      </h2>
      <div id="variant-info-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <form>
            <VariantTypes
              :pmidList="pmidList"
              :variantTypes="variantTypes"
              @update-variant-types="
                (updatedVariantTypes) =>
                  $emit('updateVariantTypes', updatedVariantTypes)
              "
            />
            <div class="row g-3 px-3 pt-3">
              <div class="col-12"><h5>Variant Description</h5></div>
            </div>
            <div
              v-if="
                variantDescriptions &&
                Object.keys(variantDescriptions).length > 0
              "
            >
              <div
                class="row g-3 px-3 py-3"
                v-for="pmid in Object.keys(variantDescriptions)"
              >
                <div class="col-12">
                  <strong>
                    <p class="mb-0">Publication (PMID: {{ pmid }})</p>
                  </strong>
                </div>
                <div class="col-auto">
                  <label
                    :for="`variant-description-input-${pmid}`"
                    class="col-form-label"
                  >
                    Description (HGVS)
                  </label>
                </div>
                <div class="col-6">
                  <input
                    class="form-control"
                    :id="`variant-description-input-${pmid}`"
                    :value="variantDescriptions[pmid].description"
                    @input="
                      variantDescriptionsInputHandler(pmid, $event.target.value)
                    "
                    placeholder="Eg. ENST00000641515:c.4A>C"
                  />
                  <div class="form-text" id="publications-input-help-text">
                    Please follow
                    <a
                      href="https://hgvs-nomenclature.org/stable/"
                      target="_blank"
                      style="text-decoration: none"
                    >
                      HGVS Nomenclature
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="row g-3 px-3 pt-3">
              <div class="col-12">
                <div class="alert alert-warning mb-0" role="alert">
                  <i class="bi bi-exclamation-circle-fill"></i>
                  Please enter at least one publication to complete the
                  <strong>Variant Description</strong> section.
                </div>
              </div>
            </div>
            <VariantConsequences
              :variantConsequences="variantConsequences"
              @update-variant-consequences="
                (updatedVariantConsequences) =>
                  $emit('updateVariantConsequences', updatedVariantConsequences)
              "
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
