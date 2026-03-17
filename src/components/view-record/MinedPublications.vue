<script>
import {
  HELP_TEXT,
  MINED_PUBLICATION_STATUS,
} from "../../utility/Constants.js";
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
import ToolTip from "../tooltip/ToolTip.vue";
import { viewSelectedPublications } from "../../utility/CommonUtility.js";
export default {
  props: {
    minedPublications: Array,
    stableId: String,
    isPanelDataLoading: Boolean,
    isAuthenticated: Boolean,
    isRecordPartOfUserPanels: Boolean,
  },
  data() {
    return {
      minedPublicationsUnderReview: this.minedPublications?.filter(
        (item) => item.status === MINED_PUBLICATION_STATUS.MINED,
      ),
      selectedMinedPublicationsList: this.getAllSelectedMinedPublications(
        this.minedPublications,
      ),
      HELP_TEXT,
      EUROPE_PMC_URL,
    };
  },
  components: {
    ToolTip,
  },
  methods: {
    getAllSelectedMinedPublications(minedPublications) {
      const filteredMinedPublications = minedPublications?.filter(
        (item) => item.status === MINED_PUBLICATION_STATUS.MINED,
      );
      let allSelectedMinedPublications = [];
      if (filteredMinedPublications) {
        allSelectedMinedPublications = filteredMinedPublications.map(
          (item) => item.pmid,
        );
      }
      return allSelectedMinedPublications;
    },
    goToReviewMinedPublicationPage() {
      this.$router.push(`/lgd/review-mined-publication/${this.stableId}`);
    },
    viewSelectedPublications,
  },
};
</script>
<template>
  <div
    v-if="minedPublicationsUnderReview.length > 0"
    class="accordion accordion-flush mt-4"
    id="accordionMinedPublications"
  >
    <div class="accordion-item">
      <h2 class="accordion-header border">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleMinedPublicationsTable"
          aria-expanded="false"
          aria-controls="collapsibleMinedPublicationsTable"
        >
          <i class="bi bi-stars me-1"></i> Additional mined publications
          awaiting review ({{ minedPublicationsUnderReview.length }})
          <ToolTip class="ms-1" :toolTipText="HELP_TEXT.MINED_PUBLICATIONS" />
        </button>
      </h2>
      <div
        id="collapsibleMinedPublicationsTable"
        class="accordion-collapse collapse"
        data-bs-parent="#accordionMinedPublications"
      >
        <div class="accordion-body p-0">
          <table class="table table-bordered mb-0 table-info">
            <thead>
              <tr>
                <th class="text-nowrap px-1">
                  Select
                  <ToolTip
                    toolTipText="Select papers and click 'View selected publications in EuropePMC' to view them there"
                  />
                </th>
                <th>PMID</th>
                <th>Year</th>
                <th>
                  <div class="d-flex justify-content-between">
                    <span class="align-middle">Title</span>
                    <button
                      v-if="
                        !isPanelDataLoading &&
                        isAuthenticated &&
                        isRecordPartOfUserPanels
                      "
                      class="btn btn-link p-0 m-0"
                      style="text-decoration: none"
                      @click="goToReviewMinedPublicationPage"
                    >
                      <i class="bi bi-file-earmark-text"></i> Review all mined
                      publications
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in minedPublicationsUnderReview">
                <td class="text-center">
                  <input
                    v-if="item.pmid"
                    type="checkbox"
                    :id="`mined-publication-select-${item.pmid}`"
                    v-model="selectedMinedPublicationsList"
                    :value="item.pmid"
                  />
                </td>
                <td>
                  <a
                    v-if="item.pmid"
                    :href="EUROPE_PMC_URL + item.pmid"
                    style="text-decoration: none"
                    target="_blank"
                  >
                    {{ item.pmid }}
                  </a>
                </td>
                <td>
                  {{ item.year }}
                </td>
                <td>
                  {{ item.title }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="d-flex justify-content-between">
            <div class="pt-1 px-0 pb-0">
              <button
                type="button"
                class="btn btn-link p-0"
                style="text-decoration: none"
                @click="
                  selectedMinedPublicationsList =
                    getAllSelectedMinedPublications(minedPublications)
                "
                :disabled="
                  selectedMinedPublicationsList.length ===
                  minedPublicationsUnderReview.length
                "
              >
                Select all
              </button>
              |
              <button
                type="button"
                class="btn btn-link p-0"
                style="text-decoration: none"
                @click="selectedMinedPublicationsList = []"
                :disabled="selectedMinedPublicationsList.length === 0"
              >
                Deselect all
              </button>
            </div>
            <button
              type="button"
              class="btn btn-link pt-1 px-0 pb-0"
              style="text-decoration: none"
              @click="viewSelectedPublications(selectedMinedPublicationsList)"
              :disabled="selectedMinedPublicationsList.length === 0"
            >
              View selected publications in EuropePMC
              <i class="bi bi-box-arrow-up-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
