import { useState } from "react";
import "./Auth.css";

import hero from "@/assets/img/login-left.png";
import GlassCard from "@/components/GlassCard/GlassCard";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

export default function Auth() {
  const [mode, setMode] = useState("login");

  return (
    <div className="auth-root">
      <div className="auth-hero">
        <img src={hero} alt="Synergy Hub visual" className="hero-img" />
      </div>

      <GlassCard className="auth-card">
        {mode === "login" ? (
          <LoginForm onSwitch={() => setMode("signup")} />
        ) : (
          <SignUpForm onSwitch={() => setMode("login")} />
        )}
      </GlassCard>
    </div>
  );
}
