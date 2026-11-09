import { compact, toFormData } from "../../lib/apiHelpers";
import { baseApi } from "./baseApi";

/** Normalize / validate GET /game/v1/list payload. */
export function normalizeGamesList(payload) {
  if (!payload || typeof payload !== "object") {
    throw Object.assign(new Error("Invalid games list response."), {
      status: "CUSTOM_ERROR",
    });
  }

  const category = Array.isArray(payload.category) ? payload.category : [];
  const games = Array.isArray(payload.games) ? payload.games : [];

  return {
    category,
    games,
    featured_game: payload.featured_game ?? null,
    top_game: payload.top_game ?? null,
  };
}

export const gameApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /game/v1/list?home=&category_id= */
    getGames: builder.query({
      query: ({ home, category_id } = {}) => ({
        url: "/game/v1/list",
        params: compact({ home, category_id }),
      }),
      transformResponse: (response) =>
        normalizeGamesList(response?.data ?? response),
      providesTags: (result) =>
        result?.games
          ? [
              ...result.games.map(({ id }) => ({ type: "Games", id })),
              { type: "Games", id: "LIST" },
            ]
          : [{ type: "Games", id: "LIST" }],
    }),

    createGame: builder.mutation({
      query: (values) => ({
        url: "/game/v1/create",
        method: "POST",
        body: toFormData(values),
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: [{ type: "Games", id: "LIST" }],
    }),

    updateGame: builder.mutation({
      query: ({ id, values }) => ({
        url: `/game/v1/update/${id}`,
        method: "PATCH",
        body: toFormData(values),
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Games", id },
        { type: "Games", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetGamesQuery,
  useLazyGetGamesQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
} = gameApi;
