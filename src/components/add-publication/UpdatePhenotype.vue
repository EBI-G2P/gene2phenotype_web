<script>
import { HELP_TEXT } from "../../utility/Constants.js";
import ToolTip from "../tooltip/ToolTip.vue";
export default {
  props: {
    currentPhenotypes: Object,
    clinicalPhenotype: Object,
    hpoTermsInputHelper: Object,
    fetchAndSearchHPO: Function,
  },
  data() {
    return {
      HELP_TEXT,
    };
  },
  components: { ToolTip },
  emits: ["update:clinicalPhenotype", "update:hpoTermsInputHelper"],
  methods: {
    selectTerm(pmid, term) {
      // searchTerm should be cleared and HPOsearchResponseJson should be set to empty list
      let updatedHpoTermsInputHelper = { ...this.hpoTermsInputHelper };
      updatedHpoTermsInputHelper[pmid].searchTerm = "";
      updatedHpoTermsInputHelper[pmid].HPOsearchResponseJson = [];
      this.$emit("update:hpoTermsInputHelper", updatedHpoTermsInputHelper);

      // IF the selected term is not already present in hpo_terms list THEN add it
      if (
        !this.clinicalPhenotype[pmid].hpo_terms.find(
          (item) => item.accession === term.id
        )
      ) {
        let updatedClinicalPhenotype = { ...this.clinicalPhenotype };
        updatedClinicalPhenotype[pmid].hpo_terms.push({
          accession: term.id,
          term: term.name,
        });
        this.$emit("update:clinicalPhenotype", updatedClinicalPhenotype);
      }
    },
    removeSelectedTerm(pmid, removedTermAccession) {
      let updatedClinicalPhenotype = { ...this.clinicalPhenotype };
      // remove term from hpo_terms list
      updatedClinicalPhenotype[pmid].hpo_terms = updatedClinicalPhenotype[
        pmid
      ].hpo_terms.filter((item) => item.accession !== removedTermAccession);
      this.$emit("update:clinicalPhenotype", updatedClinicalPhenotype);
    },
    summaryInputHandler(pmid, inputValue) {
      let updatedClinicalPhenotype = { ...this.clinicalPhenotype };
      updatedClinicalPhenotype[pmid].summary = inputValue;
      this.$emit("update:clinicalPhenotype", updatedClinicalPhenotype);
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="clinical-phenotype-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#clinical-phenotype-section-body"
          aria-expanded="false"
          aria-controls="clinical-phenotype-section-body"
        >
          Phenotypic Features
        </button>
      </h2>
      <div
        id="clinical-phenotype-section-body"
        class="accordion-collapse collapse"
      >
        <div class="accordion-body">
          <div class="row g-3 px-3 py-3">
            <div
              v-if="currentPhenotypes?.length > 0"
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
                    Current Phenotypic Features ({{ currentPhenotypes.length }})
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
                          v-for="item in currentPhenotypes"
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
            <p v-else>
              <i class="bi bi-info-circle"></i> There are no Phenotypic Features
              available for this record.
            </p>
            <div
              v-if="
                clinicalPhenotype && Object.keys(clinicalPhenotype).length > 0
              "
            >
              <h5>Phenotypic Features for new Publication(s)</h5>
              <div v-for="pmid in Object.keys(clinicalPhenotype)" :key="pmid">
                <h6 class="mt-3">Publication (PMID: {{ pmid }})</h6>
                <div class="row pt-3">
                  <div class="dropdown">
                    <button
                      class="btn btn-primary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Click to search HPO terms
                    </button>
                    <div class="dropdown-menu">
                      <form class="p-3" @submit.prevent>
                        <label
                          :for="`search-phenotype-${pmid}`"
                          class="form-label"
                        >
                          Search and select Human Phenotype Ontology terms
                        </label>
                        <input
                          type="text"
                          :id="`search-phenotype-${pmid}`"
                          placeholder="E.g. Abnormality of the kidney"
                          :value="hpoTermsInputHelper[pmid].searchTerm"
                          @input="fetchAndSearchHPO(pmid, $event.target.value)"
                          class="form-control"
                        />
                        <div
                          class="form-text"
                          :id="`search-phenotype-${pmid}-input-help-text`"
                        >
                          Enter at least 3 letters to find and select HPO
                          term(s) then click outside to close.
                        </div>
                      </form>
                      <div
                        v-if="hpoTermsInputHelper[pmid].isLoadingValue"
                        class="d-flex justify-content-center my-1"
                      >
                        <div
                          class="spinner-border text-secondary spinner-border-sm"
                          role="status"
                        >
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </div>
                      <div
                        class="alert alert-danger mx-3 mb-3 mt-1"
                        role="alert"
                        v-if="hpoTermsInputHelper[pmid].HPOAPIerrormsg"
                      >
                        <div>
                          <i class="bi bi-exclamation-circle-fill"></i>
                          {{ hpoTermsInputHelper[pmid].HPOAPIerrormsg }}
                        </div>
                      </div>
                      <div
                        v-if="
                          hpoTermsInputHelper[pmid].HPOsearchResponseJson
                            ?.length > 0
                        "
                      >
                        <div class="dropdown-divider"></div>
                        <li>
                          <h6 class="dropdown-header">
                            HPO term suggestions
                            <ToolTip
                              :toolTipText="HELP_TEXT.CLICK_HPO_SUGGESTION"
                            />
                          </h6>
                        </li>
                        <li
                          v-for="term in hpoTermsInputHelper[pmid]
                            .HPOsearchResponseJson"
                          :key="term.id"
                          @mousedown="selectTerm(pmid, term)"
                          class="dropdown-item text-wrap"
                        >
                          {{ term.name }}
                        </li>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-4">
                  <label
                    :for="`phenotype-summary-input-${pmid}`"
                    class="form-label"
                  >
                    Summary
                  </label>
                  <textarea
                    class="form-control"
                    :id="`phenotype-summary-input-${pmid}`"
                    rows="3"
                    :value="clinicalPhenotype[pmid].summary"
                    @input="summaryInputHandler(pmid, $event.target.value)"
                  ></textarea>
                </div>
                <div
                  class="row pt-3"
                  v-if="clinicalPhenotype[pmid].hpo_terms?.length > 0"
                >
                  <div class="col-12">
                    <p>Selected HPO Term(s)</p>
                  </div>
                  <div class="col-7">
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th>Accession</th>
                          <th>Term</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in clinicalPhenotype[pmid].hpo_terms"
                          :key="item.accession"
                        >
                          <td>{{ item.accession }}</td>
                          <td>{{ item.term }}</td>
                          <td class="text-nowrap">
                            <button
                              type="button"
                              class="btn btn-link p-0 text-danger"
                              style="text-decoration: none"
                              @click="removeSelectedTerm(pmid, item.accession)"
                            >
                              <i class="bi bi-trash-fill"></i> Remove
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
