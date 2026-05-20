import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { SnackbarProvider } from "notistack";
import AppSnackbar from "@/components/ui/AppSnackbar";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SnackbarProvider
      maxSnack={4}
      autoHideDuration={4000}
      preventDuplicate
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      Components={{
        default: AppSnackbar,
        success: AppSnackbar,
        error: AppSnackbar,
        warning: AppSnackbar,
        info: AppSnackbar,
      }}
    >
      <App />
    </SnackbarProvider>
  </React.StrictMode>,
);
