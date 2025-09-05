import api from "../services/api.js";
import { logGeneralErrorMsg } from "../utility/ErrorUtility.js";
import { PROFILE_URL } from "../utility/UrlConstants.js";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    userName: null,
    userEmail: null,
    userPanels: null,
    isSuperUser: null,
    refreshTokenExpiry: null,
    expiryTimeOut: null,
  }),
  actions: {
    login(data) {
      this.isAuthenticated = true;
      this.userName = data.full_name;
      this.userEmail = data.email;
      this.userPanels = data.panels;
      this.isSuperUser = data.is_superuser;
      this.refreshTokenExpiry = new Date(data.refresh_token_time);

      // auto logout after refresh token is expired
      if (this.expiryTimeOut) clearTimeout(this.expiryTimeOut);
      const timeUntilExpiry = this.refreshTokenExpiry.getTime() - Date.now();
      this.expiryTimeOut = setTimeout(() => {
        this.logout();
      }, timeUntilExpiry);
    },
    logout() {
      this.isAuthenticated = false;
      this.userName = null;
      this.userEmail = null;
      this.userPanels = null;
      this.isSuperUser = null;
      this.refreshTokenExpiry = null;
      if (this.expiryTimeOut) clearTimeout(this.expiryTimeOut);
    },
    setRefreshTokenExpiry(value) {
      this.refreshTokenExpiry = new Date(value);

      // auto logout after refresh token is expired
      if (this.expiryTimeOut) clearTimeout(this.expiryTimeOut);
      const timeUntilExpiry = this.refreshTokenExpiry.getTime() - Date.now();
      this.expiryTimeOut = setTimeout(() => {
        this.logout();
      }, timeUntilExpiry);
    },
    validateUser() {
      return api
        .get(PROFILE_URL, {}, { _skipAuthRedirect: true })
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
