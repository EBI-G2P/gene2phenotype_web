<script>
import { LGD_RECORD_URL, USER_PANELS_URL } from "../utility/UrlConstants.js";
import AddPanelModal from "../components/modal/AddPanelModal.vue";
import { CONFIDENCE_COLOR_MAP, HELP_TEXT } from "../utility/Constants.js";
import UpdateRecordModal from "../components/modal/UpdateRecordModal.vue";
import ToolTip from "../components/tooltip/ToolTip.vue";
import { mapState } from "pinia";
import { useAuthStore } from "../store/auth.js";
import api from "../services/api.js";
import {
  fetchAndLogGeneralErrorMsg,
  logGeneralErrorMsg,
} from "../utility/ErrorUtility.js";

export default {
  data() {
    return {
      isDataLoading: false,
      locusGeneDiseaseData: null,
      errorMsg: null,
      confidenceColorMap: { ...CONFIDENCE_COLOR_MAP },
      isRecordPartOfUserPanels: false,
      stableId: null,
      userPanels: null,
      isPanelDataLoading: false,
      HELP_TEXT,
    };
  },
  components: {
    AddPanelModal,
    UpdateRecordModal,
    ToolTip,
  },
  computed: {
    ...mapState(useAuthStore, ["isAuthenticated"]),
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchRecordData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  methods: {
    fetchRecordData() {
      this.stableId = this.$route.params.stableId;
      this.errorMsg = this.locusGeneDiseaseData = null;
      this.isDataLoading = true;
      api
        .get(LGD_RECORD_URL.replace(":stableid", this.stableId))
        .then((response) => {
          this.locusGeneDiseaseData = response.data;
          if (this.isAuthenticated) {
            this.fetchUserPanels();
          }
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to fetch record data. Please try again later."
          );
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
    fetchUserPanels() {
      this.userPanels = null;
      this.isPanelDataLoading = true;
      api
        .get(USER_PANELS_URL)
        .then((response) => {
          if (response.data?.length > 0) {
            this.userPanels = response.data;
            this.validateIsRecordPartOfUserPanels(
              this.locusGeneDiseaseData?.panels,
              this.userPanels
            );
          }
        })
        .catch((error) => {
          logGeneralErrorMsg(error);
        })
        .finally(() => {
          this.isPanelDataLoading = false;
        });
    },
    validateIsRecordPartOfUserPanels(recordPanels, userPanels) {
      // convert array of objects (name, description) to array of strings (description)
      const userPanelDescriptions = userPanels.map(
        (panelObj) => panelObj.description
      );
      // if any of the user panels exists in the g2p record panels list then true else false
      this.isRecordPartOfUserPanels = recordPanels.some((item) =>
        userPanelDescriptions.includes(item.description)
      );
    },
    refreshPage() {
      this.$router.go(); // refresh current page
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <div
      class="d-flex justify-content-center"
      v-if="isDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-if="errorMsg">
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ errorMsg }}
      </div>
    </div>
    <div v-if="locusGeneDiseaseData">
      <div class="d-flex justify-content-between">
        <div>
          <h2 v-if="locusGeneDiseaseData.disease?.name">
            {{ locusGeneDiseaseData.disease.name }}
          </h2>
          <h2 v-else class="text-muted">Disease Name Not Available</h2>
        </div>
        <button
          class="btn btn-outline-primary"
          data-bs-toggle="modal"
          data-bs-target="#add-panel-modal"
          v-if="
            !isPanelDataLoading &&
            userPanels?.length > 0 &&
            isAuthenticated &&
            !isRecordPartOfUserPanels
          "
        >
          <i class="bi bi-plus-circle-fill"></i> Add to another panel
        </button>
        <button
          class="btn btn-outline-primary"
          data-bs-toggle="modal"
          data-bs-target="#update-record-modal"
          v-if="
            !isPanelDataLoading && isAuthenticated && isRecordPartOfUserPanels
          "
        >
          <i class="bi bi-pencil-square"></i> Update record
        </button>
        <div v-if="isPanelDataLoading && isAuthenticated" class="my-auto">
          <span
            class="spinner-border spinner-border-sm text-primary"
            role="status"
            aria-hidden="true"
          ></span>
        </div>
      </div>
      <table class="table table-borderless my-3">
        <tbody>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h5>
                Allelic Requirement
                <ToolTip :toolTipText="HELP_TEXT.ALLELIC_REQUIREMENT" />
              </h5>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.genotype">
                {{ locusGeneDiseaseData.genotype }}
                <span
                  v-if="locusGeneDiseaseData.confidence"
                  class="badge text-white fs-6 ms-2"
                  :style="{
                    backgroundColor:
                      confidenceColorMap[
                        locusGeneDiseaseData.confidence.toLowerCase()
                      ],
                  }"
                >
                  {{ locusGeneDiseaseData.confidence }}
                </span>
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h5>
                Cross Cutting Modifier(s)
                <ToolTip :toolTipText="HELP_TEXT.CROSS_CUTTING_MODIFIER" />
              </h5>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.cross_cutting_modifier?.length > 0">
                {{
                  locusGeneDiseaseData.cross_cutting_modifier
                    .map((item) => item.term)
                    .join(", ")
                }}
              </p>
              <p v-else class="text-muted">Not Assigned</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h5>Panel(s)</h5>
            </td>
            <td class="w-75">
              <span v-if="locusGeneDiseaseData.panels?.length > 0">
                <span v-for="(item, index) in locusGeneDiseaseData.panels">
                  <span v-if="index < locusGeneDiseaseData.panels.length - 1">
                    <router-link
                      :to="`/panel/${item.name}`"
                      style="text-decoration: none"
                    >
                      {{ item.description ? item.description : item.name }}
                    </router-link>
                    ,
                  </span>
                  <router-link
                    :to="`/panel/${item.name}`"
                    v-else
                    style="text-decoration: none"
                  >
                    {{ item.description ? item.description : item.name }}
                  </router-link>
                </span>
              </span>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h5>Variant Information</h5>
            </td>
            <td></td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>
                Variant Type(s)
                <ToolTip :toolTipText="HELP_TEXT.VARIANT_TYPE" />
              </h6>
            </td>
            <td class="w-75">
              <div
                v-if="locusGeneDiseaseData.variant_type?.length > 0"
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
                      {{
                        locusGeneDiseaseData.variant_type
                          .map((x) => x.term)
                          .join(", ")
                      }}
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
                          <tr v-for="item in locusGeneDiseaseData.variant_type">
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
                            <td class="ps-0">
                              <ul
                                v-if="
                                  item.de_novo ||
                                  item.inherited ||
                                  item.unknown_inheritance
                                "
                                class="mb-0"
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
                                  v-for="(
                                    publicationItem, index
                                  ) in item.publications"
                                >
                                  <span
                                    v-if="index < item.publications.length - 1"
                                  >
                                    <a
                                      :href="`https://europepmc.org/article/MED/${publicationItem}`"
                                      style="text-decoration: none"
                                      target="_blank"
                                    >
                                      {{ publicationItem }}
                                    </a>
                                    ,
                                  </span>
                                  <a
                                    v-else
                                    :href="`https://europepmc.org/article/MED/${publicationItem}`"
                                    style="text-decoration: none"
                                    target="_blank"
                                  >
                                    {{ publicationItem }}
                                  </a>
                                </span>
                              </span>
                            </td>
                            <td class="ps-0">
                              <ul v-if="item.comments?.length > 0" class="mb-0">
                                <li
                                  v-for="commentItem in item.comments"
                                  :key="commentItem.text"
                                >
                                  {{ commentItem.text }} ({{
                                    commentItem.date
                                  }})
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
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>Variant Description</h6>
            </td>
            <td class="w-75">
              <div
                v-if="locusGeneDiseaseData.variant_description?.length > 0"
                class="accordion accordion-flush"
                id="accordionVariantDescription"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsibleVariantDescriptionTable"
                      aria-expanded="false"
                      aria-controls="collapsibleVariantDescriptionTable"
                    >
                      Variant Description ({{
                        locusGeneDiseaseData.variant_description.length
                      }})
                    </button>
                  </h2>
                  <div
                    id="collapsibleVariantDescriptionTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionVariantDescription"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>Variant Description</th>
                            <th>Publications</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="item in locusGeneDiseaseData.variant_description"
                          >
                            <td>
                              {{ item.description }}
                            </td>
                            <td>
                              <span v-if="item.publications?.length > 0">
                                <span
                                  v-for="(
                                    publicationItem, index
                                  ) in item.publications"
                                >
                                  <span
                                    v-if="index < item.publications.length - 1"
                                  >
                                    <a
                                      :href="`https://europepmc.org/article/MED/${publicationItem}`"
                                      style="text-decoration: none"
                                      target="_blank"
                                    >
                                      {{ publicationItem }}
                                    </a>
                                    ,
                                  </span>
                                  <a
                                    v-else
                                    :href="`https://europepmc.org/article/MED/${publicationItem}`"
                                    style="text-decoration: none"
                                    target="_blank"
                                  >
                                    {{ publicationItem }}
                                  </a>
                                </span>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>
                Variant Consequence(s)
                <ToolTip :toolTipText="HELP_TEXT.VARIANT_CONSEQUENCE" />
              </h6>
            </td>
            <td class="w-75">
              <div
                v-if="locusGeneDiseaseData.variant_consequence?.length > 0"
                class="accordion accordion-flush"
                id="accordionVariantConsequences"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsibleVariantConsequencesTable"
                      aria-expanded="false"
                      aria-controls="collapsibleVariantConsequencesTable"
                    >
                      {{
                        locusGeneDiseaseData.variant_consequence
                          .map((x) => x.variant_consequence)
                          .join(", ")
                      }}
                    </button>
                  </h2>
                  <div
                    id="collapsibleVariantConsequencesTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionVariantConsequences"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>Variant Consequence</th>
                            <th>Support</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="item in locusGeneDiseaseData.variant_consequence"
                          >
                            <td>
                              <a
                                v-if="item.accession"
                                :href="`http://www.sequenceontology.org/browser/current_release/term/${item.accession}`"
                                style="text-decoration: none"
                                target="_blank"
                              >
                                {{ item.variant_consequence }}
                              </a>
                              <span v-else>{{ item.variant_consequence }}</span>
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
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h5>Molecular Mechanism</h5>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Mechanism <ToolTip :toolTipText="HELP_TEXT.MECHANISM" /></h6>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.molecular_mechanism?.mechanism">
                {{ locusGeneDiseaseData.molecular_mechanism.mechanism }}
                <span
                  v-if="
                    locusGeneDiseaseData.molecular_mechanism
                      ?.mechanism_support === 'inferred' &&
                    locusGeneDiseaseData.molecular_mechanism.mechanism !==
                      'undetermined'
                  "
                >
                  ({{
                    locusGeneDiseaseData.molecular_mechanism.mechanism_support
                  }})
                </span>
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>
                Categorisation
                <ToolTip :toolTipText="HELP_TEXT.CATEGORISATION" />
              </h6>
            </td>
            <td class="w-75">
              <div
                v-if="
                  locusGeneDiseaseData.molecular_mechanism?.synopsis?.length > 0
                "
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
                      Categorisation ({{
                        locusGeneDiseaseData.molecular_mechanism.synopsis
                          .length
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
                          <tr
                            v-for="item in locusGeneDiseaseData
                              .molecular_mechanism.synopsis"
                          >
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
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr
            v-if="
              locusGeneDiseaseData.molecular_mechanism?.evidence &&
              Object.keys(locusGeneDiseaseData.molecular_mechanism.evidence)
                .length > 0
            "
          >
            <td class="w-25 text-end">
              <h6>Evidence</h6>
            </td>
            <td class="w-75">
              <div
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
                      Evidence ({{
                        Object.keys(
                          locusGeneDiseaseData.molecular_mechanism.evidence
                        ).length
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
                          <tr
                            v-for="(value, key) in locusGeneDiseaseData
                              .molecular_mechanism.evidence"
                          >
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
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h5>
                Phenotypic Feature(s)
                <ToolTip :toolTipText="HELP_TEXT.PHENOTYPIC_FEATURE" />
              </h5>
            </td>
            <td class="w-75">
              <div
                v-if="locusGeneDiseaseData.phenotypes?.length > 0"
                class="accordion accordion-flush"
                id="accordionPhenotypicFeatures"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsiblePhenotypicFeaturesTable"
                      aria-expanded="false"
                      aria-controls="collapsiblePhenotypicFeaturesTable"
                    >
                      Phenotypic Features ({{
                        locusGeneDiseaseData.phenotypes.length
                      }})
                    </button>
                  </h2>
                  <div
                    id="collapsiblePhenotypicFeaturesTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionPhenotypicFeatures"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th style="width: 10%">Accession</th>
                            <th style="width: 60%">Term</th>
                            <th style="width: 30%">Publications</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="item in locusGeneDiseaseData.phenotypes"
                            :key="item.accession"
                          >
                            <td style="width: 10%">
                              <a
                                :href="`https://hpo.jax.org/app/browse/term/${item.accession}`"
                                style="text-decoration: none"
                                v-if="item.accession"
                                target="_blank"
                              >
                                {{ item.accession }}
                              </a>
                            </td>
                            <td style="width: 60%">
                              {{ item.term }}
                            </td>
                            <td style="width: 30%">
                              <span v-if="item.publications?.length > 0">
                                <span
                                  v-for="(
                                    publicationItem, index
                                  ) in item.publications"
                                >
                                  <span
                                    v-if="index < item.publications.length - 1"
                                  >
                                    <a
                                      :href="`https://europepmc.org/article/MED/${publicationItem}`"
                                      style="text-decoration: none"
                                      target="_blank"
                                    >
                                      {{ publicationItem }}
                                    </a>
                                    ,
                                  </span>
                                  <a
                                    v-else
                                    :href="`https://europepmc.org/article/MED/${publicationItem}`"
                                    style="text-decoration: none"
                                    target="_blank"
                                  >
                                    {{ publicationItem }}
                                  </a>
                                </span>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h5>Phenotypic Summary</h5>
            </td>
            <td class="w-75">
              <div
                v-if="locusGeneDiseaseData.phenotype_summary?.length > 0"
                class="accordion accordion-flush"
                id="accordionPhenotypicSummary"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsiblePhenotypicSummaryTable"
                      aria-expanded="false"
                      aria-controls="collapsiblePhenotypicSummaryTable"
                    >
                      Phenotypic Summary ({{
                        locusGeneDiseaseData.phenotype_summary.length
                      }})
                    </button>
                  </h2>
                  <div
                    id="collapsiblePhenotypicSummaryTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionPhenotypicSummary"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>Publication</th>
                            <th>Phenotypic Summary</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="item in locusGeneDiseaseData.phenotype_summary"
                          >
                            <td>
                              <a
                                v-if="item.publication"
                                :href="`https://europepmc.org/article/MED/${item.publication}`"
                                style="text-decoration: none"
                                target="_blank"
                              >
                                {{ item.publication }}
                              </a>
                            </td>
                            <td>
                              {{ item.summary }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h5>Evidence</h5>
            </td>
            <td class="w-75">
              <div
                v-if="locusGeneDiseaseData.publications?.length > 0"
                class="accordion accordion-flush"
                id="accordionPublications"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsiblePublicationsTable"
                      aria-expanded="false"
                      aria-controls="collapsiblePublicationsTable"
                    >
                      Publications ({{
                        locusGeneDiseaseData.publications.length
                      }})
                    </button>
                  </h2>
                  <div
                    id="collapsiblePublicationsTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionPublications"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>PMID</th>
                            <th>Title</th>
                            <th>Individuals</th>
                            <th>Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in locusGeneDiseaseData.publications">
                            <td>
                              <a
                                v-if="item.publication?.pmid"
                                :href="`https://europepmc.org/article/MED/${item.publication?.pmid}`"
                                style="text-decoration: none"
                                target="_blank"
                              >
                                {{ item.publication.pmid }}
                              </a>
                            </td>
                            <td>
                              {{ item.publication?.title }}
                            </td>
                            <td>
                              <span
                                v-if="item.publication?.families?.length > 0"
                              >
                                Number of Families:
                                {{
                                  item.publication.families[0]
                                    .number_of_families
                                }}
                                <br />
                                Affected Individuals:
                                {{
                                  item.publication.families[0]
                                    .affected_individuals
                                }}
                                <br />
                                Ancestry:
                                {{ item.publication.families[0].ancestry }}
                                <br />
                                Consanguinity:
                                {{ item.publication.families[0].consanguinity }}
                              </span>
                            </td>
                            <td>
                              <span
                                v-if="item.publication?.comments?.length > 0"
                              >
                                {{
                                  item.publication.comments[
                                    item.publication.comments.length - 1
                                  ].comment
                                }}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h5>Gene Information</h5>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Gene Symbol</h6>
            </td>
            <td>
              <router-link
                :to="`/gene/${locusGeneDiseaseData.locus?.gene_symbol}`"
                v-if="locusGeneDiseaseData.locus?.gene_symbol"
                style="text-decoration: none"
              >
                {{ locusGeneDiseaseData.locus.gene_symbol }}
              </router-link>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Synonym(s)</h6>
            </td>
            <td>
              <p v-if="locusGeneDiseaseData.locus?.synonyms?.length > 0">
                {{ locusGeneDiseaseData.locus.synonyms.join(", ") }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>
                Location <ToolTip :toolTipText="HELP_TEXT.GENE_LOCATION" />
              </h6>
            </td>
            <td>
              <a
                :href="`https://www.ensembl.org/Homo_sapiens/Location/View?r=${locusGeneDiseaseData.locus?.sequence}:${locusGeneDiseaseData.locus?.start}-${locusGeneDiseaseData.locus?.end}`"
                v-if="
                  locusGeneDiseaseData.locus?.sequence &&
                  locusGeneDiseaseData.locus?.start &&
                  locusGeneDiseaseData.locus?.end
                "
                style="text-decoration: none"
                target="_blank"
              >
                {{ locusGeneDiseaseData.locus.sequence }}:{{
                  locusGeneDiseaseData.locus.start
                }}-{{ locusGeneDiseaseData.locus.end }}:{{
                  locusGeneDiseaseData.locus.strand
                }}
              </a>
              <p
                v-else-if="
                  locusGeneDiseaseData.locus?.sequence ||
                  locusGeneDiseaseData.locus?.start ||
                  locusGeneDiseaseData.locus?.end
                "
              >
                {{ locusGeneDiseaseData.locus.sequence }}:{{
                  locusGeneDiseaseData.locus.start
                }}-{{ locusGeneDiseaseData.locus.end }}:{{
                  locusGeneDiseaseData.locus.strand
                }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>
                External Links
                <ToolTip :toolTipText="HELP_TEXT.EXTERNAL_LINKS" />
              </h6>
            </td>
            <td class="w-75">
              <table class="table table-bordered mb-0">
                <tbody>
                  <tr>
                    <td>
                      DECIPHER:
                      <a
                        :href="`https://www.deciphergenomics.org/gene/${locusGeneDiseaseData.locus?.gene_symbol}`"
                        style="text-decoration: none"
                        v-if="locusGeneDiseaseData.locus?.gene_symbol"
                        target="_blank"
                      >
                        {{ locusGeneDiseaseData.locus.gene_symbol }}
                      </a>
                      <p v-else class="text-muted">Not Available</p>
                    </td>
                    <td>
                      OMIM:
                      <a
                        :href="`https://www.omim.org/entry/${locusGeneDiseaseData.locus?.ids?.OMIM}`"
                        style="text-decoration: none"
                        v-if="locusGeneDiseaseData.locus?.ids?.OMIM"
                        target="_blank"
                      >
                        {{ locusGeneDiseaseData.locus.ids.OMIM }}
                      </a>
                      <p v-else class="text-muted">Not Available</p>
                    </td>
                    <td>
                      Ensembl ID:
                      <a
                        :href="`https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${locusGeneDiseaseData.locus?.ids?.Ensembl}`"
                        style="text-decoration: none"
                        v-if="locusGeneDiseaseData.locus?.ids?.Ensembl"
                        target="_blank"
                      >
                        {{ locusGeneDiseaseData.locus.ids.Ensembl }}
                      </a>
                      <p v-else class="text-muted">Not Available</p>
                    </td>
                    <td>
                      HGNC ID:
                      <a
                        :href="`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${locusGeneDiseaseData.locus?.ids?.HGNC}`"
                        style="text-decoration: none"
                        v-if="locusGeneDiseaseData.locus?.ids?.HGNC"
                        target="_blank"
                      >
                        {{ locusGeneDiseaseData.locus.ids.HGNC }}
                      </a>
                      <p v-else class="text-muted">Not Available</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h5>Disease Information</h5>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Disease Name</h6>
            </td>
            <td>
              <router-link
                :to="`/disease/${locusGeneDiseaseData.disease?.name}`"
                v-if="locusGeneDiseaseData.disease?.name"
                style="text-decoration: none"
              >
                {{ locusGeneDiseaseData.disease?.name }}
              </router-link>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>
                Cross Reference(s)
                <ToolTip :toolTipText="HELP_TEXT.CROSS_REFERENCES" />
              </h6>
            </td>
            <td class="w-75">
              <div
                v-if="locusGeneDiseaseData.disease?.ontology_terms?.length > 0"
                class="accordion accordion-flush"
                id="accordionCrossReferences"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsibleCrossReferencesTable"
                      aria-expanded="false"
                      aria-controls="collapsibleCrossReferencesTable"
                    >
                      Cross References ({{
                        locusGeneDiseaseData.disease.ontology_terms.length
                      }})
                    </button>
                  </h2>
                  <div
                    id="collapsibleCrossReferencesTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionCrossReferences"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>Accession</th>
                            <th>Term</th>
                            <th>Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="ontologyTerm in locusGeneDiseaseData.disease
                              .ontology_terms"
                          >
                            <td>
                              <a
                                v-if="ontologyTerm.source === 'OMIM'"
                                :href="`https://www.omim.org/entry/${ontologyTerm.accession}`"
                                style="text-decoration: none"
                                target="_blank"
                              >
                                {{ ontologyTerm.accession }}
                              </a>
                              <a
                                v-else-if="ontologyTerm.source === 'Mondo'"
                                :href="`https://monarchinitiative.org/${ontologyTerm.accession}`"
                                style="text-decoration: none"
                                target="_blank"
                              >
                                {{ ontologyTerm.accession }}
                              </a>
                              <span v-else>{{ ontologyTerm.accession }}</span>
                            </td>
                            <td>{{ ontologyTerm.term }}</td>
                            <td>{{ ontologyTerm.source }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h5>G2P ID <ToolTip :toolTipText="HELP_TEXT.G2P_ID" /></h5>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.stable_id">
                {{ locusGeneDiseaseData.stable_id }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr v-if="locusGeneDiseaseData.comments?.length > 0">
            <td class="w-25 text-end">
              <h5>Comment(s)</h5>
            </td>
            <td class="w-75">
              <div class="accordion accordion-flush" id="accordionComments">
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsibleCommentsTable"
                      aria-expanded="false"
                      aria-controls="collapsibleCommentsTable"
                    >
                      Comments ({{ locusGeneDiseaseData.comments.length }})
                    </button>
                  </h2>
                  <div
                    id="collapsibleCommentsTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionComments"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>Comment</th>
                            <th>Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="commentObj in locusGeneDiseaseData.comments"
                          >
                            <td>{{ commentObj.text }}</td>
                            <td>
                              {{
                                commentObj.is_public == 1
                                  ? "Public"
                                  : commentObj.is_public == 0
                                  ? "Private"
                                  : ""
                              }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h5>Curation Information</h5>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Created On</h6>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.date_created">
                {{ locusGeneDiseaseData.date_created }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Last Updated On</h6>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.last_updated">
                {{ locusGeneDiseaseData.last_updated }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
        </tbody>
      </table>
      <AddPanelModal
        :stableId="stableId"
        :userPanels="userPanels"
        @refreshpage="refreshPage"
      />
      <UpdateRecordModal :stableId="stableId" />
    </div>
  </div>
</template>
<style scoped>
h5,
h6,
p {
  margin-bottom: 0;
}
</style>
