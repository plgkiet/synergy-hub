import { useState } from "react";
import { useSnackbar } from "notistack";
import { register } from "@/api/auth";

export default function SignUpForm({ onSwitch }) {
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const onChange = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }

    if (form.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "warning",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      enqueueSnackbar("Invalid email format", { variant: "warning" });
      return;
    }

    if (form.password.length < 8) {
      enqueueSnackbar("Password must be at least 8 characters", {
        variant: "warning",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);

      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        roleId: 1,
      });

      enqueueSnackbar("Register successful!", { variant: "success" });

      onSwitch();
    } catch (err) {
      console.log("REGISTER ERROR:", err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.response?.data ||
        err?.message ||
        "Register failed";

      enqueueSnackbar(String(msg), { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="login-title">Sign Up</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Username</span>
          <input
            type="text"
            autoComplete="off"
            placeholder="Enter your username"
            className="login-input"
            value={form.username}
            onChange={onChange("username")}
          />
        </label>

        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            autoComplete="off"
            placeholder="Enter your email"
            className="login-input"
            value={form.email}
            onChange={onChange("email")}
          />
        </label>

        <label className="field">
          <span className="field-label">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password"
            className="login-input"
            value={form.password}
            onChange={onChange("password")}
          />
        </label>

        <label className="field">
          <span className="field-label">Confirm Password</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className="login-input"
            value={form.confirmPassword}
            onChange={onChange("confirmPassword")}
          />
        </label>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <span className="typing-dots">
              <i></i>
              <i></i>
              <i></i>
            </span>
          ) : (
            "SIGN UP"
          )}
        </button>

        <p className="signup-hint">
          Already have an account?{" "}
          <button
            type="button"
            className="inline-link signup-link"
            onClick={onSwitch}
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </form>
    </>
  );
}
