import "./LoadingSpinner.css";

const SIZES = {
  sm: 16,
  md: 28,
  lg: 40,
};

export default function LoadingSpinner({
  size = "md",
  inline = false,
  variant = "default",
  className = "",
  label = "Loading",
}) {
  const px = SIZES[size] ?? SIZES.md;

  return (
    <span
      className={`loading-spinner${inline ? " loading-spinner--inline" : ""} ${className}`.trim()}
      style={{ width: px, height: px }}
      role="status"
      aria-label={label}
    >
      <span
        className={`loading-spinner__ring${
          variant === "light" ? " loading-spinner__ring--light" : ""
        }`}
      />
    </span>
  );
}
