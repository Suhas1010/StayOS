import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { authApi } from "../../api/auth.api";
import { Sparkles, UserPlus, CheckCircle2, Mail, ArrowRight, RefreshCw } from "lucide-react";

export const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "OWNER",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await register(formData);
      setRegisteredEmail(formData.email);
      showToast("Account created! Check your email for verification.", "success");
    } catch (err) {
      showToast(err.friendlyMessage || "Failed to register account", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setIsResending(true);
    try {
      await authApi.resendVerification(registeredEmail);
      showToast("Verification email resent!", "success");
    } catch (err) {
      showToast(err.friendlyMessage || "Could not resend email", "error");
    } finally {
      setIsResending(false);
    }
  };

  // If successfully registered, show confirmation screen
  if (registeredEmail) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card fade-in" style={{ textAlign: "center" }}>
          <div className="auth-logo" style={{ justifyContent: "center" }}>
            <div className="brand-icon">
              <Sparkles size={22} />
            </div>
            <span className="brand-name">
              Stay<span className="text-gradient">OS</span>
            </span>
          </div>

          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--success-light)",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "1.25rem auto 1rem",
            }}
          >
            <Mail size={32} />
          </div>

          <h1 className="auth-title" style={{ fontSize: "1.45rem", marginBottom: "0.5rem" }}>
            Check Your Email
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
            We've sent an activation link to <strong style={{ color: "var(--text-main)" }}>{registeredEmail}</strong>.
            Please open the email and click the verification link to activate your StayOS account.
          </p>

          <div
            style={{
              backgroundColor: "var(--bg-elevated)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.5rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              textAlign: "left",
            }}
          >
            <p>• The verification link expires in <strong>20 minutes</strong>.</p>
            <p>• If you don't see it, be sure to check your <strong>Spam/Junk</strong> folder.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={handleResend}
              className="btn btn-secondary btn-sm"
              disabled={isResending}
            >
              <RefreshCw size={14} />
              <span>{isResending ? "Resending..." : "Resend Verification Email"}</span>
            </button>

            <Link to="/login" className="btn btn-primary">
              <span>Go to Sign In</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Join the multi-property management platform
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="form-input"
              placeholder="e.g. Suhas Sharma"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">
                Account Role
              </label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="OWNER">Property Owner</option>
                <option value="CARETAKER">Property Caretaker</option>
                <option value="TENANT">Tenant / Resident</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={isSubmitting}
          >
            <UserPlus size={18} />
            <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
