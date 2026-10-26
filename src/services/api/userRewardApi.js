import { compact } from "../../lib/apiHelpers";
import { baseApi } from "./baseApi";

export const USER_REWARD_STATUS = {
  1: "Processing",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
};

export const userRewardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Returns { rewards: [...], counts: { processing, shipped, delivered, cancelled } }
    listUserRewards: builder.query({
      query: ({ user_id, reward_id, status } = {}) => ({
        url: "/user-reward/v1/list",
        params: compact({ user_id, reward_id, status }),
      }),
      transformResponse: (response) => {
        const data = response?.data;
        return { rewards: data?.rewards ?? [], counts: data?.counts ?? {} };
      },
      providesTags: (result) =>
        result?.rewards
          ? [
              ...result.rewards.map(({ id }) => ({ type: "UserRewards", id })),
              { type: "UserRewards", id: "LIST" },
            ]
          : [{ type: "UserRewards", id: "LIST" }],
    }),

    getUserReward: builder.query({
      query: (id) => `/user-reward/v1/get/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_result, _error, id) => [{ type: "UserRewards", id }],
    }),

    createUserReward: builder.mutation({
      query: ({ reward_id, user_id }) => ({
        url: "/user-reward/v1/create",
        method: "POST",
        body: compact({ reward_id, user_id }),
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: [{ type: "UserRewards", id: "LIST" }],
    }),

    updateUserRewardStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/user-reward/v1/update/${id}`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "UserRewards", id },
        { type: "UserRewards", id: "LIST" },
      ],
    }),

    deleteUserReward: builder.mutation({
      query: (id) => ({
        url: `/user-reward/v1/delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: [{ type: "UserRewards", id: "LIST" }],
    }),
  }),
});

export const {
  useListUserRewardsQuery,
  useLazyListUserRewardsQuery,
  useGetUserRewardQuery,
  useLazyGetUserRewardQuery,
  useCreateUserRewardMutation,
  useUpdateUserRewardStatusMutation,
  useDeleteUserRewardMutation,
} = userRewardApi;
