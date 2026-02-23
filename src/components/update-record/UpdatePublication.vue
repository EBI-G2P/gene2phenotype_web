<script>
import {
  getAffectedIndividualsInputErrorMsg,
  getFamiliesInputErrorMsg,
} from "../../utility/CurationUtility.js";
import {
  ADD_PUBLICATION_URL,
  EUROPE_PMC_URL,
} from "../../utility/UrlConstants.js";
import ToolTip from "../tooltip/ToolTip.vue";
import api from "../../services/api.js";
export default {
  props: {
    stableId: String,
    currentPublications: Array,
  },
  components: { ToolTip },
  data() {
    return {
      publications: this.transformPublications(this.currentPublications),
      isUpdateApiCallLoading: false,
      updateErrorMsg: null,
      isUpdateSuccess: false,
      EUROPE_PMC_URL,
    };
  },
  methods: {
    transformPublications(publications) {
      /*
        Transform currentPublications format to required format:
        currentPublications format (List of objects):
        [
          {
            publication: {
              pmid: 1,
              title: "...",
              authors: "...",
              year: 2000,
            },
            number_of_families: 1,
            consanguinity: "...",
            affected_individuals: 1,
            ancestry: "...",
            comments: [ 
              {
                comment: "..."
                user: "..."
                date: "..."
              }
            ],
          }
        ]
        Required format (Nested objects):
        {
          1: {
            title: "...",
            authors: "...",
            year: 2000,
            families: 1,
            consanguinity: "...",
            affectedIndividuals: 1,
            ancestry: "...",
            newComment: "",
            prevComments: ["..."]
          }
        }
      */
      let publicationsObj = {};
      if (publications?.length > 0) {
        publications.forEach((item) => {
          if (item?.publication?.pmid) {
            publicationsObj[item.publication.pmid] = {
              title: item.publication.title,
              authors: item.publication.authors,
              year: item.publication.year,
              families: item.number_of_families,
              consanguinity: item.consanguinity,
              affectedIndividuals: item.affected_individuals,
              ancestry: item.ancestry,
              newComment: "",
              prevComments: item.comments?.map(
                (commentObj) => commentObj.comment,
              ),
            };
          }
        });
      }
      return publicationsObj;
    },
    updatePublications() {
      this.updateErrorMsg = null;
      this.isUpdateSuccess = false;
      this.isUpdateApiCallLoading = true;
      const requestBody = this.prepareRequestBody();
      api
        .post(
          ADD_PUBLICATION_URL.replace(":stableid", this.stableId),
          requestBody,
        )
        .then(() => {
          this.isUpdateSuccess = true;
          // Move new comment to prevComments list
          this.moveNewCommentToPrevious();
        })
        .catch((error) => {
          this.updateErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to update publications. Please try again later.",
            "Unable to update publications.",
          );
        })
        .finally(() => {
          this.isUpdateApiCallLoading = false;
        });
    },
    prepareRequestBody() {
      /*
        Transform publications format to required request body format:
        publications format (Nested objects):
        {
          1: {
            title: "...",
            authors: "...",
            year: 2000,
            families: 1,
            consanguinity: "...",
            affectedIndividuals: 1,
            ancestry: "...",
            newComment: "...",
            prevComments: ["..."]
          }
        }
        Required request body format (List of objects):
        [
          {
            publication: { pmid: 1 },
            comment: { comment: "...", is_public: 1 },
            families: {
              families: 1,
              consanguinity: "...",
              ancestries: "...",
              affected_individuals: 1,
            },
          }
        ]
      */
      let requestBody = {
        publications: [],
      };
      if (this.publications && Object.keys(this.publications).length > 0) {
        Object.entries(this.publications).forEach(([pmidKey, valueObj]) => {
          requestBody.publications.push({
            publication: { pmid: pmidKey },
            comment: { comment: valueObj.newComment, is_public: 1 },
            families: {
              families: valueObj.families,
              consanguinity: valueObj.consanguinity,
              ancestries: valueObj.ancestry,
              affected_individuals: valueObj.affectedIndividuals,
            },
          });
        });
      }
      return requestBody;
    },
    moveNewCommentToPrevious() {
      // move new comment to prevComments list
      if (this.publications && Object.keys(this.publications).length > 0) {
        Object.values(this.publications).forEach((valueObj) => {
          if (valueObj.newComment?.trim()) {
            valueObj.prevComments.push(valueObj.newComment);
            valueObj.newComment = "";
          }
        });
      }
    },
    getFamiliesInputErrorMsg,
    getAffectedIndividualsInputErrorMsg,
  },
};
</script>
<template>
  <div class="accordion py-1" id="update-publication-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#update-publication-section-body"
          aria-expanded="false"
          aria-controls="update-publication-section-body"
        >
          Publications
          <span
            v-if="isUpdateSuccess"
            class="badge rounded-pill text-bg-success mx-2"
          >
            <i class="bi bi-check-circle-fill"></i> Updated
          </span>
        </button>
      </h2>
      <div
        id="update-publication-section-body"
        class="accordion-collapse collapse"
      >
        <div class="accordion-body">
          <h5>Publications</h5>
          <div
            v-if="isUpdateApiCallLoading"
            class="d-flex justify-content-center"
            style="margin-top: 122px; margin-bottom: 122px"
          >
            <div class="spinner-border text-secondary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else>
            <div v-if="publications && Object.keys(publications).length > 0">
              <div
                v-for="pmid in Object.keys(publications)"
                :id="`publication-outer-accordion-${pmid}`"
                class="accordion py-1"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button
                      class="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      :data-bs-target="`#publication-inner-accordion-${pmid}`"
                      aria-expanded="true"
                      :aria-controls="`publication-inner-accordion-${pmid}`"
                    >
                      PMID: {{ pmid }}
                    </button>
                  </h2>
                  <div
                    :id="`publication-inner-accordion-${pmid}`"
                    class="accordion-collapse collapse show"
                    :data-bs-parent="`publication-outer-accordion-${pmid}`"
                  >
                    <div class="accordion-body">
                      <div class="row g-3">
                        <div class="col-12">
                          <a
                            v-if="pmid"
                            :href="EUROPE_PMC_URL + pmid"
                            style="text-decoration: none"
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
                            :id="`publication-pmid-input-${pmid}`"
                            :value="pmid"
                            class="form-control"
                            type="text"
                            aria-label="Publication pmid input"
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
                            :id="`publication-year-input-${pmid}`"
                            :value="publications[pmid].year"
                            class="form-control"
                            type="text"
                            aria-label="Publication year input"
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
                            :id="`publication-title-input-${pmid}`"
                            :value="publications[pmid].title"
                            class="form-control"
                            type="text"
                            aria-label="Publication title input"
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
                            :id="`publication-authors-input-${pmid}`"
                            :value="publications[pmid].authors"
                            class="form-control"
                            type="text"
                            aria-label="Publication authors input"
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
                            :id="`publication-families-input-${pmid}`"
                            v-model.number="publications[pmid].families"
                            :class="
                              getFamiliesInputErrorMsg(
                                publications[pmid].families,
                                publications[pmid].affectedIndividuals,
                              )
                                ? 'form-control is-invalid'
                                : 'form-control'
                            "
                            type="number"
                            min="0"
                            aria-describedby="invalid-families-input-feedback"
                          />
                          <div
                            id="invalid-families-input-feedback"
                            class="invalid-feedback"
                          >
                            {{
                              getFamiliesInputErrorMsg(
                                publications[pmid].families,
                                publications[pmid].affectedIndividuals,
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
                            :id="`publication-affected-individuals-input-${pmid}`"
                            v-model.number="
                              publications[pmid].affectedIndividuals
                            "
                            :class="
                              getAffectedIndividualsInputErrorMsg(
                                publications[pmid].families,
                                publications[pmid].affectedIndividuals,
                              )
                                ? 'form-control is-invalid'
                                : 'form-control'
                            "
                            type="number"
                            min="0"
                            aria-describedby="invalid-affected-individuals-input-feedback"
                          />
                          <div
                            id="invalid-affected-individuals-input-feedback"
                            class="invalid-feedback"
                          >
                            {{
                              getAffectedIndividualsInputErrorMsg(
                                publications[pmid].families,
                                publications[pmid].affectedIndividuals,
                              )
                            }}
                          </div>
                        </div>
                        <div class="col-md-3">
                          <label
                            :for="`publication-consanguineous-input-${pmid}`"
                            class="form-label"
                          >
                            Consanguineous
                          </label>
                          <select
                            :id="`publication-consanguineous-input-${pmid}`"
                            v-model="publications[pmid].consanguinity"
                            class="form-select"
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
                            :id="`publication-ancestries-input-${pmid}`"
                            v-model="publications[pmid].ancestry"
                            type="text"
                            class="form-control"
                          />
                        </div>
                        <div class="col-12">
                          <label
                            :for="`publication-comment-input-${pmid}`"
                            class="form-label"
                          >
                            Comment (Private
                            <ToolTip
                              toolTipText="This comment will only be visible to logged-in users"
                            />)
                          </label>
                          <textarea
                            :id="`publication-comment-input-${pmid}`"
                            v-model="publications[pmid].newComment"
                            class="form-control"
                            rows="3"
                          ></textarea>
                        </div>
                        <div
                          v-if="publications[pmid].prevComments?.length > 0"
                          :id="`previous-comments-outer-accordion-${pmid}`"
                          class="accordion accordion-flush"
                        >
                          <div class="accordion-item">
                            <h2 class="accordion-header border">
                              <button
                                class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                :data-bs-target="`#previous-comments-inner-accordion-${pmid}`"
                                aria-expanded="false"
                                :aria-controls="`previous-comments-inner-accordion-${pmid}`"
                              >
                                Previous comments ({{
                                  publications[pmid].prevComments.length
                                }})
                              </button>
                            </h2>
                            <div
                              :id="`previous-comments-inner-accordion-${pmid}`"
                              class="accordion-collapse collapse"
                              :data-bs-parent="`#previous-comments-outer-accordion-${pmid}`"
                            >
                              <div class="accordion-body p-0">
                                <table class="table table-bordered mb-0">
                                  <thead>
                                    <tr>
                                      <th>Comment</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr
                                      v-for="comment in publications[pmid]
                                        .prevComments"
                                      :key="comment"
                                    >
                                      <td>
                                        <span style="white-space: pre-wrap">
                                          {{ comment }}
                                        </span>
                                      </td>
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
              <button
                type="button"
                class="btn btn-primary mt-3"
                @click="updatePublications"
              >
                <i class="bi bi-pencil-square"></i> Update publications
              </button>
            </div>
            <p v-else>
              <i class="bi bi-info-circle"></i> No publications available for
              this record.
            </p>
          </div>
          <div
            v-if="updateErrorMsg"
            class="alert alert-danger mt-3"
            role="alert"
          >
            <div>
              <i class="bi bi-exclamation-circle-fill"></i>
              {{ updateErrorMsg }}
            </div>
          </div>
          <div
            v-if="isUpdateSuccess"
            class="alert alert-success mt-3"
            role="alert"
          >
            <div>
              <i class="bi bi-check-circle-fill"></i>
              Publications successfully updated.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
