import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import "./Login.css";
import hero from "@/assets/img/login-left.png";
import GlassCard from "@/components/GlassCard/GlassCard";
import { login as loginApi } from "@/api/auth";

export default function Login() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    userName: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.userName.trim() || !form.password.trim()) {
      enqueueSnackbar("Please enter username and password", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      await loginApi({
        userName: form.userName,
        password: form.password,
        rememberMe: false,
      });

      enqueueSnackbar("Login successful!", {
        variant: "success",
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      enqueueSnackbar(err?.message || "Login failed", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-hero">
        <img src={hero} alt="Synergy Hub visual" className="hero-img" />
      </div>

      <GlassCard className="login-card">
        <h2 className="login-title">Login</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Username</span>
            <input
              type="text"
              className="login-input"
              placeholder="Enter your username"
              value={form.userName}
              onChange={onChange("userName")}
              autoComplete="off"
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange("password")}
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>

          <p className="signup-hint">
            If you don't have an account, please{" "}
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </p>
        </form>
      </GlassCard>
    </div>
  );
}
