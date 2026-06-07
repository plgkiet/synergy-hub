import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth/Auth";
import UploadPage from "./pages/UploadPage/UploadPage";
import SearchPage from "./pages/SearchPage/SearchPage";
import UsersPage from "./pages/UsersPage/UsersPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PermissionRoute from "./routes/PermissionRoute";
import AdminIndexRedirect from "./routes/AdminIndexRedirect";
import PermissionsProvider from "./auth/PermissionsContext";
import ActivateAccount from "./pages/ActivateAccount/ActivateAccount";
import JobsPage from "./pages/JobsPage/JobsPage";
import JobDetailPage from "./pages/JobDetailPage/JobDetailPage";
import AdminJobsPage from "./pages/AdminJobsPage/AdminJobsPage";
import AdminJobDetailPage from "./pages/AdminJobDetailPage/AdminJobDetailPage";
import ApplyPage from "./pages/ApplyPage/ApplyPage";
import NotificationProvider from "./realtime/NotificationContext";
import AboutPage from "./pages/AboutPage/AboutPage";
import ContactPage from "./pages/ContactPage/ContactPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/apply/:publicCode" element={<ApplyPage />} />
        <Route
          element={
            <NotificationProvider>
              <ProtectedRoute />
            </NotificationProvider>
          }
        >
          <Route element={<PermissionsProvider />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              element={<PermissionRoute module="CVDocument" action="Upload" />}
            >
              <Route path="/upload" element={<UploadPage />} />
            </Route>
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:publicCode" element={<JobDetailPage />} />
            <Route path="/posts" element={<Navigate to="/jobs" replace />} />
            <Route
              path="/posts/:id"
              element={<Navigate to="/jobs" replace />}
            />
            <Route path="/search" element={<SearchPage />} />
            <Route
              path="/users"
              element={<Navigate to="/admin/users" replace />}
            />
            <Route
              element={
                <PermissionRoute
                  module="AdminPage"
                  anyAction
                  redirectTo="/dashboard"
                />
              }
            >
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminIndexRedirect />} />
                <Route
                  element={
                    <PermissionRoute
                      module="User"
                      action="Read"
                      redirectTo="/admin"
                    />
                  }
                >
                  <Route path="users" element={<UsersPage />} />
                </Route>
                <Route
                  element={
                    <PermissionRoute
                      module="Job"
                      action="Read"
                      redirectTo="/admin"
                    />
                  }
                >
                  <Route path="jobs" element={<AdminJobsPage />} />
                  <Route path="jobs/:id" element={<AdminJobDetailPage />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
