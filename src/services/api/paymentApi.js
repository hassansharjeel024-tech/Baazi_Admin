import { compact } from "../../lib/apiHelpers";
import { baseApi } from "./baseApi";

export const PAYMENT_STATUS = {
  1: "Pending",
  2: "Succeeded",
  3: "Failed",
  4: "Cancelled",
  5: "Refunded",
};

/** Sirf succeeded (status 2) payments ka total */
export function calculateRevenue(payments = []) {
  return payments
    .filter((p) => p.status === 2)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPayments: builder.query({
      query: ({ user_id, status } = {}) => ({
        url: "/payment/v1/list",
        params: compact({ user_id, status }),
      }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Payments", id })),
              { type: "Payments", id: "LIST" },
            ]
          : [{ type: "Payments", id: "LIST" }],
    }),
  }),
});

export const { useListPaymentsQuery, useLazyListPaymentsQuery } = paymentApi;
