<script>
import {
  HELP_TEXT,
  MINED_PUBLICATION_STATUS,
} from "../../utility/Constants.js";
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
import TableToolTip from "../tooltip/TableToolTip.vue";
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
      selectedMinedPublicationsList: [],
      searchQuery: "",
      sortKey: null,
      sortOrder: null, // 1 = ascending order, -1 = descending order
      HELP_TEXT,
      EUROPE_PMC_URL,
    };
  },
  computed: {
    filteredAndSortedMinedPublications() {
      const searchFields = ["pmid", "year", "title"];
      const queryText = this.searchQuery.trim().toLowerCase();
      // Filter mined publications by matching the query text against the search fields (case insensitive text matching)
      let filteredList = this.minedPublicationsUnderReview.filter((item) => {
        if (!queryText) return true;
        return searchFields.some((field) =>
          String(item[field] ?? "")
            .toLowerCase()
            .includes(queryText),
        );
      });
      // Sort filtered mined publications based on sort key and sort order
      if (this.sortKey && this.sortOrder !== null) {
        filteredList = [...filteredList].sort((a, b) => {
          const valA = String(a[this.sortKey] ?? "").toLowerCase();
          const valB = String(b[this.sortKey] ?? "").toLowerCase();
          return valA.localeCompare(valB) * this.sortOrder;
        });
      }
      return filteredList;
    },
    tableResultsCountText() {
      const count = this.filteredAndSortedMinedPublications.length;
      return `${count} result${count !== 1 ? "s" : ""}`;
    },
  },
  watch: {
    filteredAndSortedMinedPublications: {
      immediate: true,
      handler(newList) {
        // Sync selectedMinedPublicationsList with pmids from filteredAndSortedMinedPublications
        this.selectedMinedPublicationsList = newList.map((item) => item.pmid);
      },
    },
  },
  components: {
    TableToolTip,
  },
  methods: {
    toggleSort(key) {
      if (this.sortKey !== key) {
        this.sortKey = key;
        this.sortOrder = 1;
      } else if (this.sortOrder === 1) {
        this.sortOrder = -1;
      } else {
        this.sortKey = null;
        this.sortOrder = null;
      }
    },
    getSortIcon(key) {
      if (this.sortKey !== key) return "bi bi-arrow-down-up";
      return this.sortOrder === 1
        ? "bi bi-sort-alpha-down"
        : "bi bi-sort-alpha-down-alt";
    },
    selectAll() {
      this.selectedMinedPublicationsList =
        this.filteredAndSortedMinedPublications.map((item) => item.pmid);
    },
    deselectAll() {
      this.selectedMinedPublicationsList = [];
    },
    goToReviewMinedPublicationPage() {
      this.$router.push(`/lgd/review-mined-publication/${this.stableId}`);
    },
    viewPublications() {
      viewSelectedPublications(this.selectedMinedPublicationsList);
    },
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
          <TableToolTip
            class="ms-1"
            :toolTipText="HELP_TEXT.MINED_PUBLICATIONS"
          />
        </button>
      </h2>
      <div
        id="collapsibleMinedPublicationsTable"
        class="accordion-collapse collapse"
        data-bs-parent="#accordionMinedPublications"
      >
        <div class="accordion-body" style="border: 1px solid #dee2e6">
          <div>
            <!-- Search Filter -->
            <div class="mb-3 d-flex gap-2 align-items-center">
              <div class="position-relative w-100">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control pe-4"
                  placeholder="Search mined publications"
                />
                <span
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
                  style="cursor: pointer; font-size: 1.1rem; line-height: 1"
                >
                  &times;
                </span>
              </div>
            </div>
            <div class="mb-1 d-flex justify-content-between">
              <span class="text-muted small">
                {{ tableResultsCountText }}
              </span>
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
            <!-- Scrollable Table -->
            <div
              class="table-responsive"
              style="max-height: 500px; overflow-y: scroll"
            >
              <table class="table mb-0 table-info table-hover">
                <!-- sticky header is collapsing the borders so a border styling fix is made in the style section below -->
                <thead class="table-info sticky-top">
                  <tr>
                    <th class="text-nowrap px-1">
                      Select
                      <TableToolTip
                        toolTipText="Select papers and click 'View selected publications in EuropePMC' to view them there"
                      />
                    </th>
                    <th>
                      <button
                        @click="toggleSort('pmid')"
                        aria-label="Sort by PMID"
                        class="btn btn-link p-0 text-decoration-none fw-bold"
                      >
                        <span class="text-black me-1">PMID</span>
                        <i :class="getSortIcon('pmid')"></i>
                      </button>
                    </th>
                    <th>
                      <button
                        @click="toggleSort('year')"
                        aria-label="Sort by year"
                        class="btn btn-link p-0 text-decoration-none fw-bold"
                      >
                        <span class="text-black me-1">Year</span>
                        <i :class="getSortIcon('year')"></i>
                      </button>
                    </th>
                    <th>
                      <button
                        @click="toggleSort('title')"
                        aria-label="Sort by title"
                        class="btn btn-link p-0 text-decoration-none fw-bold"
                      >
                        <span class="text-black me-1">Title</span>
                        <i :class="getSortIcon('title')"></i>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredAndSortedMinedPublications.length === 0">
                    <td colspan="4" class="text-center text-muted">
                      No publications found.
                    </td>
                  </tr>
                  <tr
                    v-for="item in filteredAndSortedMinedPublications"
                    :key="item.pmid"
                  >
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
            </div>
          </div>
          <div
            v-if="filteredAndSortedMinedPublications.length > 0"
            class="d-flex justify-content-between"
          >
            <div class="pt-1 px-0 pb-0">
              <button
                type="button"
                class="btn btn-link p-0"
                style="text-decoration: none"
                @click="selectAll"
                :disabled="
                  selectedMinedPublicationsList.length ===
                  filteredAndSortedMinedPublications.length
                "
              >
                Select all
              </button>
              |
              <button
                type="button"
                class="btn btn-link p-0"
                style="text-decoration: none"
                @click="deselectAll"
                :disabled="selectedMinedPublicationsList.length === 0"
              >
                Deselect all
              </button>
            </div>
            <button
              type="button"
              class="btn btn-link pt-1 px-0 pb-0"
              style="text-decoration: none"
              @click="viewPublications"
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
<style scoped>
/* Border styling fix for sticky header - START */
table {
  border-collapse: separate; /* Does not collapse border */
  border-spacing: 0;
  width: 100%;
}

table th {
  /* Apply top and bottom borders */
  border-top: 1px solid #a6c3ca;
  border-bottom: 1px solid #a6c3ca;
  border-right: 1px solid #a6c3ca;
  /* Keep header text on one line */
  white-space: nowrap;
}

table td {
  /* Apply bottom and right borders */
  border-bottom: 1px solid #a6c3ca;
  border-right: 1px solid #a6c3ca;
}

table th:first-child,
table td:first-child {
  /* Apply left border to first <td> and first <th> of every row */
  border-left: 1px solid #a6c3ca;
}
/* Border styling fix for sticky header - END */
</style>
