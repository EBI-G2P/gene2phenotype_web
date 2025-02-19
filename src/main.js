import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { useAuthStore } from "./store/auth";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

const authStore = useAuthStore();
authStore.validateUser().finally(() => {
  app.use(router);
  app.mount("#app");
});
