import axiosClient from "../lib/axiosClient";

const LOGIN_ENDPOINT = "/auth/v1/login";
const CHECK_USERNAME_ENDPOINT = "/auth/v1/check-username";
const SIGNUP_ENDPOINT = "/auth/v1/signup";
const VERIFY_EMAIL_ENDPOINT = "/auth/v1/verify-email";
const FORGET_PASSWORD_ENDPOINT = "/auth/v1/forget-password";
const TOKEN_KEY = "baazi_admin_token";
const USER_KEY = "baazi_admin_user";

// 1) Login
export async function login({ email, password }) {
  const { data } = await axiosClient.post(LOGIN_ENDPOINT, { email, password });

  const token = data?.data?.access_token;
  const user = data?.data?.user;

  if (!token) {
    throw { message: "Login succeeded but no token was returned by the API." };
  }

  if (user?.role !== "admin") {
    throw { message: "This account doesn't have admin access." };
  }

  localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));

  return { token, user };
}

// 2) Check username -> { available: true/false, message }
export async function checkUsername(username) {
  try {
    const { data } = await axiosClient.post(CHECK_USERNAME_ENDPOINT, { username });
    return { available: data?.success === true, message: data?.message || "" };
  } catch (err) {
    // Agar backend "taken" ko 400/409 error ke taur par bhejta hai
    if (err?.status === 400 || err?.status === 409) {
      return { available: false, message: err.message };
    }
    throw err;
  }
}

// Khali (empty) fields ko body se hata deta hai
function compact(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

// 3) Signup
export async function signup({ username, email, password, referral_code }) {
  const { data } = await axiosClient.post(
    SIGNUP_ENDPOINT,
    compact({ username, email, password, referral_code })
  );
  return data;
}

// 4) Verify email
export async function verifyEmail({ email, verification_code }) {
  const { data } = await axiosClient.post(VERIFY_EMAIL_ENDPOINT, {
    email,
    verification_code: Number(verification_code),
  });
  return {
    message: data?.message,
    token: data?.data?.access_token,
    user: data?.data?.user,
  };
}

// 5) Forget password (step ke hisaab se alag fields bhejein)
export async function forgetPassword({ step, email, verification_code, password }) {
  const { data } = await axiosClient.post(
    FORGET_PASSWORD_ENDPOINT,
    compact({
      step,
      email,
      verification_code: verification_code ? String(verification_code) : undefined,
      password,
    })
  );
  return data;
}

// Session helpers
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