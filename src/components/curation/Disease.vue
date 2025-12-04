<script>
import { MONDO_URL, OMIM_URL } from "../../utility/UrlConstants.js";
export default {
  props: {
    inputGeneSymbol: String,
    geneDiseaseData: Object,
    isGeneDiseaseDataLoading: Boolean,
    geneDiseaseErrorMsg: String,
    diseaseName: String,
    diseaseCrossReferences: Array,
  },
  emits: ["update:diseaseName", "update:diseaseCrossReferences"],
  data() {
    return {
      OMIM_URL,
      MONDO_URL,
    };
  },
  methods: {
    checkboxHandler(diseaseCrossReference, checked) {
      let updatedDiseaseCrossReferences = [...this.diseaseCrossReferences];
      if (checked) {
        updatedDiseaseCrossReferences.push(diseaseCrossReference);
      } else {
        const elementIndexToBeRemoved = updatedDiseaseCrossReferences.findIndex(
          (item) => item.identifier === diseaseCrossReference.identifier
        );
        updatedDiseaseCrossReferences.splice(elementIndexToBeRemoved, 1);
      }
      this.$emit(
        "update:diseaseCrossReferences",
        updatedDiseaseCrossReferences
      );
    },
    useDiseaseName(diseaseCrossReference) {
      if (diseaseCrossReference?.disease_name) {
        this.$emit("update:diseaseName", diseaseCrossReference.disease_name);
        // check if disease cross reference is present in list of selected disease cross references
        const index = this.diseaseCrossReferences.findIndex(
          (item) => item.identifier === diseaseCrossReference.identifier
        );
        // if disease cross reference is not present then select it
        if (index === -1) {
          this.checkboxHandler(diseaseCrossReference, true);
        }
      }
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="disease-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#disease-section-body"
          aria-expanded="false"
          aria-controls="disease-section-body"
        >
          Disease Name
        </button>
      </h2>
      <div id="disease-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <div
            class="d-flex justify-content-center"
            v-if="isGeneDiseaseDataLoading"
            style="margin-top: 20px; margin-bottom: 20px"
          >
            <div class="spinner-border text-secondary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div class="row g-3">
            <div class="row g-3">
              <div class="col-auto">
                <label for="disease-name-input" class="col-form-label">
                  Disease Name<span class="text-danger">*</span>
                </label>
              </div>
              <div class="col input-group">
                <span class="input-group-text"
                  >{{ inputGeneSymbol }}-related</span
                >
                <input
                  class="form-control"
                  id="disease-name-input"
                  type="text"
                  :value="diseaseName"
                  @input="$emit('update:diseaseName', $event.target.value)"
                />
              </div>
            </div>
            <div
              class="row g-3 px-3"
              v-if="
                !geneDiseaseErrorMsg && geneDiseaseData?.results?.length > 0
              "
            >
              <strong class="p-0">
                <p class="mb-0">Possible Disease Names and Cross References</p>
              </strong>
              <table
                class="table table-hover table-bordered"
                style="width: 100%"
              >
                <thead>
                  <tr>
                    <th style="width: 5%">Link</th>
                    <th style="width: 55%">Name</th>
                    <th style="width: 20%">Accession</th>
                    <th style="width: 20%">Source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in geneDiseaseData.results">
                    <td class="text-center" style="width: 5%">
                      <input
                        type="checkbox"
                        :id="`disease-name-link-input-${index}`"
                        :checked="
                          diseaseCrossReferences.findIndex(
                            (diseaseCrossReference) =>
                              diseaseCrossReference.identifier ===
                              item.identifier
                          ) !== -1
                        "
                        @input="checkboxHandler(item, $event.target.checked)"
                      />
                    </td>
                    <td style="width: 55%">
                      <div class="d-flex justify-content-between">
                        <div class="flex-grow-1 me-1">
                          {{ item.disease_name }}
                        </div>
                        <div class="flex-shrink-0">
                          <button
                            :id="`disease-name-use-btn-${index}`"
                            class="btn btn-outline-primary py-0 px-1"
                            @click="useDiseaseName(item)"
                            type="button"
                          >
                            Use name
                          </button>
                        </div>
                      </div>
                    </td>
                    <td style="width: 20%">
                      <a
                        :href="OMIM_URL + item.identifier"
                        style="text-decoration: none"
                        v-if="item.source === 'OMIM'"
                        target="_blank"
                      >
                        {{ item.identifier }}
                      </a>
                      <a
                        :href="MONDO_URL + item.identifier"
                        style="text-decoration: none"
                        v-else-if="item.source === 'Mondo'"
                        target="_blank"
                      >
                        {{ item.identifier }}
                      </a>
                      <span v-else>{{ item.identifier }}</span>
                    </td>
                    <td style="width: 20%">{{ item.source }}</td>
                  </tr>
                </tbody>
              </table>
              <p class="m-0">
                <i class="bi bi-info-circle"></i> Clicking on <b>Use name</b>
                will auto-populate the disease name in the input.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
