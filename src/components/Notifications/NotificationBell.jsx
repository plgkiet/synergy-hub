// src/components/Notifications/NotificationBell.jsx
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/realtime/useNotifications";
import "./NotificationBell.css";

export default function NotificationBell() {
  const { notifications, markRead, markAllRead, dismiss, clearNotifications } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const closePanel = () => {
    setOpen(false);
    setSelected(null);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target)) return;
      closePanel();
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") closePanel();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleItemClick = (n) => {
    setSelected(n);
  };

  const handleDelete = (e, n) => {
    e.preventDefault();
    e.stopPropagation();
    const id = n.id ?? n.notificationId;
    if (id) dismiss(id);
  };

  const handleMarkRead = async () => {
    if (!selectedView) return;
    const id = selectedView.id ?? selectedView.notificationId;
    if (!id || selectedView.isRead) return;

    await markRead(id);
    setSelected((prev) => (prev ? { ...prev, isRead: true } : prev));
  };

  // If notifications update (SignalR) while detail is open, keep detail in sync.
  // Avoid setState inside effect; derive "selectedView" instead.
  const selectedId = selected?.id ?? selected?.notificationId ?? null;
  const selectedView =
    (selectedId &&
      notifications.find((n) => (n.id ?? n.notificationId) === selectedId)) ||
    selected;

  return (
    <div className="notif-root" ref={rootRef}>
      <button
        type="button"
        className="notif-bell"
        onClick={() => {
          if (open) {
            closePanel();
          } else {
            setOpen(true);
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open notifications"
      >
        <i className="fa-regular fa-bell" aria-hidden="true" />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel notif-panel--open" role="dialog">
          <div className="notif-header">
            <div className="notif-header-left">
              <span className="notif-header-title">
                {selected ? "Notification" : "Notifications"}
              </span>
              <span className="notif-header-sub">
                {selectedView
                  ? selectedView.isRead
                    ? "Read"
                    : "Unread"
                  : unreadCount > 0
                    ? `${unreadCount} unread`
                    : "All caught up"}
              </span>
            </div>

            <div className="notif-header-actions">
              {selectedView ? (
                <button
                  type="button"
                  className="notif-header-btn"
                  onClick={() => setSelected(null)}
                  title="Back"
                >
                  Back
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="notif-header-btn"
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    title="Mark all as read"
                  >
                    Mark all
                  </button>
                  <button
                    type="button"
                    className="notif-header-btn notif-header-btn--ghost"
                    onClick={clearNotifications}
                    disabled={notifications.length === 0}
                    title="Clear all (hide)"
                  >
                    Clear
                  </button>
                </>
              )}
              <button
                type="button"
                className="notif-close"
                onClick={closePanel}
                aria-label="Close notifications"
                title="Close"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
          </div>
          {selectedView ? (
            <div
              className={`notif-detail ${
                selectedView?.isRead ? "notif-detail--read" : ""
              }`}
            >
              <div className="notif-detail-title">
                {selectedView.title || "Notification"}
              </div>
              <div className="notif-detail-body">
                {selectedView.message || selectedView.content || "(No content)"}
              </div>
              <div className="notif-detail-actions">
                <button
                  type="button"
                  className="notif-primary"
                  onClick={handleMarkRead}
                  disabled={selectedView.isRead}
                >
                  {selectedView.isRead ? "Marked as read" : "Mark as read"}
                </button>
                <button
                  type="button"
                  className="notif-secondary"
                  onClick={() => {
                    const id = selectedView.id ?? selectedView.notificationId;
                    if (id) dismiss(id);
                    setSelected(null);
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.length === 0 && (
                <div className="notif-empty">No notifications yet</div>
              )}
              {notifications.map((n) => (
                <button
                  key={n.id ?? n.notificationId}
                  type="button"
                  className={`notif-item ${n.isRead ? "notif-item--read" : ""}`}
                  onClick={() => handleItemClick(n)}
                >
                  <div className="notif-row">
                    <div className="notif-title">
                      {n.title || "Notification"}
                    </div>
                    <div className="notif-row-right">
                      {!n.isRead && <span className="notif-unread-dot" />}
                      <button
                        type="button"
                        className="notif-item-delete"
                        onClick={(e) => handleDelete(e, n)}
                        aria-label="Delete notification"
                        title="Dismiss (mark read)"
                      >
                        <i className="fa-solid fa-xmark" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  {n.message && (
                    <div className="notif-message">{n.message}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
