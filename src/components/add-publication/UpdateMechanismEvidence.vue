<script>
import ToolTip from "../tooltip/ToolTip.vue";
import {
  EvidenceTypesAttribs,
  MechanismAttribs,
  MechanismSupportAttribs,
  MechanismSynopsisAttribs,
} from "../../utility/CurationConstants.js";
import kebabCase from "lodash/kebabCase";
import { HELP_TEXT } from "../../utility/Constants.js";
export default {
  props: {
    currentMechanism: Object,
    mechanismEvidence: Object,
    molecularMechanism: String,
    molecularMechanismSupport: String,
    mechanismSynopsis: String,
    mechanismSynopsisSupport: String,
  },
  emits: [
    "updateMechanismEvidence",
    "update:molecularMechanism",
    "update:molecularMechanismSupport",
    "update:mechanismSynopsis",
    "update:mechanismSynopsisSupport",
  ],
  components: { ToolTip },
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
      mechanismAttribs: [...MechanismAttribs],
      mechanismSynopsisAttribs: [...MechanismSynopsisAttribs],
      mechanismSupportAttribs: [...MechanismSupportAttribs],
      evidenceTypesAttribs: [...EvidenceTypesAttribs],
      HELP_TEXT,
    };
  },
  computed: {
    canUpdateMechanismInput() {
      return this.currentMechanism?.mechanism === "undetermined";
    },
    canUpdateMechanismSourceInput() {
      return this.currentMechanism?.mechanism_support === "inferred";
    },
    isDisplayNewEvidenceForm() {
      return (
        this.mechanismEvidence &&
        Object.keys(this.mechanismEvidence).length > 0 &&
        this.molecularMechanismSupport === "evidence"
      );
    },
    isDisplayCurrentCategorisation() {
      return this.currentMechanism?.synopsis?.length > 0;
    },
    isDisplayCurrentEvidence() {
      return (
        this.currentMechanism?.evidence &&
        Object.keys(this.currentMechanism.evidence).length > 0
      );
    },
    molecularMechanismSupportErrorMsg() {
      // Following condition will return an error message:
      // 1. molecularMechanismSupport is set to 'evidence' and molecularMechanism is set to 'undetermined'

      if (
        this.molecularMechanismSupport === "evidence" &&
        this.molecularMechanism === "undetermined"
      ) {
        return `Mechanism source can not be set to '${this.molecularMechanismSupport}' for 'undetermined' Mechanism`;
      }
      return null;
    },
    mechanismSynopsisErrorMsg() {
      // Following condition will return an error message:
      // 1. mechanismSynopsis is empty and mechanismSynopsisSupport is defined

      if (!this.mechanismSynopsis && this.mechanismSynopsisSupport) {
        return "Select Categorisation";
      }
      return null;
    },
    mechanismSynopsisSupportErrorMsg() {
      // Any of following conditions will return an error message:
      // 1. mechanismSynopsisSupport is empty and mechanismSynopsis is defined
      // 2. mechanismSynopsisSupport is set to 'evidence' and molecularMechanismSupport is set to 'inferred'

      if (!this.mechanismSynopsisSupport && this.mechanismSynopsis) {
        return "Select source";
      } else if (
        this.mechanismSynopsisSupport === "evidence" &&
        this.molecularMechanismSupport === "inferred"
      ) {
        return "Categorisation source can not be set to 'evidence' if Mechanism source is 'inferred'";
      }
      return null;
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="mechanism-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mechanism-section-body"
          aria-expanded="false"
          aria-controls="mechanism-section-body"
        >
          Mechanism
        </button>
      </h2>
      <div id="mechanism-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <div class="row g-3 px-3 pt-3">
            <div class="row pt-3">
              <div class="col-lg-2">
                <label for="mechanism-input" class="col-form-label">
                  Mechanism
                  <ToolTip
                    v-if="!canUpdateMechanismInput"
                    :toolTipText="HELP_TEXT.CHANGE_MECHANISM"
                  />
                </label>
              </div>
              <div class="col-xl-3 col-lg-3 col-6">
                <select
                  id="mechanism-input"
                  class="form-select"
                  :value="molecularMechanism"
                  @input="
                    $emit('update:molecularMechanism', $event.target.value)
                  "
                  :disabled="!canUpdateMechanismInput"
                >
                  <option value="" disabled>Select</option>
                  <option v-for="item in mechanismAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
              </div>
              <div class="col-xl-3 col-lg-3 col-6">
                <select
                  id="mechanism-input-source"
                  :class="
                    molecularMechanismSupportErrorMsg
                      ? 'form-select is-invalid'
                      : 'form-select'
                  "
                  :value="molecularMechanismSupport"
                  @input="
                    $emit(
                      'update:molecularMechanismSupport',
                      $event.target.value
                    )
                  "
                  :disabled="!canUpdateMechanismSourceInput"
                  aria-describedby="invalid-mechanism-input-source-feedback"
                >
                  <option value="" disabled>Select Source</option>
                  <option v-for="item in mechanismSupportAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
                <div
                  id="invalid-mechanism-input-source-feedback"
                  class="invalid-feedback"
                >
                  {{ molecularMechanismSupportErrorMsg }}
                </div>
              </div>
            </div>
            <div class="row py-3">
              <div class="col-lg-2">
                <label for="categorisation-input" class="col-form-label">
                  Categorisation
                </label>
              </div>
              <div class="col-xl-3 col-lg-3 col-6">
                <select
                  id="categorisation-input"
                  :class="
                    mechanismSynopsisErrorMsg
                      ? 'form-select is-invalid'
                      : 'form-select'
                  "
                  :value="mechanismSynopsis"
                  @input="
                    $emit('update:mechanismSynopsis', $event.target.value)
                  "
                  aria-describedby="invalid-categorisation-input-feedback"
                >
                  <option value="">Select</option>
                  <option
                    v-for="item in mechanismSynopsisAttribs"
                    :value="item"
                  >
                    {{ item }}
                  </option>
                </select>
                <div
                  id="invalid-categorisation-input-feedback"
                  class="invalid-feedback"
                >
                  {{ mechanismSynopsisErrorMsg }}
                </div>
              </div>
              <div class="col-xl-3 col-lg-3 col-6">
                <select
                  id="categorisation-input-source"
                  :class="
                    mechanismSynopsisSupportErrorMsg
                      ? 'form-select is-invalid'
                      : 'form-select'
                  "
                  :value="mechanismSynopsisSupport"
                  @input="
                    $emit(
                      'update:mechanismSynopsisSupport',
                      $event.target.value
                    )
                  "
                  aria-describedby="invalid-categorisation-input-source-feedback"
                >
                  <option value="">Select Source</option>
                  <option v-for="item in mechanismSupportAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
                <div
                  id="invalid-categorisation-input-source-feedback"
                  class="invalid-feedback"
                >
                  {{ mechanismSynopsisSupportErrorMsg }}
                </div>
              </div>
            </div>
            <div
              v-if="isDisplayCurrentCategorisation"
              class="accordion accordion-flush"
              id="accordionMechanismSynopsis"
            >
              <div class="accordion-item">
                <h2 class="accordion-header border">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapsibleMechanismSynopsisTable"
                    aria-expanded="false"
                    aria-controls="collapsibleMechanismSynopsisTable"
                  >
                    Current Categorisation ({{
                      currentMechanism.synopsis.length
                    }})
                  </button>
                </h2>
                <div
                  id="collapsibleMechanismSynopsisTable"
                  class="accordion-collapse collapse"
                  data-bs-parent="#accordionMechanismSynopsis"
                >
                  <div class="accordion-body p-0">
                    <table class="table table-bordered mb-0">
                      <thead>
                        <tr>
                          <th>Categorisation</th>
                          <th>Support</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in currentMechanism.synopsis">
                          <td>
                            {{ item.synopsis }}
                          </td>
                          <td>
                            {{ item.support }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="isDisplayCurrentEvidence"
              class="accordion accordion-flush"
              id="accordionMechanismEvidence"
            >
              <div class="accordion-item">
                <h2 class="accordion-header border">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapsibleMechanismEvidenceTable"
                    aria-expanded="false"
                    aria-controls="collapsibleMechanismEvidenceTable"
                  >
                    Current Mechanism Evidence ({{
                      Object.keys(currentMechanism.evidence).length
                    }})
                  </button>
                </h2>
                <div
                  id="collapsibleMechanismEvidenceTable"
                  class="accordion-collapse collapse"
                  data-bs-parent="#accordionMechanismEvidence"
                >
                  <div class="accordion-body p-0">
                    <table class="table table-bordered mb-0">
                      <thead>
                        <tr>
                          <th>Functional Studies</th>
                          <th>Publication</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(value, key) in currentMechanism.evidence">
                          <td class="ps-0">
                            <ul
                              v-if="value && Object.keys(value).length > 0"
                              class="mb-0"
                            >
                              <li
                                v-for="(
                                  secondaryEvidenceTypeArray,
                                  primaryEvidenceType
                                ) in value"
                              >
                                {{ primaryEvidenceType }} :
                                {{
                                  secondaryEvidenceTypeArray?.length > 0
                                    ? secondaryEvidenceTypeArray.join(", ")
                                    : null
                                }}
                              </li>
                            </ul>
                          </td>
                          <td>
                            <a
                              :href="`https://europepmc.org/article/MED/${key}`"
                              style="text-decoration: none"
                              target="_blank"
                            >
                              {{ key }}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <form>
              <div v-if="isDisplayNewEvidenceForm">
                <h5 class="mb-0">Functional Studies for new Publication(s)</h5>
                <div
                  class="py-3"
                  v-for="pmid in Object.keys(mechanismEvidence)"
                >
                  <div class="col-12">
                    <h6 class="mb-3">Publication (PMID: {{ pmid }})</h6>
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
                      @input="
                        mechanismEvidenceInputHandler(pmid, $event.target.value)
                      "
                    >
                    </textarea>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
