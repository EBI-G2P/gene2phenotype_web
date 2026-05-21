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
    sourceData: Object,
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
          (item) => item.identifier === diseaseCrossReference.identifier,
        );
        updatedDiseaseCrossReferences.splice(elementIndexToBeRemoved, 1);
      }
      this.$emit(
        "update:diseaseCrossReferences",
        updatedDiseaseCrossReferences,
      );
    },
    useDiseaseName(diseaseCrossReference) {
      if (diseaseCrossReference?.disease_name) {
        this.$emit("update:diseaseName", diseaseCrossReference.disease_name);
        // check if disease cross reference is present in list of selected disease cross references
        const index = this.diseaseCrossReferences.findIndex(
          (item) => item.identifier === diseaseCrossReference.identifier,
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
          <template
            v-if="
              sourceData &&
              (sourceData.disease ||
                sourceData.disease_cross_references?.length > 0)
            "
          >
            <div class="card source-data-card">
              <h5 class="card-header">Data from imported source</h5>
              <div class="card-body">
                <dl class="row mb-0">
                  <template v-if="sourceData.disease">
                    <dt class="col-xl-3 col-lg-4">
                      Disease name
                      <span v-if="sourceData.name">
                        from {{ sourceData.name }}</span
                      >
                    </dt>
                    <dd class="col-xl-9 col-lg-8">
                      {{ sourceData.disease }}
                    </dd>
                  </template>
                  <template
                    v-if="sourceData.disease_cross_references?.length > 0"
                  >
                    <dt class="col-xl-3 col-lg-4">
                      Ontology term
                      <span v-if="sourceData.name">
                        from {{ sourceData.name }}</span
                      >
                    </dt>
                    <dd class="col-xl-9 col-lg-8">
                      {{ sourceData.disease_cross_references[0].disease_name }}
                      (
                      <a
                        v-if="
                          sourceData.disease_cross_references[0].source ===
                          'OMIM'
                        "
                        :href="
                          OMIM_URL +
                          sourceData.disease_cross_references[0].identifier
                        "
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ sourceData.disease_cross_references[0].identifier }}
                      </a>
                      <a
                        v-else-if="
                          sourceData.disease_cross_references[0].source ===
                          'Mondo'
                        "
                        :href="
                          MONDO_URL +
                          sourceData.disease_cross_references[0].identifier
                        "
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ sourceData.disease_cross_references[0].identifier }}
                      </a>
                      <span v-else>{{
                        sourceData.disease_cross_references[0].identifier
                      }}</span>
                      )
                    </dd>
                  </template>
                </dl>
                <a
                  v-if="sourceData.url"
                  :href="sourceData.url"
                  target="_blank"
                  style="text-decoration: none"
                  class="mb-0 mt-0 subtitle-text"
                >
                  See details in source
                  <i class="bi bi-box-arrow-up-right"></i>
                </a>
              </div>
            </div>
            <hr />
          </template>
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
            <div class="row g-3 mt-0">
              <div class="col-auto mt-0">
                <button
                  type="button"
                  class="btn btn-link m-0 p-0"
                  style="text-decoration: none"
                  data-bs-toggle="modal"
                  data-bs-target="#disease-name-guidelines-modal"
                >
                  Guidelines
                  <i class="bi bi-file-earmark-text"></i>
                </button>
              </div>
            </div>
            <div
              class="row g-3 px-3 mt-0"
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
                              item.identifier,
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
<style scoped>
.source-data-card {
  background-color: #fff3cd;
}
.subtitle-text {
  font-size: small;
}
</style>
