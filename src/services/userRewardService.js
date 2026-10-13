import axiosClient from "../lib/axiosClient";
import { unwrap, compact } from "../lib/apiHelpers";

export const USER_REWARD_STATUS = {
  1: "Processing",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
};

// Returns { rewards: [...], counts: { processing, shipped, delivered, cancelled } }
// Note: list mein user ka naam nahi hota, sirf user_id. Naam ke liye getUserReward(id) use karein.
export async function listUserRewards({ user_id, reward_id, status } = {}) {
  const res = await axiosClient.get("/user-reward/v1/list", {
    params: compact({ user_id, reward_id, status }),
  });
  const data = unwrap(res);
  return { rewards: data?.rewards ?? [], counts: data?.counts ?? {} };
}

// Detail mein user { id, display_name, email, username } aur reward ka poora data hota hai
export async function getUserReward(id) {
  const res = await axiosClient.get(`/user-reward/v1/get/${id}`);
  return unwrap(res);
}

export async function createUserReward({ reward_id, user_id }) {
  const res = await axiosClient.post("/user-reward/v1/create", compact({ reward_id, user_id }));
  return res.data?.message;
}

// status: 1 = Processing, 2 = Shipped, 3 = Delivered, 4 = Cancelled
export async function updateUserRewardStatus(id, status) {
  const res = await axiosClient.patch(`/user-reward/v1/update/${id}`, { status });
  return res.data?.message;
}

export async function deleteUserReward(id) {
  const res = await axiosClient.delete(`/user-reward/v1/delete/${id}`);
  return res.data?.message;
}