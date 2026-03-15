import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import GlassCard from "@/components/GlassCard/GlassCard";
import { activateAccount, resendActivation } from "@/api/auth";
import "./ActivateAccount.css";
import { useLocation, useNavigate } from "react-router-dom";

export default function ActivateAccount() {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((v) => v - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token.trim()) {
      enqueueSnackbar("Please enter activation code", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      await activateAccount({
        email,
        token,
      });

      enqueueSnackbar("Account activated. You can now log in.", {
        variant: "success",
      });

      navigate("/login", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Activation failed";

      enqueueSnackbar(String(msg), { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendActivation({
        email,
      });

      enqueueSnackbar("Activation email sent again", {
        variant: "success",
      });

      setCountdown(60);
    } catch (err) {
      enqueueSnackbar("Failed to resend activation email", {
        variant: "error",
      });
    }
  };

  return (
    <div className="auth-root">
      <GlassCard className="auth-card">
        <h2 className="login-title">Activate Account</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <p
            style={{
              fontSize: 13,
              textAlign: "center",
              marginBottom: 8,
              color: "#334155",
            }}
          >
            Enter the activation code sent to your email
          </p>

          <input
            type="text"
            placeholder="Activation code"
            className="login-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <span className="typing-dots">
                <i></i>
                <i></i>
                <i></i>
              </span>
            ) : (
              "VERIFY"
            )}
          </button>

          <button
            type="button"
            className="resend-btn"
            disabled={countdown > 0}
            onClick={handleResend}
          >
            {countdown > 0
              ? `Resend available in ${countdown}s`
              : "Resend activation email"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
