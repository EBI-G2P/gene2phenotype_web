<script>
import {
  getAffectedIndividualsInputErrorMsg,
  getFamiliesInputErrorMsg,
} from "../../utility/CurationUtility.js";
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
import ToolTip from "../tooltip/ToolTip.vue";
export default {
  props: {
    currentPublications: Object,
    publications: Object,
  },
  emits: ["update:publications"],
  components: { ToolTip },
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
          <div
            v-if="currentPublications?.length > 0"
            class="accordion accordion-flush"
            id="accordionPublications"
          >
            <div class="accordion-item">
              <h2 class="accordion-header border">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapsiblePublicationsTable"
                  aria-expanded="false"
                  aria-controls="collapsiblePublicationsTable"
                >
                  Current Publications ({{ currentPublications.length }})
                </button>
              </h2>
              <div
                id="collapsiblePublicationsTable"
                class="accordion-collapse collapse"
                data-bs-parent="#accordionPublications"
              >
                <div class="accordion-body p-0">
                  <table class="table table-bordered mb-0">
                    <thead>
                      <tr>
                        <th>PMID</th>
                        <th>Title</th>
                        <th>Individuals</th>
                        <th>Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="item in currentPublications"
                        :key="item.publication?.pmid"
                      >
                        <td>
                          <a
                            v-if="item.publication?.pmid"
                            :href="EUROPE_PMC_URL + item.publication.pmid"
                            style="text-decoration: none"
                            target="_blank"
                          >
                            {{ item.publication.pmid }}
                          </a>
                        </td>
                        <td>
                          {{ item.publication?.title }}
                        </td>
                        <td>
                          <span
                            v-if="
                              item.number_of_families ||
                              item.affected_individuals ||
                              item.ancestry ||
                              item.consanguinity
                            "
                          >
                            Number of Families:
                            {{ item.number_of_families }}
                            <hr class="m-0" />
                            Affected Individuals:
                            {{ item.affected_individuals }}
                            <hr class="m-0" />
                            Ancestry:
                            {{ item.ancestry }}
                            <hr class="m-0" />
                            Consanguinity:
                            {{ item.consanguinity }}
                          </span>
                        </td>
                        <td class="ps-0">
                          <ul
                            v-if="item.comments?.length > 0"
                            class="mb-0"
                          >
                            <li
                              v-for="commentItem in item.comments"
                              :key="commentItem.comment"
                              style="white-space: pre-wrap;"
                            >
                              {{ commentItem.comment }} ({{ commentItem.date }})
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
            <i class="bi bi-info-circle"></i> No Publication available for this
            record.
          </p>
          <div v-if="publications && Object.keys(publications).length > 0">
            <h5 class="pt-3">Data for new Publication(s)</h5>
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
                          Comment (Private
                          <ToolTip
                            toolTipText="This comment will only be visible to logged-in users"
                          />)
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
