import { Navigate, Outlet } from "react-router-dom";
import { usePermissions } from "@/auth/usePermissions";
import { canDo, hasModule } from "@/utils/permissions";

export default function PermissionRoute({
  module,
  action,
  anyAction = false,
  redirectTo = "/dashboard",
}) {
  const { permissions, loading } = usePermissions();

  if (loading) return null;

  let allowed = false;
  if (anyAction) {
    allowed = hasModule(permissions, module);
  } else {
    allowed = canDo(permissions, module, action);
  }

  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
