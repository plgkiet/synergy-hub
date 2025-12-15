import React from "react";
import "./glass.css";

export default function GlassCircle({ className = "", children, ...rest }) {
  return (
    <div className={`glass-circle ${className}`} {...rest}>
      {children}
    </div>
  );
}
