const TOKEN_KEY = "baazi_admin_token";
const USER_KEY = "baazi_admin_user";

// Session helpers (API calls live in services/api/authApi.js)
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCurrentAdmin() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}
