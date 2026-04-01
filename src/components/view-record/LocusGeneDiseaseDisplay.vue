<script>
import { CONFIDENCE_COLOR_MAP, HELP_TEXT } from "../../utility/Constants.js";
import ToolTip from "../tooltip/ToolTip.vue";
import { exportRecordPdf } from "../../utility/DownloadUtility.js";
import { ENSEMBL_LOCATION_URL } from "../../utility/UrlConstants.js";
import VariantTypes from "./VariantTypes.vue";
import VariantConsequences from "./VariantConsequences.vue";
import VariantDescription from "./VariantDescription.vue";
import MechanismSynopsis from "./MechanismSynopsis.vue";
import MechanismEvidence from "./MechanismEvidence.vue";
import Phenotypes from "./Phenotypes.vue";
import PhenotypicSummary from "./PhenotypicSummary.vue";
import Publications from "./Publications.vue";
import MinedPublications from "./MinedPublications.vue";
import ExternalLinks from "./ExternalLinks.vue";
import CrossReferences from "./CrossReferences.vue";
import Comments from "./Comments.vue";
export default {
  props: {
    isRecordPartOfUserPanels: Boolean,
    locusGeneDiseaseData: Object,
    stableId: String,
    userPanels: Array,
    isPanelDataLoading: Boolean,
    isAuthenticated: Boolean,
  },
  data() {
    return {
      observer: null,
      isDisplayComments: this.locusGeneDiseaseData?.comments?.length > 0,
      CONFIDENCE_COLOR_MAP,
      HELP_TEXT,
      ENSEMBL_LOCATION_URL,
      exportRecordPdf,
    };
  },
  created() {
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
    VariantTypes,
    VariantDescription,
    VariantConsequences,
    MechanismSynopsis,
    MechanismEvidence,
    Phenotypes,
    PhenotypicSummary,
    Publications,
    MinedPublications,
    ExternalLinks,
    CrossReferences,
    Comments,
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
          <h2 v-if="locusGeneDiseaseData.disease?.name">
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
          </h2>
          <h2 v-else class="text-muted">Disease Name Not Available</h2>
          <span
            v-if="locusGeneDiseaseData.under_review"
            class="badge text-white fs-6 text-bg-warning"
          >
            Under review
          </span>
        </div>
        <div class="flex-shrink-0">
          <div class="d-flex align-items-start flex-column">
            <div>
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
                  !isPanelDataLoading &&
                  isAuthenticated &&
                  isRecordPartOfUserPanels
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
            <div class="mt-1">
              <button
                class="btn btn-outline-primary"
                type="button"
                @click="exportRecordPdf(locusGeneDiseaseData, isAuthenticated)"
              >
                <i class="bi bi-file-earmark-arrow-down"></i> Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="locusGeneDiseaseData.summary" class="record-summary-div my-3">
        <p>
          {{ locusGeneDiseaseData.summary }}
        </p>
      </div>
      <table class="table table-borderless my-3">
        <tbody>
          <tr id="allelic-requirement-section" class="align-middle">
            <td class="w-25 text-end">
              <h5>
                Allelic Requirement
                <ToolTip :toolTipText="HELP_TEXT.ALLELIC_REQUIREMENT" />
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
                <ToolTip :toolTipText="HELP_TEXT.VARIANT_TYPE" />
              </h6>
            </td>
            <td class="w-75">
              <VariantTypes
                :variant-types="locusGeneDiseaseData.variant_type"
                :is-authenticated="isAuthenticated"
              />
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>Variant Description</h6>
            </td>
            <td class="w-75">
              <VariantDescription
                :variant-description="locusGeneDiseaseData.variant_description"
              />
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>
                Variant Consequences
                <ToolTip :toolTipText="HELP_TEXT.VARIANT_CONSEQUENCE" />
              </h6>
            </td>
            <td class="w-75">
              <VariantConsequences
                :variant-consequences="locusGeneDiseaseData.variant_consequence"
              />
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
          <tr>
            <td class="w-25 text-end">
              <h6>
                Categorisation
                <ToolTip :toolTipText="HELP_TEXT.CATEGORISATION" />
              </h6>
            </td>
            <td class="w-75">
              <MechanismSynopsis
                :mechanism-synopsis="
                  locusGeneDiseaseData.molecular_mechanism?.synopsis
                "
              />
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
              <MechanismEvidence
                :mechanism-evidence="
                  locusGeneDiseaseData.molecular_mechanism.evidence
                "
              />
            </td>
          </tr>
          <tr id="phenotype-feature-section">
            <td class="w-25 text-end">
              <h5>
                Phenotypic Features
                <ToolTip :toolTipText="HELP_TEXT.PHENOTYPIC_FEATURE" />
              </h5>
            </td>
            <td class="w-75">
              <Phenotypes :phenotypes="locusGeneDiseaseData.phenotypes" />
            </td>
          </tr>
          <tr id="phenotype-summary-section">
            <td class="w-25 text-end">
              <h5>Phenotypic Summary</h5>
            </td>
            <td class="w-75">
              <PhenotypicSummary
                :phenotype-summary="locusGeneDiseaseData.phenotype_summary"
              />
            </td>
          </tr>
          <tr id="evidence-section">
            <td class="w-25 text-end">
              <h5>Evidence</h5>
            </td>
            <td class="w-75">
              <Publications
                :publications="locusGeneDiseaseData.publications"
                :is-authenticated="isAuthenticated"
              />
              <MinedPublications
                :mined-publications="locusGeneDiseaseData.mined_publications"
                :stable-id="locusGeneDiseaseData.stable_id"
                :is-panel-data-loading="isPanelDataLoading"
                :is-authenticated="isAuthenticated"
                :is-record-part-of-user-panels="isRecordPartOfUserPanels"
              />
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
                Location <ToolTip :toolTipText="HELP_TEXT.GENE_LOCATION" />
              </h6>
            </td>
            <td>
              <a
                v-if="
                  locusGeneDiseaseData.locus?.sequence &&
                  locusGeneDiseaseData.locus?.start &&
                  locusGeneDiseaseData.locus?.end
                "
                :href="`${ENSEMBL_LOCATION_URL}${locusGeneDiseaseData.locus.sequence}:${locusGeneDiseaseData.locus.start}-${locusGeneDiseaseData.locus.end}`"
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
              <ExternalLinks
                :gene-symbol="locusGeneDiseaseData.locus?.gene_symbol"
                :omim-id="locusGeneDiseaseData.locus?.ids?.OMIM"
                :ensembl-id="locusGeneDiseaseData.locus?.ids?.Ensembl"
                :hgnc-id="locusGeneDiseaseData.locus?.ids?.HGNC"
              />
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
                <ToolTip :toolTipText="HELP_TEXT.CROSS_REFERENCES" />
              </h6>
            </td>
            <td class="w-75">
              <CrossReferences
                :ontology-terms="locusGeneDiseaseData.disease?.ontology_terms"
              />
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
          <tr id="comments-section" v-if="isDisplayComments">
            <td class="w-25 text-end">
              <h5>Comments</h5>
            </td>
            <td class="w-75">
              <Comments :comments="locusGeneDiseaseData.comments" />
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

.record-summary-div {
  background: #f7f9fb;
  border-radius: 0.25rem;
  padding: 0.9rem 1rem;
}

.record-summary-div p {
  line-height: 1.4;
}

h5,
h6,
p {
  margin-bottom: 0;
}
</style>
