<script>
import api from "../../services/api.js";
import { UPDATE_VARIANT_CONSEQUENCE_URL } from "../../utility/UrlConstants.js";
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";
import { VariantConsequencesAttribs } from "../../utility/CurationConstants.js";

export default {
  props: {
    stableId: String,
    currentVariantConsequences: Object,
  },
  data() {
    return {
      variantConsequences: this.getInitialVariantConsequences(
        this.currentVariantConsequences
      ),
      transformedCurrentVariantConsequences: this.getInitialVariantConsequences(
        this.currentVariantConsequences
      ),
      isUpdateApiCallLoading: false,
      updateVariantConsequenceErrorMsg: null,
      isUpdateVariantConsequenceSuccess: false,
      updateVariantConsequenceSuccessMsg: null,
      VariantConsequencesAttribs,
    };
  },
  methods: {
    getInitialVariantConsequences(currentVariantConsequences) {
      let variantConsequencesObj = {};

      VariantConsequencesAttribs.forEach((item) => {
        variantConsequencesObj[item.inputKey] = "";
      });

      currentVariantConsequences.forEach((item) => {
        const { variant_consequence, support } = item;
        const variantConsequenceInputKey = variant_consequence
          .split(" ")
          .join("_");
        if (variantConsequenceInputKey in variantConsequencesObj) {
          variantConsequencesObj[variantConsequenceInputKey] = support;
        }
      });

      return variantConsequencesObj;
    },
    prepareRequestBody() {
      // convert variant consequences from object to array of objects and include variant consequence that changed
      let variantConsequencesArray = [];
      for (const [key, value] of Object.entries(this.variantConsequences)) {
        if (this.transformedCurrentVariantConsequences[key] !== value) {
          let variantConsequencesObj = {
            variant_consequence: key,
            support: value,
          };
          variantConsequencesArray.push(variantConsequencesObj);
        }
      }
      return {
        variant_consequences: variantConsequencesArray,
      };
    },
    variantConsequenceCssClass(hierarchyLevel) {
      if (hierarchyLevel === 1) {
        return "text-start";
      } else if (hierarchyLevel === 2) {
        return "text-center";
      } else if (hierarchyLevel === 3) {
        return "text-end";
      }
      return "text-start";
    },
    updateVariantConsequence() {
      this.updateVariantConsequenceErrorMsg =
        this.updateVariantConsequenceSuccessMsg = null;
      this.isUpdateVariantConsequenceSuccess = false;
      this.isUpdateApiCallLoading = true;

      const requestBody = this.prepareRequestBody();
      api
        .post(
          UPDATE_VARIANT_CONSEQUENCE_URL.replace(":stableid", this.stableId),
          requestBody
        )
        .then((response) => {
          this.isUpdateVariantConsequenceSuccess = true;
          this.updateVariantConsequenceSuccessMsg = response.data.message;
        })
        .catch((error) => {
          this.updateVariantConsequenceErrorMsg =
            fetchAndLogApiResponseErrorMsg(
              error,
              error?.response?.data?.error,
              "Unable to update variant consequence. Please try again later.",
              "Unable to update variant consequence."
            );
        })
        .finally(() => {
          this.isUpdateApiCallLoading = false;
        });
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="update-variant-consequence-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#update-variant-consequence-section-body"
          aria-expanded="false"
          aria-controls="update-variant-consequence-section-body"
        >
          Variant Consequences
          <span
            class="badge rounded-pill text-bg-success mx-2"
            v-if="isUpdateVariantConsequenceSuccess"
          >
            <i class="bi bi-check-circle-fill"></i> Updated
          </span>
        </button>
      </h2>
      <div
        id="update-variant-consequence-section-body"
        class="accordion-collapse collapse"
      >
        <div class="accordion-body">
          <div class="row g-3 p-2">
            <h5>Variant Consequence</h5>
            <div
              v-if="isUpdateApiCallLoading"
              class="d-flex justify-content-center"
              style="margin-top: 122px; margin-bottom: 122px"
            >
              <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div
              class="alert alert-success mt-3"
              role="alert"
              v-else-if="isUpdateVariantConsequenceSuccess"
            >
              <div>
                <i class="bi bi-check-circle-fill"></i>
                {{ updateVariantConsequenceSuccessMsg }}
              </div>
            </div>
            <div v-else>
              <div class="col-12">
                <table style="width: 70%" class="table table-bordered">
                  <thead>
                    <tr>
                      <th style="width: 70%">
                        Altered protein for protein-coding genes or altered RNA
                        level for non-protein coding genes
                      </th>
                      <th style="width: 30%">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in VariantConsequencesAttribs">
                      <td
                        :class="variantConsequenceCssClass(item.hierarchyLevel)"
                      >
                        {{ item.labelText }}
                      </td>
                      <td>
                        <select
                          :id="`variant-consequence-input-source-${item.inputKey}`"
                          class="form-select"
                          v-model="variantConsequences[item.inputKey]"
                          :disabled="
                            transformedCurrentVariantConsequences[item.inputKey]
                          "
                        >
                          >
                          <option value="">Select</option>
                          <option value="inferred">inferred</option>
                          <option value="evidence">evidence</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                class="btn btn-primary"
                @click="updateVariantConsequence"
              >
                <i class="bi bi-pencil-square"></i> Update variant consequence
              </button>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-if="updateVariantConsequenceErrorMsg"
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ updateVariantConsequenceErrorMsg }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
