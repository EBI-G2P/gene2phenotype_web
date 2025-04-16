<script>
import { ConfidenceAttribsOrder } from "../../utility/CurationConstants.js";
export default {
  props: {
    attributesData: Object,
    inputPublications: Object,
    confidence: String,
    geneData: Object,
  },
  data() {
    return {
      sortedConfidenceCategoryList:
        this.attributesData?.confidence_category?.sort(
          (a, b) =>
            ConfidenceAttribsOrder.indexOf(a) -
            ConfidenceAttribsOrder.indexOf(b)
        ) || [],
    };
  },
  emits: ["update:confidence"],
};
</script>
<template>
  <div class="accordion py-1" id="confidence-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#confidence-section-body"
          aria-expanded="false"
          aria-controls="confidence-section-body"
        >
          Confidence
        </button>
      </h2>
      <div id="confidence-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <div class="row g-3">
            <p class="mb-0 fw-bold">Summary</p>
            <div class="col-3">
              <table class="table table-bordered mb-0">
                <tbody>
                  <tr>
                    <th width="50%">Total Papers</th>
                    <td width="50%">
                      {{ Object.keys(inputPublications).length }}
                    </td>
                  </tr>
                  <tr>
                    <th width="50%">Total Families</th>
                    <td width="50%">
                      {{
                        Object.values(inputPublications).reduce(
                          (accumulator, currentValue) =>
                            currentValue.families
                              ? accumulator + currentValue.families
                              : accumulator,
                          0
                        )
                      }}
                    </td>
                  </tr>
                  <tr>
                    <th width="50%">Total Cases</th>
                    <td width="50%">
                      {{
                        Object.values(inputPublications).reduce(
                          (accumulator, currentValue) =>
                            currentValue.affectedIndividuals
                              ? accumulator + currentValue.affectedIndividuals
                              : accumulator,
                          0
                        )
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="fw-bold">External Links</p>
            <div class="row mx-3">
              <ul class="mb-0">
                <li v-if="geneData?.gene_symbol">
                  <a
                    :href="`https://panelapp.genomicsengland.co.uk/panels/entities/${geneData.gene_symbol}`"
                    style="text-decoration: none"
                    target="_blank"
                  >
                    PanelApp
                    <i class="bi bi-box-arrow-up-right"></i>
                  </a>
                </li>
                <li v-if="geneData?.ids?.HGNC">
                  <a
                    :href="`https://search.thegencc.org/genes/${geneData.ids.HGNC}`"
                    style="text-decoration: none"
                    target="_blank"
                  >
                    GenCC
                    <i class="bi bi-box-arrow-up-right"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <hr />
          <p class="mb-0 fw-bold">Confidence</p>
          <div class="row g-3 py-3 w-50">
            <label for="confidence-level-input" class="col-lg-3 col-form-label">
              Level<span class="text-danger">*</span>
            </label>
            <div class="col-lg-6">
              <select
                id="confidence-level-input"
                class="form-select"
                :value="confidence"
                @input="$emit('update:confidence', $event.target.value)"
              >
                <option value="">Select</option>
                <option
                  v-for="item in sortedConfidenceCategoryList"
                  :value="item"
                >
                  {{ item }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
