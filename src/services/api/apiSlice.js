import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, selectToken } from "../../features/auth/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    headers.set("platform", "web");
    const token = selectToken(getState());
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// 401 aaye to session clear + login page par redirect
const baseQueryWith401 = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    api.dispatch(logout());
    if (!window.location.pathname.includes("/admin/login")) {
      window.location.href = "/admin/login";
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWith401,
  tagTypes: ["CoinPackage", "Game", "Reward", "RewardCategory", "UserReward", "Payment", "Category"],
  endpoints: () => ({}),
});

// Error se readable message nikalne ke liye
export const getErrorMessage = (err) =>
  err?.data?.message ||
  err?.data?.error ||
  err?.message ||
  "Something went wrong. Please try again.";