import { createRouter, createWebHistory } from "vue-router";
import HomePageView from "../views/HomePageView.vue";
import PublicationsView from "../views/PublicationsView.vue";
import AboutProjectView from "../views/AboutProjectView.vue";
import GeneView from "../views/GeneView.vue";
import PanelView from "../views/PanelView.vue";
import LocusGeneDiseaseView from "../views/LocusGeneDiseaseView.vue";
import SearchPageView from "../views/SearchPageView.vue";
import DiseaseView from "../views/DiseaseView.vue";
import ListCurationView from "../views/ListCurationView.vue";
import AddLocusGeneDiseaseView from "../views/AddLocusGeneDiseaseView.vue";
import CuratorsView from "../views/CuratorsView.vue";
import DisclaimerView from "../views/DisclaimerView.vue";
import UpdateLocusGeneDiseaseView from "../views/UpdateLocusGeneDiseaseView.vue";
import VariantFilteringView from "../views/VariantFilteringView.vue";
import TerminologyView from "../views/TerminologyView.vue";
import DataDownloadView from "../views/DataDownloadView.vue";
import LoginView from "../views/LoginView.vue";
import ProfileView from "../views/ProfileView.vue";
import UpdateRecordView from "../views/UpdateRecordView.vue";
import ContactPageView from "../views/ContactPageView.vue";
import AddPublicationView from "../views/AddPublicationView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import { useAuthStore } from "../store/auth.js";
import ChangePasswordView from "../views/ChangePasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";
import VerifyEmailView from "../views/VerifyEmailView.vue";
import ReferenceDataView from "../views/ReferenceDataView.vue";
import ApiInformationView from "../views/ApiInformationView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePageView,
    },
    {
      path: "/publications",
      name: "publications",
      component: PublicationsView,
    },
    {
      path: "/about/project",
      name: "aboutproject",
      component: AboutProjectView,
    },
    {
      path: "/gene/:symbol",
      name: "gene",
      component: GeneView,
    },
    {
      path: "/panel/:panel",
      name: "panel",
      component: PanelView,
    },
    {
      path: "/lgd/:stableId",
      name: "locus gene disease",
      component: LocusGeneDiseaseView,
    },
    {
      path: "/search",
      name: "search",
      component: SearchPageView,
    },
    {
      path: "/disease/:name(.*)",
      name: "disease",
      component: DiseaseView,
    },
    {
      path: "/curation/entries",
      name: "curation-entries",
      component: ListCurationView,
      meta: { requiresLogIn: true },
    },
    {
      path: "/lgd/add",
      name: "add-g2p-record",
      component: AddLocusGeneDiseaseView,
      meta: { requiresLogIn: true },
    },
    {
      path: "/curators",
      name: "curators",
      component: CuratorsView,
    },
    {
      path: "/disclaimer",
      name: "disclaimer",
      component: DisclaimerView,
    },
    {
      path: "/lgd/update-draft/:stableID",
      name: "update-g2p-record-draft",
      component: UpdateLocusGeneDiseaseView,
      meta: { requiresLogIn: true },
    },
    {
      path: "/lgd/update/:stableId",
      name: "update-g2p-record",
      component: UpdateRecordView,
      meta: { requiresLogIn: true },
    },
    {
      path: "/lgd/add-publication/:stableId",
      name: "add-publication",
      component: AddPublicationView,
      meta: { requiresLogIn: true },
    },
    {
      path: "/variant-filtering",
      name: "variant filtering",
      component: VariantFilteringView,
    },
    {
      path: "/download",
      name: "download",
      component: DataDownloadView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { requiresLogOut: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
      meta: { requiresLogIn: true },
    },
    {
      path: "/change-password",
      name: "change-password",
      component: ChangePasswordView,
      meta: { requiresLogIn: true },
    },
    {
      path: "/verify-email",
      name: "verify-email",
      component: VerifyEmailView,
    },
    {
      path: "/reset-password/:uid/:token",
      name: "reset-password",
      component: ResetPasswordView,
    },
    {
      path: "/about/terminology",
      name: "terminology",
      component: TerminologyView,
    },
    {
      path: "/contact",
      name: "contact",
      component: ContactPageView,
    },
    {
      path: "/reference-data",
      name: "reference-data",
      component: ReferenceDataView,
    },
    {
      path: "/g2p-api-info",
      name: "g2p-api-info",
      component: ApiInformationView,
    },
    // 404 page route, should always be at end of routes list
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFoundView,
    },
  ],
  scrollBehavior(to, _, savedPosition) {
    // custom scroll behavior
    if (to.hash) {
      return {
        el: to.hash,
        bahaviour: "smooth",
      };
    } else if (savedPosition) {
      return savedPosition;
    } else {
      // scroll to top
      return { top: 0 };
    }
  },
});

router.beforeEach(function (to, _, next) {
  const authStore = useAuthStore();
  if (to.meta.requiresLogIn && !authStore.isAuthenticated) {
    next({ path: "/login", query: { redirect: to.fullPath } });
  } else if (to.meta.requiresLogOut && authStore.isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
