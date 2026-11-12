<script>
import { HELP_TEXT } from "../../utility/Constants.js";
import ToolTip from "../tooltip/ToolTip.vue";
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
import RecordHeaderControls from "./RecordHeaderControls.vue";

const SECTION_ACTIVATION_LINE_PX = 2;
const RESIZE_DEBOUNCE_DELAY = 150;
const NAVIGATION_ITEMS = Object.freeze([
  { id: "allelic-requirement-section", label: "Allelic Requirement" },
  {
    id: "cross-cutting-modifier-section",
    label: "Cross Cutting Modifiers",
  },
  { id: "panel-section", label: "Panels" },
  { id: "variant-information-section", label: "Variant Information" },
  { id: "molecular-mechanism-section", label: "Molecular Mechanism" },
  { id: "phenotype-feature-section", label: "Phenotypic Features" },
  { id: "phenotype-summary-section", label: "Phenotypic Summary" },
  { id: "evidence-section", label: "Evidence" },
  { id: "gene-information-section", label: "Gene Information" },
  { id: "disease-information-section", label: "Disease Information" },
  { id: "g2p-id-section", label: "G2P ID" },
  { id: "comments-section", label: "Comments", requiresComments: true },
  { id: "curation-information-section", label: "Curation Information" },
]);

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
      activeSectionId: null,
      HELP_TEXT,
      ENSEMBL_LOCATION_URL,
    };
  },
  computed: {
    hasComments() {
      return this.locusGeneDiseaseData?.comments?.length > 0;
    },
    hasMechanismEvidence() {
      const evidence = this.locusGeneDiseaseData.molecular_mechanism?.evidence;
      return Object.keys(evidence ?? {}).length > 0;
    },
    navigationItems() {
      return NAVIGATION_ITEMS.filter(
        (item) => !item.requiresComments || this.hasComments,
      );
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
    RecordHeaderControls,
  },
  methods: {
    createSectionObserver() {
      this.observer?.disconnect();

      const sections = this.getRecordSections();
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

      sections.forEach((section) => this.observer.observe(section));
      // Set the initial active section before the observer callback runs.
      this.updateActiveSection(sections, SECTION_ACTIVATION_LINE_PX);
    },
    getRecordSections() {
      return Array.from(
        this.$refs.recordMain.querySelectorAll(
          "section[data-navigation-section][id]",
        ),
      );
    },
    onElementObserved() {
      this.updateActiveSection(
        this.getRecordSections(),
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
    updateActiveSection(sections, activationOffset) {
      if (sections.length === 0) {
        return;
      }

      const pageBottom = window.scrollY + window.innerHeight;
      // Keep the final section active when its heading cannot reach the activation line.
      const isAtPageBottom =
        Math.ceil(pageBottom) >= document.documentElement.scrollHeight;
      const activeSection = isAtPageBottom
        ? sections[sections.length - 1]
        : sections.reduce((current, section) => {
            // Use the last section that has crossed the activation line.
            return section.getBoundingClientRect().top <= activationOffset
              ? section
              : current;
          }, sections[0]);

      this.activeSectionId = activeSection.id;
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
      <RecordHeaderControls
        :locus-gene-disease-data="locusGeneDiseaseData"
        :user-panels="userPanels"
        :is-panel-data-loading="isPanelDataLoading"
        :is-authenticated="isAuthenticated"
        :is-record-part-of-user-panels="isRecordPartOfUserPanels"
      />
      <div v-if="locusGeneDiseaseData.summary" class="record-summary-div my-3">
        <p>
          {{ locusGeneDiseaseData.summary }}
        </p>
      </div>
      <div class="dropdown mobile-navigation mb-4">
        <button
          id="record-mobile-navigation-button"
          class="btn btn-outline-primary dropdown-toggle w-100"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          On this page
        </button>
        <nav class="dropdown-menu w-100" aria-label="On this page">
          <a
            v-for="item in navigationItems"
            :key="item.id"
            class="dropdown-item"
            :class="{ active: activeSectionId === item.id }"
            :aria-current="activeSectionId === item.id ? 'location' : undefined"
            :href="`#${item.id}`"
          >
            {{ item.label }}
          </a>
        </nav>
      </div>
      <div class="record-details">
        <section
          id="allelic-requirement-section"
          data-navigation-section
          aria-labelledby="allelic-requirement-heading"
        >
          <div class="record-field record-field--align-center">
            <h3
              id="allelic-requirement-heading"
              class="record-field__label record-field__label--section-heading"
            >
              Allelic Requirement
              <ToolTip :toolTipText="HELP_TEXT.ALLELIC_REQUIREMENT" />
            </h3>
            <div class="record-field__value">
              <p v-if="locusGeneDiseaseData.genotype">
                {{ locusGeneDiseaseData.genotype }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </div>
          </div>
        </section>
        <section
          id="cross-cutting-modifier-section"
          data-navigation-section
          aria-labelledby="cross-cutting-modifier-heading"
        >
          <div class="record-field record-field--align-center">
            <h3
              id="cross-cutting-modifier-heading"
              class="record-field__label record-field__label--section-heading"
            >
              Cross Cutting Modifiers
              <ToolTip :toolTipText="HELP_TEXT.CROSS_CUTTING_MODIFIER" />
            </h3>
            <div class="record-field__value">
              <p v-if="locusGeneDiseaseData.cross_cutting_modifier?.length > 0">
                {{
                  locusGeneDiseaseData.cross_cutting_modifier
                    .map((item) => item.term)
                    .join(", ")
                }}
              </p>
              <p v-else class="text-muted">Not Assigned</p>
            </div>
          </div>
        </section>
        <section
          id="panel-section"
          data-navigation-section
          aria-labelledby="panel-heading"
        >
          <div class="record-field record-field--align-center">
            <h3
              id="panel-heading"
              class="record-field__label record-field__label--section-heading"
            >
              Panels
            </h3>
            <div class="record-field__value">
              <PanelLinks
                :panels="locusGeneDiseaseData.panels"
                empty-text="Not Available"
              />
            </div>
          </div>
        </section>
        <section
          id="variant-information-section"
          data-navigation-section
          aria-labelledby="variant-information-heading"
        >
          <h3 id="variant-information-heading" class="record-section__heading">
            Variant Information
          </h3>
          <dl class="mb-0">
            <div class="record-field">
              <dt class="record-field__label">
                Variant Types
                <ToolTip :toolTipText="HELP_TEXT.VARIANT_TYPE" />
              </dt>
              <dd class="record-field__value">
                <VariantTypes
                  :variant-types="locusGeneDiseaseData.variant_type"
                  :is-authenticated="isAuthenticated"
                />
              </dd>
            </div>
            <div class="record-field">
              <dt class="record-field__label">Variant Description</dt>
              <dd class="record-field__value">
                <VariantDescription
                  :variant-description="
                    locusGeneDiseaseData.variant_description
                  "
                />
              </dd>
            </div>
            <div class="record-field">
              <dt class="record-field__label">
                Variant Consequences
                <ToolTip :toolTipText="HELP_TEXT.VARIANT_CONSEQUENCE" />
              </dt>
              <dd class="record-field__value">
                <VariantConsequences
                  :variant-consequences="
                    locusGeneDiseaseData.variant_consequence
                  "
                />
              </dd>
            </div>
          </dl>
        </section>
        <section
          id="molecular-mechanism-section"
          data-navigation-section
          aria-labelledby="molecular-mechanism-heading"
        >
          <h3 id="molecular-mechanism-heading" class="record-section__heading">
            Molecular Mechanism
          </h3>
          <dl class="mb-0">
            <div class="record-field record-field--align-center">
              <dt class="record-field__label">
                Mechanism <ToolTip :toolTipText="HELP_TEXT.MECHANISM" />
              </dt>
              <dd class="record-field__value">
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
                      locusGeneDiseaseData.molecular_mechanism
                        .mechanism_support
                    }})
                  </span>
                </p>
                <p v-else class="text-muted">Not Available</p>
              </dd>
            </div>
            <div class="record-field">
              <dt class="record-field__label">
                Categorisation
                <ToolTip :toolTipText="HELP_TEXT.CATEGORISATION" />
              </dt>
              <dd class="record-field__value">
                <MechanismSynopsis
                  :mechanism-synopsis="
                    locusGeneDiseaseData.molecular_mechanism?.synopsis
                  "
                />
              </dd>
            </div>
            <div v-if="hasMechanismEvidence" class="record-field">
              <dt class="record-field__label">Evidence</dt>
              <dd class="record-field__value">
                <MechanismEvidence
                  :mechanism-evidence="
                    locusGeneDiseaseData.molecular_mechanism.evidence
                  "
                />
              </dd>
            </div>
          </dl>
        </section>
        <section
          id="phenotype-feature-section"
          data-navigation-section
          aria-labelledby="phenotype-feature-heading"
        >
          <div class="record-field">
            <h3
              id="phenotype-feature-heading"
              class="record-field__label record-field__label--section-heading"
            >
              Phenotypic Features
              <ToolTip :toolTipText="HELP_TEXT.PHENOTYPIC_FEATURE" />
            </h3>
            <div class="record-field__value">
              <Phenotypes :phenotypes="locusGeneDiseaseData.phenotypes" />
            </div>
          </div>
        </section>
        <section
          id="phenotype-summary-section"
          data-navigation-section
          aria-labelledby="phenotype-summary-heading"
        >
          <div class="record-field">
            <h3
              id="phenotype-summary-heading"
              class="record-field__label record-field__label--section-heading"
            >
              Phenotypic Summary
            </h3>
            <div class="record-field__value">
              <PhenotypeSummary
                :phenotype-summary="locusGeneDiseaseData.phenotype_summary"
              />
            </div>
          </div>
        </section>
        <section
          id="evidence-section"
          data-navigation-section
          aria-labelledby="evidence-heading"
        >
          <div class="record-field">
            <h3
              id="evidence-heading"
              class="record-field__label record-field__label--section-heading"
            >
              Evidence
            </h3>
            <div class="record-field__value">
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
            </div>
          </div>
        </section>
        <section
          id="gene-information-section"
          data-navigation-section
          aria-labelledby="gene-information-heading"
        >
          <h3 id="gene-information-heading" class="record-section__heading">
            Gene Information
          </h3>
          <dl class="mb-0">
            <div class="record-field record-field--align-center">
              <dt class="record-field__label">Gene Symbol</dt>
              <dd class="record-field__value">
                <router-link
                  v-if="locusGeneDiseaseData.locus?.gene_symbol"
                  :to="`/gene/${locusGeneDiseaseData.locus?.gene_symbol}`"
                  class="text-decoration-none"
                >
                  {{ locusGeneDiseaseData.locus.gene_symbol }}
                </router-link>
                <p v-else class="text-muted">Not Available</p>
              </dd>
            </div>
            <div class="record-field record-field--align-center">
              <dt class="record-field__label">Synonyms</dt>
              <dd class="record-field__value">
                <p v-if="locusGeneDiseaseData.locus?.synonyms?.length > 0">
                  {{ locusGeneDiseaseData.locus.synonyms.join(", ") }}
                </p>
                <p v-else class="text-muted">Not Available</p>
              </dd>
            </div>
            <div class="record-field record-field--align-center">
              <dt class="record-field__label">
                Location <ToolTip :toolTipText="HELP_TEXT.GENE_LOCATION" />
              </dt>
              <dd class="record-field__value">
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
              </dd>
            </div>
            <div class="record-field">
              <dt class="record-field__label">
                External Links
                <ToolTip :toolTipText="HELP_TEXT.EXTERNAL_LINKS" />
              </dt>
              <dd class="record-field__value">
                <ExternalLinks
                  :gene-symbol="locusGeneDiseaseData.locus?.gene_symbol"
                  :omim-id="locusGeneDiseaseData.locus?.ids?.OMIM"
                  :ensembl-id="locusGeneDiseaseData.locus?.ids?.Ensembl"
                  :hgnc-id="locusGeneDiseaseData.locus?.ids?.HGNC"
                />
              </dd>
            </div>
          </dl>
        </section>
        <section
          id="disease-information-section"
          data-navigation-section
          aria-labelledby="disease-information-heading"
        >
          <h3 id="disease-information-heading" class="record-section__heading">
            Disease Information
          </h3>
          <dl class="mb-0">
            <div class="record-field record-field--align-center">
              <dt class="record-field__label">Disease Name</dt>
              <dd class="record-field__value">
                <router-link
                  v-if="locusGeneDiseaseData.disease?.name"
                  :to="`/disease/${locusGeneDiseaseData.disease?.name}`"
                  class="text-decoration-none"
                >
                  {{ locusGeneDiseaseData.disease?.name }}
                </router-link>
                <p v-else class="text-muted">Not Available</p>
              </dd>
            </div>
            <div class="record-field">
              <dt class="record-field__label">
                Cross References
                <ToolTip :toolTipText="HELP_TEXT.CROSS_REFERENCES" />
              </dt>
              <dd class="record-field__value">
                <CrossReferences
                  :ontology-terms="locusGeneDiseaseData.disease?.ontology_terms"
                />
              </dd>
            </div>
          </dl>
        </section>
        <section
          id="g2p-id-section"
          data-navigation-section
          aria-labelledby="g2p-id-heading"
        >
          <div class="record-field record-field--align-center">
            <h3
              id="g2p-id-heading"
              class="record-field__label record-field__label--section-heading"
            >
              G2P ID <ToolTip :toolTipText="HELP_TEXT.G2P_ID" />
            </h3>
            <div class="record-field__value">
              <p v-if="locusGeneDiseaseData.stable_id">
                {{ locusGeneDiseaseData.stable_id }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </div>
          </div>
        </section>
        <section
          v-if="hasComments"
          id="comments-section"
          data-navigation-section
          aria-labelledby="comments-heading"
        >
          <div class="record-field">
            <h3
              id="comments-heading"
              class="record-field__label record-field__label--section-heading"
            >
              Comments
            </h3>
            <div class="record-field__value">
              <Comments :comments="locusGeneDiseaseData.comments" />
            </div>
          </div>
        </section>
        <section
          id="curation-information-section"
          data-navigation-section
          aria-labelledby="curation-information-heading"
        >
          <h3 id="curation-information-heading" class="record-section__heading">
            Curation Information
          </h3>
          <dl class="mb-0">
            <div class="record-field record-field--align-center">
              <dt class="record-field__label">Created On</dt>
              <dd class="record-field__value">
                <p v-if="locusGeneDiseaseData.date_created">
                  {{ locusGeneDiseaseData.date_created }}
                </p>
                <p v-else class="text-muted">Not Available</p>
              </dd>
            </div>
            <div class="record-field record-field--align-center">
              <dt class="record-field__label">Last Updated On</dt>
              <dd class="record-field__value">
                <p v-if="locusGeneDiseaseData.last_updated">
                  {{ locusGeneDiseaseData.last_updated }}
                </p>
                <p v-else class="text-muted">Not Available</p>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
    <nav
      id="record-side-navbar"
      class="h-100 flex-column align-items-stretch ps-3"
      aria-label="On this page"
    >
      <strong class="d-none d-md-block h6 my-2 ms-3 text-body-secondary"
        >On this page</strong
      >
      <hr class="d-none d-md-block my-2 ms-3" />
      <div class="nav nav-pills flex-column">
        <a
          v-for="item in navigationItems"
          :key="item.id"
          class="nav-link"
          :class="{ active: activeSectionId === item.id }"
          :aria-current="activeSectionId === item.id ? 'location' : undefined"
          :href="`#${item.id}`"
        >
          {{ item.label }}
        </a>
      </div>
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
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

#record-content-div {
  width: 82%;
}

.mobile-navigation {
  display: none;
}

.record-details {
  margin: 1rem 0;
}

.record-section__heading {
  width: 25%;
  margin: 0;
  padding: 0.5rem;
  text-align: right;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.2;
}

.record-field {
  display: grid;
  grid-template-columns: 25% 75%;
  align-items: start;
}

.record-field--align-center {
  align-items: center;
}

.record-field__label,
.record-field__value {
  margin: 0;
  padding: 0.5rem;
}

.record-field__value {
  min-width: 0;
}

.record-field__label {
  text-align: right;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.2;
}

.record-field__label--section-heading {
  font-size: 1.25rem;
}

.record-summary-div {
  background: #f7f9fb;
  border-radius: 0.25rem;
  padding: 0.9rem 1rem;
}

.record-summary-div p {
  line-height: 1.4;
}

p {
  margin-bottom: 0;
}

@media (max-width: 767.98px) {
  #record-content-div {
    width: 100%;
    min-width: 0;
  }

  #record-side-navbar {
    display: none;
  }

  .mobile-navigation {
    display: block;
  }

  .record-section__heading {
    width: 100%;
    text-align: left;
  }

  .record-field {
    grid-template-columns: 1fr;
  }

  .record-field__label {
    padding-bottom: 0.25rem;
    text-align: left;
  }

  .record-field__value {
    padding-top: 0.25rem;
  }
}
</style>
