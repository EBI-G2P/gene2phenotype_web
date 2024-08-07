<script>
import router from "@/router";

export default {
  data() {
    return {
      isDataLoading: false,
      panelData: null,
      errorMsg: null,
      searchInput: "",
      selectedSearchType: "all",
      selectedSearchPanel: "all",
    };
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  methods: {
    fetchData() {
      this.errorMsg = this.panelData = null;
      this.isDataLoading = true;
      fetch("/gene2phenotype/api/panels/")
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            return Promise.reject(new Error("Unable to fetch panel data"));
          }
        })
        .then((responseJson) => {
          this.isDataLoading = false;
          this.panelData = responseJson;
        })
        .catch((error) => {
          this.isDataLoading = false;
          this.errorMsg = error.message;
          console.log(error);
        });
    },
    searchClickHandler() {
      if (this.searchInput) {
        let routeQuery = {
          query: this.searchInput,
          type:
            this.selectedSearchType === "all"
              ? undefined
              : this.selectedSearchType,
          panel:
            this.selectedSearchPanel === "all"
              ? undefined
              : this.selectedSearchPanel,
        };
        router.push({ path: "/search", query: routeQuery });
      }
    },
  },
};
</script>
<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img
          src="../../assets/G2P-logo.png"
          alt="G2P logo"
          width="30"
          height="30"
          class="d-inline-block align-text-top"
        />
        Gene2Phenotype
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mb-2 mb-lg-0">
          <li class="nav-item dropdown">
            <span
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              About
            </span>
            <ul class="dropdown-menu">
              <li>
                <router-link to="/about/project" class="dropdown-item">
                  The Project
                </router-link>
              </li>
              <li><a class="dropdown-item" href="#">Terminology</a></li>
              <li>
                <router-link to="/variant-filtering" class="dropdown-item">
                  Variant filtering
                </router-link>
              </li>
              <li>
                <router-link to="/publications" class="dropdown-item">
                  Publications
                </router-link>
              </li>
              <li>
                <router-link to="/curators" class="dropdown-item">
                  Curators
                </router-link>
              </li>
              <li><a class="dropdown-item" href="#">Announcements</a></li>
            </ul>
          </li>
          <li
            class="nav-item dropdown"
            v-if="
              panelData && panelData.results && panelData.results.length > 0
            "
          >
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Browse
            </a>
            <ul class="dropdown-menu">
              <li v-for="item in panelData.results">
                <router-link
                  :to="`/panel/${item.name}`"
                  v-if="item.name"
                  class="dropdown-item"
                >
                  {{ item.description }} panel
                </router-link>
              </li>
            </ul>
          </li>
          <li class="nav-item" v-else>
            <router-link to="/" class="nav-link" aria-current="page">
              Browse
            </router-link>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Curate</a
            >
            <ul class="dropdown-menu">
              <li>
                <router-link to="/lgd/add" class="dropdown-item">
                  Add New G2P Record
                </router-link>
              </li>
              <li>
                <router-link to="/curation/entries" class="dropdown-item">
                  Saved Drafts
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
        <div class="input-group ms-auto me-auto" style="max-width: 73%">
          <input
            type="text"
            class="form-control"
            aria-label="Search text input"
            placeholder="Search G2P"
            v-model="searchInput"
            id="header-search-input"
          />
          <select
            class="form-select"
            aria-label="Select search type"
            style="max-width: 22%"
            v-model="selectedSearchType"
            id="header-select-search-type"
          >
            <option value="all">Search by All Types</option>
            <option value="gene">Search by Gene</option>
            <option value="disease">Search by Disease</option>
            <option value="phenotype">Search by Phenotype</option>
            <option value="g2p_id">Search by G2P ID</option>
          </select>
          <select
            class="form-select"
            aria-label="Select search panel"
            style="max-width: 22%"
            v-model="selectedSearchPanel"
            :disabled="
              !(panelData && panelData.results && panelData.results.length > 0)
            "
            id="header-select-search-panel"
          >
            <option value="all">Search All Panels</option>
            <option
              v-if="
                panelData && panelData.results && panelData.results.length > 0
              "
              v-for="item in panelData.results"
              :value="item.name.toLowerCase()"
            >
              Search {{ item.description }} panel
            </option>
          </select>
          <button
            type="button"
            :class="isDataLoading ? 'btn btn-secondary' : 'btn btn-primary'"
            @click="searchClickHandler"
            :disabled="isDataLoading"
          >
            <i class="bi bi-search"></i>
          </button>
        </div>
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="#">Log In</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
