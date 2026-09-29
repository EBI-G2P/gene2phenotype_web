<script>
import { ALL_PANELS_URL, LOGOUT_URL } from "../../utility/UrlConstants.js";
import api from "../../services/api.js";
import { useAuthStore } from "../../store/auth.js";
import { mapState } from "pinia";
import { logGeneralErrorMsg } from "../../utility/ErrorUtility.js";
import MaintenanceAlert from "../../components/alert/MaintenanceAlert.vue";
import SessionExpiryToast from "./SessionExpiryToast.vue";
import { SEARCH_FILTER } from "../../utility/Constants.js";

export default {
  data() {
    return {
      isDataLoading: false,
      isLogoutInProgress: false,
      panelData: null,
      searchInput: "",
      selectedSearchType: SEARCH_FILTER.SEARCH_TYPE.ALL_TYPES,
      selectedSearchPanel: SEARCH_FILTER.SEARCH_PANEL.ALL_PANELS,
      isMaintenance: false,
      SEARCH_FILTER,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["isAuthenticated", "userName", "isSuperUser"]),
  },
  watch: {
    "$route.fullPath"() {
      this.$nextTick(() => {
        this.closeMobileNavigation();
      });
    },
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchPanelData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true },
    );
  },
  components: {
    MaintenanceAlert,
    SessionExpiryToast,
  },
  methods: {
    closeMobileNavigation() {
      // Close the expanded mobile navbar after navigation so it is not left open on the new page
      const navigation = this.$refs.navigation;

      if (!navigation?.classList.contains("show")) {
        return;
      }

      window.bootstrap?.Collapse?.getOrCreateInstance(navigation, {
        toggle: false,
      })?.hide();
    },
    fetchPanelData() {
      this.searchInput = "";
      this.selectedSearchType = SEARCH_FILTER.SEARCH_TYPE.ALL_TYPES;
      this.selectedSearchPanel = SEARCH_FILTER.SEARCH_PANEL.ALL_PANELS;
      this.panelData = null;
      this.isDataLoading = true;
      api
        .get(ALL_PANELS_URL)
        .then((response) => {
          this.panelData = response.data;
        })
        .catch((error) => {
          if (error.status === 503 || error.status === 500) {
            this.isMaintenance = true;
          }
          logGeneralErrorMsg(error);
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
    searchClickHandler() {
      if (this.searchInput) {
        let routeQuery = {
          query: this.searchInput,
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
    logoutBtnClickHandler() {
      this.isLogoutInProgress = true;
      api
        .post(LOGOUT_URL)
        .then(() => {
          const authStore = useAuthStore();
          authStore.logout();
          if (this.$router.currentRoute.value.fullPath === "/") {
            this.$router.go(); // refresh current page
          } else {
            this.$router.push("/"); // navigate to Home page
          }
        })
        .catch((error) => {
          logGeneralErrorMsg(error);
        })
        .finally(() => {
          this.isLogoutInProgress = false;
        });
    },
    loginBtnClickHandler() {
      this.$router.push({
        path: "/login",
        query: { redirect: this.$router.currentRoute.value.fullPath },
      });
    },
  },
};
</script>
<template>
  <header class="py-2 top-header">
    <div
      class="container d-flex flex-column flex-md-row gap-3 align-items-stretch align-items-md-center"
    >
      <router-link
        to="/"
        aria-label="Gene2Phenotype home"
        class="brand-home-link d-flex align-items-center mb-0 flex-shrink-0 text-decoration-none"
      >
        <img
          src="../../assets/G2P-logo.png"
          alt="G2P logo"
          width="70"
          height="70"
        />
        <span class="navbar-brand mb-0 h1 mx-2 fs-4 text-white">
          Gene2Phenotype
        </span>
      </router-link>
      <div
        v-if="!isMaintenance"
        class="d-flex align-items-center header-search"
      >
        <div class="input-group w-100">
          <input
            type="text"
            class="form-control"
            aria-label="Search text input"
            placeholder="Search G2P"
            v-model="searchInput"
            id="header-search-input"
            @keyup.enter="searchClickHandler"
          />
          <button
            class="btn dropdown-toggle text-white fw-bold filter-btn"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            aria-label="Filter search results"
          >
            <span class="d-none d-md-inline">Filter</span>
            <i class="bi bi-funnel d-md-none" aria-hidden="true"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-end p-3">
            <p class="fw-bold mb-1">Filter by type</p>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :value="SEARCH_FILTER.SEARCH_TYPE.ALL_TYPES"
                v-model="selectedSearchType"
                id="header-filter-input-type-all"
              />
              <label
                class="form-check-label"
                for="header-filter-input-type-all"
              >
                All
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :value="SEARCH_FILTER.SEARCH_TYPE.GENE"
                v-model="selectedSearchType"
                id="header-filter-input-type-gene"
              />
              <label
                class="form-check-label"
                for="header-filter-input-type-gene"
              >
                Gene
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :value="SEARCH_FILTER.SEARCH_TYPE.DISEASE"
                v-model="selectedSearchType"
                id="header-filter-input-type-disease"
              />
              <label
                class="form-check-label"
                for="header-filter-input-type-disease"
              >
                Disease
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :value="SEARCH_FILTER.SEARCH_TYPE.PHENOTYPE"
                v-model="selectedSearchType"
                id="header-filter-input-type-phenotype"
              />
              <label
                class="form-check-label"
                for="header-filter-input-type-phenotype"
              >
                Phenotype
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :value="SEARCH_FILTER.SEARCH_TYPE.G2P_ID"
                v-model="selectedSearchType"
                id="header-filter-input-type-g2p-id"
              />
              <label
                class="form-check-label"
                for="header-filter-input-type-g2p-id"
              >
                G2P ID
              </label>
            </div>
            <div v-if="panelData?.results?.length > 0">
              <hr class="dropdown-divider" />
              <p class="fw-bold mb-1">Filter by panel</p>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  :value="SEARCH_FILTER.SEARCH_PANEL.ALL_PANELS"
                  v-model="selectedSearchPanel"
                  id="header-filter-input-panel-all"
                />
                <label
                  class="form-check-label"
                  for="header-filter-input-panel-all"
                >
                  All
                </label>
              </div>
              <div
                v-for="item in panelData.results"
                :key="item.name"
                class="form-check"
              >
                <input
                  class="form-check-input"
                  type="radio"
                  :value="item.name.toLowerCase()"
                  v-model="selectedSearchPanel"
                  :id="`header-filter-input-panel-${item.name}`"
                />
                <label
                  class="form-check-label"
                  :for="`header-filter-input-panel-${item.name}`"
                >
                  {{ item.description ? item.description : item.name }}
                </label>
              </div>
            </div>
          </div>
          <button
            type="button"
            class="btn text-white search-btn"
            @click="searchClickHandler"
            aria-label="Search"
          >
            <i class="bi bi-search" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  </header>
  <nav
    class="navbar navbar-expand-md navbar-dark py-2 border-bottom text-white bottom-header"
  >
    <div class="container">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#header-navigation"
        aria-controls="header-navigation"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        ref="navigation"
        class="collapse navbar-collapse order-3 order-md-1"
        id="header-navigation"
      >
        <ul class="navbar-nav me-auto nav-underline gap-0 gap-md-3">
          <li class="nav-item">
            <router-link
              to="/"
              class="nav-link px-1 fw-bold text-white text-decoration-none"
            >
              Home
            </router-link>
          </li>
          <li class="nav-item dropdown">
            <span
              class="nav-link dropdown-toggle px-1 text-white fw-bold"
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
                  The G2P project
                </router-link>
              </li>
              <li>
                <router-link to="/about/terminology" class="dropdown-item"
                  >Terminology</router-link
                >
              </li>
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
              <li>
                <router-link to="/contributing" class="dropdown-item">
                  Contributing
                </router-link>
              </li>
              <li>
                <router-link to="/download" class="dropdown-item">
                  Downloads
                </router-link>
              </li>
              <li>
                <router-link to="/g2p-api-info" class="dropdown-item">
                  G2P API
                </router-link>
              </li>
              <li>
                <router-link to="/reference-data" class="dropdown-item">
                  Reference data
                </router-link>
              </li>
              <li>
                <router-link to="/use-of-ai-in-g2p" class="dropdown-item">
                  Use of AI in G2P
                </router-link>
              </li>
              <li>
                <router-link to="/using-this-site" class="dropdown-item">
                  Using this site
                </router-link>
              </li>
            </ul>
          </li>
          <li v-if="panelData?.results?.length > 0" class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle px-1 text-white fw-bold"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Browse panels
            </a>
            <ul class="dropdown-menu">
              <li v-for="item in panelData.results" :key="item.name">
                <router-link
                  v-if="item.name"
                  :to="`/panel/${item.name}`"
                  class="dropdown-item"
                >
                  {{ item.description }} panel
                </router-link>
              </li>
            </ul>
          </li>
          <li v-else class="nav-item">
            <router-link to="/" class="nav-link px-1 text-white fw-bold">
              Browse panels
            </router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle px-1 text-white fw-bold"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Curate
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link to="/lgd/add" class="dropdown-item">
                  Add new G2P record
                </router-link>
              </li>
              <li>
                <router-link to="/draft-records" class="dropdown-item">
                  Draft records
                </router-link>
              </li>
            </ul>
          </li>
          <li v-if="isAuthenticated && isSuperUser" class="nav-item">
            <router-link
              to="/records-review"
              class="nav-link px-1 text-white fw-bold"
            >
              Review records
            </router-link>
          </li>
        </ul>
        <ul class="navbar-nav nav-underline gap-0 gap-md-3">
          <li v-if="isAuthenticated && !!userName" class="nav-item">
            <span class="nav-link px-1 text-white fw-bold">
              <i class="bi bi-person-fill"></i>
              <router-link
                to="/profile"
                class="text-white"
                style="text-decoration: none"
              >
                {{ userName }}
              </router-link>
            </span>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
            <button
              v-if="isLogoutInProgress"
              disabled="true"
              class="nav-link px-1 text-white fw-bold"
            >
              Logging Out
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            </button>
            <button
              v-else
              @click="logoutBtnClickHandler"
              class="nav-link px-1 text-white fw-bold"
            >
              Log Out
            </button>
          </li>
          <li v-else class="nav-item">
            <button
              @click="loginBtnClickHandler"
              class="nav-link px-1 text-white fw-bold"
            >
              Log In
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <MaintenanceAlert v-if="isMaintenance" />
  <SessionExpiryToast v-if="isAuthenticated" />
</template>
<style scoped>
.top-header {
  background-color: #286ece;
}
.brand-home-link {
  width: fit-content;
}
.header-search {
  width: 100%;
}
@media (min-width: 768px) {
  .header-search {
    width: 60%;
    margin-left: auto;
  }
}
.filter-btn {
  background-color: #4d89dc;
  border-right: solid;
}
.filter-btn .bi-funnel {
  -webkit-text-stroke: 1px;
}
.search-btn {
  background-color: #4d89dc;
  -webkit-text-stroke: 1px;
}
.bottom-header {
  background-color: #4d89dc;
}
</style>
