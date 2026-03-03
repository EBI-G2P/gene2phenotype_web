<script>
import api from "../../services/api.js";
import {
  EUROPE_PMC_URL,
  UPDATE_VARIANT_TYPE_URL,
} from "../../utility/UrlConstants.js";
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";
import { VariantTypesAttribs } from "../../utility/CurationConstants.js";
import ToolTip from "../tooltip/ToolTip.vue";

export default {
  props: {
    stableId: String,
    currentPublications: Array,
    currentVariantTypes: Object,
  },
  data() {
    return {
      variantTypes: this.getInitialVariantTypes(),
      currentPublicationPMIDs: this.getCurrentPublicationPMIDs(
        this.currentPublications,
      ),
      isUpdateApiCallLoading: false,
      updateVariantTypeErrorMsg: null,
      isUpdateVariantTypeSuccess: false,
      updateVariantTypeSuccessMsg: null,
      VariantTypesAttribs,
      EUROPE_PMC_URL,
    };
  },
  components: { ToolTip },
  methods: {
    getInitialVariantTypes() {
      let variantTypesObj = {};
      for (const item of VariantTypesAttribs) {
        variantTypesObj[item.primaryType.inputKey] = {};
        for (const secondaryTypeObj of item.secondaryType) {
          variantTypesObj[item.primaryType.inputKey][
            secondaryTypeObj.inputKey
          ] = {
            de_novo: false,
            inherited: false,
            unknown_inheritance: false,
            supporting_papers: [],
            comment: "",
          };
        }
      }

      return variantTypesObj;
    },
    getCurrentPublicationPMIDs(currentPublications) {
      let pmidList = [];
      if (currentPublications?.length > 0) {
        currentPublications.forEach((item) => {
          if (item?.publication?.pmid) {
            pmidList.push(item.publication.pmid);
          }
        });
      }
      return pmidList;
    },
    updateVariantType() {
      this.updateVariantTypeErrorMsg = this.updateVariantTypeSuccessMsg = null;
      this.isUpdateVariantTypeSuccess = false;
      this.isUpdateApiCallLoading = true;
      const requestBody = this.prepareRequestBody();
      api
        .post(
          UPDATE_VARIANT_TYPE_URL.replace(":stableid", this.stableId),
          requestBody,
        )
        .then((response) => {
          this.isUpdateVariantTypeSuccess = true;
          this.updateVariantTypeSuccessMsg = response.data.message;
        })
        .catch((error) => {
          this.updateVariantTypeErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to update variant types. Please try again later.",
            "Unable to update variant types.",
          );
        })
        .finally(() => {
          this.isUpdateApiCallLoading = false;
        });
    },
    prepareRequestBody() {
      // convert variant types from object to array of objects and include variant types that have any non empty field data
      let variantTypesArray = [];
      for (const [primaryType, primaryTypeValueObj] of Object.entries(
        this.variantTypes,
      )) {
        for (const [secondaryType, secondaryTypeValueObj] of Object.entries(
          primaryTypeValueObj,
        )) {
          if (
            secondaryTypeValueObj.de_novo ||
            secondaryTypeValueObj.inherited ||
            secondaryTypeValueObj.unknown_inheritance ||
            secondaryTypeValueObj.comment.trim() !== "" ||
            secondaryTypeValueObj.supporting_papers.length > 0
          ) {
            let variantTypesObj = {
              ...secondaryTypeValueObj,
              primary_type: primaryType,
              secondary_type: secondaryType,
              comment: secondaryTypeValueObj.comment.trim(), // trim comment value
            };
            variantTypesArray.push(variantTypesObj);
          }
        }
      }
      return {
        variant_types: variantTypesArray,
      };
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="update-variant-type-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#update-variant-type-section-body"
          aria-expanded="false"
          aria-controls="update-variant-type-section-body"
        >
          Variant Types
          <span
            class="badge rounded-pill text-bg-success mx-2"
            v-if="isUpdateVariantTypeSuccess"
          >
            <i class="bi bi-check-circle-fill"></i> Updated
          </span>
        </button>
      </h2>
      <div
        id="update-variant-type-section-body"
        class="accordion-collapse collapse"
      >
        <div class="accordion-body">
          <div class="row g-3 p-2">
            <h5>Variant Types</h5>
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
              v-else-if="isUpdateVariantTypeSuccess"
            >
              <div>
                <i class="bi bi-check-circle-fill"></i>
                {{ updateVariantTypeSuccessMsg }}
              </div>
            </div>
            <div v-else>
              <div
                v-if="currentVariantTypes?.length > 0"
                class="accordion accordion-flush"
                id="accordionVariantTypes"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsibleVariantTypesTable"
                      aria-expanded="false"
                      aria-controls="collapsibleVariantTypesTable"
                    >
                      Current Variant Types ({{ currentVariantTypes.length }})
                    </button>
                  </h2>
                  <div
                    id="collapsibleVariantTypesTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionVariantTypes"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Inheritance</th>
                            <th>Publications</th>
                            <th>Comments</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="item in currentVariantTypes"
                            :key="item.accession"
                          >
                            <td>
                              <a
                                v-if="item.accession"
                                :href="`http://www.sequenceontology.org/browser/current_release/term/${item.accession}`"
                                style="text-decoration: none"
                                target="_blank"
                              >
                                {{ item.term }}
                              </a>
                              <span v-else>{{ item.term }}</span>
                            </td>
                            <td>
                              <ul
                                v-if="
                                  item.de_novo ||
                                  item.inherited ||
                                  item.unknown_inheritance
                                "
                                class="mb-0 ps-3"
                              >
                                <li v-if="item.de_novo">De Novo</li>
                                <li v-if="item.inherited">Inherited</li>
                                <li v-if="item.unknown_inheritance">
                                  Unknown Inheritance
                                </li>
                              </ul>
                            </td>
                            <td>
                              <span v-if="item.publications?.length > 0">
                                <span
                                  v-for="(pmid, index) in item.publications"
                                  :key="pmid"
                                >
                                  <span
                                    v-if="index < item.publications.length - 1"
                                  >
                                    <a
                                      :href="EUROPE_PMC_URL + pmid"
                                      style="text-decoration: none"
                                      target="_blank"
                                    >
                                      {{ pmid }}
                                    </a>
                                    ,
                                  </span>
                                  <a
                                    v-else
                                    :href="EUROPE_PMC_URL + pmid"
                                    style="text-decoration: none"
                                    target="_blank"
                                  >
                                    {{ pmid }}
                                  </a>
                                </span>
                              </span>
                            </td>
                            <td>
                              <ul
                                v-if="item.comments?.length > 0"
                                class="mb-0 ps-3"
                              >
                                <li
                                  v-for="commentItem in item.comments"
                                  :key="commentItem.text"
                                  style="white-space: pre-wrap"
                                >
                                  {{ commentItem.text }} ({{
                                    commentItem.date
                                  }})
                                </li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else>
                <i class="bi bi-info-circle"></i> No Variant Types available for
                this record.
              </p>
              <div class="col-12 mt-3">
                <table class="table">
                  <!-- sticky header is collapsing the borders so a border styling fix is made in the style section below -->
                  <thead class="sticky-top">
                    <tr>
                      <th>Types</th>
                      <th>De Novo</th>
                      <th>Inherited</th>
                      <th>Unknown Inheritance</th>
                      <th>Supporting Papers</th>
                      <th>
                        Comment (Private
                        <ToolTip
                          toolTipText="This comment will only be visible to logged-in users"
                        />)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="item in VariantTypesAttribs">
                      <tr>
                        <td>
                          <strong>{{ item.primaryType.labelText }}</strong>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr v-for="secondaryTypeItem in item.secondaryType">
                        <td>{{ secondaryTypeItem.labelText }}</td>
                        <td class="text-center">
                          <input
                            type="checkbox"
                            class="form-check-input custom-checkbox-border-color"
                            :id="`input-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-de_novo`"
                            v-model="
                              variantTypes[item.primaryType.inputKey][
                                secondaryTypeItem.inputKey
                              ].de_novo
                            "
                          />
                        </td>
                        <td class="text-center">
                          <input
                            type="checkbox"
                            class="form-check-input custom-checkbox-border-color"
                            :id="`input-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-inherited`"
                            v-model="
                              variantTypes[item.primaryType.inputKey][
                                secondaryTypeItem.inputKey
                              ].inherited
                            "
                          />
                        </td>
                        <td class="text-center">
                          <input
                            type="checkbox"
                            class="form-check-input custom-checkbox-border-color"
                            :id="`input-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-unknown_inheritance`"
                            v-model="
                              variantTypes[item.primaryType.inputKey][
                                secondaryTypeItem.inputKey
                              ].unknown_inheritance
                            "
                          />
                        </td>
                        <td>
                          <div
                            v-for="pmid in currentPublicationPMIDs"
                            :key="pmid"
                            class="form-check ms-2"
                          >
                            <input
                              class="form-check-input custom-checkbox-border-color"
                              type="checkbox"
                              :id="`input-${pmid}-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-supporting_papers`"
                              v-model="
                                variantTypes[item.primaryType.inputKey][
                                  secondaryTypeItem.inputKey
                                ].supporting_papers
                              "
                              :value="pmid"
                            />
                            <label
                              class="form-check-label"
                              :for="`input-${pmid}-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-supporting_papers`"
                            >
                              {{ pmid }}
                            </label>
                          </div>
                        </td>
                        <td>
                          <textarea
                            class="form-control"
                            :id="`input-${item.primaryType.inputKey}-${secondaryTypeItem.inputKey}-comment`"
                            rows="2"
                            v-model="
                              variantTypes[item.primaryType.inputKey][
                                secondaryTypeItem.inputKey
                              ].comment
                            "
                          >
                          </textarea>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                class="btn btn-primary"
                @click="updateVariantType"
              >
                <i class="bi bi-pencil-square"></i> Update variant types
              </button>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-if="updateVariantTypeErrorMsg"
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ updateVariantTypeErrorMsg }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Border styling fix for sticky header - START */
table {
  border-collapse: separate; /* Does not collapse border */
  border-spacing: 0;
  width: 100%;
}

table th {
  /* Apply top and bottom borders */
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
  /* Keep header text on one line */
  white-space: nowrap;
}

table td {
  /* Apply bottom and right borders */
  border-bottom: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
}

table th:first-child,
table td:first-child {
  /* Apply left border to first <td> and first <th> of every row */
  border-left: 1px solid #dee2e6;
}
/* Border styling fix for sticky header - END */

.custom-checkbox-border-color {
  border: 1px solid rgba(0, 0, 0, 0.5);
}
</style>
