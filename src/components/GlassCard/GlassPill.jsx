// src/components/GlassPill.jsx
import React from "react";
import "./glass.css";

export default function GlassPill({ className = "", children, ...rest }) {
  return (
    <div className={`glass-pill ${className}`} {...rest}>
      {children}
    </div>
  );
}
