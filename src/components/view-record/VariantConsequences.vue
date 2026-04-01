<script>
import { SEQUENCE_ONTOLOGY_URL } from "../../utility/UrlConstants.js";
export default {
  props: {
    variantConsequences: Array,
  },
  data() {
    return {
      SEQUENCE_ONTOLOGY_URL,
    };
  },
};
</script>
<template>
  <div
    v-if="variantConsequences?.length > 0"
    class="accordion accordion-flush"
    id="accordionVariantConsequences"
  >
    <div class="accordion-item">
      <h2 class="accordion-header border">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleVariantConsequencesTable"
          aria-expanded="false"
          aria-controls="collapsibleVariantConsequencesTable"
        >
          {{ variantConsequences.map((x) => x.variant_consequence).join(", ") }}
        </button>
      </h2>
      <div
        id="collapsibleVariantConsequencesTable"
        class="accordion-collapse collapse"
        data-bs-parent="#accordionVariantConsequences"
      >
        <div class="accordion-body p-0">
          <table class="table table-bordered mb-0">
            <thead>
              <tr>
                <th>Variant Consequence</th>
                <th>Support</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in variantConsequences">
                <td>
                  <a
                    v-if="item.accession"
                    :href="SEQUENCE_ONTOLOGY_URL + item.accession"
                    style="text-decoration: none"
                    target="_blank"
                  >
                    {{ item.variant_consequence }}
                  </a>
                  <span v-else>{{ item.variant_consequence }}</span>
                </td>
                <td>
                  <template v-if="item.variant_consequence !== 'uncertain'">
                    {{ item.support }}
                  </template>
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
