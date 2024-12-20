<script>
import LoginErrorAlert from "../alert/LoginErrorAlert.vue";
import {
  isUserLoggedIn,
  logOutUser,
  appendAuthenticationHeaders,
} from "../../utility/AuthenticationUtility";
import {
  EvidenceTypesAttribs,
  MechanismAttribs,
  MechanismSupportAttribs,
  MechanismSynopsisAttribs,
} from "../../utility/CurationConstants";
import { UPDATE_MECHANISM_URL } from "../../utility/UrlConstants";
import cloneDeep from "lodash/cloneDeep";
import kebabCase from "lodash/kebabCase";
import ToolTip from "../tooltip/ToolTip.vue";

export default {
  props: {
    stableId: String,
    currentPublications: Array,
    currentMechanism: Object,
  },
  components: {
    LoginErrorAlert,
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
      isLogInSessionExpired: false,
      isUpdateApiCallLoading: false,
      updateMechanismErrorMsg: null,
      isUpdateMechanismSuccess: false,
      updateMechanismSuccessMsg: null,
      mechanismAttribs: [...MechanismAttribs],
      mechanismSynopsisAttribs: [...MechanismSynopsisAttribs],
      mechanismSupportAttribs: [...MechanismSupportAttribs],
      evidenceTypesAttribs: [...EvidenceTypesAttribs],
    };
  },
  methods: {
    updateMechanism() {
      if (!isUserLoggedIn()) {
        logOutUser();
        this.isLogInSessionExpired = true;
        return;
      }

      this.updateMechanismErrorMsg = this.updateMechanismSuccessMsg = null;
      this.isUpdateMechanismSuccess = false;
      this.isUpdateApiCallLoading = true;

      const requestBody = this.prepareInputForDataSubmission();
      let responseStatus = null;
      let apiHeaders = appendAuthenticationHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
      });
      fetch(UPDATE_MECHANISM_URL.replace(":stableid", this.stableId), {
        method: "PATCH",
        body: JSON.stringify(requestBody),
        headers: apiHeaders,
      })
        .then((response) => {
          responseStatus = response.status;
          return response.json();
        })
        .then((responseJson) => {
          this.isUpdateApiCallLoading = false;
          if (responseStatus === 200) {
            this.isUpdateMechanismSuccess = true;
            this.updateMechanismSuccessMsg = responseJson.message;
          } else {
            let errorMsg =
              "Unable to update mechanism. Please try again later.";
            if (responseJson.error) {
              errorMsg =
                "Unable to update mechanism. Error: " + responseJson.error;
            }
            this.updateMechanismErrorMsg = errorMsg;
            console.log(errorMsg);
          }
        })
        .catch((error) => {
          this.isUpdateApiCallLoading = false;
          this.updateMechanismErrorMsg =
            "Unable to update mechanism. Please try again later.";
          console.log(error);
        });
    },
    getInitialMechanismEvidence(publications) {
      let initialMechanismEvidence = {};

      if (publications && publications.length > 0) {
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
      // convert mechanismEvidence from object to array of objects and include evidence that have non empty description or non empty evidence types
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
        if (
          valueObj.description.trim() !== "" ||
          evidenceTypesArray.length > 0
        ) {
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
        preparedInput.mechanism_synopsis = {
          name: this.mechanismSynopsis,
          support: this.mechanismSynopsisSupport,
        };
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
        this.mechanismEvidence &&
        Object.keys(this.mechanismEvidence).length > 0 &&
        this.mechanismSupport === "evidence" &&
        this.currentMechanism?.mechanism_support === "inferred"
      );
    },
    isDisplayPublicationWarning() {
      return (
        !(
          this.mechanismEvidence &&
          Object.keys(this.mechanismEvidence).length > 0
        ) &&
        this.mechanismSupport === "evidence" &&
        this.currentMechanism?.mechanism_support === "inferred"
      );
    },
    isDisplayCurrentCategorization() {
      return (
        this.currentMechanism?.synopsis &&
        this.currentMechanism.synopsis.length > 0
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
                      toolTipText="To change Mechanism, please contact Admin at g2p-help@ebi.ac.uk"
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
                    v-model="mechanismSupport"
                    :disabled="!canUpdateMechanismSourceInput"
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
                    v-model="mechanismSynopsis"
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
                    v-model="mechanismSynopsisSupport"
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
              <div
                v-if="isDisplayCurrentCategorization"
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
                      Current Categorization ({{
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
                            <th>Categorization</th>
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
              <div v-if="isDisplayEvidenceForm">
                <h5 class="mb-0">Evidence</h5>
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
                        v-model="mechanismEvidence[pmid].description"
                      >
                      </textarea>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="isDisplayPublicationWarning">
                <i class="bi bi-info-circle"></i> Please add atleast 1
                Publication to provide information on evidence.
              </p>
              <button
                type="button"
                class="btn btn-primary"
                @click="updateMechanism"
                v-else
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
            <LoginErrorAlert v-if="isLogInSessionExpired" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
