import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, RefreshCw, User } from "lucide-react";
import AdminLayout from "./AdminLayout";
import DataTable from "./ui/DataTable";
import totalUsersIcon from "../assets/stat-total-users.png";
import activeGamesIcon from "../assets/stat-active-games.png";
import carrotIssuedIcon from "../assets/stat-carrot-issued.png";
import revenueIcon from "../assets/stat-revenue.png";
import { useGetAdminRecentRedemptionsQuery } from "../services/api/userRewardApi";
import { useListPaymentsQuery, calculateRevenue } from "../services/api/paymentApi";
import { getErrorMessage } from "../lib/apiHelpers";
import { colors } from "../theme";

const RECENT_LIMIT = 5;

// Total Users, Active Games, Carrot Issued: in ki API abhi nahi hai, static hain.
// Revenue ki value API se aati hai (neeche AdminDashboard mein).
const STATS = [
  {
    label: "Total Users",
    value: "1,284,502",
    icon: totalUsersIcon,
    accent: colors.primary,
    iconBg: colors.primaryBg10, // confirmed: colors.primaryBright @ 10%
    bars: [
      { h: 42, o: 0.2 },
      { h: 63, o: 0.2 },
      { h: 53, o: 0.4 },
      { h: 84, o: 0.6 },
      { h: 100, o: 1 },
    ],
  },
  {
    label: "Active Games",
    value: "42,910",
    icon: activeGamesIcon,
    accent: colors.accentSoft,
    iconBg: colors.accentBg20, // confirmed: colors.accentPrimary @ 20%
    bars: [
      { h: 35, o: 0.2 },
      { h: 59, o: 0.4 },
      { h: 82, o: 0.6 },
      { h: 47, o: 0.8 },
      { h: 100, o: 1 },
    ],
  },
  {
    label: "Carrot Issued",
    value: "2.1 M",
    icon: carrotIssuedIcon,
    accent: colors.chartPurple,
    iconBg: colors.chartPurpleBg, // not yet confirmed from Figma - placeholder
    bars: [
      { h: 56, o: 0.2 },
      { h: 89, o: 0.4 },
      { h: 44, o: 0.6 },
      { h: 100, o: 0.8 },
      { h: 83, o: 1 },
    ],
  },
  {
    label: "Revenue",
    value: "$0",
    icon: revenueIcon,
    accent: colors.dangerSoft,
    iconBg: colors.dangerSoftBg10, // not yet confirmed from Figma - placeholder
    bars: [
      { h: 100, o: 0.2 },
      { h: 57, o: 0.4 },
      { h: 86, o: 0.6 },
      { h: 43, o: 0.8 },
      { h: 71, o: 1 },
    ],
  },
];

const TOP_GAMES = [
  { name: "Snake", value: "14.2k", pct: 70, color: colors.accentSoft },
  { name: "8 Ball Pool", value: "11.6k", pct: 58, color: colors.accentSoft },
  { name: "Bingo Blitz", value: "9.3k", pct: 46, color: colors.primary },
  { name: "Star Blaster", value: "6.4k", pct: 32, color: colors.chartPurple },
];

const PLATFORM_BREAKDOWN = [
  { label: "iOS", pct: 45 },
  { label: "Android", pct: 25 },
  { label: "Web", pct: 15 },
  { label: "Other", pct: 15 },
];

const STATUS_STYLE = {
  PENDING: { bg: colors.warningBg20, color: colors.warning },
  Pending: { bg: colors.warningBg20, color: colors.warning },
  Processing: { bg: colors.processingBg, color: colors.dangerSoft },
  APPROVED: { bg: colors.successBg, color: colors.success },
  Approved: { bg: colors.successBg, color: colors.success },
  SHIPPED: { bg: colors.accentBg20, color: colors.accentPrimary },
  Shipped: { bg: colors.accentBg20, color: colors.accentPrimary },
  DELIVERED: { bg: colors.primaryBg20, color: colors.primaryBright },
  Delivered: { bg: colors.primaryBg20, color: colors.primaryBright },
  REJECTED: { bg: colors.dangerBg20, color: colors.danger },
  Rejected: { bg: colors.dangerBg20, color: colors.danger },
  Cancelled: { bg: colors.borderMuted, color: colors.textMuted },
};

const FALLBACK_STATUS_STYLE = { bg: colors.borderMuted, color: colors.textMuted };

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function resolveStatusLabel(item) {
  if (item?.status_label && typeof item.status_label === "string") {
    return item.status_label;
  }
  return "Unknown";
}

function AvatarImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
        style={{ backgroundColor: colors.buttonAlt, color: colors.primary }}
        aria-hidden
      >
        <User className="w-4 h-4" />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt || ""}
      className="w-8 h-8 rounded-full object-cover shrink-0"
      style={{ backgroundColor: colors.buttonAlt }}
      onError={() => setFailed(true)}
    />
  );
}

function formatRevenue(amount) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function StatCard({ label, value, icon, iconBg, bars, accent }) {
  return (
    <div
      className="rounded-xl pt-6 px-6 pb-12 h-[243px]"
      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: iconBg }}
      >
        <img src={icon} alt={label} className="w-5 h-5 object-contain" />
      </div>
      <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className="mb-3"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: "28px",
          lineHeight: "42px",
          color: colors.textPrimary,
        }}
      >
        {value}
      </p>
      <div className="flex items-end gap-1 h-[60px] pt-3">
        {bars.map((bar, i) => {
          const isDetailed = typeof bar === "object";
          const height = isDetailed ? bar.h : bar;
          const opacity = isDetailed
            ? bar.o
            : i === bars.length - 2
            ? 1
            : 0.33;
          return (
            <div
              key={i}
              className="flex-1"
              style={{
                height: `${height}%`,
                backgroundColor: accent,
                opacity,
                borderRadius: "2px 2px 0 0",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// pct    = number shown in the centre label (e.g. 45%)
// arcPct = how much of the circle the blue arc fills (Figma shows ~75%)
function DonutChart({ pct, arcPct = 75 }) {
  const size = 192;
  const center = size / 2;
  const strokeWidth = 8;

  // outer grey track: full 192px diameter
  const rOuter = (192 - strokeWidth) / 2;

  // inner blue arc: 176px diameter
  const rInner = (176 - strokeWidth) / 2;
  const circInner = 2 * Math.PI * rInner;
  const dashInner = (arcPct / 100) * circInner;

  const centerText = {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 400,
    fontSize: "14px",
    lineHeight: "21px",
    color: colors.textPrimary,
  };

  return (
    <div className="relative w-[192px] h-[192px] mx-auto">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={rOuter}
          fill="none"
          stroke={colors.indigoMuted}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={rInner}
          fill="none"
          stroke={colors.accentSoft}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashInner} ${circInner - dashInner}`}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p style={centerText}>iOS</p>
        <p style={centerText}>{pct}%</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const {
    data: payments,
    isLoading: paymentsLoading,
    isError: paymentsIsError,
  } = useListPaymentsQuery();

  const {
    data: recentItems,
    isLoading: recentLoading,
    isFetching: recentFetching,
    isError: recentIsError,
    error: recentError,
    refetch: refetchRecent,
  } = useGetAdminRecentRedemptionsQuery({ limit: RECENT_LIMIT });

  const revenueValue = useMemo(
    () => (payments ? calculateRevenue(payments) : 0),
    [payments]
  );

  const revenueLoading = paymentsLoading;
  const revenueError = paymentsIsError;

  const items = recentItems ?? [];
  const showRecentSkeleton = recentLoading && !recentItems;
  const showRecentHardError = recentIsError && !recentItems;
  const showRecentSoftError = recentIsError && Boolean(recentItems);
  const showRecentEmpty = !recentLoading && !recentIsError && recentItems && items.length === 0;
  const recentErrorMessage = recentIsError
    ? getErrorMessage(recentError, "Unable to load recent redemptions. Please try again.")
    : "";

  const revenueText = revenueLoading
    ? "..."
    : revenueError
      ? "--"
      : formatRevenue(revenueValue);
  const stats = STATS.map((s) => (s.label === "Revenue" ? { ...s, value: revenueText } : s));

  const recentColumns = useMemo(
    () => [
      {
        key: "user",
        header: "User",
        headerClassName: "pl-8",
        cellClassName: "pl-8",
        skeletonWidth: "70%",
        render: (r) => {
          const userName = r.user?.display_name || r.user?.username || "—";
          return (
            <div className="flex items-center gap-3 min-w-0">
              <AvatarImage src={r.user?.avatar?.image} alt={userName} />
              <div className="min-w-0 flex flex-col">
                <span
                  className="truncate"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "21px",
                    color: colors.textPrimary,
                  }}
                >
                  {userName}
                </span>
                {r.request_id && (
                  <span className="truncate text-[11px]" style={{ color: colors.textSecondary }}>
                    {r.request_id}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "reward",
        header: "Reward",
        cellClassName: "text-sm",
        cellStyle: { color: colors.textPrimary },
        skeletonWidth: "45%",
        render: (r) => r.reward?.name || "-",
      },
      {
        key: "carrots",
        header: "Carrots",
        cellClassName: "text-sm font-bold",
        cellStyle: { color: colors.textPrimary },
        skeletonWidth: "45%",
        render: (r) => {
          const carrots = Number(r.carrots ?? r.reward?.carrot ?? 0);
          return Number.isFinite(carrots) ? carrots.toLocaleString() : "-";
        },
      },
      {
        key: "status",
        header: "Status",
        skeletonWidth: "45%",
        render: (r) => {
          const statusLabel = resolveStatusLabel(r);
          const statusStyle = STATUS_STYLE[statusLabel] || FALLBACK_STATUS_STYLE;
          return (
            <span
              className="px-2 py-[2.5px] rounded text-[10px] font-bold uppercase"
              style={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                fontFamily: "'Montserrat', sans-serif",
                lineHeight: "15px",
                letterSpacing: "0px",
              }}
            >
              {String(statusLabel).toUpperCase()}
            </span>
          );
        },
      },
      {
        key: "date",
        header: "Date",
        headerClassName: "pr-8 text-right",
        cellClassName: "pr-8 text-right text-sm",
        cellStyle: { color: colors.textPrimary },
        align: "right",
        skeletonWidth: "45%",
        render: (r) => formatDate(r.created_at),
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-white/40 text-sm">
              Welcome back! Here's what's happening in Baazi today.
            </p>
          </div>
          <button
            className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-full hover:brightness-95 transition"
            style={{
              backgroundColor: colors.primary,
              color: colors.surfacePanel,
              boxShadow: `0px 0px 15px 0px ${colors.primaryGlow}`,
            }}
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="lg:col-span-2 rounded-xl pt-8 px-8 pb-24"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <h2
              className="mb-6"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: "18px",
                lineHeight: "24px",
                color: colors.textPrimary,
              }}
            >
              Top games by players
            </h2>
            <div className="flex flex-col gap-4">
              {TOP_GAMES.map((g) => (
                <div key={g.name} className="flex items-center gap-3">
                  <span className="text-white/60 text-xs w-24 shrink-0">{g.name}</span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.indigo }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${g.pct}%`, backgroundColor: g.color }}
                    />
                  </div>
                  <span
                    className="w-14 text-right shrink-0"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: colors.textPrimary,
                    }}
                  >
                    {g.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-8"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <h2
              className="mb-6"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: "18px",
                lineHeight: "24px",
                color: colors.textPrimary,
              }}
            >
              Platform breakdown
            </h2>
            <DonutChart pct={PLATFORM_BREAKDOWN[0].pct} arcPct={75} />
            <div className="flex flex-col gap-2 mt-8">
              {PLATFORM_BREAKDOWN.slice(1).map((seg) => (
                <div key={seg.label} className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: colors.textSecondary,
                    }}
                  >
                    {seg.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: colors.textPrimary,
                    }}
                  >
                    {seg.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center justify-between p-8">
            <div>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "24px",
                  color: colors.textPrimary,
                }}
              >
                Recent Redemptions
              </h2>
              <p
                className="mt-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: colors.textSecondary,
                }}
              >
                Latest withdrawal and prize claim requests
              </p>
            </div>

            <Link
              to="/admin/redemptions"
              className="hover:underline"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                color: colors.primary,
              }}
            >
              View All Redemptions
            </Link>
          </div>

          {showRecentSoftError && (
            <div
              className="mx-8 mb-4 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm"
              role="status"
              style={{
                color: colors.warning,
                backgroundColor: colors.warningBg10,
                border: `1px solid ${colors.warningBg25}`,
              }}
            >
              <span>Recent redemptions couldn’t refresh. Showing the last loaded results.</span>
              <button
                type="button"
                onClick={() => refetchRecent()}
                disabled={recentFetching}
                className="inline-flex items-center gap-2 font-bold hover:underline disabled:opacity-60 shrink-0"
                style={{ color: colors.warning }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${recentFetching ? "animate-spin" : ""}`} aria-hidden />
                {recentFetching ? "Refreshing…" : "Retry"}
              </button>
            </div>
          )}

          <div
            style={{
              opacity: recentFetching && recentItems && !recentIsError ? 0.85 : 1,
              transition: "opacity 160ms ease",
            }}
          >
            <DataTable
              scrollable={false}
              tableClassName="w-full table-fixed text-left"
              theadRowStyle={{
                backgroundColor: colors.surfaceElevated,
                height: "57px",
                borderBottom: `1px solid ${colors.border}`,
              }}
              colgroup={["28%", "25%", "18%", "15%", "14%"]}
              columns={recentColumns}
              data={showRecentHardError ? [] : items}
              isLoading={showRecentSkeleton}
              skeletonRows={RECENT_LIMIT}
              skeletonRowStyle={{ height: "65px" }}
              skeletonDivider={`1px solid ${colors.borderSubtle}`}
              isError={showRecentHardError}
              error={recentErrorMessage}
              errorTitle="Couldn’t load recent redemptions"
              onRetry={() => refetchRecent()}
              isRetrying={recentFetching}
              showEmpty={showRecentEmpty}
              emptyMessage="No recent redemptions yet."
              emptyClassName="pl-8 text-sm"
              emptyStyle={{ color: colors.textSecondary }}
              emptyRowStyle={{ height: "65px" }}
              divided="top"
              divider={`1px solid ${colors.borderSubtle}`}
              rowStyle={{ height: "65px" }}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}