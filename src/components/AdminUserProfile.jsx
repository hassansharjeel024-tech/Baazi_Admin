import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Mail,
  Calendar,
  MapPin,
  Ban,
  KeyRound,
  Hash,
  Circle,
  ShoppingBag,
  Trophy,
  Gift,
  ArrowLeftRight,
  Zap,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Coins,
  RefreshCw,
  User,
  AtSign,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import DataTable from "./ui/DataTable";
import { colors } from "../theme";
import {
  ADMIN_USER_PERIODS,
  useGetAdminUserQuery,
  useGetAdminUserTransactionsQuery,
  useGetAdminUserTasksXpQuery,
  useGetAdminUserRedemptionsQuery,
  useGetAdminUserReferralsQuery,
} from "../services/api/adminUserApi";
import { getErrorMessage } from "../lib/apiHelpers";

const BASE = colors.surface;
const BORDER = colors.border;
const LIME = colors.primary;
const BTN_BG = colors.buttonGhost;
const HEADER_BG = colors.surfaceElevated;
const FONT = "'Montserrat', sans-serif";

const cardStyle = {
  backgroundColor: BASE,
  border: `1px solid ${BORDER}`,
};

const PANEL_HEADER_BG = colors.surfaceElevated;
const PANEL_HEADER_BORDER = colors.borderDark;
const ROW_BORDER = colors.accentSoftBg;

const PAGE_SIZE = 10;
const EMPTY_ITEMS = [];

const PERIOD_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const TABS = [
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "tasks", label: "Tasks & XP", icon: Zap },
  { id: "redemptions", label: "Redemptions", icon: Gift },
  { id: "referrals", label: "Referrals", icon: Hash },
];

function formatCount(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return Math.trunc(n).toLocaleString("en-US");
}

function formatPlayerId(playerId) {
  if (playerId === null || playerId === undefined || playerId === "") return "—";
  const raw = String(playerId);
  return raw.startsWith("#") ? raw : `#${raw}`;
}

function formatJoinedDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  return `Joined ${label}`;
}

function formatLastSeen(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `Last seen ${d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLevel(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value).toUpperCase();
  return `LEVEL ${Math.trunc(n)}`;
}

function displayText(value, fallback = "—") {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

function pickField(row, keys, fallback = "") {
  if (!row || typeof row !== "object") return fallback;
  for (const key of keys) {
    const value = row[key];
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && !value.trim()) continue;
    return value;
  }
  return fallback;
}

function buildPageNumbers(current, total) {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(1, Math.min(current - 2, total - 4));
  return Array.from({ length: 5 }, (_, i) => start + i);
}

function activityIconMeta(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("redeem") || t.includes("gift") || t.includes("claim")) {
    return { Icon: Gift, iconColor: colors.dangerSoft, iconBg: colors.dangerSoftBg10, iconSize: 20 };
  }
  if (t.includes("task") || t.includes("xp") || t.includes("trophy") || t.includes("reward")) {
    return { Icon: Trophy, iconColor: colors.accentSoft, iconBg: colors.accentBg10, iconSize: 18 };
  }
  if (t.includes("purchase") || t.includes("buy") || t.includes("pack") || t.includes("payment")) {
    return { Icon: ShoppingBag, iconColor: colors.primaryBright, iconBg: colors.oliveBg10, iconSize: 18 };
  }
  return { Icon: Receipt, iconColor: colors.primaryBright, iconBg: colors.oliveBg10, iconSize: 18 };
}

function isNegativeAmount(label, type) {
  const raw = String(label || "");
  if (raw.trim().startsWith("-")) return true;
  const t = String(type || "").toLowerCase();
  return t.includes("debit") || t.includes("spend") || t.includes("redeem") || t.includes("withdraw");
}

function mapFeedItem(row, index, defaults = {}) {
  const title = displayText(
    pickField(row, ["title", "name", "reward_name", "task_name", "label"], ""),
    defaults.title || "Activity"
  );
  const subtitleParts = [
    pickField(row, ["subtitle", "description", "detail", "game_name", "request_id"], ""),
    row?.created_at || row?.date ? formatDate(row.created_at || row.date) : "",
  ].filter(Boolean);
  const subtitle = subtitleParts.length
    ? subtitleParts.join(" · ")
    : displayText(defaults.subtitle, "—");

  const amountLabel = displayText(
    pickField(row, ["amount_label", "amount", "xp_label", "carrot_label", "carrots"], ""),
    "—"
  );
  const currency = displayText(
    pickField(row, ["currency", "unit", "amount_unit"], ""),
    defaults.currency || ""
  );
  const type = pickField(row, ["type", "activity_type", "kind"], defaults.type || "");
  const statusLabel = pickField(row, ["status_label", "status"], "");

  return {
    key: row?.id ?? row?.transaction_id ?? row?.request_id ?? `${title}-${index}`,
    title,
    subtitle: statusLabel
      ? `${subtitle === "—" ? "" : `${subtitle} · `}${statusLabel}`
      : subtitle,
    amountLabel,
    currency,
    type,
    ...activityIconMeta(type || defaults.type),
    negative: isNegativeAmount(amountLabel, type),
  };
}

function PeriodSelect({ value, onChange, disabled }) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Activity period"
        className="appearance-none h-10 pl-3 pr-9 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-bright disabled:opacity-60"
        style={{
          backgroundColor: BTN_BG,
          border: `1px solid ${BORDER}`,
          color: colors.white,
        }}
      >
        {PERIOD_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: colors.textSecondary }}
      />
    </div>
  );
}

function ProfileAvatar({ src, alt, size = 96 }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const dim = { width: size, height: size };
  const showFallback = !src || failedSrc === src;

  if (showFallback) {
    return (
      <span
        className="rounded-full flex items-center justify-center shrink-0"
        style={{
          ...dim,
          backgroundColor: colors.borderDark,
          border: `1px solid ${BORDER}`,
          color: LIME,
        }}
        aria-hidden
      >
        <User size={Math.round(size * 0.4)} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ""}
      className="rounded-full object-cover shrink-0"
      style={dim}
      onError={() => setFailedSrc(src)}
    />
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className="rounded-xl p-6 mb-6" style={cardStyle}>
        <div className="flex items-start gap-4">
          <div
            className="rounded-full animate-pulse shrink-0"
            style={{ width: 96, height: 96, backgroundColor: colors.skeleton }}
          />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-48 rounded animate-pulse" style={{ backgroundColor: colors.skeleton }} />
            <div className="h-4 w-72 rounded animate-pulse" style={{ backgroundColor: colors.skeleton }} />
            <div className="h-4 w-56 rounded animate-pulse" style={{ backgroundColor: colors.skeleton }} />
            <div className="flex gap-2 mt-2">
              <div className="h-6 w-16 rounded-full animate-pulse" style={{ backgroundColor: colors.skeleton }} />
              <div className="h-6 w-20 rounded-full animate-pulse" style={{ backgroundColor: colors.skeleton }} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl p-5" style={cardStyle}>
            <div className="h-3 w-28 rounded animate-pulse mb-3" style={{ backgroundColor: colors.skeleton }} />
            <div className="h-12 w-24 rounded animate-pulse" style={{ backgroundColor: colors.skeleton }} />
          </div>
        ))}
      </div>
    </>
  );
}

function FeedSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl p-4"
          style={{ border: `1px solid ${ROW_BORDER}` }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-12 h-12 rounded-lg animate-pulse shrink-0"
              style={{ backgroundColor: colors.skeleton }}
            />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 rounded animate-pulse" style={{ backgroundColor: colors.skeleton }} />
              <div className="h-3 w-64 rounded animate-pulse" style={{ backgroundColor: colors.skeleton }} />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-6 w-16 rounded animate-pulse ml-auto" style={{ backgroundColor: colors.skeleton }} />
            <div className="h-3 w-12 rounded animate-pulse ml-auto" style={{ backgroundColor: colors.skeleton }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityPagination({
  page,
  totalPages,
  total,
  limit,
  noun,
  onPageChange,
  disabled,
}) {
  const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const from = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const to = total === 0 ? 0 : Math.min(safePage * limit, total);
  const pageNumbers = buildPageNumbers(safePage, totalPages);

  return (
    <div
      className="flex items-center justify-between mt-5 -mx-5 -mb-5 py-6 px-8 flex-wrap gap-3"
      style={{
        backgroundColor: PANEL_HEADER_BG,
        borderTop: `1px solid ${PANEL_HEADER_BORDER}`,
      }}
    >
      <p className="text-sm text-gray-400">
        {total > 0
          ? `Showing ${from}-${to} of ${total.toLocaleString("en-US")} ${noun}`
          : `No ${noun}`}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={disabled || safePage <= 1}
          className="w-10 h-10 rounded-md flex items-center justify-center disabled:opacity-40"
          style={{ color: colors.textSecondary }}
          aria-label="Previous page"
        >
          <ChevronLeft size={12} />
        </button>
        {pageNumbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            disabled={disabled}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium disabled:opacity-40"
            style={
              n === safePage
                ? { backgroundColor: LIME, color: colors.backgroundDarkest }
                : { color: colors.textMuted, border: `1px solid ${colors.borderDark}` }
            }
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={disabled || safePage >= totalPages || total === 0}
          className="w-10 h-10 rounded-md flex items-center justify-center disabled:opacity-40"
          style={{ color: colors.textSecondary }}
          aria-label="Next page"
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function ActivityError({ title, message, onRetry, isRetrying }) {
  return (
    <div className="rounded-xl px-5 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ border: `1px solid ${BORDER}` }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: colors.dangerSoft }}>
          {title}
        </p>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-bold transition hover:brightness-110 disabled:opacity-60 shrink-0"
        style={{ backgroundColor: colors.button, color: colors.white }}
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} aria-hidden />
        {isRetrying ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}

function SoftErrorBanner({ message, onRetry, isRetrying }) {
  return (
    <div
      className="mb-4 rounded-lg px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      style={{
        color: colors.warning,
        backgroundColor: colors.warningBg10,
        border: `1px solid ${colors.warningBg25}`,
      }}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center gap-2 font-bold hover:underline disabled:opacity-60 shrink-0"
        style={{ color: colors.warning }}
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} aria-hidden />
        {isRetrying ? "Refreshing…" : "Retry"}
      </button>
    </div>
  );
}

function ActivityFeedList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = item.Icon;
        return (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-xl p-4 gap-4"
            style={{ border: `1px solid ${ROW_BORDER}` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: item.iconBg }}
              >
                <Icon size={item.iconSize} style={{ color: item.iconColor }} />
              </div>
              <div className="min-w-0">
                <p
                  style={{
                    fontFamily: FONT,
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: colors.textPrimary,
                  }}
                  className="truncate"
                >
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{item.subtitle}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p
                style={{
                  fontFamily: FONT,
                  fontWeight: 500,
                  fontSize: "24px",
                  lineHeight: "36px",
                  textAlign: "right",
                  color: item.negative ? colors.dangerSoft : colors.primary,
                }}
              >
                {item.amountLabel}
              </p>
              {item.currency ? (
                <p
                  style={{
                    fontFamily: FONT,
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "24px",
                    letterSpacing: "-0.8px",
                    textAlign: "right",
                    textTransform: "uppercase",
                    color: colors.textSecondary,
                  }}
                >
                  {item.currency}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function matchesRoute(profile, routeId) {
  if (!profile || !routeId) return false;
  const candidates = [profile.player_id, profile.id]
    .filter((v) => v !== null && v !== undefined && v !== "")
    .map((v) => String(v).replace(/^#/, ""));
  const target = String(routeId).replace(/^#/, "");
  return candidates.includes(target);
}

export default function AdminUserProfile() {
  const { id: routeId } = useParams();
  const userId = routeId ? String(routeId).replace(/^#/, "") : "";

  const [activeTab, setActiveTab] = useState("transactions");
  const [period, setPeriod] = useState("weekly");
  const [page, setPage] = useState(1);
  const [syncedUserId, setSyncedUserId] = useState(userId);

  if (syncedUserId !== userId) {
    setSyncedUserId(userId);
    setPage(1);
    setActiveTab("transactions");
    setPeriod("weekly");
  }

  const safePeriod = ADMIN_USER_PERIODS.includes(period) ? period : "weekly";

  function handleTabChange(nextTab) {
    setActiveTab(nextTab);
    setPage(1);
  }

  function handlePeriodChange(nextPeriod) {
    setPeriod(nextPeriod);
    setPage(1);
  }

  const {
    data,
    currentData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAdminUserQuery(userId, {
    skip: !userId,
  });

  const profile = currentData ?? (data && matchesRoute(data, userId) ? data : undefined);

  const showSkeleton = Boolean(userId) && (isLoading || (isFetching && !profile));
  const showHardError = Boolean(userId) && isError && !profile;
  const showSoftError = Boolean(userId) && isError && Boolean(profile);
  const errorMessage = isError
    ? getErrorMessage(error, "Unable to load this player profile. Please try again.")
    : "";

  const activityArgs = useMemo(
    () => ({
      id: userId,
      period: safePeriod,
      page,
      limit: PAGE_SIZE,
    }),
    [userId, safePeriod, page]
  );

  const txQuery = useGetAdminUserTransactionsQuery(activityArgs, {
    skip: !userId || activeTab !== "transactions",
  });
  const tasksQuery = useGetAdminUserTasksXpQuery(activityArgs, {
    skip: !userId || activeTab !== "tasks",
  });
  const redemptionsQuery = useGetAdminUserRedemptionsQuery(activityArgs, {
    skip: !userId || activeTab !== "redemptions",
  });
  const referralsQuery = useGetAdminUserReferralsQuery(activityArgs, {
    skip: !userId || activeTab !== "referrals",
  });

  const activeQuery =
    activeTab === "transactions"
      ? txQuery
      : activeTab === "tasks"
        ? tasksQuery
        : activeTab === "redemptions"
          ? redemptionsQuery
          : referralsQuery;

  const activityPayload = activeQuery.currentData;
  const activityItems = activityPayload?.items ?? EMPTY_ITEMS;
  const activityMeta = activityPayload?.meta;
  const activityTotal = activityMeta?.total ?? 0;
  const activityLimit = activityMeta?.limit || PAGE_SIZE;
  const activityPages = Math.max(1, activityMeta?.pages || 1);
  const activitySafePage = Math.min(
    Math.max(1, activityMeta?.page || page),
    activityPages
  );

  const showActivitySkeleton =
    Boolean(userId) &&
    (activeQuery.isLoading || (activeQuery.isFetching && !activityPayload));
  const showActivityHardError =
    Boolean(userId) && activeQuery.isError && !activityPayload;
  const showActivitySoftError =
    Boolean(userId) && activeQuery.isError && Boolean(activityPayload);
  const showActivityEmpty =
    Boolean(userId) &&
    !showActivitySkeleton &&
    !showActivityHardError &&
    activityItems.length === 0;
  const activityErrorMessage = activeQuery.isError
    ? getErrorMessage(activeQuery.error, "Unable to load this activity. Please try again.")
    : "";

  const feedItems = useMemo(() => {
    if (activeTab === "referrals") return [];
    const defaults =
      activeTab === "tasks"
        ? { type: "task", currency: "XP" }
        : activeTab === "redemptions"
          ? { type: "redemption", currency: "CARROTS" }
          : { type: "transaction" };
    return activityItems.map((row, i) => mapFeedItem(row, i, defaults));
  }, [activeTab, activityItems]);

  const referralColumns = useMemo(
    () => [
      {
        key: "player",
        header: "Player",
        headerClassName: "px-5 py-4",
        cellClassName: "px-5 py-4",
        skeletonWidth: 180,
        render: (u) => {
          const name = displayText(u.display_name || u.username, "Player");
          return (
            <div className="flex items-center gap-3 min-w-0">
              <ProfileAvatar src={u.avatar?.image} alt={name} size={40} />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: colors.white }}>
                  {name}
                </p>
                <p className="text-xs truncate" style={{ color: colors.textSecondary }}>
                  {formatPlayerId(u.player_id ?? u.id)}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: "email",
        header: "Email",
        headerClassName: "px-5 py-4",
        cellClassName: "px-5 py-4",
        skeletonWidth: 160,
        render: (u) => (
          <span className="text-sm" style={{ color: colors.textSecondary }}>
            {displayText(u.email)}
          </span>
        ),
      },
      {
        key: "level",
        header: "Level",
        headerClassName: "px-5 py-4",
        cellClassName: "px-5 py-4",
        skeletonWidth: 70,
        render: (u) => (
          <span className="text-sm" style={{ color: colors.textLight }}>
            {formatLevel(u.level)}
          </span>
        ),
      },
      {
        key: "carrot",
        header: "Carrots",
        headerClassName: "px-5 py-4",
        cellClassName: "px-5 py-4",
        skeletonWidth: 80,
        render: (u) => (
          <span className="text-sm font-medium" style={{ color: colors.primary }}>
            {formatCount(u.carrot)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        headerClassName: "px-5 py-4",
        cellClassName: "px-5 py-4",
        skeletonWidth: 80,
        render: (u) => {
          const label = displayText(u.status_label, "Unknown");
          const banned =
            String(label).toLowerCase() === "banned" ||
            String(label).toLowerCase() === "inactive";
          return (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium uppercase"
              style={
                banned
                  ? {
                      color: colors.dangerBanned,
                      backgroundColor: colors.dangerBannedBg,
                      border: `1px solid ${colors.dangerBorder}`,
                    }
                  : {
                      color: colors.primaryBright,
                      backgroundColor: colors.primaryBg20,
                      border: `1px solid ${colors.primaryBg30}`,
                    }
              }
            >
              {label}
            </span>
          );
        },
      },
      {
        key: "joined",
        header: "Joined",
        headerClassName: "px-5 py-4",
        cellClassName: "px-5 py-4",
        skeletonWidth: 90,
        render: (u) => (
          <span className="text-sm" style={{ color: colors.textSecondary }}>
            {formatJoinedDate(u.joined_at)}
          </span>
        ),
      },
    ],
    []
  );

  const displayName = displayText(
    profile?.display_name || profile?.username,
    "Player"
  );

  const statusLabel = displayText(profile?.status_label, "Unknown");
  const isBanned =
    String(statusLabel).toLowerCase() === "banned" ||
    String(statusLabel).toLowerCase() === "inactive";

  const statCards = useMemo(() => {
    if (!profile) return [];
    return [
      {
        label: "CARROT BALANCE",
        value: formatCount(profile.carrot),
        icon: Receipt,
        valueColor: colors.textLight,
      },
      {
        label: "COINS",
        value: formatCount(profile.coin),
        icon: Coins,
        valueColor: colors.primary,
      },
      {
        label: "TOTAL XP",
        value: formatCount(profile.total_xp),
        icon: Zap,
        valueColor: colors.accentSoft,
      },
      {
        label: "TOTAL TRANSACTIONS",
        value: formatCount(profile.total_transactions),
        icon: ArrowLeftRight,
        valueColor: colors.violetGlow,
      },
    ];
  }, [profile]);

  const activityNoun =
    activeTab === "transactions"
      ? "transactions"
      : activeTab === "tasks"
        ? "tasks"
        : activeTab === "redemptions"
          ? "redemptions"
          : "referrals";

  if (!userId) {
    return (
      <AdminLayout>
        <div className="rounded-xl p-6" style={cardStyle}>
          <p className="text-sm font-semibold" style={{ color: colors.dangerSoft }}>
            Missing player ID
          </p>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Open a player from the Users list to view their profile.
          </p>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 mt-4 text-sm font-bold hover:underline"
            style={{ color: LIME }}
          >
            <ChevronLeft size={16} />
            Back to Users
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1 text-sm mb-2 hover:underline"
            style={{ color: colors.textSecondary }}
          >
            <ChevronLeft size={14} />
            Users
          </Link>
          <h1 className="text-[32px] leading-[40px] font-bold" style={{ color: colors.textPrimary }}>
            {showSkeleton ? "Loading profile…" : `${displayName} - User Profile`}
          </h1>
          <p className="text-base leading-6 mt-1 max-w-xl" style={{ color: colors.textPrimary }}>
            Manage player accounts, monitor carrot balances, and oversee platform integrity
            with administrative controls.
          </p>
        </div>
      </div>

      {showSoftError && (
        <SoftErrorBanner
          message="Profile couldn’t refresh. Showing the last loaded results."
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}

      {showHardError && (
        <div className="mb-6">
          <ActivityError
            title="Couldn’t load player profile"
            message={errorMessage}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </div>
      )}

      {showSkeleton && <ProfileSkeleton />}

      {!showSkeleton && !showHardError && profile && (
        <>
          <div
            className="rounded-xl p-6 mb-6"
            style={{
              ...cardStyle,
              opacity: isFetching ? 0.9 : 1,
              transition: "opacity 160ms ease",
            }}
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <ProfileAvatar
                    src={profile.avatar?.image}
                    alt={displayName}
                    size={96}
                  />
                </div>
                <div>
                  <p className="text-base leading-6 font-normal" style={{ color: colors.white }}>
                    {displayName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    {formatPlayerId(profile.player_id ?? profile.id ?? userId)}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                    {profile.username && (
                      <span className="flex items-center gap-1.5">
                        <AtSign size={14} />
                        {displayText(profile.username)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} />
                      {displayText(profile.email)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatJoinedDate(profile.joined_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {displayText(profile.country)}
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 mt-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium uppercase"
                      style={
                        isBanned
                          ? {
                              color: colors.dangerBanned,
                              backgroundColor: colors.dangerBannedBg,
                              border: `1px solid ${colors.dangerBorder}`,
                            }
                          : {
                              color: colors.primaryBright,
                              backgroundColor: colors.primaryBg20,
                              border: `1px solid ${colors.primaryBg30}`,
                            }
                      }
                    >
                      {statusLabel}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: colors.accentPrimary }}
                    >
                      {formatLevel(profile.level)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Circle size={6} fill="currentColor" />
                      {formatLastSeen(profile.last_seen_at)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Hash size={12} />
                      {profile.referral_code
                        ? `Ref: ${profile.referral_code}`
                        : "Ref: —"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg text-sm font-medium hover:brightness-125 transition w-[116px] whitespace-nowrap"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${colors.dangerSoft}`,
                    color: colors.dangerSoft,
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    paddingLeft: "38.39px",
                    paddingRight: "38.39px",
                  }}
                >
                  <Ban size={16} />
                  Ban user
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white hover:brightness-110 transition w-[150px]"
                  style={{
                    backgroundColor: colors.accentPrimary,
                    border: `1px solid ${colors.accentPrimary}`,
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    paddingLeft: "44.02px",
                    paddingRight: "44.02px",
                  }}
                >
                  <KeyRound size={16} />
                  Reset Password
                </button>
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            style={{
              opacity: isFetching ? 0.9 : 1,
              transition: "opacity 160ms ease",
            }}
          >
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-xl p-5" style={cardStyle}>
                  <div className="flex items-center gap-2 text-xs text-gray-400 tracking-wide mb-2">
                    <Icon size={14} />
                    {card.label}
                  </div>
                  <p
                    className="text-[48px] leading-[56px] font-extrabold"
                    style={{
                      color: card.valueColor || colors.white,
                      letterSpacing: "-0.96px",
                    }}
                  >
                    {card.value}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Activity tabs */}
      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <div
          className="flex items-center justify-between gap-3 py-6 px-8 flex-wrap"
          style={{
            backgroundColor: PANEL_HEADER_BG,
            borderBottom: `1px solid ${PANEL_HEADER_BORDER}`,
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabChange(id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md transition"
                  style={{
                    backgroundColor: active ? colors.primaryBg15 : "transparent",
                    fontFamily: FONT,
                    fontWeight: active ? 700 : 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: active ? LIME : colors.textSecondary,
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>
          <PeriodSelect
            value={safePeriod}
            onChange={handlePeriodChange}
            disabled={showActivitySkeleton && !activityPayload}
          />
        </div>

        <div className="p-5">
          {showActivitySoftError && (
            <SoftErrorBanner
              message={`${TABS.find((t) => t.id === activeTab)?.label || "Activity"} couldn’t refresh. Showing the last loaded results.`}
              onRetry={() => activeQuery.refetch()}
              isRetrying={activeQuery.isFetching}
            />
          )}

          {showActivityHardError && (
            <ActivityError
              title={`Couldn’t load ${activityNoun}`}
              message={activityErrorMessage}
              onRetry={() => activeQuery.refetch()}
              isRetrying={activeQuery.isFetching}
            />
          )}

          {showActivitySkeleton && activeTab !== "referrals" && <FeedSkeleton />}

          {showActivitySkeleton && activeTab === "referrals" && (
            <DataTable
              tableClassName="w-full text-left text-sm min-w-[800px]"
              theadRowStyle={{
                backgroundColor: HEADER_BG,
                borderBottom: `1px solid ${BORDER}`,
              }}
              columns={referralColumns}
              data={[]}
              getRowKey={(_, i) => i}
              isLoading
              skeletonRows={PAGE_SIZE}
              skeletonRowClassName="h-[64px]"
              skeletonDivider={`1px solid ${colors.borderSubtle}`}
              divided="top"
              divider={`1px solid ${colors.borderSubtle}`}
            />
          )}

          {!showActivitySkeleton && !showActivityHardError && showActivityEmpty && (
            <div className="py-12 text-center text-sm" style={{ color: colors.textSecondary }}>
              No {activityNoun} for this period.
            </div>
          )}

          {!showActivitySkeleton &&
            !showActivityHardError &&
            !showActivityEmpty &&
            activeTab !== "referrals" && (
              <div
                style={{
                  opacity: activeQuery.isFetching ? 0.9 : 1,
                  transition: "opacity 160ms ease",
                }}
              >
                <ActivityFeedList items={feedItems} />
              </div>
            )}

          {!showActivitySkeleton &&
            !showActivityHardError &&
            !showActivityEmpty &&
            activeTab === "referrals" && (
              <div
                style={{
                  opacity: activeQuery.isFetching ? 0.9 : 1,
                  transition: "opacity 160ms ease",
                }}
              >
                <DataTable
                  tableClassName="w-full text-left text-sm min-w-[800px]"
                  theadRowStyle={{
                    backgroundColor: HEADER_BG,
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                  columns={referralColumns}
                  data={activityItems}
                  getRowKey={(u, i) => u.player_id ?? u.id ?? i}
                  divided="top"
                  divider={`1px solid ${colors.borderSubtle}`}
                />
              </div>
            )}

          {!showActivityHardError && activityPayload && (
            <ActivityPagination
              page={activitySafePage}
              totalPages={activityPages}
              total={activityTotal}
              limit={activityLimit}
              noun={activityNoun}
              onPageChange={setPage}
              disabled={showActivitySkeleton}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
