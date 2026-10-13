import axiosClient from "../lib/axiosClient";
import { unwrap, compact } from "../lib/apiHelpers";

export const PAYMENT_STATUS = {
  1: "Pending",
  2: "Succeeded",
  3: "Failed",
  4: "Cancelled",
  5: "Refunded",
};

// user_id sirf admin ke liye hai (kisi ek user ki payments)
export async function listPayments({ user_id, status } = {}) {
  const res = await axiosClient.get("/payment/v1/list", {
    params: compact({ user_id, status }),
  });
  return unwrap(res) ?? [];
}

// Sirf succeeded (status 2) payments ka total
export function calculateRevenue(payments = []) {
  return payments
    .filter((p) => p.status === 2)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
}