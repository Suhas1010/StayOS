import apiClient from "./client";

/**
 * Authentication API Service
 * Encapsulates all auth-related endpoints (/api/v1/auth/*).
 */

export const authApi = {
  // Register a new user (OWNER, CARETAKER, or TENANT)
  register: (data) => apiClient.post("/auth/register", data),

  // Login user and receive accessToken & user details
  login: (credentials) => apiClient.post("/auth/login", credentials),

  // Logout and clear server-side refresh cookies
  logout: () => apiClient.post("/auth/logout"),

  // Fetch currently authenticated user details
  getCurrentUser: () => apiClient.get("/auth/current-user"),

  // Change password for logged in user
  changePassword: (data) => apiClient.patch("/auth/change-password", data),

  // Request password reset email
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),

  // Reset password using temporary token
  resetPassword: (token, newPassword) =>
    apiClient.post(`/auth/reset-password/${token}`, { newPassword }),

  // Resend verification email
  resendVerification: (email) =>
    apiClient.post("/auth/resend-verification", { email }),

  // Verify email address using verification token
  verifyEmail: (verificationToken) =>
    apiClient.get(`/auth/verify-email/${verificationToken}`),
};
