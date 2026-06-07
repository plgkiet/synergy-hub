import "./glass.css";

export default function GlassCard({ children, className = "", ...props }) {
  return (
    <div className={`about-glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}
