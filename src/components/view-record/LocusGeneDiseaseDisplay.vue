<script>
import { CONFIDENCE_COLOR_MAP, HELP_TEXT } from "../../utility/Constants.js";
import ToolTip from "../tooltip/ToolTip.vue";
export default {
  props: {
    isRecordPartOfUserPanels: Boolean,
    locusGeneDiseaseData: Object,
    stableId: String,
    userPanels: Array,
    isPanelDataLoading: Boolean,
    isAuthenticated: Boolean,
    exportToPDF: Function,
  },
  data() {
    return {
      observer: null,
      isFireFox: false,
      isDisplayComments: this.locusGeneDiseaseData?.comments?.length > 0,
      CONFIDENCE_COLOR_MAP,
      HELP_TEXT,
    };
  },
  created() {
    this.isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
    this.observer = new IntersectionObserver(this.onElementObserved, {
      root: document.querySelector("#record-main"),
      rootMargin: "0% 0% -90% 0%",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
  },
  mounted() {
    document.querySelectorAll("tr[id]").forEach((heading) => {
      this.observer.observe(heading);
    });
  },
  beforeDestroy() {
    this.observer.disconnect();
  },
  components: {
    ToolTip,
  },
  methods: {
    onElementObserved(entries) {
      entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
        const id = target.getAttribute("id");
        const ratio = Math.floor(intersectionRatio * 100);
        if (isIntersecting && ratio > 80) {
          document
            .querySelector(`nav a[href="#${id}"]`)
            .classList.add("active");
        } else {
          document
            .querySelector(`nav a[href="#${id}"]`)
            .classList.remove("active");
        }
      });
    },
  },
};
</script>
<template>
  <main id="record-main">
    <div id="record-content-div">
      <div class="d-flex justify-content-between">
        <div class="flex-grow-1 me-1">
          <h3 v-if="locusGeneDiseaseData.disease?.name">
            {{ locusGeneDiseaseData.disease.name }}
            <span
              v-if="locusGeneDiseaseData.confidence"
              class="badge text-white fs-6"
              :style="{
                backgroundColor:
                  CONFIDENCE_COLOR_MAP[
                    locusGeneDiseaseData.confidence.toLowerCase()
                  ],
              }"
            >
              {{ locusGeneDiseaseData.confidence }}
            </span>
          </h3>
          <h2 v-else class="text-muted">Disease Name Not Available</h2>
        </div>
        <div class="flex-shrink-0" id="record-buttons-div">
          <button  v-if="!isFirefox" class="btn btn-primary me-1" type="button" @click="exportToPDF">
            <i class="bi bi-file-earmark-pdf-fill"></i> Export to PDF
          </button>
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
            data-html2canvas-ignore
          >
            <i class="bi bi-plus-circle-fill"></i> Add to another panel
          </button>
          <button
            class="btn btn-outline-primary"
            data-bs-toggle="modal"
            data-bs-target="#update-record-modal"
            data-html2canvas-ignore
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
      </div>
      <table class="table table-borderless my-3">
        <tbody>
          <tr id="allelic-requirement-section">
            <td class="w-25 text-end">
              <h5>
                Allelic Requirement
                <ToolTip :toolTipText="HELP_TEXT.ALLELIC_REQUIREMENT" data-html2canvas-ignore />
              </h5>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.genotype">
                {{ locusGeneDiseaseData.genotype }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr id="cross-cutting-modifier-section">
            <td class="w-25 text-end">
              <h5>
                Cross Cutting Modifiers
                <ToolTip :toolTipText="HELP_TEXT.CROSS_CUTTING_MODIFIER" data-html2canvas-ignore />
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
          <tr id="panel-section" class="align-middle">
            <td class="w-25 text-end">
              <h5>Panels</h5>
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
          <tr id="variant-information-section" class="align-middle">
            <td class="w-25 text-end">
              <h5>Variant Information</h5>
            </td>
            <td></td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>
                Variant Types
                <ToolTip :toolTipText="HELP_TEXT.VARIANT_TYPE" data-html2canvas-ignore/>
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
                            <th v-if="isAuthenticated">Comments</th>
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
                            <td v-if="isAuthenticated" class="ps-0">
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
                Variant Consequences
                <ToolTip :toolTipText="HELP_TEXT.VARIANT_CONSEQUENCE" data-html2canvas-ignore/>
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
          <tr id="molecular-mechanism-section" class="align-middle">
            <td class="w-25 text-end">
              <h5>Molecular Mechanism</h5>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Mechanism <ToolTip :toolTipText="HELP_TEXT.MECHANISM" data-html2canvas-ignore /></h6>
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
                <ToolTip :toolTipText="HELP_TEXT.CATEGORISATION" data-html2canvas-ignore />
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
          <tr id="phenotype-feature-section">
            <td class="w-25 text-end">
              <h5>
                Phenotypic Features
                <ToolTip :toolTipText="HELP_TEXT.PHENOTYPIC_FEATURE" data-html2canvas-ignore />
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
          <tr id="phenotype-summary-section">
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
          <tr id="evidence-section">
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
                            <th v-if="isAuthenticated">Comment</th>
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
                            <td v-if="isAuthenticated">
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
          <tr id="gene-information-section" class="align-middle">
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
              <h6>Synonyms</h6>
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
                Location <ToolTip :toolTipText="HELP_TEXT.GENE_LOCATION" data-html2canvas-ignore/>
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
                <ToolTip :toolTipText="HELP_TEXT.EXTERNAL_LINKS" data-html2canvas-ignore/>
              </h6>
            </td>
            <td class="w-75">
              <table class="table table-bordered mb-0">
                <thead>
                  <tr>
                    <th>DECIPHER</th>
                    <th>OMIM</th>
                    <th>Ensembl ID</th>
                    <th>HGNC ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
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
          <tr id="disease-information-section">
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
                Cross References
                <ToolTip :toolTipText="HELP_TEXT.CROSS_REFERENCES" data-html2canvas-ignore />
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
              <h5>G2P ID <ToolTip :toolTipText="HELP_TEXT.G2P_ID" data-html2canvas-ignore/></h5>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.stable_id">
                {{ locusGeneDiseaseData.stable_id }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr id="comments-section" v-if="isDisplayComments">
            <td class="w-25 text-end">
              <h5>Comments</h5>
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
          <tr id="curation-information-section">
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
    </div>
    <nav
      id="record-side-navbar"
      class="h-100 flex-column align-items-stretch ps-3"
      data-html2canvas-ignore
    >
      <strong class="d-none d-md-block h6 my-2 ms-3 text-body-secondary"
        >On this page</strong
      >
      <hr class="d-none d-md-block my-2 ms-3" />
      <nav class="nav nav-pills flex-column">
        <a class="nav-link" href="#allelic-requirement-section"
          >Allelic Requirement</a
        >
        <a class="nav-link" href="#cross-cutting-modifier-section"
          >Cross Cutting Modifiers</a
        >
        <a class="nav-link" href="#panel-section">Panels</a>
        <a class="nav-link" href="#variant-information-section"
          >Variant Information</a
        >
        <a class="nav-link" href="#molecular-mechanism-section"
          >Molecular Mechanism</a
        >
        <a class="nav-link" href="#phenotype-feature-section"
          >Phenotypic Features</a
        >
        <a class="nav-link" href="#phenotype-summary-section"
          >Phenotypic Summary</a
        >
        <a class="nav-link" href="#evidence-section">Evidence</a>
        <a class="nav-link" href="#gene-information-section"
          >Gene Information</a
        >
        <a class="nav-link" href="#disease-information-section"
          >Disease Information</a
        >
        <a v-if="isDisplayComments" class="nav-link" href="#comments-section"
          >Comments</a
        >
        <a class="nav-link" href="#curation-information-section"
          >Curation Information</a
        >
      </nav>
    </nav>
  </main>
</template>
<style scoped>
/* Sticky Navigation */
main > nav {
  position: sticky;
  top: 2rem;
  align-self: start;
}

#record-main {
  display: flex;
  justify-content: space-between;
}

#record-side-navbar {
  width: 18%;
}

#record-content-div {
  width: 82%;
}

h5,
h6,
p {
  margin-bottom: 0;
}
</style>
