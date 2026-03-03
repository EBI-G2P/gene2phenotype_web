<script>
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
import { VariantTypesAttribs } from "../../utility/CurationConstants.js";
import ToolTip from "../tooltip/ToolTip.vue";
export default {
  props: {
    pmidList: Array,
    variantTypes: Object,
    currentVariantTypes: Array,
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
      EUROPE_PMC_URL,
    };
  },
};
</script>
<template>
  <div class="row g-3 px-3 pt-3">
    <h5>Variant Types</h5>
    <div
      v-if="currentVariantTypes?.length > 0"
      class="accordion accordion-flush"
      id="accordionVariantTypes"
    >
      <div class="accordion-item">
        <h2 class="accordion-header border">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapsibleVariantTypesTable"
            aria-expanded="false"
            aria-controls="collapsibleVariantTypesTable"
          >
            Current Variant Types ({{ currentVariantTypes.length }})
          </button>
        </h2>
        <div
          id="collapsibleVariantTypesTable"
          class="accordion-collapse collapse"
          data-bs-parent="#accordionVariantTypes"
        >
          <div class="accordion-body p-0">
            <table class="table table-bordered mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Inheritance</th>
                  <th>Publications</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in currentVariantTypes" :key="item.accession">
                  <td>
                    <a
                      v-if="item.accession"
                      :href="`http://www.sequenceontology.org/browser/current_release/term/${item.accession}`"
                      style="text-decoration: none"
                      target="_blank"
                    >
                      {{ item.term }}
                    </a>
                    <span v-else>{{ item.term }}</span>
                  </td>
                  <td>
                    <ul
                      v-if="
                        item.de_novo ||
                        item.inherited ||
                        item.unknown_inheritance
                      "
                      class="mb-0 ps-3"
                    >
                      <li v-if="item.de_novo">De Novo</li>
                      <li v-if="item.inherited">Inherited</li>
                      <li v-if="item.unknown_inheritance">
                        Unknown Inheritance
                      </li>
                    </ul>
                  </td>
                  <td>
                    <span v-if="item.publications?.length > 0">
                      <span
                        v-for="(pmid, index) in item.publications"
                        :key="pmid"
                      >
                        <span v-if="index < item.publications.length - 1">
                          <a
                            :href="EUROPE_PMC_URL + pmid"
                            style="text-decoration: none"
                            target="_blank"
                          >
                            {{ pmid }}
                          </a>
                          ,
                        </span>
                        <a
                          v-else
                          :href="EUROPE_PMC_URL + pmid"
                          style="text-decoration: none"
                          target="_blank"
                        >
                          {{ pmid }}
                        </a>
                      </span>
                    </span>
                  </td>
                  <td>
                    <ul v-if="item.comments?.length > 0" class="mb-0 ps-3">
                      <li
                        v-for="commentItem in item.comments"
                        :key="commentItem.text"
                      >
                        {{ commentItem.text }} ({{ commentItem.date }})
                      </li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="mb-0">
      <i class="bi bi-info-circle"></i> No Variant Types available for this
      record.
    </p>
    <h5>Variant Types for new Publication(s)</h5>
    <div class="col-12">
      <table class="table">
        <!-- sticky header is collapsing the borders so a border styling fix is made in the style section below -->
        <thead class="sticky-top">
          <tr>
            <th>Types</th>
            <th>De Novo</th>
            <th>Inherited</th>
            <th>Unknown Inheritance</th>
            <th>Supporting Papers</th>
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
              <td></td>
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
              <td>
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
