<script>
import { ref, computed } from "vue";
export default {
  setup() {
    let searchTerm = ref("");
    const isLoadingValue = ref(false);
    const HPOsearchResponseJson = ref(null);
    const HPOAPIerrormsg = ref(null);
    const showDropDown = ref(false);
    let TermSelected = ref("");

    //function to fetch ontology data
    // Function to fetch and return filtered ontology data based on search term
    const fetchAndSearchHPO = computed(async () => {
      isLoadingValue.value = true;
      HPOAPIerrormsg.value = null;
      HPOsearchResponseJson.value = [];

      if (searchTerm.value.length < 3) {
        isLoadingValue.value = false;
        return [];
      }
      try {
        // Call the ontology API
        const hpoApiResponse = await fetch(
          `https://ontology.jax.org/api/hp/search?q=${searchTerm.value}&page=0&limit=10`
        );

        if (!hpoApiResponse.ok) {
          throw new Error("Failed to fetch HPO API");
        }

        const ontology_data = await hpoApiResponse.json();
        HPOsearchResponseJson.value = ontology_data.terms || [];
      } catch (error) {
        HPOAPIerrormsg.value = "HPO ontology API not working, try again later";
      } finally {
        isLoadingValue.value = false;
      }

      console.log(HPOsearchResponseJson.value);
      return HPOsearchResponseJson.value; // Return search results
    });

    const onInput = () => {
      fetchAndSearchHPO.value;
    };

    const selectTerm = (term) => {
      TermSelected.value = term.name;
      showDropDown.value = false;
      searchTerm.value = "";
    };

    const hideDropdown = () => {
      setTimeout(() => {
        showDropDown.value = false;
      }, 800);
    };

    return {
      isLoadingValue,
      HPOsearchResponseJson,
      HPOAPIerrormsg,
      fetchAndSearchHPO, //expose function, because it allows other component to access and invoke the function
      showDropDown,
      hideDropdown,
      TermSelected,
      searchTerm,
      selectTerm,
      onInput,
    };
  },
  props: {
    fetchHpoTerms: Function,
    clinicalPhenotype: Object,
    hpoTermsInputHelper: Object,
  },
  emits: ["update:clinicalPhenotype", "update:hpoTermsInputHelper"],
  methods: {
    summaryInputHandler(pmid, inputValue) {
      console.log(inputValue);
      let updateClinicalPhenotype = { ...this.clinicalPhenotype };
      updateClinicalPhenotype[pmid].summary = inputValue;
      this.$emit("update:clinicalPhenotype", updateClinicalPhenotype);
    },
    hpoTermsInputHandler(pmid, inputValue) {
      let updatedHpoTermsInputHelper = { ...this.hpoTermsInputHelper };
      updatedHpoTermsInputHelper[pmid].hpoTermsInput = inputValue;
      this.$emit("update:hpoTermsInputHelper", updatedHpoTermsInputHelper);
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
          <div
            class="row g-3 px-3 py-3"
            v-if="
              clinicalPhenotype && Object.keys(clinicalPhenotype).length > 0
            "
            v-for="pmid in Object.keys(clinicalPhenotype)"
          >
            <div class="row">
              <div class="col-12">
                <strong>
                  <p class="mb-0">Publication (PMID: {{ pmid }})</p>
                </strong>
              </div>
            </div>
            <div class="row pt-3">
              <label for="search_phenotype" class="form_label">
                Search Phenotypes
              </label>
              <div class="d-flex align-items-center position-relative">
                <input
                  type="text"
                  id="search_phenotype"
                  placeholder="Enter phenotype...."
                  v-model="searchTerm"
                  @input="onInput"
                  @focus="showDropdown = true"
                  @blur="hideDropdown"
                  style="
                    width: 100%;
                    max-width: 300px;
                    border: 2px solid #00008b;
                    border-radius: 8px;
                    padding: 10px;
                    margin-right: 10px;
                    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
                  "
                />
                <button type="button" class="btn btn-primary">Enter</button>

                <!-- Autocomplete Dropdown -->
                <ul
                  v-if="HPOsearchResponseJson && HPOsearchResponseJson.length"
                  class="w-full rounded bg-white border border-gray-300 px-4 py-2 space-y-1 absolute z-10"
                >
                  <li
                    v-for="term in HPOsearchResponseJson"
                    :key="term.id"
                    @click="selectTerm(term)"
                    class="cursor-pointer hover:bg-gray-100 p-1"
                  >
                    {{ term.name }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="row pt-3">
              <div class="col-2">
                <label
                  :for="`phenotype-summary-input-${pmid}`"
                  class="col-form-label"
                >
                  Summary
                </label>
              </div>
              <div class="col-4">
                <textarea
                  class="form-control"
                  :id="`phenotype-summary-input-${pmid}`"
                  rows="3"
                  :value="clinicalPhenotype[pmid].summary"
                  @input="summaryInputHandler(pmid, $event.target.value)"
                >
                </textarea>
              </div>
            </div>
            <div
              class="row py-3"
              v-if="hpoTermsInputHelper && hpoTermsInputHelper[pmid]"
            >
              <div class="col-2">
                <label
                  :for="`phenotype-hpo-terms-input-${pmid}`"
                  class="col-form-label"
                >
                  HPO Terms(s)
                </label>
              </div>
              <div class="col-4">
                <textarea
                  :class="
                    hpoTermsInputHelper[pmid].isHpoTermsValid
                      ? 'form-control'
                      : 'form-control is-invalid'
                  "
                  :id="`phenotype-hpo-terms-input-${pmid}`"
                  :value="hpoTermsInputHelper[pmid].hpoTermsInput"
                  @input="hpoTermsInputHandler(pmid, $event.target.value)"
                  rows="3"
                  :aria-describedby="`invalid-phenotype-hpo-terms-input-feedback-${pmid}`"
                >
                </textarea>
                <div
                  :id="`invalid-phenotype-hpo-terms-input-feedback-${pmid}`"
                  class="invalid-feedback"
                >
                  Please enter valid HPO Terms(s).
                </div>
                <div
                  class="form-text"
                  :id="`phenotype-hpo-terms-input-help-text-${pmid}`"
                >
                  For multiple entries, separate by semicolon
                </div>
              </div>
              <div class="col-auto">
                <button
                  type="button"
                  class="btn btn-primary mb-3"
                  @click="fetchHpoTerms(pmid)"
                >
                  <i class="bi bi-search"></i> Look Up
                </button>
              </div>
            </div>
            <div
              class="d-flex justify-content-center"
              v-if="
                hpoTermsInputHelper &&
                hpoTermsInputHelper[pmid]?.isHpoTermsDataLoading
              "
              style="margin-top: 20px; margin-bottom: 20px"
            >
              <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-if="
                hpoTermsInputHelper &&
                hpoTermsInputHelper[pmid]?.hpoTermsErrorMsg
              "
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ hpoTermsInputHelper[pmid].hpoTermsErrorMsg }}
              </div>
            </div>
            <div
              class="row py-3"
              v-if="
                clinicalPhenotype[pmid].hpo_terms &&
                clinicalPhenotype[pmid].hpo_terms.length > 0
              "
            >
              <div class="col-12">
                <strong><p class="mb-3">HPO Terms</p></strong>
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
          <div class="row g-3 px-3 py-3" v-else>
            <p>
              <i class="bi bi-info-circle"></i> Please enter Publication(s) to
              fill this section.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
