import "./glass.css";

export default function GlassButton({ children, className = "", ...props }) {
  return (
    <button className={`about-glass-button ${className}`} {...props}>
      {children}
    </button>
  );
}
