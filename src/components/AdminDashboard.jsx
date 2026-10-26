import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import AdminLayout from "./AdminLayout";
import totalUsersIcon from "../assets/stat-total-users.png";
import activeGamesIcon from "../assets/stat-active-games.png";
import carrotIssuedIcon from "../assets/stat-carrot-issued.png";
import revenueIcon from "../assets/stat-revenue.png";
import {
  useListUserRewardsQuery,
  useLazyGetUserRewardQuery,
  USER_REWARD_STATUS,
} from "../services/api/userRewardApi";
import { useListPaymentsQuery, calculateRevenue } from "../services/api/paymentApi";
import { getErrorMessage } from "../lib/apiHelpers";

// Total Users, Active Games, Carrot Issued: in ki API abhi nahi hai, static hain.
// Revenue ki value API se aati hai (neeche AdminDashboard mein).
const STATS = [
  {
    label: "Total Users",
    value: "1,284,502",
    icon: totalUsersIcon,
    accent: "#DBE21C",
    iconBg: "#DBEE2A1A", // confirmed: #DBEE2A @ 10%
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
    accent: "#B4C5FF",
    iconBg: "#0053DB33", // confirmed: #0053DB @ 20%
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
    accent: "#DDB8FF",
    iconBg: "#DDB8FF22", // not yet confirmed from Figma - placeholder
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
    accent: "#FFB4AB",
    iconBg: "#FFB4AB22", // not yet confirmed from Figma - placeholder
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
  { name: "Snake", value: "14.2k", pct: 70, color: "#B4C5FF" },
  { name: "8 Ball Pool", value: "11.6k", pct: 58, color: "#B4C5FF" },
  { name: "Bingo Blitz", value: "9.3k", pct: 46, color: "#DBE21C" },
  { name: "Star Blaster", value: "6.4k", pct: 32, color: "#DDB8FF" },
];

const PLATFORM_BREAKDOWN = [
  { label: "iOS", pct: 45 },
  { label: "Android", pct: 25 },
  { label: "Web", pct: 15 },
  { label: "Other", pct: 15 },
];

// API ke status (Processing / Shipped / Delivered / Cancelled) ke liye colors
const STATUS_STYLE = {
  Processing: { bg: "rgba(147,0,10,0.2)", color: "#FFB4AB" },
  Delivered: { bg: "rgba(219,238,42,0.2)", color: "#DBEE2A" },
  Shipped: { bg: "rgba(0,83,219,0.2)", color: "#0053DB" },
  Cancelled: { bg: "rgba(255,255,255,0.1)", color: "#9CA3AF" },
};

const FALLBACK_STATUS_STYLE = { bg: "rgba(255,255,255,0.1)", color: "#9CA3AF" };

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatRevenue(amount) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function StatCard({ label, value, icon, iconBg, bars, accent }) {
  return (
    <div
      className="rounded-xl pt-6 px-6 pb-12 h-[243px]"
      style={{ backgroundColor: "#091E46", border: "1px solid rgba(59,130,246,0.22)" }}
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
          color: "#D0D0D0",
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
    color: "#D0D0D0",
  };

  return (
    <div className="relative w-[192px] h-[192px] mx-auto">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={rOuter}
          fill="none"
          stroke="#3D465F"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={rInner}
          fill="none"
          stroke="#B4C5FF"
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
    data: userRewardsData,
    isLoading: rewardsLoading,
    isError: rewardsIsError,
    error: rewardsError,
  } = useListUserRewardsQuery();
  const [fetchUserReward] = useLazyGetUserRewardQuery();

  const [redemptionItems, setRedemptionItems] = useState([]);
  const [enriching, setEnriching] = useState(false);

  const revenueValue = useMemo(
    () => (payments ? calculateRevenue(payments) : 0),
    [payments]
  );

  useEffect(() => {
    const rewards = userRewardsData?.rewards;
    if (!rewards) return undefined;

    let cancelled = false;
    setEnriching(true);

    async function enrich() {
      const latest = [...rewards]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      const items = await Promise.all(
        latest.map(async (r) => {
          try {
            const full = await fetchUserReward(r.id).unwrap();
            return { ...r, user: full?.user };
          } catch {
            return r;
          }
        })
      );

      if (!cancelled) {
        setRedemptionItems(items);
        setEnriching(false);
      }
    }

    enrich();
    return () => {
      cancelled = true;
    };
  }, [userRewardsData, fetchUserReward]);

  const displayRedemptionItems = userRewardsData?.rewards ? redemptionItems : [];

  const revenueLoading = paymentsLoading;
  const revenueError = paymentsIsError;
  const redemptionsLoading = rewardsLoading || enriching;
  const redemptionsError = rewardsIsError
    ? getErrorMessage(rewardsError, "Failed to load redemptions")
    : "";

  const revenueText = revenueLoading
    ? "..."
    : revenueError
      ? "--"
      : formatRevenue(revenueValue);
  const stats = STATS.map((s) => (s.label === "Revenue" ? { ...s, value: revenueText } : s));
  const redemptions = {
    loading: redemptionsLoading,
    error: redemptionsError,
    items: displayRedemptionItems,
  };

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
              backgroundColor: "#DBE21C",
              color: "#1F2544",
              boxShadow: "0px 0px 15px 0px rgba(221,238,42,0.15)",
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
            style={{ backgroundColor: "#091E46", border: "1px solid rgba(59,130,246,0.22)" }}
          >
            <h2
              className="mb-6"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: "18px",
                lineHeight: "24px",
                color: "#D0D0D0",
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
                    style={{ backgroundColor: "#334A74" }}
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
                      color: "#D0D0D0",
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
            style={{ backgroundColor: "#091E46", border: "1px solid rgba(59,130,246,0.22)" }}
          >
            <h2
              className="mb-6"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: "18px",
                lineHeight: "24px",
                color: "#D0D0D0",
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
                      color: "#6B7280",
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
                      color: "#D0D0D0",
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
          style={{ backgroundColor: "#091E46", border: "1px solid rgba(59,130,246,0.22)" }}
        >
          <div className="flex items-center justify-between p-8">
            <div>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "24px",
                  color: "#D0D0D0",
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
                  color: "#6B7280",
                }}
              >
                Latest withdrawal and prize claim requests
              </p>
            </div>

            <button
              type="button"
              className="hover:underline"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                color: "#DBE21C",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              View All Redemptions
            </button>
          </div>

          <table className="w-full table-fixed text-left">
            <colgroup>
              <col style={{ width: "28%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            <thead>
              <tr
                className="text-white/35 text-[11px] uppercase"
                style={{
                  backgroundColor: "#120D2A",
                  height: "57px",
                  borderBottom: "1px solid rgba(59,130,246,0.22)",
                }}
              >
                <th className="pl-8 font-medium">User</th>
                <th className="font-medium">Reward</th>
                <th className="font-medium">Carrots</th>
                <th className="font-medium">Status</th>
                <th className="pr-8 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.loading && (
                <tr style={{ height: "65px" }}>
                  <td colSpan={5} className="pl-8 text-sm" style={{ color: "#6B7280" }}>
                    Loading redemptions...
                  </td>
                </tr>
              )}

              {!redemptions.loading && redemptions.error && (
                <tr style={{ height: "65px" }}>
                  <td colSpan={5} className="pl-8 text-sm" style={{ color: "#FFB4AB" }}>
                    {redemptions.error}
                  </td>
                </tr>
              )}

              {!redemptions.loading && !redemptions.error && redemptions.items.length === 0 && (
                <tr style={{ height: "65px" }}>
                  <td colSpan={5} className="pl-8 text-sm" style={{ color: "#6B7280" }}>
                    No redemptions yet.
                  </td>
                </tr>
              )}

              {redemptions.items.map((r, i) => {
                const statusLabel = USER_REWARD_STATUS[r.status] || "Unknown";
                const statusStyle = STATUS_STYLE[statusLabel] || FALLBACK_STATUS_STYLE;
                const userName =
                  r.user?.display_name || r.user?.username || `User #${r.user_id}`;

                return (
                  <tr
                    key={r.id}
                    style={{
                      height: "65px",
                      borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <td className="pl-8">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: "#1F2C73" }}
                        />
                        <span
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 400,
                            fontSize: "14px",
                            lineHeight: "21px",
                            color: "#D0D0D0",
                          }}
                        >
                          {userName}
                        </span>
                      </div>
                    </td>
                    <td className="text-sm" style={{ color: "#D0D0D0" }}>
                      {r.reward?.name || "-"}
                    </td>
                    <td className="text-sm font-bold" style={{ color: "#D0D0D0" }}>
                      {Number(r.reward?.carrot || 0).toLocaleString()}
                    </td>
                    <td>
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
                        {statusLabel.toUpperCase()}
                      </span>
                    </td>
                    <td className="pr-8 text-right text-sm" style={{ color: "#D0D0D0" }}>
                      {formatDate(r.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}