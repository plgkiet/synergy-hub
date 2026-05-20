import { forwardRef } from "react";
import { SnackbarContent, useSnackbar } from "notistack";
import "./AppSnackbar.css";

const VARIANTS = {
  success: { icon: "fa-circle-check", tone: "success" },
  error: { icon: "fa-circle-xmark", tone: "error" },
  warning: { icon: "fa-triangle-exclamation", tone: "warning" },
  info: { icon: "fa-circle-info", tone: "info" },
  default: { icon: "fa-circle-info", tone: "info" },
};

const AppSnackbar = forwardRef(function AppSnackbar(props, ref) {
  const { id, message, variant = "default" } = props;
  const { closeSnackbar } = useSnackbar();
  const cfg = VARIANTS[variant] ?? VARIANTS.default;

  return (
    <SnackbarContent ref={ref} className="app-snackbar-root">
      <div className={`app-snackbar app-snackbar--${cfg.tone}`} role="alert">
        <span className="app-snackbar__icon" aria-hidden>
          <i className={`fa-solid ${cfg.icon}`} />
        </span>
        <p className="app-snackbar__message">{message}</p>
        <button
          type="button"
          className="app-snackbar__close"
          onClick={() => closeSnackbar(id)}
          aria-label="Dismiss"
        >
          <i className="fa-solid fa-xmark" aria-hidden />
        </button>
      </div>
    </SnackbarContent>
  );
});

export default AppSnackbar;
