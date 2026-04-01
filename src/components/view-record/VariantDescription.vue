<script>
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
export default {
  props: {
    variantDescription: Array,
  },
  data() {
    return {
      EUROPE_PMC_URL,
    };
  },
};
</script>
<template>
  <div
    v-if="variantDescription?.length > 0"
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
          Variant Description ({{ variantDescription.length }})
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
              <tr v-for="item in variantDescription">
                <td>
                  {{ item.description }}
                </td>
                <td>
                  <span v-if="item.publications?.length > 0">
                    <span v-for="(publicationItem, index) in item.publications">
                      <span v-if="index < item.publications.length - 1">
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
  <p v-else class="text-muted">Not Available</p>
</template>
