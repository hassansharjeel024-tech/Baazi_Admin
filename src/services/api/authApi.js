import { compact } from "../../lib/apiHelpers";
import { baseApi } from "./baseApi";

const TOKEN_KEY = "baazi_admin_token";
const USER_KEY = "baazi_admin_user";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      async queryFn({ email, password }, _api, _extra, baseQuery) {
        const result = await baseQuery({
          url: "/auth/v1/login",
          method: "POST",
          body: { email, password },
        });

        if (result.error) return { error: result.error };

        const token = result.data?.data?.access_token;
        const user = result.data?.data?.user;

        if (!token) {
          return {
            error: {
              status: 500,
              message: "Login succeeded but no token was returned by the API.",
            },
          };
        }

        if (user?.role !== "admin") {
          return {
            error: {
              status: 403,
              message: "This account doesn't have admin access.",
            },
          };
        }

        localStorage.setItem(TOKEN_KEY, token);
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));

        return { data: { token, user } };
      },
    }),

    checkUsername: builder.mutation({
      async queryFn(username, _api, _extra, baseQuery) {
        const result = await baseQuery({
          url: "/auth/v1/check-username",
          method: "POST",
          body: { username },
        });

        if (result.error) {
          if (result.error.status === 400 || result.error.status === 409) {
            return {
              data: { available: false, message: result.error.message || "" },
            };
          }
          return { error: result.error };
        }

        return {
          data: {
            available: result.data?.success === true,
            message: result.data?.message || "",
          },
        };
      },
    }),

    signup: builder.mutation({
      query: ({ username, email, password, referral_code }) => ({
        url: "/auth/v1/signup",
        method: "POST",
        body: compact({ username, email, password, referral_code }),
      }),
    }),

    verifyEmail: builder.mutation({
      query: ({ email, verification_code }) => ({
        url: "/auth/v1/verify-email",
        method: "POST",
        body: {
          email,
          verification_code: Number(verification_code),
        },
      }),
      transformResponse: (response) => ({
        message: response?.message,
        token: response?.data?.access_token,
        user: response?.data?.user,
      }),
    }),

    forgetPassword: builder.mutation({
      query: ({ step, email, verification_code, password }) => ({
        url: "/auth/v1/forget-password",
        method: "POST",
        body: compact({
          step,
          email,
          verification_code: verification_code ? String(verification_code) : undefined,
          password,
        }),
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useCheckUsernameMutation,
  useSignupMutation,
  useVerifyEmailMutation,
  useForgetPasswordMutation,
} = authApi;
