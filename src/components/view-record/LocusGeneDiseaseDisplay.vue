<script>
import { HELP_TEXT } from "../../utility/Constants.js";
import ToolTip from "../tooltip/ToolTip.vue";
import ConfidenceBadge from "../confidence/ConfidenceBadge.vue";
import PanelLinks from "../panel/PanelLinks.vue";
import { ENSEMBL_LOCATION_URL } from "../../utility/UrlConstants.js";
import VariantTypes from "./VariantTypes.vue";
import VariantConsequences from "./VariantConsequences.vue";
import VariantDescription from "./VariantDescription.vue";
import MechanismSynopsis from "./MechanismSynopsis.vue";
import MechanismEvidence from "./MechanismEvidence.vue";
import Phenotypes from "./Phenotypes.vue";
import PhenotypeSummary from "./PhenotypeSummary.vue";
import Publications from "./Publications.vue";
import MinedPublications from "./MinedPublications.vue";
import ExternalLinks from "./ExternalLinks.vue";
import CrossReferences from "./CrossReferences.vue";
import Comments from "./Comments.vue";

const SECTION_ACTIVATION_LINE_PX = 2;
const RESIZE_DEBOUNCE_DELAY = 150;

export default {
  props: {
    isRecordPartOfUserPanels: Boolean,
    locusGeneDiseaseData: {
      type: Object,
      required: true,
    },
    userPanels: {
      type: Array,
      default: () => [],
    },
    isPanelDataLoading: Boolean,
    isAuthenticated: Boolean,
  },
  data() {
    return {
      observer: null,
      resizeTimer: null,
      isPdfDownloading: false,
      HELP_TEXT,
      ENSEMBL_LOCATION_URL,
    };
  },
  computed: {
    canAddToPanel() {
      return (
        !this.isPanelDataLoading &&
        this.userPanels?.length > 0 &&
        this.isAuthenticated &&
        !this.isRecordPartOfUserPanels
      );
    },
    canUpdateRecord() {
      return (
        !this.isPanelDataLoading &&
        this.isAuthenticated &&
        this.isRecordPartOfUserPanels
      );
    },
    hasComments() {
      return this.locusGeneDiseaseData?.comments?.length > 0;
    },
    hasMechanismEvidence() {
      const evidence = this.locusGeneDiseaseData.molecular_mechanism?.evidence;
      return Object.keys(evidence ?? {}).length > 0;
    },
  },
  mounted() {
    this.createSectionObserver();
    window.addEventListener("resize", this.onWindowResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
    window.clearTimeout(this.resizeTimer);
    this.observer?.disconnect();
  },
  components: {
    ToolTip,
    ConfidenceBadge,
    PanelLinks,
    VariantTypes,
    VariantDescription,
    VariantConsequences,
    MechanismSynopsis,
    MechanismEvidence,
    Phenotypes,
    PhenotypeSummary,
    Publications,
    MinedPublications,
    ExternalLinks,
    CrossReferences,
    Comments,
  },
  methods: {
    async exportRecordPdf(locusGeneDiseaseData, isAuthenticated) {
      if (this.isPdfDownloading) {
        return;
      }

      this.isPdfDownloading = true;

      try {
        const { exportRecordPdf } =
          await import("../../utility/DownloadUtility.js");
        exportRecordPdf(locusGeneDiseaseData, isAuthenticated);
      } finally {
        this.isPdfDownloading = false;
      }
    },
    createSectionObserver() {
      this.observer?.disconnect();

      const headings = this.getSectionHeadings();
      // Reduce the observer root to a narrow activation line at the viewport top.
      const bottomMargin = Math.max(
        window.innerHeight - SECTION_ACTIVATION_LINE_PX,
        0,
      );

      this.observer = new IntersectionObserver(this.onElementObserved, {
        root: null,
        rootMargin: `1px 0px -${bottomMargin}px 0px`,
        threshold: 0,
      });

      headings.forEach((heading) => this.observer.observe(heading));
      // Set the initial active section before the observer callback runs.
      this.updateActiveSection(headings, SECTION_ACTIVATION_LINE_PX);
    },
    getSectionHeadings() {
      return Array.from(this.$refs.recordMain.querySelectorAll("tr[id]"));
    },
    onElementObserved() {
      this.updateActiveSection(
        this.getSectionHeadings(),
        SECTION_ACTIVATION_LINE_PX,
      );
    },
    onWindowResize() {
      // Debounce observer recreation while the viewport is being resized.
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => {
        this.createSectionObserver();
        this.resizeTimer = null;
      }, RESIZE_DEBOUNCE_DELAY);
    },
    updateActiveSection(headings, activationOffset) {
      if (headings.length === 0) {
        return;
      }

      const pageBottom = window.scrollY + window.innerHeight;
      // Keep the final section active when its heading cannot reach the activation line.
      const isAtPageBottom =
        Math.ceil(pageBottom) >= document.documentElement.scrollHeight;
      const activeHeading = isAtPageBottom
        ? headings[headings.length - 1]
        : headings.reduce((current, heading) => {
            // Use the last heading that has crossed the activation line.
            return heading.getBoundingClientRect().top <= activationOffset
              ? heading
              : current;
          }, headings[0]);

      this.setActiveSection(activeHeading.id);
    },
    setActiveSection(id) {
      this.$refs.sideNav
        ?.querySelectorAll("a.nav-link")
        .forEach((link) =>
          link.classList.toggle("active", link.hash === `#${id}`),
        );
    },
  },
};
</script>
<template>
  <main id="record-main" ref="recordMain">
    <div id="record-content-div">
      <h2 v-if="locusGeneDiseaseData.disease?.name">
        {{ locusGeneDiseaseData.disease.name }}
      </h2>
      <h2 v-else class="text-muted">Disease Name Not Available</h2>
      <div
        class="d-flex flex-wrap justify-content-between align-items-start gap-2"
      >
        <div class="d-flex flex-wrap align-items-center gap-1">
          <ConfidenceBadge
            :confidence="locusGeneDiseaseData.confidence"
            class="fs-6"
          />
          <span
            v-if="locusGeneDiseaseData.under_review"
            class="badge text-white fs-6 text-bg-warning"
          >
            Under review
          </span>
        </div>
        <div class="d-flex flex-wrap justify-content-end gap-1 ms-auto">
          <button
            v-if="canAddToPanel"
            class="btn btn-outline-primary"
            data-bs-toggle="modal"
            data-bs-target="#add-panel-modal"
          >
            <i class="bi bi-plus-circle-fill"></i> Add to another panel
          </button>
          <button
            v-if="canUpdateRecord"
            class="btn btn-outline-primary"
            data-bs-toggle="modal"
            data-bs-target="#update-record-modal"
          >
            <i class="bi bi-pencil-square"></i> Update record
          </button>
          <div
            v-if="isPanelDataLoading && isAuthenticated"
            class="my-auto"
            role="status"
          >
            <span
              class="spinner-border spinner-border-sm text-primary"
              aria-hidden="true"
            ></span>
            <span class="visually-hidden">Loading panel data...</span>
          </div>
          <button
            class="btn btn-outline-primary"
            type="button"
            :disabled="isPdfDownloading"
            :aria-busy="isPdfDownloading"
            @click="exportRecordPdf(locusGeneDiseaseData, isAuthenticated)"
          >
            <span
              v-if="isPdfDownloading"
              class="spinner-border spinner-border-sm me-1"
              aria-hidden="true"
            ></span>
            <i
              v-else
              class="bi bi-file-earmark-arrow-down me-1"
              aria-hidden="true"
            ></i>
            {{ isPdfDownloading ? "Downloading" : "Download PDF" }}
          </button>
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
              <PanelLinks
                :panels="locusGeneDiseaseData.panels"
                empty-text="Not Available"
              />
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
          <tr v-if="hasMechanismEvidence">
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
              <PhenotypeSummary
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
                v-if="locusGeneDiseaseData.locus?.gene_symbol"
                :to="`/gene/${locusGeneDiseaseData.locus?.gene_symbol}`"
                class="text-decoration-none"
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
                class="text-decoration-none"
                target="_blank"
                rel="noopener noreferrer"
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
                v-if="locusGeneDiseaseData.disease?.name"
                :to="`/disease/${locusGeneDiseaseData.disease?.name}`"
                class="text-decoration-none"
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
          <tr v-if="hasComments" id="comments-section">
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
      ref="sideNav"
      class="h-100 flex-column align-items-stretch ps-3"
      aria-label="On this page"
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
        <a v-if="hasComments" class="nav-link" href="#comments-section"
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
