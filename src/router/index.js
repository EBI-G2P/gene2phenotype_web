import { createRouter, createWebHistory } from "vue-router";
import HomePageView from "../views/HomePageView.vue";
import PublicationsView from "../views/PublicationsView.vue";
import AboutProjectView from "../views/AboutProjectView.vue";
import GeneView from "../views/GeneView.vue";
import PanelView from "../views/PanelView.vue";
import LocusGeneDiseaseView from "../views/LocusGeneDiseaseView.vue";

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
      name: "gene symbol",
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
  ],
});

export default router;
