<script>
import api from "../services/api.js";
import { SESSION_END_REASON, useAuthStore } from "../store/auth.js";
import { CHANGE_PASSWORD_URL } from "../utility/UrlConstants.js";
import { fetchAndLogApiResponseErrorListMsg } from "../utility/ErrorUtility.js";

export default {
  data() {
    return {
      errorMsg: null,
      isDataLoading: false,
      oldPassword: "",
      newPassword: "",
      newPasswordRepeat: "",
      isPasswordVisible: false,
    };
  },
  methods: {
    changePassword() {
      this.errorMsg = null;
      this.isDataLoading = true;
      const requestBody = {
        old_password: this.oldPassword,
        password: this.newPassword,
        password2: this.newPasswordRepeat,
      };

      api
        .post(CHANGE_PASSWORD_URL, requestBody)
        .then(() => {
          this.oldPassword = "";
          this.newPassword = "";
          this.newPasswordRepeat = "";

          // A successful password change clears both authentication cookies on
          // the server, so only local session cleanup is needed here.
          const authStore = useAuthStore();
          authStore.logout(SESSION_END_REASON.USER_LOGOUT);

          return this.$router.replace("/login");
        })
        .catch((error) => {
          const apiError = error.response?.data?.error;
          this.errorMsg = fetchAndLogApiResponseErrorListMsg(
            error,
            Array.isArray(apiError) ? apiError : [apiError],
            "Unable to change password. Please check your credentials or try again later.",
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
    <div class="form-signin w-100 m-auto" v-else>
      <form @submit.prevent="changePassword">
        <h1 class="h3 mb-3 fw-normal">Change password</h1>
        <div class="alert alert-info" role="note">
          You will be logged out after changing your password and will need to
          log in again.
        </div>
        <div class="form-floating">
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            class="form-control"
            id="input-old-password"
            placeholder="Old Password"
            v-model.trim="oldPassword"
          />
          <label for="input-old-password">Old Password</label>
        </div>
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

#input-old-password {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

#input-new-password {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

#input-new-password-repeat {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
