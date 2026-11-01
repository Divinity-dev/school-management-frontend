const SESSION_TOKEN_KEY = "token";
const SESSION_USER_KEY = "user";

export function getSessionToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function getSessionUser() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SESSION_USER_KEY);
}

export function saveSession({ token, user }) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

export function saveSessionUser(user) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_USER_KEY);
}
