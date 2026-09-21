import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { authApi } from "../../api/auth.api";
import { Sparkles, LogIn, AlertCircle, Mail, Send } from "lucide-react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnverifiedEmail("");

    if (!email || !password) {
      showToast("Please provide both email and password", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      showToast("Welcome back to StayOS!", "success");
      navigate(from, { replace: true });
    } catch (err) {
      const errMsg = err.friendlyMessage || "Failed to log in";
      showToast(errMsg, "error");

      // Detect unverified account
      if (
        errMsg.toLowerCase().includes("not verified") ||
        errMsg.toLowerCase().includes("verify your email")
      ) {
        setUnverifiedEmail(email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    try {
      await authApi.resendVerification(unverifiedEmail);
      showToast(
        "Verification email resent! Please check your inbox and click the link.",
        "success"
      );
    } catch (err) {
      showToast(
        err.friendlyMessage || "Failed to resend verification email",
        "error"
      );
    } finally {
      setIsResending(false);
    }
  };

  // Helper for quick testing/demo
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setUnverifiedEmail("");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="brand-icon">
              <Sparkles size={22} />
            </div>
            <span className="brand-name">
              Stay<span className="text-gradient">OS</span>
            </span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to access your properties, rooms, and rent
          </p>
        </div>

        {/* Unverified Email Alert Banner */}
        {unverifiedEmail && (
          <div
            style={{
              backgroundColor: "var(--warning-light)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              marginBottom: "1.25rem",
              fontSize: "0.85rem",
              color: "#fbbf24",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: "600",
                marginBottom: "0.4rem",
              }}
            >
              <AlertCircle size={16} />
              <span>Email Not Verified</span>
            </div>
            <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              Your account exists, but your email address has not been confirmed yet.
              Please check your inbox or click below to receive a new link.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              className="btn btn-secondary btn-sm"
              disabled={isResending}
              style={{ width: "100%" }}
            >
              <Send size={14} />
              <span>{isResending ? "Sending..." : "Resend Verification Link"}</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={isSubmitting}
          >
            <LogIn size={18} />
            <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>

        {/* Quick Demo Credentials Box for Testing */}
        <div className="demo-logins">
          <div className="demo-title">Quick Fill Demo Credentials</div>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleQuickFill("owner@stayos.com", "Password@123")}
            >
              Owner Demo
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() =>
                handleQuickFill("caretaker@stayos.com", "Password@123")
              }
            >
              Caretaker Demo
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleQuickFill("tenant@stayos.com", "Password@123")}
            >
              Tenant Demo
            </button>
          </div>
        </div>

        <div className="auth-footer" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div>
            Need to activate your account?{" "}
            <Link to="/verify-email" className="auth-link">
              Verify Email / Resend Link
            </Link>
          </div>
          <div>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
