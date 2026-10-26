import { compact, toFormData } from "../../lib/apiHelpers";
import { baseApi } from "./baseApi";

export const rewardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRewards: builder.query({
      query: ({ reward_category_id } = {}) => ({
        url: "/reward/v1/list",
        params: compact({ reward_category_id }),
      }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Rewards", id })),
              { type: "Rewards", id: "LIST" },
            ]
          : [{ type: "Rewards", id: "LIST" }],
    }),

    getReward: builder.query({
      query: (id) => `/reward/v1/get/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_result, _error, id) => [{ type: "Rewards", id }],
    }),

    createReward: builder.mutation({
      query: (values) => ({
        url: "/reward/v1/create",
        method: "POST",
        body: toFormData(values),
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: [{ type: "Rewards", id: "LIST" }],
    }),

    updateReward: builder.mutation({
      query: ({ id, values }) => ({
        url: `/reward/v1/update/${id}`,
        method: "PATCH",
        body: toFormData(values),
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Rewards", id },
        { type: "Rewards", id: "LIST" },
      ],
    }),

    deleteReward: builder.mutation({
      query: (id) => ({
        url: `/reward/v1/delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: [{ type: "Rewards", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRewardsQuery,
  useGetRewardQuery,
  useLazyGetRewardQuery,
  useCreateRewardMutation,
  useUpdateRewardMutation,
  useDeleteRewardMutation,
} = rewardApi;
