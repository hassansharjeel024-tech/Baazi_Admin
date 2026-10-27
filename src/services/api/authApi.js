import { apiSlice } from "./apiSlice";
import { setCredentials } from "../../features/auth/authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      queryFn: async (body, _api, _extra, baseQuery) => {
        const result = await baseQuery({ url: "/auth/v1/login", method: "POST", body });
        if (result.error) return result;

        const payload = result.data?.data;
        const token = payload?.access_token;
        const user = payload?.user;

        if (!token) {
          return {
            error: {
              status: 400,
              data: { message: result.data?.message || "Login failed. Please try again." },
            },
          };
        }
        if (user?.role !== "admin") {
          return {
            error: { status: 403, data: { message: "This account doesn't have admin access." } },
          };
        }
        return { data: { token, user } };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* error component mein .unwrap() se handle hoga */
        }
      },
    }),

    checkUsername: builder.mutation({
      query: (username) => ({
        url: "/auth/v1/check-username",
        method: "POST",
        body: { username },
      }),
      transformResponse: (res) => ({ available: res?.success === true, message: res?.message }),
    }),

    signup: builder.mutation({
      query: ({ username, email, password, referral_code }) => ({
        url: "/auth/v1/signup",
        method: "POST",
        body: {
          username,
          email,
          password,
          ...(referral_code ? { referral_code } : {}),
        },
      }),
    }),

    verifyEmail: builder.mutation({
      query: ({ email, verification_code }) => ({
        url: "/auth/v1/verify-email",
        method: "POST",
        body: { email, verification_code: Number(verification_code) },
      }),
    }),

    forgetPassword: builder.mutation({
      query: ({ step, email, verification_code, password }) => ({
        url: "/auth/v1/forget-password",
        method: "POST",
        body: {
          step,
          email,
          ...(verification_code ? { verification_code: String(verification_code) } : {}),
          ...(password ? { password } : {}),
        },
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