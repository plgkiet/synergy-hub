import React from "react";
import "./glass.css";

export default function GlassButton({ children, className = "", ...rest }) {
  return (
    <button className={`glass-button ${className}`} {...rest}>
      {children}
    </button>
  );
}
