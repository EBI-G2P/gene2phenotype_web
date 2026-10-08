import axios from "axios";
import router from "../router";
import {
  InvalidRefreshTokenExpiryError,
  SESSION_END_REASON,
  useAuthStore,
} from "../store/auth.js";
import { PROFILE_URL, REFRESH_TOKEN_URL } from "../utility/UrlConstants.js";

const REFRESH_REQUEST_TIMEOUT_IN_MS = 10 * 1000;
const ENDED_SESSION_STATUS_CODES = [400, 401, 403];

const apiConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

// Main API client. Authenticated requests made through this client can trigger
// the response interceptor below.
const api = axios.create(apiConfig);

// Refreshes must bypass the main response interceptor to avoid recursive
// refresh attempts when the refresh cookie is missing or invalid.
const refreshApi = axios.create({
  ...apiConfig,
  timeout: REFRESH_REQUEST_TIMEOUT_IN_MS,
});

// All requests that fail together wait for the same refresh request.
let refreshPromise = null;

// Prevent concurrent failed requests from triggering duplicate redirects.
let loginRedirectPromise = null;

// These responses mean the session cannot be restored. Other refresh errors,
// such as network failures or 5xx responses, are treated as temporary.
const isEndedSessionError = (error) =>
  error instanceof InvalidRefreshTokenExpiryError ||
  ENDED_SESSION_STATUS_CODES.includes(error.response?.status);

const refreshSession = () => {
  if (!refreshPromise) {
    const authStore = useAuthStore();

    // Store the promise immediately so later requests reuse this refresh call.
    refreshPromise = refreshApi
      .post(REFRESH_TOKEN_URL)
      .then((response) => {
        // Validate and reschedule the session expiry before retrying requests.
        authStore.setRefreshTokenExpiry(response.data?.refresh_token_time);
        return response;
      })
      .catch((error) => {
        if (isEndedSessionError(error)) {
          authStore.logout();
        }
        return Promise.reject(error);
      })
      .finally(() => {
        // A later 401 may start a new refresh attempt.
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const redirectToLogin = (originalRequest) => {
  // Startup profile validation clears invalid auth without navigating.
  if (
    originalRequest._skipAuthRedirect ||
    router.currentRoute.value.path === "/login"
  ) {
    return Promise.resolve();
  }

  if (!loginRedirectPromise) {
    const redirect = router.currentRoute.value.fullPath;
    loginRedirectPromise = router
      .replace({
        path: "/login",
        query: { redirect, reason: SESSION_END_REASON.EXPIRED },
      })
      .finally(() => {
        loginRedirectPromise = null;
      });
  }

  return loginRedirectPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const authStore = useAuthStore();
    const canRestoreStartupSession = originalRequest.url === PROFILE_URL;

    // Refresh only authenticated requests and the initial profile check.
    // Public auth endpoints opt out with _skipAuthRefresh.
    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh &&
      (authStore.isAuthenticated || canRestoreStartupSession);

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    // Retry each original request at most once.
    originalRequest._retry = true;

    try {
      await refreshSession();
      return api(originalRequest);
    } catch (refreshError) {
      if (isEndedSessionError(refreshError)) {
        await redirectToLogin(originalRequest);
      }
      return Promise.reject(refreshError);
    }
  },
);

api.defaults.headers.get["Cache-Control"] = "no-cache";
api.defaults.headers.post["Accept"] = "application/json";
api.defaults.headers.put["Accept"] = "application/json";
api.defaults.headers.patch["Accept"] = "application/json";
api.defaults.headers.delete["Accept"] = "application/json";

export default api;
