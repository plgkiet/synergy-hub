import { http } from "./http";
import { authStorage } from "./authStorage";

export async function login({ userName, password, rememberMe = false }) {
  const res = await http("/api/Auth/login", {
    method: "POST",
    body: { userName, password, rememberMe },
    auth: false,
  });

  const { accessToken, user } = res?.data || {};

  if (accessToken) authStorage.setToken(accessToken);
  if (user) authStorage.setUser(user);

  return res;
}

export function logout() {
  authStorage.clearAll();
}

export async function register({
  username,
  email,
  password,
  confirmPassword,
  roleId = 0,
}) {
  return http("/api/Auth/register", {
    method: "POST",
    body: {
      username,
      email,
      password,
      confirmPassword,
      roleId,
    },
    auth: false,
  });
}
