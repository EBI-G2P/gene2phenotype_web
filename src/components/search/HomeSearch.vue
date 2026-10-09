<script>
import { SEARCH_FILTER } from "../../utility/Constants.js";

export default {
  props: {
    panels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      searchInput: "",
      selectedSearchType: SEARCH_FILTER.SEARCH_TYPE.ALL_TYPES,
      selectedSearchPanel: SEARCH_FILTER.SEARCH_PANEL.ALL_PANELS,
      exampleSearches: [
        {
          label: "FBN1",
          query: "FBN1",
          type: SEARCH_FILTER.SEARCH_TYPE.GENE,
        },
        {
          label: "Weill-Marchesani syndrome",
          query: "Weill-Marchesani syndrome",
          type: SEARCH_FILTER.SEARCH_TYPE.DISEASE,
        },
        {
          label: "Tuberous sclerosis",
          query: "Tuberous sclerosis",
          type: SEARCH_FILTER.SEARCH_TYPE.DISEASE,
        },
      ],
      SEARCH_FILTER,
    };
  },
  methods: {
    searchClickHandler() {
      const searchInput = this.searchInput.trim();
      if (searchInput) {
        const routeQuery = {
          query: searchInput,
          type:
            this.selectedSearchType === SEARCH_FILTER.SEARCH_TYPE.ALL_TYPES
              ? undefined
              : this.selectedSearchType,
          panel:
            this.selectedSearchPanel === SEARCH_FILTER.SEARCH_PANEL.ALL_PANELS
              ? undefined
              : this.selectedSearchPanel,
        };
        this.$router.push({ path: "/search", query: routeQuery });
      }
    },
  },
};
</script>
<template>
  <div class="mt-3">
    <div class="input-group">
      <input
        id="search-input"
        v-model="searchInput"
        type="text"
        class="form-control"
        aria-label="Search text input"
        placeholder="Search for a Gene, Disease, Phenotype or G2P ID"
        @keyup.enter="searchClickHandler"
      />
      <button
        class="btn btn-primary dropdown-toggle"
        style="border-right: solid"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        Filter
      </button>
      <div class="dropdown-menu dropdown-menu-end p-3">
        <p class="fw-bold mb-1">Filter by type</p>
        <div class="form-check">
          <input
            id="filter-input-type-all"
            v-model="selectedSearchType"
            class="form-check-input"
            type="radio"
            :value="SEARCH_FILTER.SEARCH_TYPE.ALL_TYPES"
          />
          <label class="form-check-label" for="filter-input-type-all">
            All
          </label>
        </div>
        <div class="form-check">
          <input
            id="filter-input-type-gene"
            v-model="selectedSearchType"
            class="form-check-input"
            type="radio"
            :value="SEARCH_FILTER.SEARCH_TYPE.GENE"
          />
          <label class="form-check-label" for="filter-input-type-gene">
            Gene
          </label>
        </div>
        <div class="form-check">
          <input
            id="filter-input-type-disease"
            v-model="selectedSearchType"
            class="form-check-input"
            type="radio"
            :value="SEARCH_FILTER.SEARCH_TYPE.DISEASE"
          />
          <label class="form-check-label" for="filter-input-type-disease">
            Disease
          </label>
        </div>
        <div class="form-check">
          <input
            id="filter-input-type-phenotype"
            v-model="selectedSearchType"
            class="form-check-input"
            type="radio"
            :value="SEARCH_FILTER.SEARCH_TYPE.PHENOTYPE"
          />
          <label class="form-check-label" for="filter-input-type-phenotype">
            Phenotype
          </label>
        </div>
        <div class="form-check">
          <input
            id="filter-input-type-g2p-id"
            v-model="selectedSearchType"
            class="form-check-input"
            type="radio"
            :value="SEARCH_FILTER.SEARCH_TYPE.G2P_ID"
          />
          <label class="form-check-label" for="filter-input-type-g2p-id">
            G2P ID
          </label>
        </div>
        <div v-if="panels.length > 0">
          <hr class="dropdown-divider" />
          <p class="fw-bold mb-1">Filter by panel</p>
          <div class="form-check">
            <input
              id="filter-input-panel-all"
              v-model="selectedSearchPanel"
              class="form-check-input"
              type="radio"
              :value="SEARCH_FILTER.SEARCH_PANEL.ALL_PANELS"
            />
            <label class="form-check-label" for="filter-input-panel-all">
              All
            </label>
          </div>
          <div v-for="item in panels" :key="item.name" class="form-check">
            <input
              v-model="selectedSearchPanel"
              class="form-check-input"
              type="radio"
              :value="item.name?.toLowerCase()"
              :id="`filter-input-panel-${item.name}`"
            />
            <label
              class="form-check-label"
              :for="`filter-input-panel-${item.name}`"
            >
              {{ item.description || item.name }}
            </label>
          </div>
        </div>
      </div>
      <button
        type="button"
        class="btn btn-primary"
        aria-label="Search"
        @click="searchClickHandler"
      >
        <i class="bi bi-search" aria-hidden="true"></i>
      </button>
    </div>
    <div class="form-text text-start">
      Example searches:
      <template
        v-for="(exampleSearch, index) in exampleSearches"
        :key="exampleSearch.query"
      >
        <router-link
          :to="{
            path: '/search',
            query: {
              query: exampleSearch.query,
              type: exampleSearch.type,
            },
          }"
          class="text-decoration-none"
        >
          {{ exampleSearch.label }}
        </router-link>
        <span v-if="index < exampleSearches.length - 1"> | </span>
      </template>
    </div>
  </div>
</template>
<style scoped>
#search-input::placeholder {
  font-size: 16px;
}

@media (max-width: 576px) {
  #search-input::placeholder {
    font-size: 14px;
  }
}

@media (max-width: 530px) {
  #search-input::placeholder {
    font-size: 14px;
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
