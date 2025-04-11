<script>
import { getVariantConsequenceCssClass } from "../../utility/CurationUtility.js";
import { VariantConsequencesAttribs } from "../../utility/CurationConstants.js";
export default {
  props: {
    variantConsequences: Object,
  },
  emits: ["updateVariantConsequences"],
  methods: {
    variantConsequencesInputHandler(key, inputValue) {
      let updatedVariantConsequences = { ...this.variantConsequences };
      updatedVariantConsequences[key] = inputValue;
      this.$emit("updateVariantConsequences", updatedVariantConsequences);
    },
    getVariantConsequenceCssClass,
  },
  data() {
    return {
      variantConsequencesAttribs: [...VariantConsequencesAttribs],
    };
  },
};
</script>
<template>
  <div class="row g-3 px-3 py-3">
    <div class="col-12">
      <h5>Variant Consequences<span class="text-danger">*</span></h5>
    </div>
    <div class="col-xl-6 col-12">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th style="width: 70%">
              Altered protein for protein-coding genes or altered RNA level for
              non-protein coding genes
            </th>
            <th style="width: 30%">Source</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in variantConsequencesAttribs" :key="item.inputKey">
            <td :class="getVariantConsequenceCssClass(item.hierarchyLevel)">
              <a
                v-if="item.accession"
                :href="`http://www.sequenceontology.org/browser/current_release/term/${item.accession}`"
                style="text-decoration: none"
                target="_blank"
              >
                {{ item.labelText }}
              </a>
              <span v-else>
                {{ item.labelText }}
              </span>
            </td>
            <td>
              <select
                :id="`variant-consequence-input-source-${item.inputKey}`"
                class="form-select"
                :value="variantConsequences[item.inputKey]"
                @input="
                  variantConsequencesInputHandler(
                    item.inputKey,
                    $event.target.value
                  )
                "
              >
                >
                <option value="">Select</option>
                <option value="inferred">inferred</option>
                <option value="evidence">evidence</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
