<script>
import { CONFIDENCE_COLOR_MAP } from "../../utility/Constants.js";
import {
  ConfidenceAttribsOrder,
  VariantConsequencesAttribs,
} from "../../utility/CurationConstants.js";
export default {
  props: {
    terminologyDescriptionData: {
      type: Object,
      required: true,
    },
    molecularDescriptionData: {
      type: Object,
      required: true,
    },
    variantDescriptionData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      observer: null,
      CONFIDENCE_COLOR_MAP,
      VariantConsequencesAttribs,
      navigationItems: [
        {
          id: "g2p-confidence-section",
          label: "G2P Confidence Category",
        },
        { id: "allelic-requirement-section", label: "Allelic Requirement" },
        {
          id: "cross-cutting-modifier-section",
          label: "Cross Cutting Modifier",
        },
        { id: "molecular-mechanism-section", label: "Molecular Mechanism" },
        {
          id: "mechanism-synopsis-section",
          label: "Molecular Mechanism Synopsis",
        },
        {
          id: "mechanism-evidence-section",
          label: "Molecular Mechanism Evidence Types",
        },
        { id: "variant-consequence-section", label: "Variant Consequence" },
        { id: "variant-types-section", label: "Variant Types" },
      ],
    };
  },
  computed: {
    sortedConfidenceCategoryList() {
      return [
        ...(this.terminologyDescriptionData?.confidence_category || []),
      ].sort(
        (a, b) =>
          ConfidenceAttribsOrder.indexOf(Object.keys(a)[0]) -
          ConfidenceAttribsOrder.indexOf(Object.keys(b)[0]),
      );
    },
  },
  mounted() {
    this.observer = new IntersectionObserver(this.onElementObserved, {
      root: null,
      rootMargin: "-50% 0% -50% 0%",
      threshold: 0,
    });

    this.$el.querySelectorAll("section[id]").forEach((section) => {
      this.observer.observe(section);
    });
  },
  beforeUnmount() {
    this.observer?.disconnect();
  },
  methods: {
    onElementObserved(entries) {
      entries.forEach(({ target, isIntersecting }) => {
        const id = target.getAttribute("id");
        this.$el
          .querySelectorAll(`nav a[href="#${id}"]`)
          .forEach((link) => link.classList.toggle("active", isIntersecting));
      });
    },
  },
};
</script>
<template>
  <main id="terminology-main">
    <div id="terminology-content-div">
      <div class="dropdown mobile-navigation mb-4">
        <button
          id="terminology-mobile-navigation-button"
          class="btn btn-outline-primary dropdown-toggle w-100"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          On this page
        </button>
        <nav
          class="dropdown-menu w-100"
          aria-labelledby="terminology-mobile-navigation-button"
        >
          <a
            v-for="item in navigationItems"
            :key="item.id"
            class="dropdown-item"
            :href="`#${item.id}`"
          >
            {{ item.label }}
          </a>
        </nav>
      </div>
      <h2 class="pb-3">Terminology</h2>
      <p class="terminology-description">
        Terminologies used in G2P are described here. Where possible, community
        standards are used.
      </p>
      <section id="g2p-confidence-section">
        <h3>G2P Confidence Category</h3>
        <p class="terminology-description">GenCC confidence terms are used</p>
        <div class="pt-1 table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in sortedConfidenceCategoryList"
                :key="index"
              >
                <td>
                  <span
                    v-if="Object.keys(item)[0]"
                    class="badge text-white"
                    :style="{
                      backgroundColor:
                        CONFIDENCE_COLOR_MAP[
                          Object.keys(item)[0].toLowerCase()
                        ],
                    }"
                  >
                    {{ Object.keys(item)[0] }}
                  </span>
                </td>
                <td>
                  <span v-if="Object.values(item)[0]">
                    {{ Object.values(item)[0] }}
                  </span>
                  <span v-else class="text-muted">
                    No description available
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mb-0">
          <i class="bi bi-info-circle"></i> Operationally several groups use
          <strong>definitive</strong>, <strong>strong</strong> and
          <strong>moderate</strong> for clinical reporting.
        </p>
        <p>
          <i class="bi bi-info-circle"></i> <strong>Limited</strong>,
          <strong>disputed</strong> and <strong>refuted</strong> are not used
          for clinical reporting.
        </p>
      </section>
      <section id="allelic-requirement-section" class="pt-3">
        <h3>Allelic Requirement</h3>
        <p class="terminology-description">
          HPO Mode of inheritance (MOI) terminology is used. G2P uses synonyms
          of the MOI terms as many of the disorders described are de novo.
        </p>
        <div class="pt-1 table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Genotype</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in terminologyDescriptionData.genotype"
                :key="index"
              >
                <td>{{ Object.keys(item)[0] }}</td>
                <td>
                  <span v-if="Object.values(item)[0]">
                    {{ Object.values(item)[0] }}
                  </span>
                  <span v-else class="text-muted">
                    No description available
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section id="cross-cutting-modifier-section" class="pt-3">
        <h3>Cross Cutting Modifier</h3>
        <p class="terminology-description">
          HPO inheritance qualifier terms are used where available
        </p>
        <div class="pt-1 table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Modifier</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(
                  item, index
                ) in terminologyDescriptionData.cross_cutting_modifier"
                :key="index"
              >
                <td>{{ Object.keys(item)[0] }}</td>
                <td>
                  <span v-if="Object.values(item)[0]">
                    {{ Object.values(item)[0] }}
                  </span>
                  <span v-else class="text-muted">
                    No description available
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section id="molecular-mechanism-section" class="pt-3">
        <h3>Molecular Mechanism</h3>
        <p class="terminology-description">
          The mechanism of disease derived from the available evidence,
          following the definitions of Backwell and Marsh. More information can
          be found
          <a
            href="https://europepmc.org/article/MED/35395171"
            class="text-decoration-none"
            target="_blank"
            rel="noopener noreferrer"
            >here</a
          >.
        </p>
        <div class="pt-1 table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Molecular Mechanism</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in molecularDescriptionData.mechanism"
                :key="index"
              >
                <td>{{ Object.keys(item)[0] }}</td>
                <td>
                  <span v-if="Object.values(item)[0]">
                    {{ Object.values(item)[0] }}
                  </span>
                  <span v-else class="text-muted">
                    No description available
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section id="mechanism-synopsis-section" class="pt-3">
        <h3>Molecular Mechanism Synopsis</h3>
        <p class="terminology-description">
          A more detailed description of the molecular mechanism, following the
          definitions of Backwell and Marsh. More information can be found
          <a
            href="https://europepmc.org/article/MED/35395171"
            class="text-decoration-none"
            target="_blank"
            rel="noopener noreferrer"
            >here</a
          >.
        </p>
        <div class="pt-1 table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Molecular Mechanism Synopsis</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(
                  item, index
                ) in molecularDescriptionData.mechanism_synopsis"
                :key="index"
              >
                <td>{{ Object.keys(item)[0] }}</td>
                <td>
                  <span v-if="Object.values(item)[0]">
                    {{ Object.values(item)[0] }}
                  </span>
                  <span v-else class="text-muted">
                    No description available
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section id="mechanism-evidence-section" class="pt-3">
        <h3>Molecular Mechanism Evidence Types</h3>
        <p class="terminology-description">
          G2P evidence classifications reuse terms from the ClinGen gene-disease
          validity SOP Experimental Evidence Summary Matrix. More information
          can be found
          <a
            href="https://clinicalgenome.org/docs/gene-disease-validity-standard-operating-procedures-version-10/"
            class="text-decoration-none"
            target="_blank"
            rel="noopener noreferrer"
            >here</a
          >.
        </p>
        <div class="pt-1 table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Class</th>
                <th scope="col">Evidence Type</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="primaryEvidenceType in Object.keys(
                  molecularDescriptionData.evidence,
                )"
                :key="primaryEvidenceType"
              >
                <tr
                  v-for="(secondaryTypeObj, index) in molecularDescriptionData
                    .evidence[primaryEvidenceType]"
                  :key="index"
                >
                  <td>{{ primaryEvidenceType }}</td>
                  <td>{{ Object.keys(secondaryTypeObj)[0] }}</td>
                  <td>
                    <span v-if="Object.values(secondaryTypeObj)[0]">
                      {{ Object.values(secondaryTypeObj)[0] }}
                    </span>
                    <span v-else class="text-muted">
                      No description available
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
      <section id="variant-consequence-section" class="pt-3">
        <h3>Variant Consequence</h3>
        <p class="terminology-description">
          The consequence of the reported variants at the protein (for
          protein-coding genes) or the RNA (for non-protein coding genes), per
          allele. More information can be found
          <a
            href="https://europepmc.org/article/MED/37982373"
            class="text-decoration-none"
            target="_blank"
            rel="noopener noreferrer"
            >here</a
          >.
        </p>
        <div class="pt-1 table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Consequence</th>
                <th scope="col">Description in SO</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="term in variantDescriptionData.other_variants"
                :key="term.accession"
              >
                <td
                  v-if="
                    VariantConsequencesAttribs.some(
                      (attr) => attr.inputKey === term.term.replace(/ /g, '_'),
                    )
                  "
                >
                  {{ term.term }}
                </td>
                <td
                  v-if="
                    VariantConsequencesAttribs.some(
                      (attr) => attr.inputKey === term.term.replace(/ /g, '_'),
                    )
                  "
                >
                  <a
                    :href="`http://www.sequenceontology.org/browser/current_release/term/${term.accession}`"
                    class="text-decoration-none"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ term.accession }}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section id="variant-types-section" class="pt-3">
        <h3>Variant Types</h3>
        <p class="terminology-description">
          The types of variants associated with the curated gene-disease pair
          reported in the publication
        </p>
        <div class="pt-1 table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Primary Type</th>
                <th scope="col">Variant Type</th>
                <th scope="col">Description in SO</th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="(consequences, index) in Object.keys(
                  variantDescriptionData,
                )"
                :key="index"
              >
                <tr
                  v-for="(term, termIndex) in variantDescriptionData[
                    consequences
                  ]"
                  :key="term.accession"
                >
                  <td
                    v-if="termIndex === 0"
                    :rowspan="variantDescriptionData[consequences].length"
                  >
                    {{ consequences }}
                  </td>
                  <td
                    v-if="
                      !VariantConsequencesAttribs.some(
                        (attr) =>
                          attr.inputKey === term.term.replace(/ /g, '_'),
                      )
                    "
                  >
                    {{ term.term }}
                  </td>
                  <td
                    v-if="
                      !VariantConsequencesAttribs.some(
                        (attr) =>
                          attr.inputKey === term.term.replace(/ /g, '_'),
                      )
                    "
                  >
                    <a
                      :href="`http://www.sequenceontology.org/browser/current_release/term/${term.accession}`"
                      class="text-decoration-none"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ term.accession }}
                    </a>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </div>
    <nav id="side-navbar" class="h-100 flex-column align-items-stretch ps-3">
      <strong class="d-none d-md-block h6 my-2 ms-3 text-body-secondary">
        On this page
      </strong>
      <hr class="d-none d-md-block my-2 ms-3" />
      <nav class="nav nav-pills flex-column">
        <a
          v-for="item in navigationItems"
          :key="item.id"
          class="nav-link"
          :href="`#${item.id}`"
        >
          {{ item.label }}
        </a>
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

#terminology-main {
  display: flex;
  justify-content: space-between;
}

#terminology-content-div {
  width: 80%;
}

#side-navbar {
  width: 20%;
}

th {
  white-space: nowrap;
}

.terminology-description {
  padding-bottom: 8px;
}

.mobile-navigation {
  display: none;
}

@media (max-width: 767.98px) {
  #terminology-content-div {
    width: 100%;
    min-width: 0;
  }

  #side-navbar {
    display: none;
  }

  .mobile-navigation {
    display: block;
  }
}
</style>
