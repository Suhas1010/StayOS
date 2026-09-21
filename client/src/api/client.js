import axios from "axios";

/**
 * StayOS Axios HTTP Client
 * -------------------------------------------------------------
 * This central client is configured to send requests to the StayOS backend.
 * Features:
 * 1. Base URL points to the backend API (/api/v1).
 * 2. withCredentials: true ensures HTTP-only auth cookies are sent with requests.
 * 3. Request interceptor automatically attaches the Bearer JWT token from localStorage.
 * 4. Response interceptor extracts user-friendly error messages from ApiError responses.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables cookie exchange for refresh/access tokens
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Access Token if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("stayos_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized Error Handler
apiClient.interceptors.response.use(
  (response) => {
    // Return the ApiResponse data object directly for cleaner caller code
    return response.data;
  },
  (error) => {
    // Backend returns { success: false, message: "..." }
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected server error occurred";

    // Attach standardized message to error object
    error.friendlyMessage = message;

    // Optional: Auto redirect on 401 Unauthorized if not already on /login
    if (error.response?.status === 401) {
      const isAuthPage = window.location.pathname.includes("/login") || window.location.pathname.includes("/register");
      if (!isAuthPage) {
        // Clear expired local credentials
        localStorage.removeItem("stayos_access_token");
        localStorage.removeItem("stayos_user");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
