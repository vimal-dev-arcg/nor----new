import { appStore, PERSONAS } from "./appStore";

const KEY = "admin_token";
const USER_KEY = "ncr_current_user_role";

export function setToken(token) {
  localStorage.setItem(KEY, token);
}

export function getToken() {
  return localStorage.getItem(KEY);
}

export function clearToken() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
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
