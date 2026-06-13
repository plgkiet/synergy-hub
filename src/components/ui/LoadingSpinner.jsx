import "./LoadingSpinner.css";

export default function LoadingSpinner({
  inline = false,
  className = "",
  label = "Loading",
}) {
  return (
    <span
      className={`loading-spinner${inline ? " loading-spinner--inline" : ""} ${className}`.trim()}
      role="status"
      aria-label={label}
    >
      <span className="loading-spinner__dots">
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
