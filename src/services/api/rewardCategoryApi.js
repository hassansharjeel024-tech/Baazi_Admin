import { baseApi } from "./baseApi";

export const rewardCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRewardCategories: builder.query({
      query: () => "/reward-category/v1/get",
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "RewardCategories", id })),
              { type: "RewardCategories", id: "LIST" },
            ]
          : [{ type: "RewardCategories", id: "LIST" }],
    }),

    createRewardCategory: builder.mutation({
      query: (name) => ({
        url: "/reward-category/v1/create",
        method: "POST",
        body: { name },
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: [{ type: "RewardCategories", id: "LIST" }],
    }),

    updateRewardCategory: builder.mutation({
      query: ({ id, name }) => ({
        url: `/reward-category/v1/update/${id}`,
        method: "PATCH",
        body: { name },
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "RewardCategories", id },
        { type: "RewardCategories", id: "LIST" },
      ],
    }),

    deleteRewardCategory: builder.mutation({
      query: (id) => ({
        url: `/reward-category/v1/delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: [{ type: "RewardCategories", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRewardCategoriesQuery,
  useCreateRewardCategoryMutation,
  useUpdateRewardCategoryMutation,
  useDeleteRewardCategoryMutation,
} = rewardCategoryApi;
