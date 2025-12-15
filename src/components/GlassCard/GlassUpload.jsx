import "./glass.css";

export default function GlassUpload({ className = "", children }) {
  return <div className={`glass-upload ${className}`}>{children}</div>;
}
