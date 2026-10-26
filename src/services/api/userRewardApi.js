import { compact } from "../../lib/apiHelpers";
import { baseApi } from "./baseApi";

export const USER_REWARD_STATUS = {
  1: "Processing",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
};

const STAT_KEYS = ["total", "pending", "approved", "rejected"];

/** Normalize / validate admin stats payload; throws on malformed data. */
export function normalizeAdminRedemptionStats(data) {
  if (!data || typeof data !== "object") {
    throw Object.assign(new Error("Invalid redemption stats response."), { status: "CUSTOM_ERROR" });
  }

  const stats = {};
  for (const key of STAT_KEYS) {
    const raw = data[key];
    if (raw === null || raw === undefined || raw === "") {
      throw Object.assign(new Error("Invalid redemption stats response."), { status: "CUSTOM_ERROR" });
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      throw Object.assign(new Error("Invalid redemption stats response."), { status: "CUSTOM_ERROR" });
    }
    stats[key] = Math.trunc(n);
  }
  return stats;
}

/** Normalize / validate admin list payload; throws on malformed data. */
export function normalizeAdminRedemptionList(payload) {
  if (!payload || typeof payload !== "object") {
    throw Object.assign(new Error("Invalid redemption list response."), { status: "CUSTOM_ERROR" });
  }

  const records = Array.isArray(payload.data) ? payload.data : null;
  const metaRaw = payload.meta;
  if (!records || !metaRaw || typeof metaRaw !== "object") {
    throw Object.assign(new Error("Invalid redemption list response."), { status: "CUSTOM_ERROR" });
  }

  const total = Number(metaRaw.total);
  const limit = Number(metaRaw.limit);
  const page = Number(metaRaw.page);
  const pages = Number(metaRaw.pages);

  if (![total, limit, page, pages].every((n) => Number.isFinite(n) && n >= 0)) {
    throw Object.assign(new Error("Invalid redemption list pagination."), { status: "CUSTOM_ERROR" });
  }

  return {
    items: records,
    meta: {
      total: Math.trunc(total),
      limit: Math.trunc(limit) || 1,
      page: Math.max(1, Math.trunc(page)),
      pages: Math.max(0, Math.trunc(pages)),
    },
  };
}

export const userRewardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminRedemptionStats: builder.query({
      query: () => "/user-reward/v1/admin/stats",
      transformResponse: (response) => normalizeAdminRedemptionStats(response?.data),
      providesTags: [{ type: "UserRewards", id: "STATS" }],
    }),

    listAdminRedemptions: builder.query({
      query: ({ page = 1, limit = 5, reward_id, status } = {}) => ({
        url: "/user-reward/v1/admin/list",
        params: compact({ page, limit, reward_id, status }),
      }),
      transformResponse: (response) => normalizeAdminRedemptionList(response?.data),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({ type: "UserRewards", id })),
              { type: "UserRewards", id: "ADMIN_LIST" },
            ]
          : [{ type: "UserRewards", id: "ADMIN_LIST" }],
    }),

    getAdminRecentRedemptions: builder.query({
      query: ({ limit = 5 } = {}) => ({
        url: "/user-reward/v1/admin/recent",
        params: compact({ limit }),
      }),
      transformResponse: (response) => {
        const data = response?.data;
        if (!Array.isArray(data)) {
          throw Object.assign(new Error("Invalid recent redemptions response."), {
            status: "CUSTOM_ERROR",
          });
        }
        return data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "UserRewards", id })),
              { type: "UserRewards", id: "RECENT" },
            ]
          : [{ type: "UserRewards", id: "RECENT" }],
    }),

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
      invalidatesTags: [
        { type: "UserRewards", id: "LIST" },
        { type: "UserRewards", id: "ADMIN_LIST" },
        { type: "UserRewards", id: "RECENT" },
        { type: "UserRewards", id: "STATS" },
      ],
    }),

    approveAdminRedemption: builder.mutation({
      query: (id) => ({
        url: `/user-reward/v1/admin/approve/${id}`,
        method: "PATCH",
      }),
      transformResponse: (response) => response?.message || "Redemption approved successfully",
      invalidatesTags: (_result, _error, id) => [
        { type: "UserRewards", id },
        { type: "UserRewards", id: "LIST" },
        { type: "UserRewards", id: "ADMIN_LIST" },
        { type: "UserRewards", id: "RECENT" },
        { type: "UserRewards", id: "STATS" },
      ],
    }),

    rejectAdminRedemption: builder.mutation({
      query: (id) => ({
        url: `/user-reward/v1/admin/reject/${id}`,
        method: "PATCH",
      }),
      transformResponse: (response) => response?.message || "Redemption rejected successfully",
      invalidatesTags: (_result, _error, id) => [
        { type: "UserRewards", id },
        { type: "UserRewards", id: "LIST" },
        { type: "UserRewards", id: "ADMIN_LIST" },
        { type: "UserRewards", id: "RECENT" },
        { type: "UserRewards", id: "STATS" },
      ],
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
        { type: "UserRewards", id: "ADMIN_LIST" },
        { type: "UserRewards", id: "RECENT" },
        { type: "UserRewards", id: "STATS" },
      ],
    }),

    deleteUserReward: builder.mutation({
      query: (id) => ({
        url: `/user-reward/v1/delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: [
        { type: "UserRewards", id: "LIST" },
        { type: "UserRewards", id: "ADMIN_LIST" },
        { type: "UserRewards", id: "RECENT" },
        { type: "UserRewards", id: "STATS" },
      ],
    }),
  }),
});

export const {
  useGetAdminRedemptionStatsQuery,
  useListAdminRedemptionsQuery,
  useGetAdminRecentRedemptionsQuery,
  useListUserRewardsQuery,
  useLazyListUserRewardsQuery,
  useGetUserRewardQuery,
  useLazyGetUserRewardQuery,
  useCreateUserRewardMutation,
  useApproveAdminRedemptionMutation,
  useRejectAdminRedemptionMutation,
  useUpdateUserRewardStatusMutation,
  useDeleteUserRewardMutation,
} = userRewardApi;
