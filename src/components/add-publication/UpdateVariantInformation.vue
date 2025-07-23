<script>
import UpdateVariantTypes from "./UpdateVariantTypes.vue";
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
export default {
  props: {
    currentVariantDescription: Array,
    currentVariantTypes: Array,
    publicationsData: Object,
    variantTypes: Object,
    variantDescriptions: Object,
  },
  emits: ["updateVariantTypes", "update:variantDescriptions"],
  data() {
    return {
      EUROPE_PMC_URL,
    };
  },
  methods: {
    variantDescriptionsInputHandler(pmid, inputValue) {
      let updatedVariantDescriptions = { ...this.variantDescriptions };
      updatedVariantDescriptions[pmid].description = inputValue;
      this.$emit("update:variantDescriptions", updatedVariantDescriptions);
    },
  },
  components: { UpdateVariantTypes },
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
            <UpdateVariantTypes
              :publicationsData="publicationsData"
              :variantTypes="variantTypes"
              @update-variant-types="
                (updatedVariantTypes) =>
                  $emit('updateVariantTypes', updatedVariantTypes)
              "
              :currentVariantTypes="currentVariantTypes"
            />
            <div class="row g-3 px-3 pt-3">
              <h5>Variant Descriptions</h5>
              <div
                v-if="currentVariantDescription?.length > 0"
                class="accordion accordion-flush"
                id="accordionVariantDescription"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsibleVariantDescriptionTable"
                      aria-expanded="false"
                      aria-controls="collapsibleVariantDescriptionTable"
                    >
                      Current Variant Descriptions ({{
                        currentVariantDescription.length
                      }})
                    </button>
                  </h2>
                  <div
                    id="collapsibleVariantDescriptionTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionVariantDescription"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>Variant Description</th>
                            <th>Publications</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="item in currentVariantDescription"
                            :key="item.description"
                          >
                            <td>
                              {{ item.description }}
                            </td>
                            <td>
                              <span v-if="item.publications?.length > 0">
                                <span
                                  v-for="(
                                    publicationItem, index
                                  ) in item.publications"
                                  :key="publicationItem"
                                >
                                  <span
                                    v-if="index < item.publications.length - 1"
                                  >
                                    <a
                                      :href="EUROPE_PMC_URL + publicationItem"
                                      style="text-decoration: none"
                                      target="_blank"
                                    >
                                      {{ publicationItem }}
                                    </a>
                                    ,
                                  </span>
                                  <a
                                    v-else
                                    :href="EUROPE_PMC_URL + publicationItem"
                                    style="text-decoration: none"
                                    target="_blank"
                                  >
                                    {{ publicationItem }}
                                  </a>
                                </span>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else>
                <i class="bi bi-info-circle"></i> No Variant Descriptions
                available for this record.
              </p>
              <div
                v-if="
                  variantDescriptions &&
                  Object.keys(variantDescriptions).length > 0
                "
              >
                <h5>Variant Descriptions for new Publication(s)</h5>
                <div
                  class="py-2"
                  v-for="pmid in Object.keys(variantDescriptions)"
                >
                  <div class="col-12">
                    <h6 class="mb-1">Publication (PMID: {{ pmid }})</h6>
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
                        variantDescriptionsInputHandler(
                          pmid,
                          $event.target.value
                        )
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
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
