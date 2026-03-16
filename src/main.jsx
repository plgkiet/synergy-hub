import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { SnackbarProvider, closeSnackbar } from "notistack";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      action={(key) => (
        <button className="snackbar-close" onClick={() => closeSnackbar(key)}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}
    >
      <App />
    </SnackbarProvider>
  </React.StrictMode>,
);
