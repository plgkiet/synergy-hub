import "./SignUp.css";
import hero from "@/assets/img/login-left.png";
import GlassCard from "@/components/GlassCard/GlassCard";

export default function SignUp() {
  return (
    <div className="signup-root">
      <div className="signup-hero">
        <img src={hero} alt="Synergy Hub visual" className="hero-img" />
      </div>

      <div className="signup-right">
        <GlassCard className="signup-card">
          <h2 className="login-title">Sign Up</h2>
          <form className="signup-form">
            <label className="field">
              <span className="field-label">Username</span>
              <input
                type="text"
                autoComplete="off"
                name="signup-username"
                placeholder="Enter your username"
                className="signup-input"
              />
            </label>

            <label className="field">
              <span className="field-label">Email</span>
              <input
                type="email"
                autoComplete="off"
                name="signup-email"
                placeholder="Enter your email"
                className="signup-input"
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                type="password"
                autoComplete="new-password"
                name="signup-password"
                placeholder="Enter your password"
                className="signup-input"
              />
            </label>

            <label className="field">
              <span className="field-label">Confirm Password</span>

              <input
                type="password"
                autoComplete="new-password"
                name="signup-confirm"
                placeholder="Re-enter your password"
                className="signup-input"
              />
            </label>

            <button type="submit" className="btn-submit">
              SIGN UP
            </button>

            <p className="signin-hint">
              Already have an account?{" "}
              <a href="/login" className="signin-link">
                Sign in
              </a>
            </p>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
