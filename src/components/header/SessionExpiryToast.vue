<script>
import { mapState } from "pinia";
import { useAuthStore } from "../../store/auth.js";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const CHECK_INTERVAL_IN_MS = 60 * 1000;
const MAX_TIMEOUT_DELAY = 2147483647;
const WARNING_STORAGE_KEY = "session-expiry-warning";

export default {
  data() {
    return {
      warningTimer: null,
      checkTimer: null,
      isVisible: false,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["refreshTokenExpiry"]),
    expiryTime() {
      if (!this.refreshTokenExpiry) {
        return null;
      }

      const expiry = new Date(this.refreshTokenExpiry).getTime();
      return Number.isNaN(expiry) ? null : expiry;
    },
  },
  watch: {
    expiryTime() {
      this.hideToast();
      this.scheduleWarning();
    },
  },
  mounted() {
    this.scheduleWarning();
    this.checkTimer = setInterval(this.checkWarning, CHECK_INTERVAL_IN_MS);
    document.addEventListener("visibilitychange", this.checkWarning);
  },
  beforeUnmount() {
    this.clearWarningTimer();
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    document.removeEventListener("visibilitychange", this.checkWarning);
  },
  methods: {
    clearWarningTimer() {
      if (this.warningTimer) {
        clearTimeout(this.warningTimer);
        this.warningTimer = null;
      }
    },
    hasShownWarning() {
      return (
        !!this.expiryTime &&
        sessionStorage.getItem(WARNING_STORAGE_KEY) === String(this.expiryTime)
      );
    },
    markWarningShown() {
      if (this.expiryTime) {
        sessionStorage.setItem(WARNING_STORAGE_KEY, String(this.expiryTime));
      }
    },
    scheduleWarning() {
      this.clearWarningTimer();

      if (!this.expiryTime || this.hasShownWarning()) {
        return;
      }

      const remainingMilliseconds = this.expiryTime - Date.now();
      const delay = remainingMilliseconds - ONE_HOUR_IN_MS;

      if (delay <= 0) {
        this.checkWarning();
        return;
      }

      this.warningTimer = setTimeout(
        () => {
          this.warningTimer = null;
          this.checkWarning();

          if (
            !this.hasShownWarning() &&
            this.expiryTime - Date.now() > ONE_HOUR_IN_MS
          ) {
            this.scheduleWarning();
          }
        },
        Math.min(delay, MAX_TIMEOUT_DELAY),
      );
    },
    checkWarning() {
      if (document.hidden || !this.expiryTime || this.hasShownWarning()) {
        return;
      }

      const remainingMilliseconds = this.expiryTime - Date.now();
      if (
        remainingMilliseconds <= 0 ||
        remainingMilliseconds > ONE_HOUR_IN_MS
      ) {
        return;
      }

      this.showToast();
    },
    showToast() {
      this.markWarningShown();
      this.isVisible = true;

      this.$nextTick(() => {
        const toastElement = this.$refs.sessionExpiryToast;
        if (!toastElement || !window.bootstrap?.Toast) {
          return;
        }

        window.bootstrap.Toast.getOrCreateInstance(toastElement, {
          autohide: false,
        }).show();
      });
    },
    hideToast() {
      this.isVisible = false;

      const toastElement = this.$refs.sessionExpiryToast;
      if (!toastElement || !window.bootstrap?.Toast) {
        return;
      }

      window.bootstrap.Toast.getInstance(toastElement)?.hide();
    },
  },
};
</script>

<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div
      ref="sessionExpiryToast"
      class="toast text-bg-warning border-0"
      :class="{ show: isVisible }"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="toast-header">
        <i class="bi bi-clock-history me-2" aria-hidden="true"></i>
        <strong class="me-auto">Login session</strong>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="hideToast"
        ></button>
      </div>
      <div class="toast-body">
        Your login session will expire in about 1 hour. Save any in-progress
        work before the session ends and log in again.
      </div>
    </div>
  </div>
</template>
