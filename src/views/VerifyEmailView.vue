<script>
import api from "../services/api.js";
import { VERIFY_EMAIL_URL } from "../utility/UrlConstants.js";
import { fetchAndLogGeneralErrorMsg } from "../utility/ErrorUtility.js";

export default {
  data() {
    return {
      errorMsg: null,
      isDataLoading: false,
      email: "",
      isVerifySuccess: false,
      verifySuccessMsg: null,
    };
  },
  methods: {
    verifyEmail() {
      this.errorMsg = this.verifySuccessMsg = null;
      this.isDataLoading = true;
      this.isVerifySuccess = false;
      const requestBody = {
        email: this.email,
      };
      api
        .post(VERIFY_EMAIL_URL, requestBody, { _skipAuthRefresh: true })
        .then((response) => {
          this.isVerifySuccess = true;
          this.verifySuccessMsg =
            response?.data?.message ||
            "If an account exists for this email, a reset link has been sent.";
        })
        .catch((error) => {
          this.errorMsg = fetchAndLogGeneralErrorMsg(
            error,
            "Unable to verify email. Please try again later.",
          );
        })
        .finally(() => {
          this.isDataLoading = false;
        });
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
      v-else-if="isVerifySuccess"
    >
      <div>
        <i class="bi bi-check-circle-fill"></i>
        {{ verifySuccessMsg }}
      </div>
    </div>
    <div class="form-signin w-100 m-auto" v-else>
      <form @submit.prevent="verifyEmail">
        <h1 class="h3 fw-normal">Verify email</h1>
        <p class="pb-3">To reset your password, please verify your email.</p>
        <div class="form-floating">
          <input
            type="email"
            class="form-control"
            id="input-email"
            placeholder="name@example.com"
            v-model.trim="email"
          />
          <label for="input-email">Email address</label>
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
  max-width: 400px;
  padding: 1rem;
}

.form-signin .form-floating:focus-within {
  z-index: 2;
}

#input-email {
  margin-bottom: 10px;
}
</style>
