<script>
import { VariantTypesAttribs } from "../../utility/CurationConstants.js";
import ToolTip from "../tooltip/ToolTip.vue";
export default {
  props: {
    pmidList: Array,
    variantTypes: Object,
  },
  emits: ["updateVariantTypes"],
  components: { ToolTip },
  methods: {
    variantTypesSingleCheckboxHandler(
      primaryType,
      secondaryType,
      key,
      checked,
    ) {
      let updatedVariantTypes = { ...this.variantTypes };
      if (checked) {
        updatedVariantTypes[primaryType][secondaryType][key] = true;
      } else {
        updatedVariantTypes[primaryType][secondaryType][key] = false;
      }
      this.$emit("updateVariantTypes", updatedVariantTypes);
    },
    variantTypesMultiCheckboxHandler(
      primaryType,
      secondaryType,
      key,
      checked,
      value,
    ) {
      let updatedVariantTypes = { ...this.variantTypes };
      if (checked) {
        updatedVariantTypes[primaryType][secondaryType][key].push(value);
      } else {
        updatedVariantTypes[primaryType][secondaryType][key].splice(
          updatedVariantTypes[primaryType][secondaryType][key].indexOf(value),
          1,
        );
      }
      this.$emit("updateVariantTypes", updatedVariantTypes);
    },
    variantTypesInputHandler(primaryType, secondaryType, key, inputValue) {
      let updatedVariantTypes = { ...this.variantTypes };
      updatedVariantTypes[primaryType][secondaryType][key] = inputValue;
      this.$emit("updateVariantTypes", updatedVariantTypes);
    },
  },
  data() {
    return {
      variantTypesAttribs: [...VariantTypesAttribs],
    };
  },
  computed: {
    hasPublications() {
      return this.pmidList?.length > 0;
    },
  },
};
</script>
<template>
  <div class="row g-3 px-3 pt-3">
    <div class="col-12"><h5>Variant Types</h5></div>
    <div class="col-12" v-if="!hasPublications">
      <div class="alert alert-warning mb-0" role="alert">
        <i class="bi bi-exclamation-circle-fill"></i>
        Please enter at least one publication to select supporting papers for
        <strong>Variant Types</strong>.
      </div>
    </div>
    <div class="col-12">
      <table class="table">
        <!-- sticky header is collapsing the borders so a border styling fix is made in the style section below -->
        <thead class="sticky-top">
          <tr>
            <th>Types</th>
            <th>De Novo</th>
            <th>Inherited</th>
            <th>Unknown Inheritance</th>
            <th v-if="hasPublications">Supporting Papers</th>
            <th>
              Comment (Private
              <ToolTip
                toolTipText="This comment will only be visible to logged-in users"
              />)
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in variantTypesAttribs">
            <tr>
              <td>
                <strong>{{ item.primaryType.labelText }}</strong>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td v-if="hasPublications"></td>
              <td></td>
            </tr>
            <tr v-for="secondaryTypeItem in item.secondaryType">
              <td>{{ secondaryTypeItem.labelText }}</td>
              <td class="text-center">
                <input
                  type="checkbox"
                  class="form-check-input custom-checkbox-border-color"
                  :id="`input-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-de_novo`"
                  :checked="
                    variantTypes[item.primaryType.inputKey][
                      secondaryTypeItem.inputKey
                    ].de_novo
                  "
                  @input="
                    variantTypesSingleCheckboxHandler(
                      item.primaryType.inputKey,
                      secondaryTypeItem.inputKey,
                      'de_novo',
                      $event.target.checked,
                    )
                  "
                />
              </td>
              <td class="text-center">
                <input
                  type="checkbox"
                  class="form-check-input custom-checkbox-border-color"
                  :id="`input-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-inherited`"
                  :checked="
                    variantTypes[item.primaryType.inputKey][
                      secondaryTypeItem.inputKey
                    ].inherited
                  "
                  @input="
                    variantTypesSingleCheckboxHandler(
                      item.primaryType.inputKey,
                      secondaryTypeItem.inputKey,
                      'inherited',
                      $event.target.checked,
                    )
                  "
                />
              </td>
              <td class="text-center">
                <input
                  type="checkbox"
                  class="form-check-input custom-checkbox-border-color"
                  :id="`input-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-unknown_inheritance`"
                  :checked="
                    variantTypes[item.primaryType.inputKey][
                      secondaryTypeItem.inputKey
                    ].unknown_inheritance
                  "
                  @input="
                    variantTypesSingleCheckboxHandler(
                      item.primaryType.inputKey,
                      secondaryTypeItem.inputKey,
                      'unknown_inheritance',
                      $event.target.checked,
                    )
                  "
                />
              </td>
              <td v-if="hasPublications">
                <div
                  v-for="pmid in pmidList"
                  :key="pmid"
                  class="form-check ms-2"
                >
                  <input
                    class="form-check-input custom-checkbox-border-color"
                    type="checkbox"
                    :id="`input-${pmid}-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-supporting_papers`"
                    :checked="
                      variantTypes[item.primaryType.inputKey][
                        secondaryTypeItem.inputKey
                      ].supporting_papers.includes(pmid)
                    "
                    @input="
                      variantTypesMultiCheckboxHandler(
                        item.primaryType.inputKey,
                        secondaryTypeItem.inputKey,
                        'supporting_papers',
                        $event.target.checked,
                        pmid,
                      )
                    "
                  />
                  <label
                    class="form-check-label"
                    :for="`input-${pmid}-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-supporting_papers`"
                  >
                    {{ pmid }}
                  </label>
                </div>
              </td>
              <td>
                <textarea
                  class="form-control"
                  :id="`input-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-comment`"
                  rows="2"
                  :value="
                    variantTypes[item.primaryType.inputKey][
                      secondaryTypeItem.inputKey
                    ].comment
                  "
                  @input="
                    variantTypesInputHandler(
                      item.primaryType.inputKey,
                      secondaryTypeItem.inputKey,
                      'comment',
                      $event.target.value,
                    )
                  "
                >
                </textarea>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped>
/* Border styling fix for sticky header - START */
table {
  border-collapse: separate; /* Does not collapse border */
  border-spacing: 0;
  width: 100%;
}

table th {
  /* Apply top and bottom borders */
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
  /* Keep header text on one line */
  white-space: nowrap;
}

table td {
  /* Apply bottom and right borders */
  border-bottom: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
}

table th:first-child,
table td:first-child {
  /* Apply left border to first <td> and first <th> of every row */
  border-left: 1px solid #dee2e6;
}
/* Border styling fix for sticky header - END */

.custom-checkbox-border-color {
  border: 1px solid rgba(0, 0, 0, 0.5);
}
</style>
