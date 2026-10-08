import { createApp, watch } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { SESSION_END_REASON, useAuthStore } from "./store/auth";
import { configure } from "vue-gtag";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

// Configure google analytics
const googleAnalyticsMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (googleAnalyticsMeasurementId) {
  configure({
    tagId: googleAnalyticsMeasurementId,
  });
}

const authStore = useAuthStore();
authStore.validateUser().finally(() => {
  app.use(router);

  // Route guards only run during navigation. Redirect if the session expires
  // while the user is already viewing a protected route.
  watch(
    () => authStore.sessionEndReason,
    (reason) => {
      if (reason !== SESSION_END_REASON.EXPIRED) {
        return;
      }

      const currentRoute = router.currentRoute.value;
      if (
        currentRoute.meta.requiresLogIn &&
        currentRoute.path !== "/login"
      ) {
        router.replace({
          path: "/login",
          query: {
            redirect: currentRoute.fullPath,
            reason: SESSION_END_REASON.EXPIRED,
          },
        });
      }
    },
  );

  app.mount("#app");
});
