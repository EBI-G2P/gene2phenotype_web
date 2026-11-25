import { createRouter, createWebHistory } from "vue-router";
import HomePageView from "../views/HomePageView.vue";
import { useAuthStore } from "../store/auth.js";

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
      component: () => import("../views/PublicationsView.vue"),
    },
    {
      path: "/about/project",
      name: "aboutproject",
      component: () => import("../views/AboutProjectView.vue"),
    },
    {
      path: "/gene/:symbol",
      name: "gene",
      component: () => import("../views/GeneView.vue"),
    },
    {
      path: "/panel/:panel",
      name: "panel",
      component: () => import("../views/PanelView.vue"),
    },
    {
      path: "/lgd/:stableId",
      name: "locus gene disease",
      component: () => import("../views/LocusGeneDiseaseView.vue"),
    },
    {
      path: "/search",
      name: "search",
      component: () => import("../views/SearchPageView.vue"),
    },
    {
      path: "/disease/:name(.*)",
      name: "disease",
      component: () => import("../views/DiseaseView.vue"),
    },
    {
      path: "/draft-records",
      name: "draft-records",
      component: () => import("../views/RecordDraftsView.vue"),
      meta: { requiresLogIn: true },
    },
    {
      path: "/lgd/add",
      name: "add-g2p-record",
      component: () => import("../views/AddLocusGeneDiseaseView.vue"),
      meta: { requiresLogIn: true },
    },
    {
      path: "/curators",
      name: "curators",
      component: () => import("../views/CuratorsView.vue"),
    },
    {
      path: "/contributing",
      name: "contributing",
      component: () => import("../views/ContributingView.vue"),
    },
    {
      path: "/disclaimer",
      name: "disclaimer",
      component: () => import("../views/DisclaimerView.vue"),
    },
    {
      path: "/lgd/review-draft/:stableId",
      name: "review-draft",
      component: () => import("../views/ReviewRecordDraftView.vue"),
      meta: { requiresLogIn: true },
    },
    {
      path: "/lgd/update-draft/:stableID",
      name: "update-g2p-record-draft",
      component: () => import("../views/UpdateLocusGeneDiseaseView.vue"),
      meta: { requiresLogIn: true },
    },
    {
      path: "/lgd/update/:stableId",
      name: "update-g2p-record",
      component: () => import("../views/UpdateRecordView.vue"),
      meta: { requiresLogIn: true },
    },
    {
      path: "/lgd/review-mined-publication/:stableId",
      name: "review-mined-publication",
      component: () => import("../views/ReviewMinedPublicationView.vue"),
      meta: { requiresLogIn: true },
    },
    {
      path: "/lgd/add-publication/:stableId",
      name: "add-publication",
      component: () => import("../views/AddPublicationView.vue"),
      meta: { requiresLogIn: true },
    },
    {
      path: "/variant-filtering",
      name: "variant filtering",
      component: () => import("../views/VariantFilteringView.vue"),
    },
    {
      path: "/download",
      name: "download",
      component: () => import("../views/DataDownloadView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { requiresLogOut: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: { requiresLogIn: true },
    },
    {
      path: "/change-password",
      name: "change-password",
      component: () => import("../views/ChangePasswordView.vue"),
      meta: { requiresLogIn: true },
    },
    {
      path: "/verify-email",
      name: "verify-email",
      component: () => import("../views/VerifyEmailView.vue"),
    },
    {
      path: "/reset-password/:uid/:token",
      name: "reset-password",
      component: () => import("../views/ResetPasswordView.vue"),
    },
    {
      path: "/about/terminology",
      name: "terminology",
      component: () => import("../views/TerminologyView.vue"),
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("../views/ContactPageView.vue"),
    },
    {
      path: "/reference-data",
      name: "reference-data",
      component: () => import("../views/ReferenceDataView.vue"),
    },
    {
      path: "/g2p-api-info",
      name: "g2p-api-info",
      component: () => import("../views/ApiInformationView.vue"),
    },
    {
      path: "/using-this-site",
      name: "using-this-site",
      component: () => import("../views/HelpView.vue"),
    },
    {
      path: "/use-of-ai-in-g2p",
      name: "use-of-ai-in-g2p",
      component: () => import("../views/AIUsageView.vue"),
    },
    {
      path: "/records-review",
      name: "records-review",
      component: () => import("../views/RecordsReviewView.vue"),
      meta: { requiresLogIn: true, requiresSuperUser: true },
    },
    {
      path: "/record-review-update/:caseId",
      name: "record-review-update",
      component: () => import("../views/RecordReviewUpdateView.vue"),
      meta: { requiresLogIn: true, requiresSuperUser: true },
    },
    {
      path: "/record-review-create",
      name: "record-review-create",
      component: () => import("../views/RecordReviewCreateView.vue"),
      meta: { requiresLogIn: true, requiresSuperUser: true },
    },
    {
      path: "/responsible-handover",
      name: "responsible-handover",
      component: () => import("../views/ResponsibleHandoverView.vue"),
    },
    // 404 page route, should always be at end of routes list
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
  scrollBehavior(to, _, savedPosition) {
    // custom scroll behavior
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    } else if (savedPosition) {
      return savedPosition;
    } else {
      // scroll to top
      return { top: 0 };
    }
  },
});

router.beforeEach(function (to) {
  const authStore = useAuthStore();
  if (to.meta.requiresLogIn && !authStore.isAuthenticated) {
    return { path: "/login", query: { redirect: to.fullPath } };
  } else if (to.meta.requiresSuperUser && !authStore.isSuperUser) {
    return "/";
  } else if (to.meta.requiresLogOut && authStore.isAuthenticated) {
    return "/";
  }
});

export default router;
