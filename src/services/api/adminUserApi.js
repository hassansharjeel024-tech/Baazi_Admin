import {
  compact,
  filenameFromContentDisposition,
  getErrorMessage,
} from "../../lib/apiHelpers";
import { baseApi } from "./baseApi";

export const ADMIN_USER_PERIODS = ["weekly", "monthly", "yearly"];

/** 0 = All, 1 = Active, 2 = Banned (Inactive) */
export const ADMIN_USER_STATUS = {
  ALL: 0,
  ACTIVE: 1,
  BANNED: 2,
};

function toFiniteNumber(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Normalize / validate GET /admin-user/v1/stats payload. */
export function normalizeAdminUserStats(data, requestedPeriod = "weekly") {
  if (!data || typeof data !== "object") {
    throw Object.assign(new Error("Invalid user statistics response."), {
      status: "CUSTOM_ERROR",
    });
  }

  const periodRaw = typeof data.period === "string" ? data.period.toLowerCase() : requestedPeriod;
  const period = ADMIN_USER_PERIODS.includes(periodRaw) ? periodRaw : requestedPeriod;

  return {
    period,
    total_players: toFiniteNumber(data.total_players),
    total_players_growth_percent: toFiniteNumber(data.total_players_growth_percent),
    active_30d: toFiniteNumber(data.active_30d),
    banned: toFiniteNumber(data.banned),
  };
}

/** Normalize / validate GET /admin-user/v1/list payload (`data.data` + `data.meta`). */
export function normalizeAdminUserList(payload) {
  if (!payload || typeof payload !== "object") {
    throw Object.assign(new Error("Invalid user list response."), {
      status: "CUSTOM_ERROR",
    });
  }

  const records = Array.isArray(payload.data) ? payload.data : null;
  const metaRaw = payload.meta;
  if (!records || !metaRaw || typeof metaRaw !== "object") {
    throw Object.assign(new Error("Invalid user list response."), {
      status: "CUSTOM_ERROR",
    });
  }

  const total = Number(metaRaw.total);
  const limit = Number(metaRaw.limit);
  const page = Number(metaRaw.page);
  const pages = Number(metaRaw.pages);

  if (![total, limit, page, pages].every((n) => Number.isFinite(n) && n >= 0)) {
    throw Object.assign(new Error("Invalid user list pagination."), {
      status: "CUSTOM_ERROR",
    });
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

export const adminUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUserStats: builder.query({
      query: ({ period = "weekly" } = {}) => ({
        url: "/admin-user/v1/stats",
        params: compact({ period }),
      }),
      transformResponse: (response, _meta, arg) =>
        normalizeAdminUserStats(response?.data ?? response, arg?.period || "weekly"),
      providesTags: (_result, _err, arg) => [
        { type: "AdminUsers", id: `STATS-${arg?.period || "weekly"}` },
      ],
    }),

    listAdminUsers: builder.query({
      query: ({
        period = "weekly",
        page = 1,
        limit = 10,
        status,
        search,
      } = {}) => ({
        url: "/admin-user/v1/list",
        // status 0 = All — omit from query; only send Active (1) / Banned (2)
        params: compact({
          period,
          page,
          limit,
          status:
            status === ADMIN_USER_STATUS.ALL || status === "0" || status == null
              ? undefined
              : status,
          search,
        }),
      }),
      transformResponse: (response) =>
        normalizeAdminUserList(response?.data ?? response),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((u) => ({
                type: "AdminUsers",
                id: u.player_id ?? u.id,
              })),
              { type: "AdminUsers", id: "LIST" },
            ]
          : [{ type: "AdminUsers", id: "LIST" }],
    }),

    /** GET /admin-user/v1/get/{id} */
    getAdminUser: builder.query({
      query: (id) => `/admin-user/v1/get/${encodeURIComponent(id)}`,
      transformResponse: (response) => {
        const data = response?.data ?? response;
        if (!data || typeof data !== "object") {
          throw Object.assign(new Error("Invalid user profile response."), {
            status: "CUSTOM_ERROR",
          });
        }
        return data;
      },
      providesTags: (_result, _err, id) => [{ type: "AdminUsers", id }],
    }),

    /** GET /admin-user/v1/{id}/transactions */
    getAdminUserTransactions: builder.query({
      query: ({ id, period = "weekly", page = 1, limit = 10 } = {}) => ({
        url: `/admin-user/v1/${encodeURIComponent(id)}/transactions`,
        params: compact({ period, page, limit }),
      }),
      transformResponse: (response) =>
        normalizeAdminUserList(response?.data ?? response),
      providesTags: (_result, _err, arg) => [
        { type: "AdminUsers", id: `TX-${arg?.id}-${arg?.period}-${arg?.page}` },
      ],
    }),

    /** GET /admin-user/v1/{id}/tasks-xp */
    getAdminUserTasksXp: builder.query({
      query: ({ id, period = "weekly", page = 1, limit = 10 } = {}) => ({
        url: `/admin-user/v1/${encodeURIComponent(id)}/tasks-xp`,
        params: compact({ period, page, limit }),
      }),
      transformResponse: (response) =>
        normalizeAdminUserList(response?.data ?? response),
      providesTags: (_result, _err, arg) => [
        { type: "AdminUsers", id: `TASKS-${arg?.id}-${arg?.period}-${arg?.page}` },
      ],
    }),

    /** GET /admin-user/v1/{id}/redemptions */
    getAdminUserRedemptions: builder.query({
      query: ({ id, period = "weekly", page = 1, limit = 10 } = {}) => ({
        url: `/admin-user/v1/${encodeURIComponent(id)}/redemptions`,
        params: compact({ period, page, limit }),
      }),
      transformResponse: (response) =>
        normalizeAdminUserList(response?.data ?? response),
      providesTags: (_result, _err, arg) => [
        { type: "AdminUsers", id: `REDEEM-${arg?.id}-${arg?.period}-${arg?.page}` },
      ],
    }),

    /** GET /admin-user/v1/{id}/referrals */
    getAdminUserReferrals: builder.query({
      query: ({ id, period = "weekly", page = 1, limit = 10 } = {}) => ({
        url: `/admin-user/v1/${encodeURIComponent(id)}/referrals`,
        params: compact({ period, page, limit }),
      }),
      transformResponse: (response) =>
        normalizeAdminUserList(response?.data ?? response),
      providesTags: (_result, _err, arg) => [
        { type: "AdminUsers", id: `REF-${arg?.id}-${arg?.period}-${arg?.page}` },
      ],
    }),

    /**
     * CSV export — Blob response (not JSON).
     * GET /admin-user/v1/export?period=weekly|monthly|yearly
     */
    exportAdminUsersCsv: builder.mutation({
      async queryFn({ period = "weekly" } = {}, _api, _extraOptions, baseQuery) {
        const safePeriod = ADMIN_USER_PERIODS.includes(period) ? period : "weekly";
        const fallbackName = `players-${safePeriod}.csv`;

        const result = await baseQuery({
          url: "/admin-user/v1/export",
          method: "GET",
          params: compact({ period: safePeriod }),
          responseHandler: async (response) => {
            const disposition = response.headers.get("content-disposition");
            const blob = await response.blob();
            return { blob, disposition };
          },
        });

        if (result.error) {
          let message = "Failed to export players. Please try again.";
          const data = result.error.data;

          if (data?.blob instanceof Blob) {
            try {
              const text = await data.blob.text();
              const json = JSON.parse(text);
              message = json?.message || json?.error || message;
            } catch {
              /* keep default */
            }
          } else {
            message = getErrorMessage(result.error, message);
          }

          return {
            error: {
              status: result.error.status,
              message,
              data: result.error.data,
            },
          };
        }

        const payload = result.data;
        const blob = payload?.blob;

        if (!(blob instanceof Blob)) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              message: "Invalid export response.",
            },
          };
        }

        if ((blob.type || "").includes("application/json")) {
          let message = "Failed to export players. Please try again.";
          try {
            const json = JSON.parse(await blob.text());
            message = json?.message || json?.error || message;
          } catch {
            /* keep default */
          }
          return { error: { status: "CUSTOM_ERROR", message } };
        }

        if (blob.size === 0) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              message: "Export returned an empty file.",
            },
          };
        }

        return {
          data: {
            blob,
            filename: filenameFromContentDisposition(payload.disposition, fallbackName),
            period: safePeriod,
          },
        };
      },
    }),
  }),
});

export const {
  useGetAdminUserStatsQuery,
  useListAdminUsersQuery,
  useGetAdminUserQuery,
  useGetAdminUserTransactionsQuery,
  useGetAdminUserTasksXpQuery,
  useGetAdminUserRedemptionsQuery,
  useGetAdminUserReferralsQuery,
  useExportAdminUsersCsvMutation,
} = adminUserApi;
