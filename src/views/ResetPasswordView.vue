<script>
import api from "../services/api.js";
import { useAuthStore } from "../store/auth.js";
import { RESET_PASSWORD_URL } from "../utility/UrlConstants.js";
import { fetchAndLogApiResponseErrorListMsg } from "../utility/ErrorUtility.js";

export default {
  data() {
    return {
      errorMsg: null,
      isDataLoading: false,
      newPassword: "",
      newPasswordRepeat: "",
      isPasswordVisible: false,
      isResetSuccess: false,
    };
  },
  methods: {
    resetPassword() {
      this.errorMsg = null;
      this.isDataLoading = true;
      this.isResetSuccess = false;
      const requestBody = {
        password: this.newPassword,
        password2: this.newPasswordRepeat,
      };
      api
        .post(
          RESET_PASSWORD_URL.replace(":uid", this.$route.params.uid).replace(
            ":token",
            this.$route.params.token,
          ),
          requestBody,
          {
            _skipAuthRefresh: true,
            _skipAuthRedirect: true,
          },
        )
        .then(() => {
          const authStore = useAuthStore();
          authStore.logout();
          this.isResetSuccess = true;
        })
        .catch((error) => {
          const apiError = error.response?.data?.error;
          this.errorMsg = fetchAndLogApiResponseErrorListMsg(
            error,
            Array.isArray(apiError) ? apiError : [apiError],
            "Unable to reset password. Please check your credentials or try again later.",
          );
        })
        .finally(() => {
          this.isDataLoading = false;
          this.isPasswordVisible = false;
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
    <div
      class="alert alert-success mt-3"
      role="alert"
      v-else-if="isResetSuccess"
    >
      <div>
        <i class="bi bi-check-circle-fill"></i>
        Password reset successful. Please
        <router-link to="/login">log in</router-link>.
      </div>
    </div>
    <div class="form-signin w-100 m-auto" v-else>
      <form @submit.prevent="resetPassword">
        <h1 class="h3 mb-3 fw-normal">Reset password</h1>
        <div class="form-floating">
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            class="form-control"
            id="input-new-password"
            placeholder="New Password"
            v-model.trim="newPassword"
          />
          <label for="input-new-password">New Password</label>
        </div>
        <div class="form-floating">
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            class="form-control"
            id="input-new-password-repeat"
            placeholder="Repeat New Password"
            v-model.trim="newPasswordRepeat"
          />
          <label for="input-new-password-repeat">Repeat New Password</label>
          <div class="mb-2">
            <span id="passwordHelpInline" class="form-text">
              Must be at least 8 characters long.
            </span>
          </div>
          <input type="checkbox" @click="togglePasswordVisibility" />
          {{ isPasswordVisible ? "Hide Password" : "Show Password" }}
        </div>
        <button class="btn btn-primary w-100 mt-2" type="submit">Submit</button>
      </form>
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

#input-new-password {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

#input-new-password-repeat {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
