import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth/Auth";
import UploadPage from "./pages/UploadPage/UploadPage";
import SearchPage from "./pages/SearchPage/SearchPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ActivateAccount from "./pages/ActivateAccount/ActivateAccount";
import NotificationProvider from "./realtime/NotificationContext";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route element={<NotificationProvider><ProtectedRoute /></NotificationProvider>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
