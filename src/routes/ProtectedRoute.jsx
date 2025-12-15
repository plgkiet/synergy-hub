import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authStorage } from "@/api/authStorage";

export default function ProtectedRoute() {
  const location = useLocation();

  const token = authStorage.getToken();
  const user = authStorage.getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
