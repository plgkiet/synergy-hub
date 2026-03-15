import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { login as loginApi, requestNewActivationCode as requestNewActivationCodeApi } from "@/api/auth";
import EyeOutlined from "@/assets/icon/EyeOutlined.svg";
import EyeInvisibleOutlined from "@/assets/icon/EyeInvisibleOutlined.svg";
import { acceleratedValues } from "framer-motion";

export default function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestNewActivationCode, setRequestNewActivationCode] = useState(false);

  const onChange = (key) => (e) => {
    const value =
      e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRequestNewActivationCode = async () => {
    setLoading(true);
    await requestNewActivationCodeApi({ email: form.email })
      .then(() => {
        enqueueSnackbar("Activation code sent. Please check your email.", { variant: "success" });
        setRequestNewActivationCode(false);
        setForm({
          ...form,
          email: "",
          password: "",
          userName: ""
        });
      }).catch((err) => {
        enqueueSnackbar(err?.message || "Failed to request new activation code.", { variant: "error" });
      })
      .finally(() => {
        setLoading(false);
      });
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
        rememberMe: form.rememberMe,
      });

      enqueueSnackbar("Login successful!", { variant: "success" });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.log("LOGIN ERROR RAW:", err);

      let msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.response?.data ||
        err?.message ||
        "Login failed";

      if (msg === "ACCOUNT_NOT_ACTIVE" || msg === "Account is not active") {
        setRequestNewActivationCode(true);
        msg = "Account not active. Please request a new activation code.";
      }

      enqueueSnackbar(String(msg), { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="login-title">Login</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Username</span>
          <input
            type="text"
            autoComplete="off"
            name="login-username"
            placeholder="Enter your username"
            className="login-input"
            value={form.userName}
            onChange={onChange("userName")}
          />
        </label>

        <label className="field">
          <span className="field-label">Password</span>

          <div className="pw-wrap">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              name="login-password"
              placeholder="Enter your password"
              className="login-input pw-input"
              value={form.password}
              onChange={onChange("password")}
            />

            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((v) => !v)}
              disabled={loading}
              aria-label={showPw ? "Hide password" : "Show password"}
              title={showPw ? "Hide password" : "Show password"}
            >
              <img src={showPw ? EyeOutlined : EyeInvisibleOutlined} alt="" />
            </button>
          </div>
        </label>

        {/*
        <label className="remember-row">
          <input
            type="checkbox"
            checked={form.rememberMe}
            onChange={onChange("rememberMe")}
          />
          <span>Remember me</span>
        </label>
        */}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading && !requestNewActivationCode ? (
            <span className="typing-dots">
              <i></i>
              <i></i>
              <i></i>
            </span>
          ) : (
            "SIGN IN"
          )}
        </button>

        <p className="signup-hint">
          If you don't have an account,{" "}
          <button
            type="button"
            className="inline-link signup-link"
            onClick={onSwitch}
            disabled={loading}
          >
            Sign up
          </button>
        </p>

        {/* <p className="signup-hint">
          Don’t have an account?{" "}
          <span className="signup-link-strong">
            Contact your administrator.
          </span>
        </p> */}
        {requestNewActivationCode && (
          <form className="login-form">
            <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            autoComplete="off"
            name="login-email"
            placeholder="Enter your email"
            className="login-input"
            value={form.email}
            onChange={onChange("email")}
          />
        </label>
            <button
              type="button"
              className="inline-link signup-link"
              onClick={handleRequestNewActivationCode}
              disabled={loading}
            >
              {loading ? (
                <span className="typing-dots">
                  <i></i>
                  <i></i>
                  <i></i>
                </span>
              ) : "Request new activation code"}
            </button>
          </form>
        )}
      </form>
    </>
  );
}
