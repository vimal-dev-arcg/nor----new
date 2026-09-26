import { appStore, PERSONAS } from "./appStore";

const KEY = "admin_token";
const USER_KEY = "ncr_current_user_role";

export function setToken(token) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(KEY, token);
    localStorage.setItem("token", token);
  }
}

export function getToken() {
  if (typeof localStorage === "undefined") {
    return "ncr_admin_session_token_admin";
  }
  const token = localStorage.getItem("token") || localStorage.getItem(KEY);
  if (token) return token;

  // Provide default active admin token so initial property additions succeed
  const defaultToken = "ncr_admin_session_token_admin";
  localStorage.setItem("token", defaultToken);
  localStorage.setItem(KEY, defaultToken);
  return defaultToken;
}

export function clearToken() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(KEY);
    localStorage.removeItem("token");
    localStorage.removeItem(USER_KEY);
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function getCurrentUser() {
  return appStore.getCurrentUser();
}

export function switchRole(role) {
  if (PERSONAS[role]) {
    appStore.setCurrentRole(role);
    setToken(`ncr_token_${role}_${Date.now()}`);
  }
}

export function loginAsRole(role) {
  switchRole(role);
  return PERSONAS[role];
}

export { PERSONAS };
