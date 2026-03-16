<script>
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
import ToolTip from "../tooltip/ToolTip.vue";
import { viewSelectedPublications } from "../../utility/CommonUtility.js";
export default {
  props: {
    publications: Array,
    isAuthenticated: Boolean,
  },
  data() {
    return {
      selectedCuratedPublicationsList: this.getAllSelectedCuratedPublications(
        this.publications,
      ),
      EUROPE_PMC_URL,
    };
  },
  components: {
    ToolTip,
  },
  methods: {
    getAllSelectedCuratedPublications(curatedPublications) {
      let allSelectedCuratedPublications = [];
      if (curatedPublications) {
        allSelectedCuratedPublications = curatedPublications.map(
          (item) => item.publication?.pmid,
        );
      }
      return allSelectedCuratedPublications;
    },
    viewSelectedPublications,
  },
};
</script>
<template>
  <div
    v-if="publications?.length > 0"
    class="accordion accordion-flush"
    id="accordionPublications"
  >
    <div class="accordion-item">
      <h2 class="accordion-header border">
        <button
          id="accordionPublicationsBtn"
          class="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsiblePublicationsTable"
          aria-expanded="true"
          aria-controls="collapsiblePublicationsTable"
        >
          Curated publications ({{ publications.length }})
        </button>
      </h2>
      <div
        id="collapsiblePublicationsTable"
        class="accordion-collapse collapse show"
        data-bs-parent="#accordionPublications"
      >
        <div class="accordion-body p-0">
          <table class="table table-bordered mb-0">
            <thead>
              <tr>
                <th class="text-nowrap px-1">
                  Select
                  <ToolTip
                    toolTipText="Select papers and click 'View selected publications in EuropePMC' to view them there"
                  />
                </th>
                <th>PMID</th>
                <th>Title</th>
                <th>Individuals</th>
                <th v-if="isAuthenticated">Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in publications">
                <td class="text-center">
                  <input
                    v-if="item.publication?.pmid"
                    type="checkbox"
                    :id="`publication-select-${item.publication.pmid}`"
                    v-model="selectedCuratedPublicationsList"
                    :value="item.publication.pmid"
                  />
                </td>
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
                  <ul
                    v-if="
                      item.number_of_families ||
                      item.affected_individuals ||
                      item.ancestry ||
                      (item.consanguinity && item.consanguinity !== 'unknown')
                    "
                    class="mb-0 ps-3"
                  >
                    <li v-if="item.number_of_families">
                      Number of Families:
                      {{ item.number_of_families }}
                    </li>
                    <li v-if="item.affected_individuals">
                      Affected Individuals:
                      {{ item.affected_individuals }}
                    </li>
                    <li v-if="item.ancestry">
                      Ancestry:
                      {{ item.ancestry }}
                    </li>
                    <li
                      v-if="
                        item.consanguinity && item.consanguinity !== 'unknown'
                      "
                    >
                      Consanguinity:
                      {{ item.consanguinity }}
                    </li>
                  </ul>
                </td>
                <td v-if="isAuthenticated">
                  <ul v-if="item.comments?.length > 0" class="mb-0 ps-3">
                    <li
                      v-for="commentItem in item.comments"
                      :key="commentItem.comment"
                      style="white-space: pre-wrap"
                    >
                      {{ commentItem.comment }} ({{ commentItem.date }})
                    </li>
                  </ul>
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
                  selectedCuratedPublicationsList =
                    getAllSelectedCuratedPublications(publications)
                "
                :disabled="
                  selectedCuratedPublicationsList.length === publications.length
                "
              >
                Select all
              </button>
              |
              <button
                type="button"
                class="btn btn-link p-0"
                style="text-decoration: none"
                @click="selectedCuratedPublicationsList = []"
                :disabled="selectedCuratedPublicationsList.length === 0"
              >
                Deselect all
              </button>
            </div>
            <button
              type="button"
              class="btn btn-link pt-1 px-0 pb-0"
              style="text-decoration: none"
              @click="viewSelectedPublications(selectedCuratedPublicationsList)"
              :disabled="selectedCuratedPublicationsList.length === 0"
            >
              View selected publications in EuropePMC
              <i class="bi bi-box-arrow-up-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <p v-else class="text-muted">No curated publications available</p>
</template>
<style scoped>
/* Fix to make sure ToolTip in #accordionMinedPublications is visible when
 #accordionPublicationsBtn is in focus */
/* Tooltip has z-index=5 so #accordionPublicationsBtn z-index is set to 1 when in focus */
#accordionPublicationsBtn:focus {
  z-index: 1 !important;
}
</style>
