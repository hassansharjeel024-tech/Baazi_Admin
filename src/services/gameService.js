import axiosClient from "../lib/axiosClient";
import { unwrap, compact, toFormData, MULTIPART } from "../lib/apiHelpers";

// Returns { featured_game, top_game, category, games }
export async function getGames({ home, category_id } = {}) {
  const res = await axiosClient.get("/game/v1/list", {
    params: compact({ home, category_id }),
  });
  return unwrap(res);
}

// values: name, url, description, carrot, category_id, entry_coin, total_level (zaroori)
// minimum_score aur image (File object) optional
export async function createGame(values) {
  const res = await axiosClient.post("/game/v1/create", toFormData(values), MULTIPART);
  return res.data?.message;
}

// Sirf badle hue fields bhejein
export async function updateGame(id, values) {
  const res = await axiosClient.patch(`/game/v1/update/${id}`, toFormData(values), MULTIPART);
  return res.data?.message;
}