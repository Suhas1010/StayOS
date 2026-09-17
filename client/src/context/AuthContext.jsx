import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth.api";

/**
 * Auth Context & Provider
 * -------------------------------------------------------------
 * Manages the global authentication state of the application.
 * Highlights:
 * 1. Stores access token in localStorage for persistence.
 * 2. Fetches /api/v1/auth/current-user on boot to ensure session is valid.
 * 3. Provides clean helper booleans: isOwner, isCaretaker, isTenant.
 * 4. Supplies login, register, and logout methods.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("stayos_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("stayos_access_token") || null;
  });

  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem("stayos_access_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        // Backend returns: ApiResponse(200, { _id, fullName, email, phone, role, isEmailVerified })
        const userData = response.data;
        setUser(userData);
        localStorage.setItem("stayos_user", JSON.stringify(userData));
      } catch (error) {
        console.warn("Session verification failed or token expired:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    // Backend returns: ApiResponse(200, { accessToken, user: { _id, fullName, email } })
    const { accessToken, user: userSnippet } = response.data;

    setToken(accessToken);
    localStorage.setItem("stayos_access_token", accessToken);

    // Fetch full profile (which includes the user role)
    try {
      const profileRes = await authApi.getCurrentUser();
      const fullUser = profileRes.data;
      setUser(fullUser);
      localStorage.setItem("stayos_user", JSON.stringify(fullUser));
      return fullUser;
    } catch {
      setUser(userSnippet);
      localStorage.setItem("stayos_user", JSON.stringify(userSnippet));
      return userSnippet;
    }
  };

  // Register handler
  const register = async (userData) => {
    return await authApi.register(userData);
  };

  // Logout handler
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("stayos_user");
      localStorage.removeItem("stayos_access_token");
    }
  };

  // Role helpers
  const isOwner = user?.role === "OWNER";
  const isCaretaker = user?.role === "CARETAKER";
  const isTenant = user?.role === "TENANT";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isOwner,
        isCaretaker,
        isTenant,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
