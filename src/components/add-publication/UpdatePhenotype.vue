<script>
import ToolTip from "../tooltip/ToolTip.vue";
import { HPO_SEARCH_API_URL } from "../../utility/UrlConstants.js";
export default {
  data() {
    return {
      isLoadingValue: {},
      HPOsearchResponseJson: {},
      HPOAPIerrormsg: {},
      showDropDown: {},
      searchTerm: {},
    };
  },
  props: {
    currentPhenotypes: Object,
    clinicalPhenotype: Object,
    hpoTermsInputHelper: Object,
  },
  components: { ToolTip },
  emits: ["update:clinicalPhenotype", "update:hpoTermsInputHelper"],
  methods: {
    initializeStateForPmid(pmid) {
      if (!this.searchTerm[pmid]) this.searchTerm[pmid] = "";
      if (!this.isLoadingValue[pmid]) this.isLoadingValue[pmid] = false;
      if (!this.HPOsearchResponseJson[pmid])
        this.HPOsearchResponseJson[pmid] = [];
      if (!this.HPOAPIerrormsg[pmid]) this.HPOAPIerrormsg[pmid] = null;
      if (!this.showDropDown[pmid]) this.showDropDown[pmid] = false;
    },
    async fetchAndSearchHPO(pmid) {
      this.isLoadingValue[pmid] = true;
      this.HPOsearchResponseJson[pmid] = [];
      this.HPOAPIerrormsg[pmid] = null;

      if (!this.searchTerm[pmid] || this.searchTerm[pmid].length < 3) {
        this.isLoadingValue[pmid] = false;
        return;
      }

      try {
        const hpoApiResponse = await fetch(
          `${HPO_SEARCH_API_URL}?q=${this.searchTerm[pmid]}&page=0&limit=10`
        );
        if (!hpoApiResponse.ok) throw new Error("Failed to fetch HPO data");

        const ontology_data = await hpoApiResponse.json();
        this.HPOsearchResponseJson[pmid] = ontology_data.terms;
      } catch (error) {
        this.HPOsearchResponseJson[pmid] = [];
        this.HPOAPIerrormsg[pmid] =
          "Failed to fetch HPO data, please try again later.";
        console.log(this.HPOAPIerrormsg[pmid]);
      } finally {
        this.isLoadingValue[pmid] = false;
      }
    },
    onInput(pmid) {
      this.initializeStateForPmid(pmid);
      this.showDropDown[pmid] = true;
      this.fetchAndSearchHPO(pmid);
    },
    selectTerm(pmid, term) {
      if (!term || !pmid) return;
      this.initializeStateForPmid(pmid);

      this.hpoTermsInputHandler(pmid, term.id);
      this.searchTerm[pmid] = "";
      this.HPOsearchResponseJson[pmid] = []; // to make the dropdown have nothing to dropdown since a term has been selected

      // Ensure clinicalPhenotype is not mutated directly
      let updatedClinicalPhenotype = { ...this.clinicalPhenotype };
      updatedClinicalPhenotype[pmid].hpo_terms.push({
        accession: term.id,
        term: term.name,
      });

      this.$emit("update:clinicalPhenotype", updatedClinicalPhenotype);
      this.showDropDown[pmid] = false;
    },
    hpoTermsInputHandler(pmid, inputValue) {
      let updatedHpoTermsInputHelper = { ...this.hpoTermsInputHelper };
      if (!updatedHpoTermsInputHelper[pmid].hpoTermsInput) {
        updatedHpoTermsInputHelper[pmid].hpoTermsInput = inputValue;
      } else {
        updatedHpoTermsInputHelper[pmid].hpoTermsInput += `;${inputValue}`;
      }

      this.$emit("update:hpoTermsInputHelper", updatedHpoTermsInputHelper);
    },
    summaryInputHandler(pmid, inputValue) {
      let updatedClinicalPhenotype = { ...this.clinicalPhenotype };
      if (!updatedClinicalPhenotype[pmid]) updatedClinicalPhenotype[pmid] = {};
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
              v-if="currentPhenotypes && currentPhenotypes.length > 0"
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
                            <span
                              v-if="
                                item.publications &&
                                item.publications.length > 0
                              "
                            >
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
                    <div class="dropdown-menu w-50">
                      <form class="p-3">
                        <label
                          :for="`search-phenotype-${pmid}`"
                          class="form-label"
                        >
                          Search and select Human Phenotype Ontology terms
                          <ToolTip
                            toolTipText="Atleast 3 letters required to display HPO term suggestions."
                          />
                        </label>
                        <input
                          type="text"
                          :id="`search-phenotype-${pmid}`"
                          placeholder="E.g. Abnormality of the kidney"
                          v-model="searchTerm[pmid]"
                          @input="onInput(pmid)"
                          class="form-control"
                        />
                        <div
                          class="form-text"
                          :id="`search-phenotype-${pmid}-input-help-text`"
                        >
                          Enter atleast 3 letters to find and select HPO term(s)
                          then click outside to close.
                        </div>
                      </form>
                      <div
                        class="alert alert-danger m-3"
                        role="alert"
                        v-if="HPOAPIerrormsg[pmid]"
                      >
                        <div>
                          <i class="bi bi-exclamation-circle-fill"></i>
                          {{ HPOAPIerrormsg[pmid] }}
                        </div>
                      </div>
                      <div
                        v-if="
                          HPOsearchResponseJson[pmid] &&
                          HPOsearchResponseJson[pmid].length > 0 &&
                          showDropDown[pmid]
                        "
                      >
                        <div class="dropdown-divider"></div>
                        <li>
                          <h6 class="dropdown-header">
                            HPO term suggestions
                            <ToolTip
                              toolTipText="Click any term to select it."
                            />
                          </h6>
                        </li>
                        <li
                          v-for="term in HPOsearchResponseJson[pmid]"
                          :key="term.id"
                          @mousedown="selectTerm(pmid, term)"
                          class="dropdown-item"
                        >
                          {{ term.name }}
                        </li>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row mt-4 w-50">
                  <label
                    :for="`phenotype-summary-input-${pmid}`"
                    class="col-form-label col-lg-3"
                  >
                    Summary
                  </label>
                  <div class="col-lg-9">
                    <textarea
                      class="form-control"
                      :id="`phenotype-summary-input-${pmid}`"
                      rows="3"
                      :value="clinicalPhenotype[pmid].summary"
                      @input="summaryInputHandler(pmid, $event.target.value)"
                    ></textarea>
                  </div>
                </div>
                <div
                  class="row pt-3"
                  v-if="
                    clinicalPhenotype[pmid].hpo_terms &&
                    clinicalPhenotype[pmid].hpo_terms.length > 0
                  "
                >
                  <div class="col-12">
                    <p>Selected HPO Term(s)</p>
                  </div>
                  <div class="col-6">
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th width="30%">Accession</th>
                          <th width="70%">Term</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in clinicalPhenotype[pmid].hpo_terms">
                          <td>{{ item.accession }}</td>
                          <td>{{ item.term }}</td>
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
