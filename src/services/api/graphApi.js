import { compact } from "../../lib/apiHelpers";
import { baseApi } from "./baseApi";

export const GRAPH_PERIODS = ["weekly", "monthly", "yearly"];

function toFiniteNumber(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function normalizeGame(row) {
  if (!row || typeof row !== "object") return null;
  const name = typeof row.name === "string" ? row.name.trim() : "";
  if (!name) return null;

  const pctRaw = toFiniteNumber(row.pct);
  const pct = pctRaw === null ? 0 : Math.max(0, pctRaw);
  const value =
    row.value === null || row.value === undefined || row.value === ""
      ? "—"
      : String(row.value);
  const color =
    typeof row.color === "string" && row.color.trim() ? row.color.trim() : null;

  return { name, value, pct, color };
}

function normalizeSegment(row) {
  if (!row || typeof row !== "object") return null;
  const label = typeof row.label === "string" ? row.label.trim() : "";
  if (!label) return null;
  const pctRaw = toFiniteNumber(row.pct);
  return {
    label,
    pct: pctRaw === null ? 0 : Math.max(0, pctRaw),
  };
}

/** Normalize / validate GET /graph/v1/overview payload. */
export function normalizeDashboardOverview(data, requestedPeriod = "weekly") {
  if (!data || typeof data !== "object") {
    throw Object.assign(new Error("Invalid dashboard overview response."), {
      status: "CUSTOM_ERROR",
    });
  }

  const periodRaw =
    typeof data.period === "string" ? data.period.toLowerCase() : requestedPeriod;
  const period = GRAPH_PERIODS.includes(periodRaw) ? periodRaw : requestedPeriod;

  const games = Array.isArray(data.games)
    ? data.games.map(normalizeGame).filter(Boolean)
    : [];

  const pbRaw = data.platform_breakdown;
  let platform_breakdown = null;

  if (pbRaw && typeof pbRaw === "object") {
    const segments = Array.isArray(pbRaw.segments)
      ? pbRaw.segments.map(normalizeSegment).filter(Boolean)
      : [];

    const highlight_label =
      typeof pbRaw.highlight_label === "string" && pbRaw.highlight_label.trim()
        ? pbRaw.highlight_label.trim()
        : segments[0]?.label || null;

    const highlightPctRaw = toFiniteNumber(pbRaw.highlight_pct);
    const highlight_pct =
      highlightPctRaw !== null
        ? Math.max(0, highlightPctRaw)
        : segments.find((s) => s.label === highlight_label)?.pct ?? null;

    const arcPctRaw = toFiniteNumber(pbRaw.arc_pct);
    const arc_pct = arcPctRaw === null ? 0 : Math.max(0, Math.min(100, arcPctRaw));

    platform_breakdown = {
      segments,
      highlight_label,
      highlight_pct,
      arc_pct,
    };
  }

  return { period, games, platform_breakdown };
}

function normalizeSparkBar(row) {
  if (!row || typeof row !== "object") return null;
  const height = toFiniteNumber(row.height);
  const opacity = toFiniteNumber(row.opacity);
  if (height === null || opacity === null) return null;
  return {
    height: Math.max(0, height),
    opacity: Math.max(0, Math.min(1, opacity)),
  };
}

/** Normalize / validate GET /graph/v1/prize-pool payload. */
export function normalizePrizePool(data, requestedPeriod = "weekly") {
  if (!data || typeof data !== "object") {
    throw Object.assign(new Error("Invalid prize pool response."), {
      status: "CUSTOM_ERROR",
    });
  }

  const periodRaw =
    typeof data.period === "string" ? data.period.toLowerCase() : requestedPeriod;
  const period = GRAPH_PERIODS.includes(periodRaw) ? periodRaw : requestedPeriod;

  const total = toFiniteNumber(data.total);
  const total_label =
    typeof data.total_label === "string" && data.total_label.trim()
      ? data.total_label.trim()
      : null;

  const spark_bars = Array.isArray(data.spark_bars)
    ? data.spark_bars.map(normalizeSparkBar).filter(Boolean)
    : [];

  return { period, total, total_label, spark_bars };
}

function normalizeDistributionItem(row) {
  if (!row || typeof row !== "object") return null;
  const label = typeof row.label === "string" ? row.label.trim() : "";
  if (!label) return null;

  const pctRaw = toFiniteNumber(row.pct);
  const pct = pctRaw === null ? 0 : Math.max(0, pctRaw);
  const value =
    row.value === null || row.value === undefined || row.value === ""
      ? "—"
      : String(row.value);
  const color =
    typeof row.color === "string" && row.color.trim() ? row.color.trim() : null;

  return { label, value, pct, color };
}

/** Normalize / validate GET /graph/v1/carrot-distribution payload. */
export function normalizeCarrotDistribution(data, requestedPeriod = "weekly") {
  if (!data || typeof data !== "object") {
    throw Object.assign(new Error("Invalid carrot distribution response."), {
      status: "CUSTOM_ERROR",
    });
  }

  const periodRaw =
    typeof data.period === "string" ? data.period.toLowerCase() : requestedPeriod;
  const period = GRAPH_PERIODS.includes(periodRaw) ? periodRaw : requestedPeriod;

  const items = Array.isArray(data.items)
    ? data.items.map(normalizeDistributionItem).filter(Boolean)
    : [];

  return { period, items };
}

function normalizeTopBundle(row) {
  if (!row || typeof row !== "object") return null;
  const name = typeof row.name === "string" ? row.name.trim() : "";
  if (!name) return null;

  const price =
    row.price === null || row.price === undefined || row.price === ""
      ? "—"
      : String(row.price);
  const sold = toFiniteNumber(row.sold);
  const sold_label =
    typeof row.sold_label === "string" && row.sold_label.trim()
      ? row.sold_label.trim()
      : sold !== null
        ? String(sold)
        : "—";
  const status_label =
    typeof row.status_label === "string" && row.status_label.trim()
      ? row.status_label.trim()
      : "—";

  return { name, price, sold, sold_label, status_label };
}

/** Normalize / validate GET /graph/v1/top-bundles payload. */
export function normalizeTopBundles(data, requestedPeriod = "weekly") {
  if (!data || typeof data !== "object") {
    throw Object.assign(new Error("Invalid top bundles response."), {
      status: "CUSTOM_ERROR",
    });
  }

  const periodRaw =
    typeof data.period === "string" ? data.period.toLowerCase() : requestedPeriod;
  const period = GRAPH_PERIODS.includes(periodRaw) ? periodRaw : requestedPeriod;

  const items = Array.isArray(data.items)
    ? data.items.map(normalizeTopBundle).filter(Boolean)
    : [];

  return { period, items };
}

export const graphApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /graph/v1/overview?period=weekly|monthly|yearly */
    getDashboardOverview: builder.query({
      query: ({ period = "weekly" } = {}) => ({
        url: "/graph/v1/overview",
        params: compact({
          period: GRAPH_PERIODS.includes(period) ? period : "weekly",
        }),
      }),
      transformResponse: (response, _meta, arg) =>
        normalizeDashboardOverview(
          response?.data ?? response,
          arg?.period || "weekly"
        ),
      providesTags: (_result, _err, arg) => [
        { type: "DashboardOverview", id: arg?.period || "weekly" },
      ],
    }),

    /** GET /graph/v1/prize-pool?period=weekly|monthly|yearly */
    getPrizePool: builder.query({
      query: ({ period = "weekly" } = {}) => ({
        url: "/graph/v1/prize-pool",
        params: compact({
          period: GRAPH_PERIODS.includes(period) ? period : "weekly",
        }),
      }),
      transformResponse: (response, _meta, arg) =>
        normalizePrizePool(response?.data ?? response, arg?.period || "weekly"),
      providesTags: (_result, _err, arg) => [
        { type: "PrizePool", id: arg?.period || "weekly" },
      ],
    }),

    /** GET /graph/v1/carrot-distribution?period=weekly|monthly|yearly */
    getCarrotDistribution: builder.query({
      query: ({ period = "weekly" } = {}) => ({
        url: "/graph/v1/carrot-distribution",
        params: compact({
          period: GRAPH_PERIODS.includes(period) ? period : "weekly",
        }),
      }),
      transformResponse: (response, _meta, arg) =>
        normalizeCarrotDistribution(
          response?.data ?? response,
          arg?.period || "weekly"
        ),
      providesTags: (_result, _err, arg) => [
        { type: "CarrotDistribution", id: arg?.period || "weekly" },
      ],
    }),

    /** GET /graph/v1/top-bundles?period=weekly|monthly|yearly */
    getTopBundles: builder.query({
      query: ({ period = "weekly" } = {}) => ({
        url: "/graph/v1/top-bundles",
        params: compact({
          period: GRAPH_PERIODS.includes(period) ? period : "weekly",
        }),
      }),
      transformResponse: (response, _meta, arg) =>
        normalizeTopBundles(response?.data ?? response, arg?.period || "weekly"),
      providesTags: (_result, _err, arg) => [
        { type: "TopBundles", id: arg?.period || "weekly" },
      ],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetPrizePoolQuery,
  useGetCarrotDistributionQuery,
  useGetTopBundlesQuery,
} = graphApi;
