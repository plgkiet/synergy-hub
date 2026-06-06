import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { authStorage } from "@/api/authStorage";
import { loadPermissions } from "@/api/auth";
import { PermissionsContext } from "./PermissionsContextValue";

export default function PermissionsProvider() {
  const [permissions, setPermissions] = useState(() => authStorage.getPermissions());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      setPermissions([]);
      authStorage.clearPermissions();
      return [];
    }

    setLoading(true);
    try {
      const next = await loadPermissions();
      setPermissions(next);
      return next;
    } catch {
      const cached = authStorage.getPermissions();
      setPermissions(cached);
      return cached;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStorage.getToken()) {
      refresh();
    }
  }, [refresh]);

  return (
    <PermissionsContext.Provider value={{ permissions, loading, refresh }}>
      <Outlet />
    </PermissionsContext.Provider>
  );
}
