// src/realtime/useNotifications.js
import { useContext } from "react";
import { NotificationContext } from "./NotificationContextValue";

export function useNotifications() {
  const ctx = useContext(NotificationContext);

  if (!ctx) {
    throw new Error("useNotifications must be used inside <NotificationProvider />");
  }

  return ctx; // { notifications, connected, clearNotifications }
}