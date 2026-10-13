import axiosClient from "../lib/axiosClient";
import { unwrap, toFormData, MULTIPART } from "../lib/apiHelpers";

export async function getCoinPackages() {
  const res = await axiosClient.get("/coin-package/v1/list");
  return unwrap(res) ?? [];
}

// values: title, key, total_coin, price, image (File) zaroori; currency ("usd"), bonus_percentage optional
export async function createCoinPackage(values) {
  const res = await axiosClient.post("/coin-package/v1/create", toFormData(values), MULTIPART);
  return res.data?.message;
}

export async function updateCoinPackage(id, values) {
  const res = await axiosClient.patch(`/coin-package/v1/update/${id}`, toFormData(values), MULTIPART);
  return res.data?.message;
}