<script>
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
import {
  getAffectedIndividualsInputErrorMsg,
  getFamiliesInputErrorMsg,
} from "../../utility/CurationUtility.js";
export default {
  props: {
    fetchPublications: Function,
    isPublicationsDataLoading: Boolean,
    publicationsErrorMsg: String,
    publications: Object,
    inputPmids: String,
    isInputPmidsValid: Boolean,
    inputPmidsInvalidMsg: String,
  },
  emits: ["update:publications", "update:inputPmids"],
  data() {
    return {
      EUROPE_PMC_URL,
    };
  },
  methods: {
    inputHandler(key, pmid, inputValue) {
      let updatedPublications = { ...this.publications };
      updatedPublications[pmid][key] = inputValue;
      this.$emit("update:publications", updatedPublications);
    },
    getFamiliesInputErrorMsg,
    getAffectedIndividualsInputErrorMsg,
  },
};
</script>
<template>
  <div class="accordion py-1" id="publication-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#publication-section-body"
          aria-expanded="false"
          aria-controls="publication-section-body"
        >
          Publications
        </button>
      </h2>
      <div id="publication-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <div class="row g-3 py-3">
            <div class="col-auto">
              <label for="publications-input" class="col-form-label">
                Publication(s)<span class="text-danger">*</span>
              </label>
            </div>
            <div class="col-4">
              <textarea
                :class="
                  isInputPmidsValid ? 'form-control' : 'form-control is-invalid'
                "
                id="publications-input"
                :value="inputPmids"
                @input="$emit('update:inputPmids', $event.target.value)"
                rows="3"
                aria-describedby="invalid-publications-input-feedback"
              >
              </textarea>
              <div
                id="invalid-publications-input-feedback"
                class="invalid-feedback"
              >
                {{ inputPmidsInvalidMsg }}
              </div>
              <div class="form-text" id="publications-input-help-text">
                For multiple entries, separate by semicolon
              </div>
            </div>
            <div class="col-auto">
              <button
                type="button"
                class="btn btn-primary mb-3"
                @click="fetchPublications"
              >
                <i class="bi bi-plus-circle-fill"></i> Add
              </button>
            </div>
          </div>
          <div
            class="d-flex justify-content-center"
            v-if="isPublicationsDataLoading"
            style="margin-top: 20px; margin-bottom: 20px"
          >
            <div class="spinner-border text-secondary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div
            class="alert alert-danger mt-3"
            role="alert"
            v-if="publicationsErrorMsg"
          >
            <div>
              <i class="bi bi-exclamation-circle-fill"></i>
              {{ publicationsErrorMsg }}
            </div>
          </div>
          <div v-if="publications && Object.keys(publications).length > 0">
            <div class="d-flex justify-content-between mb-3">
              <div>
                <strong><p>Enter Publications Data</p></strong>
              </div>
              <button
                class="btn btn-outline-danger"
                data-bs-toggle="modal"
                data-bs-target="#remove-publication-modal"
              >
                <i class="bi bi-trash-fill"></i> Remove Publication(s)
              </button>
            </div>
            <div
              class="accordion py-1"
              :id="`parent-accordion-${pmid}`"
              v-for="pmid in Object.keys(publications)"
            >
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#inner-accordion-${pmid}`"
                    aria-expanded="true"
                    :aria-controls="`inner-accordion-${pmid}`"
                  >
                    PMID: {{ pmid }}
                  </button>
                </h2>
                <div
                  :id="`inner-accordion-${pmid}`"
                  class="accordion-collapse collapse show"
                  :data-bs-parent="`parent-accordion-${pmid}`"
                >
                  <div class="accordion-body">
                    <div class="row g-3">
                      <div class="col-12">
                        <a
                          :href="EUROPE_PMC_URL + pmid"
                          style="text-decoration: none"
                          v-if="pmid"
                          target="_blank"
                        >
                          View Publication
                          <i class="bi bi-box-arrow-up-right"></i>
                        </a>
                      </div>
                      <div class="col-6">
                        <label
                          :for="`publication-pmid-input-${pmid}`"
                          class="form-label"
                        >
                          PMID
                        </label>
                        <input
                          class="form-control"
                          type="text"
                          :value="pmid"
                          aria-label="readonly input example"
                          :id="`publication-pmid-input-${pmid}`"
                          disabled
                        />
                      </div>
                      <div class="col-6">
                        <label
                          :for="`publication-year-input-${pmid}`"
                          class="form-label"
                        >
                          Year
                        </label>
                        <input
                          class="form-control"
                          type="text"
                          :id="`publication-year-input-${pmid}`"
                          :value="publications[pmid].year"
                          aria-label="readonly input example"
                          disabled
                        />
                      </div>
                      <div class="col-12">
                        <label
                          :for="`publication-title-input-${pmid}`"
                          class="form-label"
                        >
                          Title
                        </label>
                        <input
                          class="form-control"
                          type="text"
                          :id="`publication-title-input-${pmid}`"
                          :value="publications[pmid].title"
                          aria-label="readonly input example"
                          disabled
                        />
                      </div>
                      <div class="col-12">
                        <label
                          :for="`publication-authors-input-${pmid}`"
                          class="form-label"
                        >
                          Authors
                        </label>
                        <input
                          class="form-control"
                          type="text"
                          :id="`publication-authors-input-${pmid}`"
                          :value="publications[pmid].authors"
                          aria-label="readonly input example"
                          disabled
                        />
                      </div>
                      <div class="col-md-3">
                        <label
                          :for="`publication-families-input-${pmid}`"
                          class="form-label"
                        >
                          Number of Families
                        </label>
                        <input
                          type="number"
                          :class="
                            getFamiliesInputErrorMsg(
                              publications[pmid].families,
                              publications[pmid].affectedIndividuals
                            )
                              ? 'form-control is-invalid'
                              : 'form-control'
                          "
                          :id="`publication-families-input-${pmid}`"
                          min="0"
                          :value="publications[pmid].families"
                          @input="
                            inputHandler(
                              'families',
                              pmid,
                              Number($event.target.value)
                            )
                          "
                          aria-describedby="invalid-families-input-feedback"
                        />
                        <div
                          id="invalid-families-input-feedback"
                          class="invalid-feedback"
                        >
                          {{
                            getFamiliesInputErrorMsg(
                              publications[pmid].families,
                              publications[pmid].affectedIndividuals
                            )
                          }}
                        </div>
                      </div>
                      <div class="col-md-3">
                        <label
                          :for="`publication-affected-individuals-input-${pmid}`"
                          class="form-label"
                        >
                          Affected Individuals
                        </label>
                        <input
                          type="number"
                          :class="
                            getAffectedIndividualsInputErrorMsg(
                              publications[pmid].families,
                              publications[pmid].affectedIndividuals
                            )
                              ? 'form-control is-invalid'
                              : 'form-control'
                          "
                          :id="`publication-affected-individuals-input-${pmid}`"
                          min="0"
                          :value="publications[pmid].affectedIndividuals"
                          @input="
                            inputHandler(
                              'affectedIndividuals',
                              pmid,
                              Number($event.target.value)
                            )
                          "
                          aria-describedby="invalid-affected-individuals-input-feedback"
                        />
                        <div
                          id="invalid-affected-individuals-input-feedback"
                          class="invalid-feedback"
                        >
                          {{
                            getAffectedIndividualsInputErrorMsg(
                              publications[pmid].families,
                              publications[pmid].affectedIndividuals
                            )
                          }}
                        </div>
                      </div>
                      <div class="col-md-3">
                        <label
                          :for="`publication-consanguineous-input-${pmid}`"
                          class="form-label"
                          >Consanguineous</label
                        >
                        <select
                          :id="`publication-consanguineous-input-${pmid}`"
                          class="form-select"
                          :value="publications[pmid].consanguineous"
                          @input="
                            inputHandler(
                              'consanguineous',
                              pmid,
                              $event.target.value
                            )
                          "
                        >
                          <option value="unknown">Unknown</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div class="col-md-3">
                        <label
                          :for="`publication-ancestries-input-${pmid}`"
                          class="form-label"
                        >
                          Ancestries
                        </label>
                        <input
                          type="text"
                          class="form-control"
                          :id="`publication-ancestries-input-${pmid}`"
                          :value="publications[pmid].ancestries"
                          @input="
                            inputHandler(
                              'ancestries',
                              pmid,
                              $event.target.value
                            )
                          "
                        />
                      </div>
                      <div class="col-12">
                        <label
                          :for="`publication-comment-input-${pmid}`"
                          class="form-label"
                        >
                          Comment
                        </label>
                        <textarea
                          class="form-control"
                          :id="`publication-comment-input-${pmid}`"
                          rows="3"
                          :value="publications[pmid].comment"
                          @input="
                            inputHandler('comment', pmid, $event.target.value)
                          "
                        ></textarea>
                      </div>
                    </div>
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
