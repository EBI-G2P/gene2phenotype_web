import api from "../services/api.js";
import { logGeneralErrorMsg } from "../utility/ErrorUtility.js";
import { LOGOUT_URL, PROFILE_URL } from "../utility/UrlConstants.js";
import { defineStore } from "pinia";

const MAX_TIMEOUT_DELAY_IN_MS = 2147483647;
const LOGOUT_REQUEST_TIMEOUT_IN_MS = 10 * 1000;

export const SESSION_END_REASON = Object.freeze({
  EXPIRED: "session-expired",
  USER_LOGOUT: "user-logout",
});

export class InvalidRefreshTokenExpiryError extends Error {
  constructor() {
    super("The refresh token expiry is missing, invalid, or expired.");
    this.name = "InvalidRefreshTokenExpiryError";
  }
}

const parseRefreshTokenExpiry = (value) => {
  const expiry = new Date(value);
  if (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= Date.now()) {
    throw new InvalidRefreshTokenExpiryError();
  }
  return expiry;
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    userName: null,
    userEmail: null,
    userPanels: null,
    isSuperUser: null,
    isJuniorCuratorUser: null,
    refreshTokenExpiry: null,
    expiryTimeOut: null,
    sessionEndReason: null,
  }),
  actions: {
    clearExpiryTimeOut() {
      if (this.expiryTimeOut !== null) {
        clearTimeout(this.expiryTimeOut);
        this.expiryTimeOut = null;
      }
    },
    scheduleExpiryTimeOut() {
      this.clearExpiryTimeOut();

      const timeUntilExpiry = this.refreshTokenExpiry?.getTime() - Date.now();
      if (!Number.isFinite(timeUntilExpiry) || timeUntilExpiry <= 0) {
        this.logout(SESSION_END_REASON.EXPIRED);
        return;
      }

      this.expiryTimeOut = setTimeout(
        () => {
          this.expiryTimeOut = null;
          this.scheduleExpiryTimeOut();
        },
        Math.min(timeUntilExpiry, MAX_TIMEOUT_DELAY_IN_MS),
      );
    },
    login(data) {
      let refreshTokenExpiry;
      try {
        refreshTokenExpiry = parseRefreshTokenExpiry(data.refresh_token_time);
      } catch (error) {
        this.logout();
        throw error;
      }

      this.isAuthenticated = true;
      this.userName = data.full_name;
      this.userEmail = data.email;
      this.userPanels = data.panels;
      this.isSuperUser = data.is_superuser;
      this.isJuniorCuratorUser = data.is_junior_curator;
      this.refreshTokenExpiry = refreshTokenExpiry;
      this.sessionEndReason = null;
      this.scheduleExpiryTimeOut();
    },
    logout(reason = null) {
      this.clearExpiryTimeOut();
      this.isAuthenticated = false;
      this.userName = null;
      this.userEmail = null;
      this.userPanels = null;
      this.isSuperUser = null;
      this.isJuniorCuratorUser = null;
      this.refreshTokenExpiry = null;
      this.sessionEndReason = reason;
    },
    async logoutUser() {
      // Keep the local session active unless the server confirms that its
      // authentication cookies/session were cleared successfully.
      await api.post(LOGOUT_URL, null, {
        _skipAuthRefresh: true,
        _skipAuthRedirect: true,
        timeout: LOGOUT_REQUEST_TIMEOUT_IN_MS,
      });
      this.logout(SESSION_END_REASON.USER_LOGOUT);
    },
    setRefreshTokenExpiry(value) {
      try {
        this.refreshTokenExpiry = parseRefreshTokenExpiry(value);
        this.scheduleExpiryTimeOut();
      } catch (error) {
        this.logout();
        throw error;
      }
    },
    validateUser() {
      return api
        .get(PROFILE_URL, { _skipAuthRedirect: true })
        .then((response) => {
          this.login(response.data);
        })
        .catch((error) => {
          this.logout();
          logGeneralErrorMsg(error);
        });
    },
  },
});
