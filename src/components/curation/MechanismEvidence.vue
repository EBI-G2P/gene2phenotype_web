<script>
import { EvidenceTypesAttribs } from "../../utility/CurationConstants.js";
import kebabCase from "lodash/kebabCase";
export default {
  props: {
    molecularMechanismSupport: String,
    mechanismEvidence: Object,
  },
  emits: ["updateMechanismEvidence"],
  methods: {
    mechanismEvidenceCheckboxHandler(key, pmid, checked, value) {
      let updatedMechanismEvidence = { ...this.mechanismEvidence };
      if (checked) {
        updatedMechanismEvidence[pmid].evidence_types[key].push(value);
      } else {
        const indexToBeRemoved =
          updatedMechanismEvidence[pmid].evidence_types[key].indexOf(value);
        updatedMechanismEvidence[pmid].evidence_types[key].splice(
          indexToBeRemoved,
          1
        );
      }
      this.$emit("updateMechanismEvidence", updatedMechanismEvidence);
    },
    mechanismEvidenceInputHandler(pmid, inputValue) {
      let updatedMechanismEvidence = { ...this.mechanismEvidence };
      updatedMechanismEvidence[pmid].description = inputValue;
      this.$emit("updateMechanismEvidence", updatedMechanismEvidence);
    },
    isDisableEvidenceDescription(pmid) {
      EvidenceTypesAttribs.forEach((item) => {
        if (
          this.mechanismEvidence[pmid].evidence_types[item.primaryType].length >
          0
        ) {
          return false;
        }
      });
      return true;
    },
    kebabCase,
  },
  data() {
    return {
      evidenceTypesAttribs: [...EvidenceTypesAttribs],
    };
  },
  computed: {
    isDisplayEvidenceForm() {
      return (
        this.mechanismEvidence && Object.keys(this.mechanismEvidence).length > 0
      );
    },
  },
};
</script>
<template>
  <div v-if="isDisplayEvidenceForm">
    <div class="row g-3 px-3 pt-3">
      <h5>Functional Studies</h5>
    </div>
    <div
      class="row g-3 px-3 py-3"
      v-for="pmid in Object.keys(mechanismEvidence)"
    >
      <div class="col-12">
        <h6>Publication (PMID: {{ pmid }})</h6>
      </div>
      <div class="col-12">
        <ul style="list-style: none; padding-left: 0">
          <li v-for="item in evidenceTypesAttribs">
            {{ item.primaryType }}
            <ul style="list-style: none">
              <li v-for="secondaryTypeItem in item.secondaryType">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`evidence-type-input-${pmid}-${kebabCase(
                      item.primaryType
                    )}-${kebabCase(secondaryTypeItem)}`"
                    :checked="
                      mechanismEvidence[pmid].evidence_types[
                        item.primaryType
                      ].includes(secondaryTypeItem)
                    "
                    @input="
                      mechanismEvidenceCheckboxHandler(
                        item.primaryType,
                        pmid,
                        $event.target.checked,
                        secondaryTypeItem
                      )
                    "
                  />
                  <label
                    class="form-check-label"
                    :for="`evidence-type-input-${pmid}-${kebabCase(
                      item.primaryType
                    )}-${kebabCase(secondaryTypeItem)}`"
                  >
                    {{ secondaryTypeItem }}
                  </label>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <p
        v-if="
          Object.values(mechanismEvidence[pmid].evidence_types).every(
            (arr) => arr.length === 0
          ) && mechanismEvidence[pmid].description.length === 0
        "
        class="m-0"
      >
        <i class="bi bi-info-circle"></i> Please select functional studies to
        enter the description.
      </p>
      <p
        v-if="
          Object.values(mechanismEvidence[pmid].evidence_types).every(
            (arr) => arr.length === 0
          ) && mechanismEvidence[pmid].description.length > 0
        "
        class="m-0"
      >
        <i class="bi bi-info-circle"></i> Please select functional studies to
        save the description.
      </p>
      <div class="mt-2">
        <label
          :for="`evidence-type-input-${pmid}-description`"
          class="form-label"
        >
          Description
        </label>
        <textarea
          class="form-control"
          :id="`evidence-type-input-${pmid}-description`"
          rows="3"
          :value="mechanismEvidence[pmid].description"
          @input="mechanismEvidenceInputHandler(pmid, $event.target.value)"
          :disabled="
            Object.values(mechanismEvidence[pmid].evidence_types).every(
              (arr) => arr.length === 0
            )
          "
        >
        </textarea>
      </div>
    </div>
  </div>
  <div class="row g-3 px-3 pt-3" v-else>
    <p>
      <i class="bi bi-info-circle"></i> Please enter Publication(s) to provide
      information on functional studies.
    </p>
  </div>
</template>
