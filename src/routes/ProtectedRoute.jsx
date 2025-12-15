import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authStorage } from "@/api/authStorage";

export default function ProtectedRoute() {
  const location = useLocation();

  const token = authStorage.getToken();
  const user = authStorage.getUser();

  const isAuthed = Boolean(token && user);

  if (isAuthed && location.pathname === "/login") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAuthed && location.pathname !== "/login") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
