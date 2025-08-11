<script>
import { PRIVACY_POLICY_CONFIG } from "../utility/Constants.js";

export default {
  data() {
    return {
      isDisplayBanner: false,
      PRIVACY_POLICY_CONFIG,
    };
  },
  mounted() {
    // IF current privacy policy config version does not match the version in localStorage THEN display banner
    this.isDisplayBanner =
      localStorage.getItem(PRIVACY_POLICY_CONFIG.STORAGE_KEY_NAME) !==
      PRIVACY_POLICY_CONFIG.VERSION;
  },
  methods: {
    dismissBanner() {
      localStorage.setItem(
        PRIVACY_POLICY_CONFIG.STORAGE_KEY_NAME,
        PRIVACY_POLICY_CONFIG.VERSION
      );
      this.isDisplayBanner = false;
    },
  },
};
</script>
<template>
  <div v-if="isDisplayBanner" class="privacy-banner">
    <p class="mb-0">
      This website requires cookies, and the limited processing of your personal
      data in order to function. By using the site you are agreeing to this as
      outlined in our
      <a :href="PRIVACY_POLICY_CONFIG.PRIVACY_POLICY_URL" target="_blank"
        >Privacy Notice</a
      >
      and
      <a :href="PRIVACY_POLICY_CONFIG.TERMS_OF_USE_URL" target="_blank"
        >Terms of Use</a
      >.
    </p>
    <button type="button" class="btn btn-success" @click="dismissBanner">
      I agree, dismiss this banner
    </button>
  </div>
</template>
<style scoped>
.privacy-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #2b2b2b;
  color: white;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  font-size: 12px;
}

.privacy-banner button {
  font-size: 12px;
}
</style>
