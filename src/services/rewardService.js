import axiosClient from "../lib/axiosClient";
import { unwrap, compact, toFormData, MULTIPART } from "../lib/apiHelpers";

export async function getRewards({ reward_category_id } = {}) {
  const res = await axiosClient.get("/reward/v1/list", {
    params: compact({ reward_category_id }),
  });
  return unwrap(res) ?? [];
}

export async function getReward(id) {
  const res = await axiosClient.get(`/reward/v1/get/${id}`);
  return unwrap(res);
}

// values: name (zaroori), description, carrot, stock, reward_category_id,
// expires_at ("2026-12-31T23:59:59"), label, image (File)
export async function createReward(values) {
  const res = await axiosClient.post("/reward/v1/create", toFormData(values), MULTIPART);
  return res.data?.message;
}

export async function updateReward(id, values) {
  const res = await axiosClient.patch(`/reward/v1/update/${id}`, toFormData(values), MULTIPART);
  return res.data?.message;
}

export async function deleteReward(id) {
  const res = await axiosClient.delete(`/reward/v1/delete/${id}`);
  return res.data?.message;
}