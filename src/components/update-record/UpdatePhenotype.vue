<script>
import { HELP_TEXT } from "../../utility/Constants.js";
import ToolTip from "../tooltip/ToolTip.vue";
import {
  HPO_SEARCH_API_URL,
  UPDATE_PHENOTYPE_URL,
} from "@/utility/UrlConstants";
import axios from "axios";
import api from "@/services/api";
import {
  fetchAndLogGeneralErrorMsg,
  fetchAndLogApiResponseErrorMsg,
} from "@/utility/ErrorUtility";
export default {
  props: {
    stableId: String,
    currentPhenotypes: Object,
    currentPhenotypeSummary: Object,
    currentPublications: Array,
  },
  data() {
    return {
      clinicalPhenotype: this.getInitialClinicalPhenotype(
        this.currentPublications
      ),
      hpoTermsInputHelper: this.getInitialHpoTermsInputHelper(
        this.currentPublications
      ),
      isUpdateApiCallLoading: false,
      updatePhenotypeErrorMsg: null,
      isUpdatePhenotypeSuccess: false,
      updatePhenotypeSuccessMsg: null,
      HELP_TEXT,
    };
  },
  components: { ToolTip },
  methods: {
    getInitialClinicalPhenotype(publications) {
      let initialClinicalPhenotype = {};

      if (publications?.length > 0) {
        publications.forEach((publicationItem) => {
          if (publicationItem?.publication?.pmid) {
            initialClinicalPhenotype[publicationItem.publication.pmid] = {
              summary: "",
              hpo_terms: [],
            };
          }
        });
      }

      return initialClinicalPhenotype;
    },
    getInitialHpoTermsInputHelper(publications) {
      let initialHpoTermsInputHelper = {};

      if (publications?.length > 0) {
        publications.forEach((publicationItem) => {
          if (publicationItem?.publication?.pmid) {
            initialHpoTermsInputHelper[publicationItem.publication.pmid] = {
              isLoadingValue: false,
              HPOsearchResponseJson: [],
              HPOAPIerrormsg: null,
              searchTerm: "",
            };
          }
        });
      }

      return initialHpoTermsInputHelper;
    },
    fetchAndSearchHPO(pmid, inputValue) {
      this.hpoTermsInputHelper[pmid].searchTerm = inputValue;
      this.hpoTermsInputHelper[pmid].HPOsearchResponseJson = [];
      this.hpoTermsInputHelper[pmid].HPOAPIerrormsg = null;

      if (!inputValue || inputValue.length < 3) {
        this.hpoTermsInputHelper[pmid].isLoadingValue = false;
        return;
      }

      this.hpoTermsInputHelper[pmid].isLoadingValue = true;
      axios
        .get(`${HPO_SEARCH_API_URL}?q=${inputValue}&page=0&limit=10`)
        .then((response) => {
          if (response.data?.terms?.length > 0) {
            this.hpoTermsInputHelper[pmid].HPOsearchResponseJson =
              response.data.terms;
          } else {
            const errorMsg = "No results found. Try another term.";
            this.hpoTermsInputHelper[pmid].HPOAPIerrormsg = errorMsg;
            console.log(errorMsg);
          }
        })
        .catch((error) => {
          this.hpoTermsInputHelper[pmid].HPOAPIerrormsg =
            fetchAndLogGeneralErrorMsg(
              error,
              "Failed to fetch HPO data. Please try again later."
            );
        })
        .finally(() => {
          this.hpoTermsInputHelper[pmid].isLoadingValue = false;
        });
    },
    selectTerm(pmid, term) {
      // searchTerm should be cleared and HPOsearchResponseJson should be set to empty list
      this.hpoTermsInputHelper[pmid].searchTerm = "";
      this.hpoTermsInputHelper[pmid].HPOsearchResponseJson = [];

      // IF the selected term is not already present in hpo_terms list THEN add it
      if (
        !this.clinicalPhenotype[pmid].hpo_terms.find(
          (item) => item.accession === term.id
        )
      ) {
        this.clinicalPhenotype[pmid].hpo_terms.push({
          accession: term.id,
          term: term.name,
        });
      }
    },
    removeSelectedTerm(pmid, removedTermAccession) {
      // remove term from hpo_terms list
      this.clinicalPhenotype[pmid].hpo_terms = this.clinicalPhenotype[
        pmid
      ].hpo_terms.filter((item) => item.accession !== removedTermAccession);
    },
    updatePhenotype() {
      this.updatePhenotypeErrorMsg = this.updatePhenotypeSuccessMsg = null;
      this.isUpdatePhenotypeSuccess = false;
      this.isUpdateApiCallLoading = true;

      const requestBody = this.prepareRequestBody();
      console.log(requestBody);
      api
        .post(
          UPDATE_PHENOTYPE_URL.replace(":stableid", this.stableId),
          requestBody
        )
        .then((response) => {
          this.isUpdatePhenotypeSuccess = true;
          this.updatePhenotypeSuccessMsg = response.data.message;
        })
        .catch((error) => {
          this.updatePhenotypeErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to update phenotype. Please try again later.",
            "Unable to update phenotype."
          );
        })
        .finally(() => {
          this.isUpdateApiCallLoading = false;
        });
    },
    prepareRequestBody() {
      // convert clinicalPhenotype from object to array of phenotype objects and include phenotypes that have non empty hpo terms
      let phenotypesArray = [];
      for (const [pmidKey, valueObj] of Object.entries(
        this.clinicalPhenotype
      )) {
        if (valueObj.hpo_terms?.length > 0) {
          valueObj.hpo_terms.forEach((hpoTermObj) => {
            let phenotypeObj = {
              publication: pmidKey,
              accession: hpoTermObj.accession,
            };
            phenotypesArray.push(phenotypeObj);
          });
        }
      }

      // convert clinicalPhenotype from object to array of phenotype summary objects and include non empty phenotype summary
      let summaryArray = [];
      for (const [pmidKey, valueObj] of Object.entries(
        this.clinicalPhenotype
      )) {
        if (valueObj.summary.trim()) {
          let summaryObj = {
            publication: pmidKey.split(),
            summary: valueObj.summary.trim(), // trim summary value
          };
          summaryArray.push(summaryObj);
        }
      }

      let requestBody = {};
      if (phenotypesArray.length > 0) {
        requestBody["hpo_terms"] = phenotypesArray;
      }
      if (summaryArray.length > 0) {
        requestBody["summaries"] = summaryArray;
      }
      return requestBody;
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
          <span
            class="badge rounded-pill text-bg-success mx-2"
            v-if="isUpdatePhenotypeSuccess"
          >
            <i class="bi bi-check-circle-fill"></i> Updated
          </span>
        </button>
      </h2>
      <div
        id="clinical-phenotype-section-body"
        class="accordion-collapse collapse"
      >
        <div class="accordion-body">
          <div class="row g-3 p-2">
            <h5>Phenotypic features</h5>
            <div
              class="d-flex justify-content-center"
              v-if="isUpdateApiCallLoading"
              style="margin-top: 122px; margin-bottom: 122px"
            >
              <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div
              class="alert alert-success mt-3"
              role="alert"
              v-else-if="isUpdatePhenotypeSuccess"
            >
              <div>
                <i class="bi bi-check-circle-fill"></i>
                {{ updatePhenotypeSuccessMsg }}
              </div>
            </div>
            <div v-else>
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
                      Current Phenotypic Features ({{
                        currentPhenotypes.length
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
                <i class="bi bi-info-circle"></i> There are no Phenotypic
                Features available for this record.
              </p>
              <div
                v-if="currentPhenotypeSummary?.length > 0"
                class="accordion accordion-flush mt-3"
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
                      Current Phenotypic Summary ({{
                        currentPhenotypeSummary.length
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
                          <tr v-for="item in currentPhenotypeSummary">
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
              <p v-else class="mt-3 mb-0">
                <i class="bi bi-info-circle"></i> There is no Phenotypic Summary
                available for this record.
              </p>
              <div
                v-if="
                  clinicalPhenotype && Object.keys(clinicalPhenotype).length > 0
                "
                class="pt-2"
              >
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
                            @input="
                              fetchAndSearchHPO(pmid, $event.target.value)
                            "
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
                        v-model="clinicalPhenotype[pmid].summary"
                      ></textarea>
                    </div>
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
                                @click="
                                  removeSelectedTerm(pmid, item.accession)
                                "
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
              <button
                type="button"
                class="btn btn-primary mt-3"
                @click="updatePhenotype"
              >
                <i class="bi bi-pencil-square"></i> Update phenotype
              </button>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-if="updatePhenotypeErrorMsg"
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ updatePhenotypeErrorMsg }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
