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
import {
  isUserLoggedIn,
  logOutUser,
} from "../utility/AuthenticationUtility.js";
import UpdateRecordView from "../views/UpdateRecordView.vue";
import ContactPageView from "../views/ContactPageView.vue";
import AddPublicationView from "../views/AddPublicationView.vue";

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
      path: "/about/terminology",
      name: "terminology",
      component: TerminologyView,
    },
    {
      path: "/contact",
      name: "contact",
      component: ContactPageView,
    },
  ],
  scrollBehavior() {
    // scroll to top
    return { top: 0 };
  },
});

router.beforeEach(function (to, _, next) {
  if (to.meta.requiresLogIn && !isUserLoggedIn()) {
    logOutUser();
    next("/login");
  } else if (to.meta.requiresLogOut && isUserLoggedIn()) {
    next("/");
  } else {
    next();
  }
});

export default router;
