import { Navigate } from "react-router-dom";
import { usePermissions } from "@/auth/usePermissions";
import {
  canAccessJobsAdmin,
  canAccessUsersAdmin,
  getAdminDefaultPath,
} from "@/utils/permissions";

export default function AdminIndexRedirect() {
  const { permissions, loading } = usePermissions();

  if (loading) return null;

  if (canAccessUsersAdmin(permissions)) {
    return <Navigate to="users" replace />;
  }
  if (canAccessJobsAdmin(permissions)) {
    return <Navigate to="jobs" replace />;
  }

  return <Navigate to={getAdminDefaultPath(permissions)} replace />;
}
