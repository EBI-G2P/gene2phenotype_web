<script>
import { VariantConsequencesAttribs } from "../../utility/CurationConstants";
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
    variantConsequenceCssClass(hierarchyLevel) {
      if (hierarchyLevel === 1) {
        return "text-start";
      } else if (hierarchyLevel === 2) {
        return "text-center";
      } else if (hierarchyLevel === 3) {
        return "text-end";
      }
      return "text-start";
    },
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
    <div class="col-12"><h5>Variant Consequences</h5></div>
    <div class="col-12">
      <table style="width: 70%" class="table table-bordered">
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
          <tr v-for="item in variantConsequencesAttribs">
            <td :class="variantConsequenceCssClass(item.hierarchyLevel)">
              {{ item.labelText }}
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
