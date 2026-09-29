<script>
import { ALL_PANELS_URL, LOGOUT_URL } from "../../utility/UrlConstants.js";
import api from "../../services/api.js";
import { useAuthStore } from "../../store/auth.js";
import { mapState } from "pinia";
import { logGeneralErrorMsg } from "../../utility/ErrorUtility.js";
import MaintenanceAlert from "../../components/alert/MaintenanceAlert.vue";
import SessionExpiryToast from "./SessionExpiryToast.vue";

export default {
  data() {
    return {
      panelData: null,
      isLogoutInProgress: false,
      isMaintenance: false,
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
      this.panelData = null;
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
    <div class="container d-grid align-items-center">
      <router-link
        to="/"
        aria-label="Gene2Phenotype home"
        class="brand-home-link d-flex align-items-center mb-0 me-lg-auto text-decoration-none"
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
        data-bs-target="#header-without-search-navigation"
        aria-controls="header-without-search-navigation"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        ref="navigation"
        class="collapse navbar-collapse order-3 order-md-1"
        id="header-without-search-navigation"
      >
        <ul class="navbar-nav me-auto nav-underline gap-0 gap-md-3">
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
.bottom-header {
  background-color: #4d89dc;
}
</style>
