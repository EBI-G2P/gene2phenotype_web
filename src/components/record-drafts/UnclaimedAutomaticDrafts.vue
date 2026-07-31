<script>
export default {
  props: {
    unclaimedAutomaticDrafts: Array,
    isClaimDraftLoading: Boolean,
    claimDraftStableId: String,
  },
  emits: ["claimDraft"],
  data() {
    return {
      searchQuery: "",
      selectedGene: "",
      selectedPanel: "",
      selectedAllelicRequirement: "",
      sortKey: null,
      sortOrder: null, // 1 = ascending order, -1 = descending order
    };
  },
  computed: {
    filteredAndSortedUnclaimedAutomaticDrafts() {
      const searchFields = [
        "session_name",
        "stable_id",
        "locus",
        "allelic_requirement",
        "panels",
        "last_update",
      ];
      const queryText = this.searchQuery.trim().toLowerCase();
      // Filter drafts by matching query text against the search fields (case insensitive text matching)
      // and applying selected filters
      let filteredList = this.unclaimedAutomaticDrafts.filter((item) => {
        const matchesSearch =
          !queryText ||
          searchFields.some((field) =>
            this.getSortValue(item, field).toLowerCase().includes(queryText),
          );
        const matchesGene =
          !this.showGeneFilter ||
          !this.selectedGene ||
          item.locus === this.selectedGene;
        const matchesPanel =
          !this.showPanelFilter ||
          !this.selectedPanel ||
          item.panels?.includes(this.selectedPanel);
        const matchesAllelicRequirement =
          !this.showAllelicRequirementFilter ||
          !this.selectedAllelicRequirement ||
          item.allelic_requirement === this.selectedAllelicRequirement;

        return (
          matchesSearch &&
          matchesGene &&
          matchesPanel &&
          matchesAllelicRequirement
        );
      });
      // Sort filtered drafts based on sort key and sort order
      if (this.sortKey && this.sortOrder !== null) {
        filteredList = [...filteredList].sort((a, b) => {
          const valA = this.getSortValue(a, this.sortKey).toLowerCase();
          const valB = this.getSortValue(b, this.sortKey).toLowerCase();
          return valA.localeCompare(valB) * this.sortOrder;
        });
      }
      return filteredList;
    },
    tableResultsCountText() {
      const count = this.filteredAndSortedUnclaimedAutomaticDrafts.length;
      return `${count} result${count !== 1 ? "s" : ""}`;
    },
    geneFilterOptions() {
      return this.getUniqueSortedValues(
        this.unclaimedAutomaticDrafts.map((item) => item.locus),
      );
    },
    panelFilterOptions() {
      return this.getUniqueSortedValues(
        this.unclaimedAutomaticDrafts.flatMap((item) => item.panels ?? []),
      );
    },
    allelicRequirementFilterOptions() {
      return this.getUniqueSortedValues(
        this.unclaimedAutomaticDrafts.map((item) => item.allelic_requirement),
      );
    },
    showGeneFilter() {
      return this.geneFilterOptions.length >= 2;
    },
    showPanelFilter() {
      return this.panelFilterOptions.length >= 2;
    },
    showAllelicRequirementFilter() {
      return this.allelicRequirementFilterOptions.length >= 2;
    },
    hasVisibleFilters() {
      return (
        this.showGeneFilter ||
        this.showPanelFilter ||
        this.showAllelicRequirementFilter
      );
    },
    hasActiveFilters() {
      return Boolean(
        this.searchQuery.trim() ||
        (this.showGeneFilter && this.selectedGene) ||
        (this.showPanelFilter && this.selectedPanel) ||
        (this.showAllelicRequirementFilter && this.selectedAllelicRequirement),
      );
    },
  },
  watch: {
    unclaimedAutomaticDrafts() {
      // Clear stale filter selections after the draft list changes
      // Eg: A selected gene may not exist after claiming a draft
      this.clearInvalidFilterSelections();
    },
  },
  methods: {
    clearFilters() {
      this.searchQuery = "";
      this.selectedGene = "";
      this.selectedPanel = "";
      this.selectedAllelicRequirement = "";
    },
    clearInvalidFilterSelections() {
      if (!Array.isArray(this.unclaimedAutomaticDrafts)) return;
      if (
        this.selectedGene &&
        !this.geneFilterOptions.includes(this.selectedGene)
      ) {
        this.selectedGene = "";
      }
      if (
        this.selectedPanel &&
        !this.panelFilterOptions.includes(this.selectedPanel)
      ) {
        this.selectedPanel = "";
      }
      if (
        this.selectedAllelicRequirement &&
        !this.allelicRequirementFilterOptions.includes(
          this.selectedAllelicRequirement,
        )
      ) {
        this.selectedAllelicRequirement = "";
      }
    },
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
    getSortValue(item, key) {
      const value = item?.[key];
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return String(value ?? "");
    },
    getUniqueSortedValues(values) {
      return [...new Set(values.filter((value) => value))]
        .map((value) => String(value))
        .sort((a, b) => a.localeCompare(b));
    },
  },
};
</script>
<template>
  <div v-if="unclaimedAutomaticDrafts?.length > 0">
    <!-- Search Filter -->
    <div class="mb-3 d-flex gap-2 align-items-center">
      <div class="position-relative w-100">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control pe-4"
          placeholder="Search unclaimed automatic drafts"
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
    <!-- Filters -->
    <div
      v-if="hasVisibleFilters"
      class="d-flex flex-wrap gap-2 mb-3 align-items-center"
    >
      <span class="text-muted fw-semibold me-1">
        <i class="bi bi-funnel"></i>
        Filters
      </span>
      <div v-if="showGeneFilter" class="filter-control">
        <select
          id="unclaimed-automatic-drafts-gene-filter"
          v-model="selectedGene"
          class="form-select"
          aria-label="Filter by gene"
        >
          <option value="">All genes</option>
          <option v-for="gene in geneFilterOptions" :key="gene" :value="gene">
            {{ gene }}
          </option>
        </select>
      </div>
      <div v-if="showPanelFilter" class="filter-control">
        <select
          id="unclaimed-automatic-drafts-panel-filter"
          v-model="selectedPanel"
          class="form-select"
          aria-label="Filter by panel"
        >
          <option value="">All panels</option>
          <option
            v-for="panel in panelFilterOptions"
            :key="panel"
            :value="panel"
          >
            {{ panel }}
          </option>
        </select>
      </div>
      <div
        v-if="showAllelicRequirementFilter"
        class="filter-control filter-control-wide"
      >
        <select
          id="unclaimed-automatic-drafts-allelic-requirement-filter"
          v-model="selectedAllelicRequirement"
          class="form-select"
          aria-label="Filter by allelic requirement"
        >
          <option value="">All allelic requirements</option>
          <option
            v-for="allelicRequirement in allelicRequirementFilterOptions"
            :key="allelicRequirement"
            :value="allelicRequirement"
          >
            {{ allelicRequirement }}
          </option>
        </select>
      </div>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="btn btn-link px-0"
        style="text-decoration: none"
        @click="clearFilters"
      >
        <i class="bi bi-x-circle"></i>
        Clear search and filters
      </button>
    </div>
    <div class="d-flex justify-content-between align-items-center mb-1">
      <span class="text-muted small">
        {{ tableResultsCountText }}
      </span>
      <span class="text-muted small d-xxl-none">
        Scroll to view more
        <i class="bi bi-arrow-right"></i>
      </span>
    </div>
    <!-- Drafts Table -->
    <div class="table-responsive-xxl">
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th>
              <button
                @click="toggleSort('session_name')"
                aria-label="Sort by session name"
                class="btn btn-link p-0 text-decoration-none fw-bold"
              >
                <span class="text-black me-1">Session Name</span>
                <i :class="getSortIcon('session_name')"></i>
              </button>
            </th>
            <th>
              <button
                @click="toggleSort('stable_id')"
                aria-label="Sort by G2P ID"
                class="btn btn-link p-0 text-decoration-none fw-bold"
              >
                <span class="text-black me-1">G2P ID</span>
                <i :class="getSortIcon('stable_id')"></i>
              </button>
            </th>
            <th>
              <button
                @click="toggleSort('locus')"
                aria-label="Sort by gene"
                class="btn btn-link p-0 text-decoration-none fw-bold"
              >
                <span class="text-black me-1">Gene</span>
                <i :class="getSortIcon('locus')"></i>
              </button>
            </th>
            <th>
              <button
                @click="toggleSort('allelic_requirement')"
                aria-label="Sort by allelic requirement"
                class="btn btn-link p-0 text-decoration-none fw-bold"
              >
                <span class="text-black me-1">Allelic Requirement</span>
                <i :class="getSortIcon('allelic_requirement')"></i>
              </button>
            </th>
            <th>
              <button
                @click="toggleSort('panels')"
                aria-label="Sort by panels"
                class="btn btn-link p-0 text-decoration-none fw-bold"
              >
                <span class="text-black me-1">Panels</span>
                <i :class="getSortIcon('panels')"></i>
              </button>
            </th>
            <th>
              <button
                @click="toggleSort('last_update')"
                aria-label="Sort by last updated"
                class="btn btn-link p-0 text-decoration-none fw-bold"
              >
                <span class="text-black me-1">Last Updated</span>
                <i :class="getSortIcon('last_update')"></i>
              </button>
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredAndSortedUnclaimedAutomaticDrafts.length === 0">
            <td colspan="7" class="text-center text-muted">
              No unclaimed automatic drafts found.
            </td>
          </tr>
          <tr
            v-for="item in filteredAndSortedUnclaimedAutomaticDrafts"
            :key="item.stable_id"
          >
            <td>
              {{ item.session_name }}
            </td>
            <td>{{ item.stable_id }}</td>
            <td>{{ item.locus }}</td>
            <td>{{ item.allelic_requirement }}</td>
            <td>
              <span v-if="item.panels?.length > 0">
                <template v-for="(panel, index) in item.panels" :key="panel">
                  {{ panel }}
                  <span v-if="index !== item.panels.length - 1">, </span>
                </template>
              </span>
            </td>
            <td>{{ item.last_update }}</td>
            <td class="text-nowrap text-center">
              <button
                type="button"
                class="btn btn-link p-0 mb-1 d-inline-flex align-items-center justify-content-center claim-draft-button"
                style="text-decoration: none"
                :disabled="isClaimDraftLoading"
                @click="$emit('claimDraft', item.stable_id)"
              >
                <span
                  v-if="claimDraftStableId === item.stable_id"
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span v-else>Claim <i class="bi bi-plus-circle"></i></span>
              </button>
              <br />
              <router-link
                v-if="item.stable_id"
                :to="`/lgd/review-draft/${item.stable_id}`"
                style="text-decoration: none"
              >
                Review <i class="bi bi-file-earmark-text"></i>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="alert alert-secondary" role="status">
    <i class="bi bi-info-circle-fill"></i>
    There are currently no unclaimed automatic drafts.
  </div>
</template>
<style scoped>
table th {
  /* Keep header text on one line */
  white-space: nowrap;
}

.claim-draft-button {
  min-width: 64px;
}

.filter-control {
  min-width: 180px;
}

.filter-control-wide {
  min-width: 240px;
}
</style>
