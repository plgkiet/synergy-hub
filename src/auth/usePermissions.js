import { useContext } from "react";
import { PermissionsContext } from "./PermissionsContextValue";

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return ctx;
}
