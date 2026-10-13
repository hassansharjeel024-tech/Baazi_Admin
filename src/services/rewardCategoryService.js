import axiosClient from "../lib/axiosClient";
import { unwrap } from "../lib/apiHelpers";

export async function getRewardCategories() {
  const res = await axiosClient.get("/reward-category/v1/get");
  return unwrap(res) ?? [];
}

export async function createRewardCategory(name) {
  const res = await axiosClient.post("/reward-category/v1/create", { name });
  return res.data?.message;
}

export async function updateRewardCategory(id, name) {
  const res = await axiosClient.patch(`/reward-category/v1/update/${id}`, { name });
  return res.data?.message;
}

export async function deleteRewardCategory(id) {
  const res = await axiosClient.delete(`/reward-category/v1/delete/${id}`);
  return res.data?.message;
}