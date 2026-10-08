<script>
import api from "../services/api.js";
import { LOGIN_URL } from "../utility/UrlConstants.js";
import { SESSION_END_REASON, useAuthStore } from "../store/auth.js";
import { fetchAndLogApiResponseErrorListMsg } from "../utility/ErrorUtility.js";

export default {
  data() {
    return {
      errorMsg: null,
      isDataLoading: false,
      username: "",
      password: "",
      isPasswordVisible: false,
    };
  },
  computed: {
    isSessionExpired() {
      return this.$route.query.reason === SESSION_END_REASON.EXPIRED;
    },
  },
  methods: {
    login() {
      const redirectRoute = this.$route.query.redirect || "/";
      this.errorMsg = null;
      this.isDataLoading = true;
      const requestBody = {
        username: this.username,
        password: this.password,
      };
      api
        .post(LOGIN_URL, requestBody, { _skipAuthRefresh: true })
        .then((response) => {
          const authStore = useAuthStore();
          authStore.login(response.data);
          this.$router.replace(redirectRoute);
        })
        .catch((error) => {
          const apiError = error.response?.data?.error;
          this.errorMsg = fetchAndLogApiResponseErrorListMsg(
            error,
            Array.isArray(apiError) ? apiError : [apiError],
            "Unable to login. Please check your credentials or try again later."
          );
        })
        .finally(() => {
          this.isDataLoading = false;
        });
    },
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible;
    },
  },
};
</script>
<template>
  <div class="container px-5 py-5" style="min-height: 60vh">
    <div
      class="d-flex justify-content-center"
      v-if="isDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="form-signin w-100 m-auto" v-else>
      <form @submit.prevent="login">
        <img
          class="mb-4 m-auto d-flex align-items-center"
          alt="G2P logo"
          src="../assets/G2P-logo.png"
          width="50%"
          height="auto"
        />
        <div v-if="isSessionExpired" class="alert alert-warning" role="alert">
          Your session has expired. Please log in again.
        </div>
        <div class="form-floating">
          <input
            type="email"
            class="form-control"
            id="input-username"
            placeholder="name@example.com"
            v-model.trim="username"
          />
          <label for="input-username">Email address</label>
        </div>
        <div class="form-floating">
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            class="form-control"
            id="input-password"
            placeholder="Password"
            v-model.trim="password"
          />
          <label for="input-password">Password</label>
          <input type="checkbox" @click="togglePasswordVisibility" />
          {{ isPasswordVisible ? "Hide Password" : "Show Password" }}
        </div>
        <button class="btn btn-primary w-100 my-2" type="submit">Log in</button>
      </form>
      <router-link to="/verify-email" style="text-decoration: None">
        Forgot password?
      </router-link>
      <div class="alert alert-danger mt-3" role="alert" v-if="errorMsg">
        <div><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg }}</div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.form-signin {
  max-width: 350px;
  padding: 1rem;
}

.form-signin .form-floating:focus-within {
  z-index: 2;
}

.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type="password"],
.form-signin input[type="text"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
