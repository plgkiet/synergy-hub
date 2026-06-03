import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth/Auth";
import UploadPage from "./pages/UploadPage/UploadPage";
import SearchPage from "./pages/SearchPage/SearchPage";
import UsersPage from "./pages/UsersPage/UsersPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ActivateAccount from "./pages/ActivateAccount/ActivateAccount";
import JobsPage from "./pages/JobsPage/JobsPage";
import JobDetailPage from "./pages/JobDetailPage/JobDetailPage";
import AdminJobsPage from "./pages/AdminJobsPage/AdminJobsPage";
import AdminJobDetailPage from "./pages/AdminJobDetailPage/AdminJobDetailPage";
import ApplyPage from "./pages/ApplyPage/ApplyPage";
import NotificationProvider from "./realtime/NotificationContext";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/apply/:publicCode" element={<ApplyPage />} />
        <Route element={<NotificationProvider><ProtectedRoute /></NotificationProvider>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/posts" element={<Navigate to="/jobs" replace />} />
          <Route path="/posts/:id" element={<Navigate to="/jobs" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="jobs/:id" element={<AdminJobDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
