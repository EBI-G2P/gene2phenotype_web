<script>
import { ConfidenceAttribsOrder } from "../../utility/CurationConstants.js";
export default {
  props: {
    attributesData: Object,
    inputPublications: Object,
    confidence: String,
  },
  emits: ["update:confidence"],
  computed: {
    reorderedConfidenceCategoryList() {
      return this.attributesData.confidence_category.sort(
        (a, b) =>
          ConfidenceAttribsOrder.indexOf(a) - ConfidenceAttribsOrder.indexOf(b)
      );
    },
  },
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
            <div class="col-12">
              <p class="mb-0 fw-bold">Summary</p>
            </div>
            <div class="col-3">
              <table class="table table-bordered">
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
          </div>
          <hr />
          <p class="mb-0 fw-bold">Confidence</p>
          <div class="row g-3 pt-3 w-50">
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
                  v-for="item in reorderedConfidenceCategoryList"
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
