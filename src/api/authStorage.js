const USER_KEY = "auth_user";
const TOKEN_KEY = "accessToken";
const PERMISSIONS_KEY = "auth_permissions";

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  },
  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser() {
    localStorage.removeItem(USER_KEY);
  },

  getPermissions() {
    const raw = localStorage.getItem(PERMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  setPermissions(permissions) {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions ?? []));
  },
  clearPermissions() {
    localStorage.removeItem(PERMISSIONS_KEY);
  },

  clearAll() {
    this.clearToken();
    this.clearUser();
    this.clearPermissions();
  },
};
