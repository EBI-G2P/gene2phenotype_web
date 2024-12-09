<script>
import ToolTip from "../tooltip/ToolTip.vue";
import {
  EvidenceTypesAttribs,
  MechanismAttribs,
  MechanismSupportAttribs,
  MechanismSynopsisAttribs,
} from "../../utility/CurationConstants";
import kebabCase from "lodash/kebabCase";
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
    };
  },
  computed: {
    canUpdateMechanism() {
      return (
        this.currentMechanism?.mechanism === "undetermined" &&
        this.currentMechanism?.support === "inferred"
      );
    },
    isDisplayNewEvidenceForm() {
      return (
        this.mechanismEvidence &&
        Object.keys(this.mechanismEvidence).length > 0 &&
        this.molecularMechanismSupport === "evidence"
      );
    },
    isDisplayCurrentEvidence() {
      return (
        this.currentMechanism?.evidence &&
        Object.keys(this.currentMechanism.evidence).length > 0
      );
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
            <div v-if="canUpdateMechanism" class="mt-0">
              <div class="row pt-3">
                <div class="col-lg-2">
                  <label for="mechanism-input" class="col-form-label">
                    Mechanism
                    <ToolTip
                      toolTipText="Mechanism can only be updated if it is 'undetermined'."
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
                  >
                    <option value="">Select</option>
                    <option v-for="item in mechanismAttribs" :value="item">
                      {{ item }}
                    </option>
                  </select>
                </div>
                <div class="col-xl-3 col-lg-3 col-6">
                  <select
                    id="mechanism-input-source"
                    class="form-select"
                    :value="molecularMechanismSupport"
                    @input="
                      $emit(
                        'update:molecularMechanismSupport',
                        $event.target.value
                      )
                    "
                  >
                    <option value="">Select Source</option>
                    <option
                      v-for="item in mechanismSupportAttribs"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </select>
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
                    class="form-select"
                    :value="mechanismSynopsis"
                    @input="
                      $emit('update:mechanismSynopsis', $event.target.value)
                    "
                  >
                    <option value="">Select</option>
                    <option
                      v-for="item in mechanismSynopsisAttribs"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </select>
                </div>
                <div class="col-xl-3 col-lg-3 col-6">
                  <select
                    id="categorisation-input-source"
                    class="form-select"
                    :value="mechanismSynopsisSupport"
                    @input="
                      $emit(
                        'update:mechanismSynopsisSupport',
                        $event.target.value
                      )
                    "
                  >
                    <option value="">Select Source</option>
                    <option
                      v-for="item in mechanismSupportAttribs"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div v-else>
              <p>
                <b>Mechanism:</b>
                {{ currentMechanism?.mechanism || "Not Available" }}
                <span v-if="currentMechanism?.support === 'inferred'">
                  ({{ currentMechanism.support }})
                </span>
              </p>
              <p class="mb-0">
                <b>Categorisation:</b>
                {{ currentMechanism?.synopsis || "Not Available" }}
                <span v-if="currentMechanism?.synopsis_support === 'inferred'">
                  ({{ currentMechanism.synopsis_support }})
                </span>
              </p>
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
                          <th>Evidence Types</th>
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
                                  secondaryEvidenceTypeArray &&
                                  secondaryEvidenceTypeArray.length > 0
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
                <h5 class="mb-0">Evidence for new Publication(s)</h5>
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
                  <div class="row mt-2 w-50">
                    <label
                      :for="`evidence-type-input-${pmid}-description`"
                      class="col-form-label col-lg-3"
                    >
                      Description
                    </label>
                    <div class="col-lg-9">
                      <textarea
                        class="form-control"
                        :id="`evidence-type-input-${pmid}-description`"
                        rows="3"
                        :value="mechanismEvidence[pmid].description"
                        @input="
                          mechanismEvidenceInputHandler(
                            pmid,
                            $event.target.value
                          )
                        "
                      >
                      </textarea>
                    </div>
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
