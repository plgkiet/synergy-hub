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

export async function register({ username, email, password }) {
  return http("/api/Auth/register", {
    method: "POST",
    body: {
      username,
      email,
      password,
    },
    auth: false,
  });
}

export async function activateAccount({ email, token }) {
  return http("/api/Auth/activate-account", {
    method: "POST",
    body: {
      email,
      token,
    },
    auth: false,
  });
}

export async function resendActivation({ email }) {
  return http("/api/Auth/resend-activation", {
    method: "POST",
    body: {
      email,
    },
    auth: false,
  });
}

export async function requestNewActivationCode({ email }) {
  return http("/api/Auth/resend-activation", {
    method: "POST",
    body: {
      email,
    },
    auth: false,
  });
}
