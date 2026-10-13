import axiosClient from "../lib/axiosClient";
import { unwrap } from "../lib/apiHelpers";

export async function getCategories() {
  const res = await axiosClient.get("/category/v1/get");
  return unwrap(res) ?? [];
}

export async function createCategory(name) {
  const res = await axiosClient.post("/category/v1/create", { name });
  return res.data?.message;
}

export async function updateCategory(id, name) {
  const res = await axiosClient.patch(`/category/v1/update/${id}`, { name });
  return res.data?.message;
}

export async function deleteCategory(id) {
  const res = await axiosClient.delete(`/category/v1/delete/${id}`);
  return res.data?.message;
}