<script>
import {
  EvidenceTypesAttribs,
  MechanismAttribs,
  MechanismSupportAttribs,
  MechanismSynopsisAttribs,
} from "../../utility/CurationConstants.js";
import {
  EUROPE_PMC_URL,
  UPDATE_MECHANISM_URL,
} from "../../utility/UrlConstants.js";
import cloneDeep from "lodash/cloneDeep";
import kebabCase from "lodash/kebabCase";
import ToolTip from "../tooltip/ToolTip.vue";
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";
import api from "../../services/api.js";
import { HELP_TEXT } from "../../utility/Constants.js";

export default {
  props: {
    stableId: String,
    currentPublications: Array,
    currentMechanism: Object,
  },
  components: {
    ToolTip,
  },
  data() {
    return {
      mechanism: this.currentMechanism?.mechanism ?? "", // if mechanism is null or undefined then it will set the value as empty string
      mechanismSupport: this.currentMechanism?.mechanism_support ?? "", // if mechanism_support is null or undefined then it will set the value as empty string
      mechanismSynopsis: "",
      mechanismSynopsisSupport: "",
      mechanismEvidence: this.getInitialMechanismEvidence(
        this.currentPublications
      ),
      isUpdateApiCallLoading: false,
      updateMechanismErrorMsg: null,
      isUpdateMechanismSuccess: false,
      updateMechanismSuccessMsg: null,
      mechanismAttribs: [...MechanismAttribs],
      mechanismSynopsisAttribs: [...MechanismSynopsisAttribs],
      mechanismSupportAttribs: [...MechanismSupportAttribs],
      evidenceTypesAttribs: [...EvidenceTypesAttribs],
      HELP_TEXT,
      EUROPE_PMC_URL,
    };
  },
  methods: {
    updateMechanism() {
      this.updateMechanismErrorMsg = this.updateMechanismSuccessMsg = null;
      this.isUpdateMechanismSuccess = false;
      this.isUpdateApiCallLoading = true;
      const requestBody = this.prepareInputForDataSubmission();
      api
        .patch(
          UPDATE_MECHANISM_URL.replace(":stableid", this.stableId),
          requestBody
        )
        .then((response) => {
          this.isUpdateMechanismSuccess = true;
          this.updateMechanismSuccessMsg = response.data.message;
        })
        .catch((error) => {
          this.updateMechanismErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to update mechanism. Please try again later.",
            "Unable to update mechanism."
          );
        })
        .finally(() => {
          this.isUpdateApiCallLoading = false;
        });
    },
    getInitialMechanismEvidence(publications) {
      let initialMechanismEvidence = {};

      if (publications?.length > 0) {
        let evidenceTypesObj = {};
        EvidenceTypesAttribs.forEach((item) => {
          evidenceTypesObj[item.primaryType] = [];
        });
        publications.forEach((publicationItem) => {
          if (publicationItem?.publication?.pmid) {
            initialMechanismEvidence[publicationItem.publication.pmid] = {
              description: "",
              evidence_types: cloneDeep(evidenceTypesObj),
            };
          }
        });
      }

      return initialMechanismEvidence;
    },
    prepareInputForDataSubmission() {
      let preparedInput = {};

      // convert mechanismEvidence from object to array of objects and include evidence that have non empty evidence types
      let mechanismEvidenceArray = [];
      for (const [publicationPmid, valueObj] of Object.entries(
        this.mechanismEvidence
      )) {
        let evidenceTypesArray = [];
        for (const [primaryType, secondaryTypesArray] of Object.entries(
          valueObj.evidence_types
        )) {
          if (secondaryTypesArray.length > 0) {
            let evidenceTypeObj = {
              primary_type: primaryType,
              secondary_type: secondaryTypesArray,
            };
            evidenceTypesArray.push(evidenceTypeObj);
          }
        }
        // IF evidenceTypesArray is not empty THEN include it in mechanismEvidenceArray
        if (evidenceTypesArray.length > 0) {
          let mechanismEvidenceObj = {
            pmid: publicationPmid,
            description: valueObj.description.trim(), // trim description value
            evidence_types: evidenceTypesArray,
          };
          mechanismEvidenceArray.push(mechanismEvidenceObj);
        }
      }
      // IF mechanismEvidenceArray is not empty THEN include it in preparedInput object
      if (mechanismEvidenceArray.length > 0) {
        preparedInput.mechanism_evidence = mechanismEvidenceArray;
      }

      // IF mechanism or mechanismSupport is updated THEN include molecular_mechanism in preparedInput object
      if (this.isMechanismUpdated() || this.isMechanismSupportUpdated()) {
        preparedInput.molecular_mechanism = {
          name: this.isMechanismUpdated() ? this.mechanism : "",
          support: this.mechanismSupport,
        };
      }

      // IF mechanismSynopsis or mechanismSynopsisSupport is updated THEN include mechanism_synopsis in preparedInput object
      if (this.isMechanismSynopsisUpdated()) {
        // TODO: Code changes to support multiple mechanism synopsis input
        preparedInput.mechanism_synopsis = [
          {
            name: this.mechanismSynopsis,
            support: this.mechanismSynopsisSupport,
          },
        ];
      }
      return preparedInput;
    },
    isMechanismUpdated() {
      const currentMechanism = this.currentMechanism.mechanism ?? ""; // if mechanism is null or undefined then it will set the value as empty string
      const newMechanism = this.mechanism;

      return newMechanism !== currentMechanism;
    },
    isMechanismSupportUpdated() {
      const currentMechanismSupport =
        this.currentMechanism.mechanism_support ?? ""; // if mechanism_support is null or undefined then it will set the value as empty string
      const newMechanismSupport = this.mechanismSupport;

      return newMechanismSupport !== currentMechanismSupport;
    },
    isMechanismSynopsisUpdated() {
      const newSynopsis = this.mechanismSynopsis;
      const newSynopsisSupport = this.mechanismSynopsisSupport;

      return newSynopsis !== "" || newSynopsisSupport !== "";
    },
    kebabCase,
  },
  computed: {
    canUpdateMechanismInput() {
      return this.currentMechanism?.mechanism === "undetermined";
    },
    canUpdateMechanismSourceInput() {
      return this.currentMechanism?.mechanism_support === "inferred";
    },
    isDisplayEvidenceForm() {
      return (
        this.mechanismEvidence && Object.keys(this.mechanismEvidence).length > 0
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
    mechanismSupportErrorMsg() {
      // Following condition will return an error message:
      // 1. mechanismSupport is set to 'evidence' and mechanism is set to 'undetermined'

      if (
        this.mechanismSupport === "evidence" &&
        this.mechanism === "undetermined"
      ) {
        return `Mechanism source can not be set to '${this.mechanismSupport}' for 'undetermined' Mechanism`;
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
      // 2. mechanismSynopsisSupport is set to 'evidence' and mechanismSupport is set to 'inferred'

      if (!this.mechanismSynopsisSupport && this.mechanismSynopsis) {
        return "Select source";
      } else if (
        this.mechanismSynopsisSupport === "evidence" &&
        this.mechanismSupport === "inferred"
      ) {
        return "Categorisation source can not be set to 'evidence' if Mechanism source is 'inferred'";
      }
      return null;
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="update-mechanism-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#update-mechanism-section-body"
          aria-expanded="false"
          aria-controls="update-mechanism-section-body"
        >
          Mechanism
          <span
            class="badge rounded-pill text-bg-success mx-2"
            v-if="isUpdateMechanismSuccess"
          >
            <i class="bi bi-check-circle-fill"></i> Updated
          </span>
        </button>
      </h2>
      <div
        id="update-mechanism-section-body"
        class="accordion-collapse collapse"
      >
        <div class="accordion-body">
          <div class="row g-3 p-2">
            <h5>Mechanism</h5>
            <div
              v-if="isUpdateApiCallLoading"
              class="d-flex justify-content-center"
              style="margin-top: 122px; margin-bottom: 122px"
            >
              <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div
              class="alert alert-success mt-3"
              role="alert"
              v-else-if="isUpdateMechanismSuccess"
            >
              <div>
                <i class="bi bi-check-circle-fill"></i>
                {{ updateMechanismSuccessMsg }}
              </div>
            </div>
            <div v-else>
              <div class="row">
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
                    v-model="mechanism"
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
                      mechanismSupportErrorMsg
                        ? 'form-select is-invalid'
                        : 'form-select'
                    "
                    v-model="mechanismSupport"
                    :disabled="!canUpdateMechanismSourceInput"
                    aria-describedby="invalid-mechanism-input-source-feedback"
                  >
                    <option value="" disabled>Select Source</option>
                    <option
                      v-for="item in mechanismSupportAttribs"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </select>
                  <div
                    id="invalid-mechanism-input-source-feedback"
                    class="invalid-feedback"
                  >
                    {{ mechanismSupportErrorMsg }}
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
                    v-model="mechanismSynopsis"
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
                    v-model="mechanismSynopsisSupport"
                    aria-describedby="invalid-categorisation-input-source-feedback"
                  >
                    <option value="">Select Source</option>
                    <option
                      v-for="item in mechanismSupportAttribs"
                      :value="item"
                    >
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
                class="accordion accordion-flush pb-3"
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
                class="accordion accordion-flush pb-3"
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
                            <th>Publication</th>
                            <th>Functional Studies</th>
                            <th>Descriptions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(value, key) in currentMechanism.evidence">
                            <td>
                              <a
                                :href="EUROPE_PMC_URL + key"
                                style="text-decoration: none"
                                target="_blank"
                              >
                                {{ key }}
                              </a>
                            </td>
                            <td class="ps-0">
                              <ul
                                v-if="
                                  Object.keys(value?.functional_studies || {})
                                    .length > 0
                                "
                                class="mb-0"
                              >
                                <li
                                  v-for="(
                                    secondaryEvidenceTypeArray,
                                    primaryEvidenceType
                                  ) in value.functional_studies"
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
                            <td class="ps-0">
                              <ul
                                v-if="value?.descriptions?.length > 0"
                                class="mb-0"
                              >
                                <li v-for="item in value.descriptions">
                                  {{ item }}
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
              <div v-if="isDisplayEvidenceForm">
                <h5 class="mb-0">Functional Studies</h5>
                <div
                  class="pt-3 pb-4"
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
                                v-model="
                                  mechanismEvidence[pmid].evidence_types[
                                    item.primaryType
                                  ]
                                "
                                :value="secondaryTypeItem"
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
                      Object.values(
                        mechanismEvidence[pmid].evidence_types
                      ).every((arr) => arr.length === 0) &&
                      mechanismEvidence[pmid].description.length === 0
                    "
                    class="m-0"
                  >
                    <i class="bi bi-info-circle"></i> Please select functional
                    studies to enter the description.
                  </p>
                  <p
                    v-if="
                      Object.values(
                        mechanismEvidence[pmid].evidence_types
                      ).every((arr) => arr.length === 0) &&
                      mechanismEvidence[pmid].description.length > 0
                    "
                    class="m-0"
                  >
                    <i class="bi bi-info-circle"></i> Please select functional
                    studies to save the description.
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
                      v-model="mechanismEvidence[pmid].description"
                      :disabled="
                        Object.values(
                          mechanismEvidence[pmid].evidence_types
                        ).every((arr) => arr.length === 0)
                      "
                    >
                    </textarea>
                  </div>
                </div>
              </div>
              <p v-else>
                <i class="bi bi-info-circle"></i> Please add atleast 1
                Publication to provide information on functional studies.
              </p>
              <button
                type="button"
                class="btn btn-primary"
                @click="updateMechanism"
              >
                <i class="bi bi-pencil-square"></i> Update mechanism
              </button>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-if="updateMechanismErrorMsg"
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ updateMechanismErrorMsg }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
