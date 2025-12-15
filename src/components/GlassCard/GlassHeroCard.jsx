// src/components/GlassHeroCard.jsx
import React from "react";
import "./glass.css";

export default function GlassHeroCard({ className = "", children, ...rest }) {
  return (
    <div className={`glass-hero-card ${className}`} {...rest}>
      {children}
    </div>
  );
}
