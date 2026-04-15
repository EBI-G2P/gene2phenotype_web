<script>
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
import TableToolTip from "../tooltip/TableToolTip.vue";
import { viewSelectedPublications } from "../../utility/CommonUtility.js";
export default {
  props: {
    publications: Array,
    isAuthenticated: Boolean,
  },
  data() {
    return {
      selectedCuratedPublicationsList: [],
      searchQuery: "",
      sortKey: null,
      sortOrder: null, // 1 = ascending order, -1 = descending order
      EUROPE_PMC_URL,
    };
  },
  computed: {
    filteredAndSortedCuratedPublications() {
      const searchFields = ["pmid", "title"];
      const queryText = this.searchQuery.trim().toLowerCase();
      // Filter curated publications by matching the query text against the search fields (case insensitive text matching)
      let filteredList = this.publications.filter((item) => {
        if (!queryText) return true;
        return searchFields.some((field) =>
          String(item.publication?.[field] ?? "")
            .toLowerCase()
            .includes(queryText),
        );
      });
      // Sort filtered curated publications based on sort key and sort order
      if (this.sortKey && this.sortOrder !== null) {
        filteredList = [...filteredList].sort((a, b) => {
          const valA = String(
            a.publication?.[this.sortKey] ?? "",
          ).toLowerCase();
          const valB = String(
            b.publication?.[this.sortKey] ?? "",
          ).toLowerCase();
          return valA.localeCompare(valB) * this.sortOrder;
        });
      }
      return filteredList;
    },
    tableResultsCountText() {
      const count = this.filteredAndSortedCuratedPublications.length;
      return `${count} result${count !== 1 ? "s" : ""}`;
    },
  },
  watch: {
    filteredAndSortedCuratedPublications: {
      immediate: true,
      handler(newList) {
        // Sync selectedCuratedPublicationsList with pmids from filteredAndSortedCuratedPublications
        this.selectedCuratedPublicationsList = newList.map(
          (item) => item.publication?.pmid,
        );
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
      this.selectedCuratedPublicationsList =
        this.filteredAndSortedCuratedPublications.map(
          (item) => item.publication?.pmid,
        );
    },
    deselectAll() {
      this.selectedCuratedPublicationsList = [];
    },
    viewPublications() {
      viewSelectedPublications(this.selectedCuratedPublicationsList);
    },
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
        <div class="accordion-body" style="border: 1px solid #dee2e6">
          <div>
            <!-- Search Filter -->
            <div class="mb-3 d-flex gap-2 align-items-center">
              <div class="position-relative w-100">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control pe-4"
                  placeholder="Search curated publications"
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
            <div class="mb-1">
              <span class="text-muted small">
                {{ tableResultsCountText }}
              </span>
            </div>
            <!-- Scrollable Table -->
            <div
              class="table-responsive"
              style="max-height: 500px; overflow-y: scroll"
            >
              <table class="table mb-0 table-hover">
                <!-- sticky header is collapsing the borders so a border styling fix is made in the style section below -->
                <thead class="sticky-top">
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
                        @click="toggleSort('title')"
                        aria-label="Sort by title"
                        class="btn btn-link p-0 text-decoration-none fw-bold"
                      >
                        <span class="text-black me-1">Title</span>
                        <i :class="getSortIcon('title')"></i>
                      </button>
                    </th>
                    <th>Individuals</th>
                    <th v-if="isAuthenticated">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredAndSortedCuratedPublications.length === 0">
                    <td
                      :colspan="isAuthenticated ? 5 : 4"
                      class="text-center text-muted"
                    >
                      No publications found.
                    </td>
                  </tr>
                  <tr
                    v-for="item in filteredAndSortedCuratedPublications"
                    :key="item.publication?.pmid"
                  >
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
                          (item.consanguinity &&
                            item.consanguinity !== 'unknown')
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
                            item.consanguinity &&
                            item.consanguinity !== 'unknown'
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
            </div>
          </div>
          <div
            v-if="filteredAndSortedCuratedPublications.length > 0"
            class="d-flex justify-content-between"
          >
            <div class="pt-1 px-0 pb-0">
              <button
                type="button"
                class="btn btn-link p-0"
                style="text-decoration: none"
                @click="selectAll"
                :disabled="
                  selectedCuratedPublicationsList.length ===
                  filteredAndSortedCuratedPublications.length
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
                :disabled="selectedCuratedPublicationsList.length === 0"
              >
                Deselect all
              </button>
            </div>
            <button
              type="button"
              class="btn btn-link pt-1 px-0 pb-0"
              style="text-decoration: none"
              @click="viewPublications"
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
</style>
