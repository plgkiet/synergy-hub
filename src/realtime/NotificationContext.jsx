// src/realtime/NotificationContext.jsx
import { useEffect, useState } from "react";
import { getConnection, startConnection } from "./signalrClient";
import { authStorage } from "@/api/authStorage";
import {
  markNotificationRead,
  getUserUnreadNotifications,
} from "@/api/notification";
import { NotificationContext } from "./NotificationContextValue";

export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return; // don't connect when logged out

    let conn = getConnection();

    var userId = authStorage.getUser().id;

    getUserUnreadNotifications(userId).then((res) => {
      setNotifications(res.metadata.data);
    });

    const handleNotification = (payload) => {      
      const incomingId = payload.id ?? payload.notificationId;
      if (!incomingId) {
        setNotifications((prev) => [payload, ...prev]);
        return;
      }

      setNotifications((prev) => {
        const existingIndex = prev.findIndex(
          (n) => (n.id ?? n.notificationId) === incomingId,
        );

        if (existingIndex === -1) {
          return [payload, ...prev];
        }

        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], ...payload };
        return next;
      });
    };

    conn.on("notification.target", handleNotification);

    startConnection()
      .then(() => setConnected(true))
      .catch(() => setConnected(false));

    return () => {
      // conn.off("notification.target", handleNotification);
      // stopConnection();
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id || n.notificationId === id ? { ...n, isRead: true } : n,
        ),
      );
    } catch {
      // swallow error; UI can handle toast if needed
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(
      (n) => !n.isRead && (n.id ?? n.notificationId),
    );
    if (unread.length === 0) return;

    try {
      await Promise.all(
        unread.map((n) =>
          markNotificationRead(n.id ?? n.notificationId).catch(() => null),
        ),
      );
      setNotifications((prev) =>
        prev.map((n) => (!n.isRead ? { ...n, isRead: true } : n)),
      );
    } catch {
      // ignore; individual failures already swallowed
    }
  };

  // Dismiss from UI only, but mark as read in backend (if possible)
  const handleDismiss = async (id) => {
    try {
      // If backend already marked it read, this is safe; if it's unread, this will mark it read.
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.filter((n) => (n.id ?? n.notificationId) !== id),
      );
    } catch {
      // swallow error; UI can handle toast if needed
    }
  };

  const value = {
    notifications,
    connected,
    clearNotifications: () => setNotifications([]),
    markRead: handleMarkRead,
    dismiss: handleDismiss,
    markAllRead: handleMarkAllRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
