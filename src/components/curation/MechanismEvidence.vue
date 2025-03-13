<script>
import { EvidenceTypesAttribs } from "../../utility/CurationConstants";
import kebabCase from "lodash/kebabCase";
export default {
  props: {
    molecularMechanismSupport: String,
    mechanismSynopsisSupport: String,
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
    kebabCase,
  },
  data() {
    return {
      evidenceTypesAttribs: [...EvidenceTypesAttribs],
    };
  },
  computed: {
    isDisplayPublicationWarning() {
      return (
        !(
          this.mechanismEvidence &&
          Object.keys(this.mechanismEvidence).length > 0
        ) && this.molecularMechanismSupport === "evidence"
      );
    },
    isDisplayEvidenceForm() {
      return (
        this.mechanismEvidence &&
        Object.keys(this.mechanismEvidence).length > 0 &&
        this.molecularMechanismSupport === "evidence"
      );
    },
  },
};
</script>
<template>
  <div class="row g-3 px-3 pt-3" v-if="isDisplayPublicationWarning">
    <p>
      <i class="bi bi-info-circle"></i> Please enter Publication(s) to provide
      information on evidence.
    </p>
  </div>
  <div v-if="isDisplayEvidenceForm">
    <div class="row g-3 px-3 pt-3">
      <h5>Evidence</h5>
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
        >
        </textarea>
      </div>
    </div>
  </div>
</template>
