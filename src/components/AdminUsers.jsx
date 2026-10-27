import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Eye,
  User,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Search,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import DataTable from "./ui/DataTable";
import { colors } from "../theme";
import {
  useGetAdminUserStatsQuery,
  useListAdminUsersQuery,
  useExportAdminUsersCsvMutation,
  ADMIN_USER_STATUS,
} from "../services/api/adminUserApi";
import { downloadBlob, getErrorMessage } from "../lib/apiHelpers";

const BASE = colors.surface;
const BORDER = colors.border;
const LIME = colors.primary;
const MUTED = colors.textSubtle;
const BTN_BG = colors.buttonGhost;
const BANNED_TINT = colors.dangerBannedBg;
const ROW_BANNED = colors.dangerRowBg;
const HEADER_BG = colors.surfaceElevated;
const TEXT_PRIMARY = colors.textPrimary;
const REGISTRY_GREY = colors.textSecondary;
const LIME_PILL = colors.primaryBright;
const LEVEL_TEXT = colors.textLight;

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const PERIOD_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const STATUS_FILTER_OPTIONS = [
  { value: String(ADMIN_USER_STATUS.ALL), label: "All Statuses" },
  { value: String(ADMIN_USER_STATUS.ACTIVE), label: "Active" },
  { value: String(ADMIN_USER_STATUS.BANNED), label: "Banned" },
];

const PERIOD_GROWTH_LABEL = {
  weekly: "this week",
  monthly: "this month",
  yearly: "this year",
};

const STATUS_STYLE = {
  Active: { color: LIME_PILL, border: colors.primaryBg20, bg: colors.primaryBg10 },
  Banned: { color: colors.dangerBanned, border: colors.dangerBorder, bg: BANNED_TINT },
  Inactive: { color: colors.dangerBanned, border: colors.dangerBorder, bg: BANNED_TINT },
};

const FALLBACK_STATUS_STYLE = {
  color: colors.textMuted,
  border: colors.borderMuted,
  bg: colors.mutedBg,
};

function formatCount(value) {
  if (value === null || value === undefined) return "—";
  return Math.trunc(value).toLocaleString("en-US");
}

function formatCarrots(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return Math.trunc(n).toLocaleString("en-US");
}

function formatJoined(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  return `Joined ${label}`;
}

function formatPlayerId(playerId) {
  if (playerId === null || playerId === undefined || playerId === "") return "—";
  const raw = String(playerId);
  return raw.startsWith("#") ? raw : `#${raw}`;
}

function resolveStatusLabel(user) {
  if (user?.status_label && typeof user.status_label === "string") {
    return user.status_label;
  }
  if (Number(user?.status) === ADMIN_USER_STATUS.BANNED) return "Banned";
  if (Number(user?.status) === ADMIN_USER_STATUS.ACTIVE) return "Active";
  return "Unknown";
}

function isBannedStatus(label) {
  const s = String(label || "").toLowerCase();
  return s === "banned" || s === "inactive";
}

function formatGrowthNote(growth, period) {
  const span = PERIOD_GROWTH_LABEL[period] || "this period";
  if (growth === null || growth === undefined) {
    return { note: `Growth unavailable for ${span}`, trend: false, noteColor: MUTED };
  }

  const rounded = Number(growth.toFixed(2));
  const sign = rounded > 0 ? "+" : "";
  const note = `${sign}${rounded}% ${span}`;

  if (rounded > 0) {
    return { note, trend: "up", noteColor: colors.successSoft };
  }
  if (rounded < 0) {
    return { note, trend: "down", noteColor: colors.dangerBright };
  }
  return { note, trend: false, noteColor: MUTED };
}

function SelectField({ value, onChange, options, disabled, ariaLabel }) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
        className="appearance-none h-[46px] pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-bright disabled:opacity-60"
        style={{
          backgroundColor: BTN_BG,
          border: `1px solid ${BORDER}`,
          color: colors.white,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: colors.white }}
        aria-hidden
      />
    </div>
  );
}

function AvatarImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        className="w-7 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          backgroundColor: colors.borderDark,
          border: `1px solid ${BORDER}`,
          color: LIME,
        }}
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
      className="w-7 h-8 rounded-lg object-cover shrink-0"
      style={{ backgroundColor: colors.borderDark, border: `1px solid ${BORDER}` }}
      onError={() => setFailed(true)}
    />
  );
}

function StatCard({ label, value, note, noteColor, valueColor, trend }) {
  return (
    <div
      className="rounded-xl pt-6 px-6 pb-7"
      style={{ backgroundColor: BASE, border: `1px solid ${BORDER}` }}
    >
      <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-3xl font-extrabold mb-1" style={{ color: valueColor }}>
        {value}
      </p>
      <p className="text-xs flex items-center gap-1" style={{ color: noteColor || MUTED }}>
        {trend === "up" && <TrendingUp className="w-3 h-3" aria-hidden />}
        {trend === "down" && <TrendingDown className="w-3 h-3" aria-hidden />}
        {note}
      </p>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div
      className="rounded-xl pt-6 px-6 pb-7"
      style={{ backgroundColor: BASE, border: `1px solid ${BORDER}` }}
    >
      <div className="h-3 w-24 rounded animate-pulse mb-3" style={{ backgroundColor: colors.skeleton }} />
      <div className="h-9 w-28 rounded animate-pulse mb-3" style={{ backgroundColor: colors.skeleton }} />
      <div className="h-3 w-36 rounded animate-pulse" style={{ backgroundColor: colors.skeleton }} />
    </div>
  );
}

export default function AdminUsers() {
  const [period, setPeriod] = useState("weekly");
  const [statusFilter, setStatusFilter] = useState(String(ADMIN_USER_STATUS.ALL));
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const [exportUsersCsv, { isLoading: isExporting }] = useExportAdminUsersCsvMutation();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  function changePeriod(value) {
    setPeriod(value);
    setPage(1);
  }

  function changeStatusFilter(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function changeSearch(value) {
    setSearchInput(value);
    setPage(1);
  }

  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
    isError: statsIsError,
    error: statsError,
    refetch: refetchStats,
  } = useGetAdminUserStatsQuery({ period });

  const listArgs = useMemo(() => {
    const statusNum = Number(statusFilter);
    return {
      period,
      page,
      limit: PAGE_SIZE,
      // Don't send status when All (0)
      status: statusNum === ADMIN_USER_STATUS.ALL ? undefined : statusNum,
      search: debouncedSearch || undefined,
    };
  }, [period, page, statusFilter, debouncedSearch]);

  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
    isError: listIsError,
    error: listError,
    refetch: refetchList,
  } = useListAdminUsersQuery(listArgs);

  const items = listData?.items ?? [];
  const meta = listData?.meta;
  const totalPages = Math.max(1, meta?.pages || 1);
  const totalRecords = meta?.total ?? 0;
  const safePage = Math.min(Math.max(1, meta?.page ?? page), totalPages);
  const from = totalRecords === 0 ? 0 : (safePage - 1) * (meta?.limit || PAGE_SIZE) + 1;
  const to = Math.min(safePage * (meta?.limit || PAGE_SIZE), totalRecords);

  const startNum = Math.max(1, Math.min(safePage - 1, totalPages - 2));
  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => startNum + i);

  const filtersActive =
    statusFilter !== String(ADMIN_USER_STATUS.ALL) || Boolean(debouncedSearch);

  const showStatsSkeleton = statsLoading && !stats;
  const showStatsHardError = statsIsError && !stats;
  const showStatsSoftError = statsIsError && Boolean(stats);

  const showListSkeleton = listLoading && !listData;
  const showListHardError = listIsError && !listData;
  const showListSoftError = listIsError && Boolean(listData);
  const showListEmpty = !listLoading && !listIsError && listData && items.length === 0;

  const statsErrorMessage = statsIsError
    ? getErrorMessage(statsError, "Unable to load user statistics. Please try again.")
    : "";
  const listErrorMessage = listIsError
    ? getErrorMessage(listError, "Unable to load users. Please try again.")
    : "";

  const displayPeriod = stats?.period || period;

  const statCards = useMemo(() => {
    if (!stats) return [];
    const growth = formatGrowthNote(stats.total_players_growth_percent, displayPeriod);
    return [
      {
        key: "total",
        label: "Total Players",
        value: formatCount(stats.total_players),
        valueColor: colors.white,
        ...growth,
      },
      {
        key: "active",
        label: "Active (30D)",
        value: formatCount(stats.active_30d),
        note: "Live Session Tracking",
        valueColor: LIME,
      },
      {
        key: "banned",
        label: "Banned",
        value: formatCount(stats.banned),
        note: "Flagged for Review",
        valueColor: colors.dangerBright,
      },
    ];
  }, [stats, displayPeriod]);

  function clearListFilters() {
    setStatusFilter(String(ADMIN_USER_STATUS.ALL));
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  }

  async function handleExportCsv() {
    if (isExporting) return;
    setNotice({ type: "", text: "" });
    try {
      const { blob, filename } = await exportUsersCsv({ period }).unwrap();
      downloadBlob(blob, filename || `players-${period}.csv`);
      setNotice({
        type: "success",
        text: `Players CSV (${period}) download started.`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        text: getErrorMessage(err, "Failed to export players. Please try again."),
      });
    }
  }

  const userColumns = useMemo(
    () => [
      {
        key: "player_id",
        header: "ID",
        headerClassName: "py-4 pl-5",
        cellClassName: "py-4 pl-5 text-base font-medium",
        cellStyle: { color: REGISTRY_GREY },
        skeletonWidth: "48%",
        render: (u) => formatPlayerId(u.player_id ?? u.id),
      },
      {
        key: "player",
        header: "Player",
        headerClassName: "py-4",
        cellClassName: "py-4",
        skeletonWidth: "70%",
        render: (u) => {
          const name = u.display_name || u.username || "—";
          return (
            <div className="flex items-center gap-3">
              <AvatarImage src={u.avatar?.image} alt={name} />
              <div className="min-w-0">
                <p
                  className="text-base font-medium leading-6 truncate"
                  style={{ color: LEVEL_TEXT }}
                >
                  {name}
                </p>
                <p
                  className="text-base font-medium leading-6"
                  style={{ color: REGISTRY_GREY }}
                >
                  {formatJoined(u.joined_at)}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: "email",
        header: "Email",
        headerClassName: "py-4",
        cellClassName: "py-4 text-base font-normal",
        cellStyle: { color: REGISTRY_GREY },
        skeletonWidth: "55%",
        render: (u) => u.email || "—",
      },
      {
        key: "level",
        header: "Level",
        headerClassName: "py-4",
        cellClassName: "py-4 text-base font-medium",
        cellStyle: { color: LEVEL_TEXT },
        skeletonWidth: "30%",
        render: (u) => {
          if (u.level === null || u.level === undefined || u.level === "") return "—";
          const n = Number(u.level);
          return Number.isFinite(n) ? Math.trunc(n) : "—";
        },
      },
      {
        key: "carrot",
        header: (
          <>
            Carrot
            <br />
            Balance
          </>
        ),
        headerClassName: "py-4 leading-tight",
        cellClassName: "py-4 text-base font-medium",
        cellStyle: { color: LEVEL_TEXT },
        skeletonWidth: "40%",
        render: (u) => formatCarrots(u.carrot),
      },
      {
        key: "status",
        header: "Status",
        headerClassName: "py-4",
        cellClassName: "py-4",
        skeletonWidth: "45%",
        render: (u) => {
          const label = resolveStatusLabel(u);
          const style = STATUS_STYLE[label] || FALLBACK_STATUS_STYLE;
          return (
            <span
              className="inline-block px-[10px] py-[2px] rounded-full text-[12px] leading-[18px] font-medium"
              style={{
                backgroundColor: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
              }}
            >
              {label}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "py-4 pr-6 text-right",
        cellClassName: "py-4 pr-6 text-right",
        skeletonWidth: "20%",
        align: "right",
        render: (u) => {
          const id = u.player_id ?? u.id;
          if (id === null || id === undefined || id === "") return null;
          return (
            <Link
              to={`/admin/users/${String(id).replace(/^#/, "")}`}
              className="text-white/60 hover:text-white transition-colors inline-flex"
              aria-label={`View user ${formatPlayerId(id)}`}
            >
              <Eye className="w-4 h-4" />
            </Link>
          );
        },
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1
            className="text-[32px] leading-[40px] font-bold mb-1"
            style={{ color: TEXT_PRIMARY }}
          >
            User Management
          </h1>
          <p className="text-sm max-w-[420px]" style={{ color: MUTED }}>
            Manage player accounts, monitor carrot balances, and oversee platform integrity
            with administrative controls.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <PeriodSelect
            value={period}
            onChange={changePeriod}
            options={PERIOD_OPTIONS}
            disabled={showStatsSkeleton && showListSkeleton}
            ariaLabel="Reporting period"
          />
          <SelectField
            value={statusFilter}
            onChange={changeStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            ariaLabel="Status filter"
          />
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 text-white text-sm font-medium min-w-[156px] h-[46px] px-4 rounded-lg hover:brightness-125 transition disabled:opacity-50"
            style={{ backgroundColor: BTN_BG, border: `1px solid ${BORDER}` }}
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      {notice.text && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={
            notice.type === "success"
              ? {
                  color: colors.primaryBright,
                  backgroundColor: colors.primaryBg10,
                  border: `1px solid ${colors.primaryBg20}`,
                }
              : {
                  color: colors.danger,
                  backgroundColor: colors.dangerBg10,
                  border: `1px solid ${colors.dangerBg25}`,
                }
          }
        >
          {notice.text}
        </div>
      )}

      <div className="mb-6 relative max-w-md">
        <Search
          className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: REGISTRY_GREY }}
          aria-hidden
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => changeSearch(e.target.value)}
          placeholder="Search by name, username, or email"
          className="w-full h-[46px] pl-11 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-bright"
          style={{
            backgroundColor: BTN_BG,
            border: `1px solid ${BORDER}`,
            color: colors.white,
          }}
          aria-label="Search users"
        />
      </div>

      {showStatsSoftError && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{
            color: colors.warning,
            backgroundColor: colors.warningBg10,
            border: `1px solid ${colors.warningBg25}`,
          }}
        >
          <span>Statistics couldn’t refresh. Showing the last loaded results.</span>
          <button
            type="button"
            onClick={() => refetchStats()}
            disabled={statsFetching}
            className="inline-flex items-center gap-2 font-bold hover:underline disabled:opacity-60 shrink-0"
            style={{ color: colors.warning }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${statsFetching ? "animate-spin" : ""}`}
              aria-hidden
            />
            {statsFetching ? "Refreshing…" : "Retry"}
          </button>
        </div>
      )}

      {showStatsHardError && (
        <div
          className="mb-6 rounded-xl px-5 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{ backgroundColor: BASE, border: `1px solid ${BORDER}` }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.dangerSoft }}>
              Couldn’t load user statistics
            </p>
            <p className="text-sm mt-1" style={{ color: REGISTRY_GREY }}>
              {statsErrorMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchStats()}
            disabled={statsFetching}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-bold transition hover:brightness-110 disabled:opacity-60 shrink-0"
            style={{ backgroundColor: colors.button, color: colors.white }}
          >
            <RefreshCw
              className={`w-4 h-4 ${statsFetching ? "animate-spin" : ""}`}
              aria-hidden
            />
            {statsFetching ? "Retrying…" : "Retry"}
          </button>
        </div>
      )}

      {!showStatsHardError && (
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          style={{
            opacity: statsFetching && stats ? 0.85 : 1,
            transition: "opacity 160ms ease",
          }}
        >
          {showStatsSkeleton
            ? Array.from({ length: 3 }, (_, i) => <StatCardSkeleton key={`sk-${i}`} />)
            : statCards.map((s) => <StatCard key={s.key} {...s} />)}
        </div>
      )}

      {showListSoftError && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{
            color: colors.warning,
            backgroundColor: colors.warningBg10,
            border: `1px solid ${colors.warningBg25}`,
          }}
        >
          <span>User list couldn’t refresh. Showing the last loaded results.</span>
          <button
            type="button"
            onClick={() => refetchList()}
            disabled={listFetching}
            className="inline-flex items-center gap-2 font-bold hover:underline disabled:opacity-60 shrink-0"
            style={{ color: colors.warning }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${listFetching ? "animate-spin" : ""}`}
              aria-hidden
            />
            {listFetching ? "Refreshing…" : "Retry"}
          </button>
        </div>
      )}

      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: BASE,
          border: `1px solid ${BORDER}`,
          boxShadow: `0 25px 50px -12px ${colors.shadow}`,
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-2">
          <h2 className="text-base font-normal" style={{ color: REGISTRY_GREY }}>
            Player Registry
          </h2>
          <div className="flex items-center gap-2 text-xs" style={{ color: colors.white70 }}>
            <span>
              {listData
                ? `Showing ${from}-${to} of ${totalRecords.toLocaleString("en-US")}`
                : showListSkeleton
                  ? "Loading…"
                  : "—"}
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1 || showListSkeleton}
              className="hover:text-white transition disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages || showListSkeleton || totalRecords === 0}
              className="hover:text-white transition disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          style={{
            opacity: listFetching && listData && !listIsError ? 0.85 : 1,
            transition: "opacity 160ms ease",
          }}
        >
          <DataTable
            tableClassName="w-full text-left text-sm min-w-[900px]"
            theadRowStyle={{
              backgroundColor: HEADER_BG,
              borderBottom: `1px solid ${BORDER}`,
            }}
            columns={userColumns}
            data={showListHardError ? [] : items}
            getRowKey={(u, i) => u.player_id ?? u.id ?? i}
            isLoading={showListSkeleton}
            skeletonRows={PAGE_SIZE}
            skeletonRowClassName="h-[72px]"
            skeletonDivider={`1px solid ${colors.borderSubtle}`}
            isError={showListHardError}
            error={listErrorMessage}
            errorTitle="Couldn’t load users"
            onRetry={() => refetchList()}
            isRetrying={listFetching}
            errorCellClassName="px-5 py-8"
            errorTitleColor={colors.dangerSoft}
            errorMessageColor={REGISTRY_GREY}
            retryButtonStyle={{ backgroundColor: colors.button, color: colors.white }}
            showEmpty={showListEmpty}
            emptyMessage={
              filtersActive ? (
                <span className="inline-flex flex-wrap items-center gap-2">
                  No users match the selected filters.
                  <button
                    type="button"
                    onClick={clearListFilters}
                    className="font-bold hover:underline"
                    style={{ color: LIME_PILL }}
                  >
                    Clear filters
                  </button>
                </span>
              ) : (
                "No users found."
              )
            }
            emptyClassName="py-8 pl-5 text-sm"
            emptyStyle={{ color: REGISTRY_GREY }}
            divided="top"
            divider={`1px solid ${colors.borderSubtle}`}
            getRowStyle={(u) => ({
              backgroundColor: isBannedStatus(resolveStatusLabel(u))
                ? ROW_BANNED
                : "transparent",
            })}
          />
        </div>

        <div
          className="flex items-center justify-between flex-wrap gap-3 px-5 py-4"
          style={{ borderTop: `1px solid ${BORDER}` }}
        >
          <span className="text-xs" style={{ color: colors.white70 }}>
            {listData
              ? `Page ${safePage} of ${totalPages}`
              : "—"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1 || showListSkeleton}
              className="w-8 h-8 rounded flex items-center justify-center transition hover:brightness-125 disabled:opacity-40"
              style={{
                backgroundColor: HEADER_BG,
                border: `1px solid ${BORDER}`,
                color: colors.white,
              }}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                disabled={showListSkeleton}
                className="min-w-8 h-8 px-2 rounded text-xs font-medium transition hover:brightness-125 disabled:opacity-40"
                style={
                  n === safePage
                    ? {
                        backgroundColor: LIME_PILL,
                        border: `1px solid ${LIME_PILL}`,
                        color: colors.surface,
                        fontWeight: 700,
                      }
                    : {
                        backgroundColor: HEADER_BG,
                        border: `1px solid ${BORDER}`,
                        color: colors.white70,
                      }
                }
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages || showListSkeleton || totalRecords === 0}
              className="w-8 h-8 rounded flex items-center justify-center transition hover:brightness-125 disabled:opacity-40"
              style={{
                backgroundColor: HEADER_BG,
                border: `1px solid ${BORDER}`,
                color: colors.white,
              }}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function PeriodSelect(props) {
  return <SelectField {...props} />;
}
