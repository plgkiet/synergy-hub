export default function SignUpForm({ onSwitch }) {
  return (
    <>
      <h2 className="login-title">Sign Up</h2>

      <form className="login-form">
        <label className="field">
          <span className="field-label">Username</span>
          <input
            type="text"
            autoComplete="off"
            name="sh-signup-username"
            placeholder="Enter your username"
            className="login-input"
          />
        </label>

        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            autoComplete="off"
            name="sh-signup-email"
            placeholder="Enter your email"
            className="login-input"
          />
        </label>

        <label className="field">
          <span className="field-label">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            name="sh-signup-password"
            placeholder="Enter your password"
            className="login-input"
          />
        </label>

        <label className="field">
          <span className="field-label">Confirm Password</span>
          <input
            type="password"
            autoComplete="new-password"
            name="sh-signup-confirm"
            placeholder="Re-enter your password"
            className="login-input"
          />
        </label>

        <button type="submit" className="btn-submit">
          SIGN UP
        </button>

        <p className="signup-hint">
          Already have an account?{" "}
          <button
            type="button"
            className="inline-link signup-link"
            onClick={onSwitch}
          >
            Sign in
          </button>
        </p>
      </form>
    </>
  );
}
