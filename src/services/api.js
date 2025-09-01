import axios from "axios";
import router from "../router";
import { useAuthStore } from "../store/auth.js";
import { REFRESH_TOKEN_URL } from "../utility/UrlConstants.js";

// Create axios instance with default configuration
const api = axios.create({
  withCredentials: true, // Required setting to ensure cookies are sent with API requests
  headers: {
    "Content-Type": "application/json",
  }, // Default header for all API requests
});

let apiRequestQueue = []; // Queue to hold pending API requests when token refresh is in progress
let isRefreshInProgress = false; // Flag to indicate if a token refresh is in progress

// Method to process all pending API requests
const processApiRequestQueue = (error) => {
  apiRequestQueue.forEach((promise) => {
    if (error) {
      promise.reject(error); // Reject API request if token refresh failed
    } else {
      promise.resolve(); // Resolve API request if token refresh succeeded
    }
  });
  apiRequestQueue = []; // Clear queue
};

// Response interceptor
api.interceptors.response.use(
  (response) => response, // Pass successful responses through
  async (error) => {
    const originalRequest = error.config;

    if (error.status === 503 || error.status === 500) {
      router.push("/maintenance");
      return; // stop further processing
    }

    // Check if error is due to an expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request to avoid infinite loops

      // If token refresh is in progress, queue current request
      if (isRefreshInProgress) {
        // Queue request
        return new Promise((resolve, reject) => {
          apiRequestQueue.push({ resolve, reject });
        }).then(() => {
          // Retry original request after the queue resolves
          return api(originalRequest);
        });
      }

      // Start token refresh process
      isRefreshInProgress = true;
      const authStore = useAuthStore();

      try {
        const response = await api.post(REFRESH_TOKEN_URL); // Call refresh token API
        isRefreshInProgress = false;
        processApiRequestQueue(null); // Process all pending API requests
        authStore.setRefreshTokenExpiry(response.data.refresh_token_time);
        return api(originalRequest); // Retry original request
      } catch (refreshError) {
        isRefreshInProgress = false;
        processApiRequestQueue(refreshError); // Reject all pending API requests
        authStore.logout();
        if (!originalRequest._skipAuthRedirect) {
          router.push({
            path: "/login",
            query: { redirect: router.currentRoute.value.fullPath },
          });
        }
        return Promise.reject(refreshError); // Reject original request
      }
    }

    // For other errors, reject Promise normally
    return Promise.reject(error);
  }
);

// Default headers for different types of API requests
api.defaults.headers.get["Cache-Control"] = "no-cache";
api.defaults.headers.post["Accept"] = "application/json";
api.defaults.headers.put["Accept"] = "application/json";
api.defaults.headers.patch["Accept"] = "application/json";
api.defaults.headers.delete["Accept"] = "application/json";

export default api;
