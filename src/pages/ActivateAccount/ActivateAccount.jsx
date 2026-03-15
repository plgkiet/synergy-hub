import { useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import GlassCard from "@/components/GlassCard/GlassCard";
import { activateAccount, resendActivation } from "@/api/auth";
import "./ActivateAccount.css";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

export default function ActivateAccount() {
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  const email = searchParams.get("email") ?? "";
  const code = searchParams.get("code") ?? "";

  const [status, setStatus] = useState("idle"); // idle | loading | success | error | invalid_link
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((v) => v - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (ranRef.current) return;

    if (!email.trim() || !code.trim()) {
      setStatus("invalid_link");
      return;
    }

    ranRef.current = true;
    setStatus("loading");

    activateAccount({ email: email.trim(), token: code.trim() })
      .then(() => {
        setStatus("success");
        enqueueSnackbar("Account activated. You can now log in.", {
          variant: "success",
        });
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      })
      .catch((err) => {
        setStatus("error");
        const msg =
          err?.data?.message ??
          err?.message ??
          "Activation failed. The link may be expired or invalid.";
        enqueueSnackbar(String(msg), { variant: "error" });
      });
  }, [email, code, enqueueSnackbar, navigate]);

  const handleResend = async () => {
    if (!email.trim()) return;
    try {
      await resendActivation({ email: email.trim() });
      enqueueSnackbar("Activation email sent again.", { variant: "success" });
      setCountdown(60);
    } catch {
      enqueueSnackbar("Failed to resend activation email.", { variant: "error" });
    }
  };

  if (status === "loading") {
    return (
      <div className="auth-root">
        <GlassCard className="auth-card">
          <h2 className="login-title">Activating your account</h2>
          <p className="activate-message">Please wait…</p>
          <div className="activate-spinner" aria-hidden />
        </GlassCard>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="auth-root">
        <GlassCard className="auth-card">
          <h2 className="login-title">Account activated</h2>
          <p className="activate-message">Redirecting you to login…</p>
        </GlassCard>
      </div>
    );
  }

  if (status === "invalid_link") {
    return (
      <div className="auth-root">
        <GlassCard className="auth-card">
          <h2 className="login-title">Invalid activation link</h2>
          <p className="activate-message">
            This link is missing email or code. Please use the link from your
            activation email, or request a new one.
          </p>
          <Link to="/login" className="signup-link">
            Back to login
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="auth-root">
        <GlassCard className="auth-card">
          <h2 className="login-title">Activation failed</h2>
          <p className="activate-message">
            We couldn’t activate your account. The link may be expired or
            already used.
          </p>
          {email && (
            <button
              type="button"
              className="resend-btn"
              disabled={countdown > 0}
              onClick={handleResend}
            >
              {countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend activation email"}
            </button>
          )}
          <Link to="/login" className="signup-link" style={{ marginTop: 12 }}>
            Back to login
          </Link>
        </GlassCard>
      </div>
    );
  }

  return null;
}
