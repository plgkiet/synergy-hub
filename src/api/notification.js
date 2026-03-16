import { http } from "./http";
const API_BASE_URL =
  import.meta.env.VITE_NOTIFICATION_API_BASE_URL?.replace(/\/$/, "") || "";

// Get notifications for a specific user
export async function getUserUnreadNotifications(userId) {
  return http(`${API_BASE_URL}/Notification/user/${userId}/unread?PageIndex=1&PageSize=10000`, {
    method: "GET",
    auth: true,
  });
}

// Mark a single notification as read by id
export async function markNotificationRead(id) {
  if (!id) throw new Error("Notification id is required");

  return http(`${API_BASE_URL}/Notification/${id}/mark-read?PageIndex=1&PageSize=10000`, {
    method: "PUT",
    auth: true,
  });
}

export async function getUserNotifications(userId) {
  return http(`${API_BASE_URL}/Notification/user/${userId}`, {
    method: "GET",
    auth: true,
  });
}