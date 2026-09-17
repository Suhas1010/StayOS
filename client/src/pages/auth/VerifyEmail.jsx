import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import { useToast } from "../../context/ToastContext";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
  RefreshCw,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { Spinner } from "../../components/common/Spinner";

export const VerifyEmail = () => {
  const { verificationToken } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [status, setStatus] = useState(verificationToken ? "verifying" : "input"); // 'verifying' | 'success' | 'error' | 'input'
  const [message, setMessage] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);

  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Auto-verify if token is in the URL (/verify-email/:verificationToken)
  useEffect(() => {
    if (!verificationToken) {
      setStatus("input");
      return;
    }

    const verify = async () => {
      setStatus("verifying");
      try {
        const response = await authApi.verifyEmail(verificationToken);
        setStatus("success");
        setMessage(
          response.message ||
            "Your email address has been verified successfully!"
        );
        showToast("Email verified successfully! You can now log in.", "success");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.friendlyMessage ||
            "The verification link is invalid, expired, or has already been used."
        );
      }
    };

    verify();
  }, [verificationToken]);

  // Handle manual token submission
  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      showToast("Please enter your verification token", "error");
      return;
    }

    setIsVerifyingManual(true);
    try {
      const response = await authApi.verifyEmail(manualToken.trim());
      setStatus("success");
      setMessage(response.message || "Email verified successfully!");
      showToast("Email verified successfully!", "success");
    } catch (err) {
      setStatus("error");
      setMessage(
        err.friendlyMessage ||
          "Invalid or expired verification token. Please request a new one."
      );
    } finally {
      setIsVerifyingManual(false);
    }
  };

  // Handle resend verification email
  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      showToast("Please enter your registered email address", "error");
      return;
    }

    setIsResending(true);
    try {
      await authApi.resendVerification(resendEmail.trim());
      showToast(
        "Verification email sent! Please check your inbox and spam folder.",
        "success"
      );
      setResendEmail("");
    } catch (err) {
      showToast(
        err.friendlyMessage || "Failed to resend verification email",
        "error"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in" style={{ textAlign: "center" }}>
        {/* Brand Header */}
        <div className="auth-logo" style={{ justifyContent: "center" }}>
          <div className="brand-icon">
            <Sparkles size={22} />
          </div>
          <span className="brand-name">
            Stay<span className="text-gradient">OS</span>
          </span>
        </div>

        {/* 1. AUTO-VERIFYING IN PROGRESS */}
        {status === "verifying" && (
          <div style={{ padding: "2rem 0" }}>
            <Spinner size={44} />
            <h2 style={{ marginTop: "1.25rem", fontSize: "1.35rem" }}>
              Verifying Your Email...
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.4rem" }}>
              Please wait while we confirm your StayOS credentials.
            </p>
          </div>
        )}

        {/* 2. SUCCESS STATE */}
        {status === "success" && (
          <div style={{ padding: "1.5rem 0" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "var(--success-light)",
                color: "#34d399",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Email Verified!
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.925rem", marginBottom: "1.75rem" }}>
              {message}
            </p>

            <Link
              to="/login"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.75rem" }}
            >
              <span>Proceed to Sign In</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* 3. ERROR OR DIRECT INPUT STATE */}
        {(status === "error" || status === "input") && (
          <div>
            {status === "error" ? (
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "var(--danger-light)",
                    color: "#f87171",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <AlertCircle size={32} />
                </div>
                <h2 style={{ fontSize: "1.35rem", marginBottom: "0.4rem" }}>
                  Verification Unsuccessful
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  {message}
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <ShieldCheck size={32} />
                </div>
                <h2 style={{ fontSize: "1.35rem", marginBottom: "0.4rem" }}>
                  Email Verification
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Activate your StayOS account by verifying your email address.
                </p>
              </div>
            )}

            {/* Form A: Enter Token Manually */}
            <div
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                textAlign: "left",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <KeyRound size={16} color="var(--primary)" />
                <h4 style={{ fontSize: "0.9rem" }}>Have a Verification Token?</h4>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                Paste the token code from your verification email link:
              </p>

              <form onSubmit={handleManualVerify}>
                <div className="form-group" style={{ marginBottom: "0.65rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 4f3a8b9e1c2d..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%" }}
                  disabled={isVerifyingManual}
                >
                  <span>{isVerifyingManual ? "Verifying..." : "Verify Email Now"}</span>
                </button>
              </form>
            </div>

            {/* Form B: Resend Link */}
            <div
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                textAlign: "left",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <RefreshCw size={16} color="#38bdf8" />
                <h4 style={{ fontSize: "0.9rem" }}>Resend Verification Link</h4>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                Enter your email address to receive a fresh 20-minute verification email:
              </p>

              <form onSubmit={handleResend}>
                <div className="form-group" style={{ marginBottom: "0.65rem" }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm"
                  style={{ width: "100%" }}
                  disabled={isResending}
                >
                  <Mail size={15} />
                  <span>{isResending ? "Sending..." : "Resend Verification Email"}</span>
                </button>
              </form>
            </div>

            <Link to="/login" className="btn btn-outline" style={{ width: "100%" }}>
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
