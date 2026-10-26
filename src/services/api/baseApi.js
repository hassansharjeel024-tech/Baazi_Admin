import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const TOKEN_KEY = "baazi_admin_token";
const USER_KEY = "baazi_admin_user";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    headers.set("platform", "web");

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

function clearSessionAndRedirect() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (!window.location.pathname.includes("/admin/login")) {
    window.location.href = "/admin/login";
  }
}

/**
 * Wraps fetchBaseQuery to mirror the previous Axios error shape:
 * { status, message } so existing UI (`err?.message`) keeps working.
 */
async function baseQueryWithAuth(args, api, extraOptions) {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    const data = result.error.data;
    const message =
      (typeof data === "object" && data !== null && (data.message || data.error)) ||
      result.error.error ||
      (typeof data === "string" ? data : null) ||
      "Something went wrong. Please try again.";

    if (status === 401) {
      clearSessionAndRedirect();
    }

    return { error: { status, message, data } };
  }

  return result;
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Games",
    "Categories",
    "Rewards",
    "RewardCategories",
    "UserRewards",
    "CoinPackages",
    "Payments",
    "AdminUsers",
  ],
  endpoints: () => ({}),
});
