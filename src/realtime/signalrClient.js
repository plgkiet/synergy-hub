// src/realtime/signalrClient.js
import * as signalR from "@microsoft/signalr";
import { authStorage } from "@/api/authStorage";

let connection;

export function getConnection() {
  if (!connection) {
    var token = authStorage.getToken();
    connection = new signalR.HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_NOTIFICATION_HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();
  }
  return connection;
}

export async function startConnection() {
  const conn = getConnection();
  if (conn.state === "Disconnected") {
    await conn.start();
  }
  return conn;
}

export async function stopConnection() {
  if (!connection) return;

  try {
    if (connection.state !== "Disconnected") {
      await connection.stop();
    }
  } catch (err) {
    // Ignore abort during handshake / disconnect
    if (err && err.name !== "AbortError") {
      // eslint-disable-next-line no-console
      console.warn("SignalR stop error:", err);
    }
  }
}