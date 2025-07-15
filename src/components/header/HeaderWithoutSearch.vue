<script>
import { ALL_PANELS_URL, LOGOUT_URL } from "../../utility/UrlConstants.js";
import api from "../../services/api.js";
import { useAuthStore } from "../../store/auth.js";
import { mapState } from "pinia";
import { logGeneralErrorMsg } from "../../utility/ErrorUtility.js";

export default {
  data() {
    return {
      panelData: null,
      isLogoutInProgress: false,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["isAuthenticated", "userName"]),
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
      { immediate: true }
    );
  },
  methods: {
    fetchPanelData() {
      this.panelData = null;
      api
        .get(ALL_PANELS_URL)
        .then((response) => {
          this.panelData = response.data;
        })
        .catch((error) => {
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
        class="d-flex align-items-center mb-3 mb-lg-0 me-lg-auto text-decoration-none"
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
  <nav class="py-2 border-bottom text-white bottom-header">
    <div class="container d-flex flex-wrap">
      <ul class="nav me-auto nav-underline">
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
              <router-link to="/g2p-website-help" class="dropdown-item">
                G2P website help
              </router-link>
            </li>
            <li>
              <router-link to="/reference-data" class="dropdown-item">
                Reference data
              </router-link>
            </li>
          </ul>
        </li>
        <li class="nav-item dropdown" v-if="panelData?.results?.length > 0">
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
          <router-link to="/" class="nav-link px-1 text-white fw-bold">
            Browse panels
          </router-link>
        </li>
        <li class="nav-item dropdown" v-if="isAuthenticated">
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
              <router-link to="/curation/entries" class="dropdown-item">
                Saved drafts
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
      <ul class="nav nav-underline">
        <li class="nav-item" v-if="isAuthenticated && !!userName">
          <span class="nav-link text-white fw-bold">
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
        <li class="nav-item" v-if="isAuthenticated">
          <button
            class="nav-link text-white fw-bold"
            disabled="true"
            v-if="isLogoutInProgress"
          >
            Logging Out
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          </button>
          <button
            class="nav-link text-white fw-bold"
            @click="logoutBtnClickHandler"
            v-else
          >
            Log Out
          </button>
        </li>
        <li class="nav-item" v-else>
          <button
            class="nav-link text-white fw-bold"
            @click="loginBtnClickHandler"
          >
            Log In
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
<style scoped>
.top-header {
  background-color: #286ece;
}
.filter-btn {
  background-color: #4d89dc;
  border-right: solid;
}
.search-btn {
  background-color: #4d89dc;
  -webkit-text-stroke: 1px;
}
.bottom-header {
  background-color: #4d89dc;
}
</style>
