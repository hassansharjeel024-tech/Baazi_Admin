import { compact, toFormData } from "../../lib/apiHelpers";
import { baseApi } from "./baseApi";

export const gameApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Returns { featured_game, top_game, category, games }
    getGames: builder.query({
      query: ({ home, category_id } = {}) => ({
        url: "/game/v1/list",
        params: compact({ home, category_id }),
      }),
      transformResponse: (response) => response?.data,
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
