import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { useAuthStore } from "./store/auth";
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
  app.mount("#app");
});
