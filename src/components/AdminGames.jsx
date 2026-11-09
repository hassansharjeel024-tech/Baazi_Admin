import { useMemo, useState } from "react";
import { ChevronDown, Gamepad2, Trophy, Pencil, RefreshCw, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import DataTable from "./ui/DataTable";
import { useGetGamesQuery, useUpdateGameMutation } from "../services/api/gameApi";
import {
  GRAPH_PERIODS,
  useGetPrizePoolQuery,
} from "../services/api/graphApi";
import { getErrorMessage } from "../lib/apiHelpers";
import { colors, alpha } from "../theme";

const FONT = "'Montserrat', sans-serif";
const EMPTY_GAMES = [];
const EMPTY_CATEGORIES = [];

const PERIOD_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const STATUS_STYLE = {
  LIVE: { bg: colors.primaryBg20, color: colors.primaryBright },
  ACTIVE: { bg: colors.primaryBg20, color: colors.primaryBright },
  DRAFT: { bg: colors.warningBg20, color: colors.warning },
  INACTIVE: { bg: colors.borderMuted, color: colors.textMuted },
  DISABLED: { bg: colors.borderMuted, color: colors.textMuted },
};

const FALLBACK_STATUS_STYLE = { bg: colors.borderMuted, color: colors.textMuted };

const EMPTY_FORM = {
  name: "",
  url: "",
  description: "",
  carrot: "",
  minimum_score: "",
  entry_coin: "",
  total_level: "",
  category_id: "",
};

function isAllCategory(category) {
  return String(category?.name || "").trim().toLowerCase() === "all";
}

function displayText(value, fallback = "—") {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

function formatPlayers(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return Math.trunc(n).toLocaleString("en-US");
}

function formatLevels(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return displayText(value);
  return Math.trunc(n).toLocaleString("en-US");
}

const labelStyle = {
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "16px",
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  color: colors.textSecondary,
};

const inputStyle = {
  fontFamily: FONT,
  fontWeight: 400,
  fontSize: "14px",
  color: colors.textPrimary,
  backgroundColor: colors.surfaceElevated,
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "10px 12px",
  width: "100%",
  outline: "none",
};

const bodyCellStyle = {
  fontFamily: FONT,
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "24px",
  color: colors.textSecondary,
};

function Field({ label, children, full }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function PeriodSelect({ value, onChange, disabled }) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Prize pool period"
        className="appearance-none h-10 pl-3 pr-9 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-bright disabled:opacity-60"
        style={{
          backgroundColor: colors.buttonGhost,
          border: `1px solid ${colors.border}`,
          color: colors.white,
          fontFamily: FONT,
        }}
      >
        {PERIOD_OPTIONS.map((o) => (
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

function PrizePoolSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex-1 space-y-3">
        <div className="h-3 w-40 rounded animate-pulse" style={{ backgroundColor: colors.skeleton }} />
        <div className="h-12 w-56 rounded animate-pulse" style={{ backgroundColor: colors.skeleton }} />
      </div>
      <div className="flex items-end gap-3" style={{ height: "64px" }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              width: "27.5px",
              height: `${24 + (i % 4) * 10}px`,
              borderTopLeftRadius: "2px",
              borderTopRightRadius: "2px",
              backgroundColor: colors.skeleton,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GameThumb({ src, alt }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const showFallback = !src || failedSrc === src;

  if (showFallback) {
    return (
      <span
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{
          backgroundColor: colors.borderDark,
          border: `1px solid ${colors.border}`,
          color: colors.primary,
        }}
        aria-hidden
      >
        <Gamepad2 className="w-4 h-4" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ""}
      className="w-10 h-10 rounded-lg object-cover shrink-0"
      style={{ backgroundColor: colors.borderDark }}
      onError={() => setFailedSrc(src)}
    />
  );
}

function CategorySelect({ value, onChange, options, disabled }) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Filter games by category"
        className="appearance-none h-10 pl-3 pr-9 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-bright disabled:opacity-60"
        style={{
          backgroundColor: colors.buttonGhost,
          border: `1px solid ${colors.border}`,
          color: colors.white,
          fontFamily: FONT,
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

export default function AdminGames() {
  const [updateGame, { isLoading: saving }] = useUpdateGameMutation();

  const [period, setPeriod] = useState("weekly");
  const safePeriod = GRAPH_PERIODS.includes(period) ? period : "weekly";

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [formError, setFormError] = useState("");

  const {
    data: prizePoolData,
    currentData: prizePoolCurrent,
    isLoading: prizePoolLoading,
    isFetching: prizePoolFetching,
    isError: prizePoolIsError,
    error: prizePoolError,
    refetch: refetchPrizePool,
  } = useGetPrizePoolQuery({ period: safePeriod });

  // Prefer currentData so a previous period's cache never paints for a new period
  const prizePool =
    prizePoolCurrent ??
    (prizePoolData?.period === safePeriod ? prizePoolData : undefined);

  const showPrizeSkeleton =
    prizePoolLoading || (prizePoolFetching && !prizePool);
  const showPrizeHardError = prizePoolIsError && !prizePool;
  const showPrizeSoftError = prizePoolIsError && Boolean(prizePool);
  const prizeErrorMessage = prizePoolIsError
    ? getErrorMessage(prizePoolError, "Unable to load prize pool. Please try again.")
    : "";

  const totalLabel = prizePool?.total_label || "—";
  const sparkBars = prizePool?.spark_bars ?? [];

  const gamesQueryArgs = useMemo(() => {
    if (categoryFilter === "all" || categoryFilter === "") return {};
    const id = Number(categoryFilter);
    if (!Number.isFinite(id)) return {};
    return { category_id: id };
  }, [categoryFilter]);

  const {
    data: gamesData,
    currentData: gamesCurrent,
    isLoading: gamesLoading,
    isFetching: gamesFetching,
    isError: gamesIsError,
    error: gamesError,
    refetch: refetchGames,
  } = useGetGamesQuery(gamesQueryArgs);

  // Games rows only from currentData to avoid stale category results
  const games = gamesCurrent?.games ?? EMPTY_GAMES;
  // Categories can come from any successful payload (list is shared across filters)
  const categories =
    (Array.isArray(gamesCurrent?.category) && gamesCurrent.category.length
      ? gamesCurrent.category
      : null) ||
    (Array.isArray(gamesData?.category) ? gamesData.category : null) ||
    EMPTY_CATEGORIES;

  const showGamesSkeleton =
    gamesLoading || (gamesFetching && !gamesCurrent);
  const showGamesHardError = gamesIsError && !gamesCurrent;
  const showGamesSoftError = gamesIsError && Boolean(gamesCurrent);
  const showGamesEmpty =
    !showGamesSkeleton && !showGamesHardError && games.length === 0;
  const gamesErrorMessage = gamesIsError
    ? getErrorMessage(gamesError, "Unable to load games. Please try again.")
    : "";

  const categoryOptions = useMemo(() => {
    const opts = [{ value: "all", label: "All Categories" }];
    categories.forEach((c) => {
      if (c?.id === null || c?.id === undefined) return;
      if (isAllCategory(c)) return; // covered by "all" (omit category_id)
      opts.push({ value: String(c.id), label: displayText(c.name, `Category ${c.id}`) });
    });
    return opts;
  }, [categories]);

  const editCategories = useMemo(
    () => categories.filter((c) => c?.id !== null && c?.id !== undefined && !isAllCategory(c)),
    [categories]
  );

  function openEdit(game) {
    const categoryId = game?.category?.id;
    setEditing(game);
    setForm({
      ...EMPTY_FORM,
      name: game.name || "",
      url: game.url || "",
      total_level:
        game.total_level === null || game.total_level === undefined
          ? ""
          : String(game.total_level),
      category_id:
        categoryId === null || categoryId === undefined ? "" : String(categoryId),
    });
    setImageFile(null);
    setFormError("");
  }

  function closeEdit() {
    if (saving) return;
    setEditing(null);
  }

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    try {
      // khali fields toFormData khud hata deta hai, is liye sirf bhare hue fields jaate hain
      const values = { ...form };
      if (imageFile) values.image = imageFile;

      await updateGame({ id: editing.id, values }).unwrap();
      setEditing(null);
      setNotice(`"${form.name || editing.name}" updated successfully.`);
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to update game"));
    }
  }

  const gamesColumns = useMemo(
    () => [
      {
        key: "game",
        header: "Game",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        skeletonWidth: 180,
        render: (g) => (
          <div className="flex items-center gap-3 min-w-0">
            <GameThumb src={g.image} alt={g.name} />
            <div className="min-w-0">
              <p
                className="truncate"
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: colors.white,
                }}
              >
                {displayText(g.name, "Untitled")}
              </p>
              {g.url ? (
                <a
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs truncate block hover:underline"
                  style={{ color: colors.textSecondary, maxWidth: 220 }}
                  title={g.url}
                >
                  Open URL
                </a>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: bodyCellStyle,
        skeletonWidth: 90,
        render: (g) => displayText(g.category?.name),
      },
      {
        key: "rating",
        header: "Rating",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: bodyCellStyle,
        skeletonWidth: 50,
        render: (g) => displayText(g.rating),
      },
      {
        key: "total_level",
        header: "Levels",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: bodyCellStyle,
        skeletonWidth: 60,
        render: (g) => formatLevels(g.total_level),
      },
      {
        key: "players",
        header: "Players",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: bodyCellStyle,
        skeletonWidth: 60,
        render: (g) => formatPlayers(g.players),
      },
      {
        key: "status",
        header: "Status",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        skeletonWidth: 70,
        render: (g) => {
          const label = displayText(g.status_label, "Unknown");
          const style = STATUS_STYLE[String(label).toUpperCase()] || FALLBACK_STATUS_STYLE;
          return (
            <span
              className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
              style={{
                backgroundColor: style.bg,
                color: style.color,
                fontFamily: FONT,
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
        headerClassName: "py-3 px-5 text-right",
        cellClassName: "py-4 px-5 text-right",
        skeletonWidth: 80,
        render: (g) => (
          <button
            type="button"
            onClick={() => openEdit(g)}
            className="inline-flex items-center gap-1.5 rounded-lg hover:brightness-110 transition"
            style={{
              backgroundColor: colors.button,
              paddingTop: "6px",
              paddingBottom: "6px",
              paddingLeft: "16px",
              paddingRight: "16px",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "24px",
              color: colors.white,
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        ),
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: "32px",
            lineHeight: "40px",
            letterSpacing: "0px",
            color: colors.textPrimary,
          }}
          className="mb-1"
        >
          Games Management
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0px",
            color: colors.textPrimary,
          }}
        >
          Configure active tournaments, difficulty tiers, and prize allocations.
        </p>
      </div>

      {notice && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{
            fontFamily: FONT,
            color: colors.primaryBright,
            backgroundColor: colors.primaryBg10,
            border: `1px solid ${colors.primaryBg20}`,
          }}
        >
          {notice}
        </div>
      )}

      <div className="flex items-center justify-end mb-3">
        <PeriodSelect
          value={safePeriod}
          onChange={setPeriod}
          disabled={showPrizeSkeleton && !prizePool}
        />
      </div>

      {showPrizeSoftError && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          role="status"
          style={{
            fontFamily: FONT,
            color: colors.warning,
            backgroundColor: colors.warningBg10,
            border: `1px solid ${colors.warningBg25}`,
          }}
        >
          <span>Prize pool couldn’t refresh. Showing the last loaded results.</span>
          <button
            type="button"
            onClick={() => refetchPrizePool()}
            disabled={prizePoolFetching}
            className="inline-flex items-center gap-2 font-bold hover:underline disabled:opacity-60 shrink-0"
            style={{ color: colors.warning }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${prizePoolFetching ? "animate-spin" : ""}`} aria-hidden />
            {prizePoolFetching ? "Refreshing…" : "Retry"}
          </button>
        </div>
      )}

      {/* Active Players remains static until its API is available; Prize Pool is live */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: colors.accentBg22 }}
          >
            <Gamepad2 className="w-4 h-4" style={{ color: colors.accent }} />
          </div>
          <p
            className="mb-1"
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: colors.primaryDark,
            }}
          >
            Active Players
          </p>
          <div className="flex items-baseline gap-2">
            <p
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "48px",
                lineHeight: "56px",
                letterSpacing: "-0.96px",
                color: colors.white,
              }}
            >
              12.4k
            </p>
            <span
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "20px",
                color: colors.primaryDark,
              }}
            >
              +18% ↑
            </span>
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            opacity: prizePoolFetching && prizePool && !prizePoolIsError ? 0.9 : 1,
            transition: "opacity 160ms ease",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: alpha(colors.primary, 0.13) }}
          >
            <Trophy className="w-4 h-4" style={{ color: colors.primary }} />
          </div>

          {showPrizeHardError ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ fontFamily: FONT, color: colors.dangerSoft }}>
                  Couldn’t load prize pool
                </p>
                <p className="text-sm mt-1" style={{ fontFamily: FONT, color: colors.textSecondary }}>
                  {prizeErrorMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetchPrizePool()}
                disabled={prizePoolFetching}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-bold transition hover:brightness-110 disabled:opacity-60 shrink-0"
                style={{ backgroundColor: colors.button, color: colors.white, fontFamily: FONT }}
              >
                <RefreshCw className={`w-4 h-4 ${prizePoolFetching ? "animate-spin" : ""}`} aria-hidden />
                {prizePoolFetching ? "Retrying…" : "Retry"}
              </button>
            </div>
          ) : showPrizeSkeleton ? (
            <PrizePoolSkeleton />
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p
                  className="mb-1"
                  style={{
                    fontFamily: FONT,
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "16px",
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    color: colors.textPrimary,
                  }}
                >
                  Total Prize Pool Distributed
                </p>
                <p
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: "48px",
                    lineHeight: "56px",
                    letterSpacing: "-0.96px",
                    color: colors.white,
                  }}
                  className="truncate"
                  title={totalLabel}
                >
                  {totalLabel}
                </p>
              </div>
              {sparkBars.length > 0 ? (
                <div className="flex items-end gap-3 shrink-0" style={{ height: "64px" }}>
                  {sparkBars.map((bar, i) => (
                    <div
                      key={`spark-${i}-${bar.height}-${bar.opacity}`}
                      style={{
                        width: "27.5px",
                        height: `${bar.height}px`,
                        borderTopLeftRadius: "2px",
                        borderTopRightRadius: "2px",
                        backgroundColor:
                          bar.opacity === 1
                            ? colors.primary
                            : alpha(colors.primaryBright, bar.opacity),
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p
                  className="text-sm shrink-0"
                  style={{ fontFamily: FONT, color: colors.textSecondary }}
                >
                  No spark data
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          paddingTop: "8px",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "24px",
              color: colors.textSecondary,
            }}
          >
            Games
          </h2>
          <CategorySelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            disabled={showGamesSkeleton && !gamesCurrent}
          />
        </div>

        {showGamesSoftError && (
          <div
            className="mx-5 mb-4 rounded-lg px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            role="status"
            style={{
              fontFamily: FONT,
              color: colors.warning,
              backgroundColor: colors.warningBg10,
              border: `1px solid ${colors.warningBg25}`,
            }}
          >
            <span>Games list couldn’t refresh. Showing the last loaded results.</span>
            <button
              type="button"
              onClick={() => refetchGames()}
              disabled={gamesFetching}
              className="inline-flex items-center gap-2 font-bold hover:underline disabled:opacity-60 shrink-0"
              style={{ color: colors.warning }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gamesFetching ? "animate-spin" : ""}`} aria-hidden />
              {gamesFetching ? "Refreshing…" : "Retry"}
            </button>
          </div>
        )}

        <div
          style={{
            opacity: gamesFetching && gamesCurrent && !gamesIsError ? 0.9 : 1,
            transition: "opacity 160ms ease",
          }}
        >
          <DataTable
            tableClassName="w-full text-left min-w-[720px]"
            theadRowStyle={{
              backgroundColor: colors.surfaceElevated,
              borderBottom: `1px solid ${colors.borderOlive}`,
            }}
            columns={gamesColumns}
            data={showGamesHardError ? [] : games}
            getRowKey={(g, i) => g.id ?? i}
            isLoading={showGamesSkeleton}
            skeletonRows={6}
            skeletonRowClassName="h-[72px]"
            skeletonDivider={`1px solid ${colors.borderSubtle}`}
            isError={showGamesHardError}
            error={gamesErrorMessage}
            errorTitle="Couldn’t load games"
            onRetry={() => refetchGames()}
            isRetrying={gamesFetching}
            showEmpty={showGamesEmpty}
            emptyMessage={
              categoryFilter !== "all"
                ? "No games found for this category."
                : "No games found."
            }
            emptyClassName="py-8 px-5 text-sm"
            emptyStyle={{ color: colors.textSecondary, fontFamily: FONT }}
            divided="top"
            divider={`1px solid ${colors.borderSubtle}`}
          />
        </div>
      </div>

      {/* Edit modal: Figma mein is ka design nahi tha, theme ke mutabiq banaya hai */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: colors.overlay }}
          onClick={closeEdit}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: "20px",
                    lineHeight: "28px",
                    color: colors.textPrimary,
                  }}
                >
                  Edit {editing.name}
                </h2>
                <p style={{ fontFamily: FONT, fontSize: "13px", color: colors.textSecondary }}>
                  Khali chhori hui fields update mein shamil nahi hongi.
                </p>
              </div>
              <button type="button" onClick={closeEdit} aria-label="Close" style={{ color: colors.textSecondary }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name" full>
                <input style={inputStyle} value={form.name} onChange={setField("name")} />
              </Field>
              <Field label="Game URL" full>
                <input style={inputStyle} value={form.url} onChange={setField("url")} />
              </Field>
              <Field label="Description" full>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  value={form.description}
                  onChange={setField("description")}
                />
              </Field>
              <Field label="Carrot">
                <input type="number" min="0" style={inputStyle} value={form.carrot} onChange={setField("carrot")} />
              </Field>
              <Field label="Minimum Score">
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={form.minimum_score}
                  onChange={setField("minimum_score")}
                />
              </Field>
              <Field label="Entry Coin">
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={form.entry_coin}
                  onChange={setField("entry_coin")}
                />
              </Field>
              <Field label="Total Levels">
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={form.total_level}
                  onChange={setField("total_level")}
                />
              </Field>
              <Field label="Category">
                <select style={inputStyle} value={form.category_id} onChange={setField("category_id")}>
                  <option value="">Select category</option>
                  {editCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Image">
                <input
                  type="file"
                  accept="image/*"
                  style={{ ...inputStyle, padding: "8px 12px" }}
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </Field>
            </div>

            {formError && (
              <p className="mt-4 text-sm" style={{ fontFamily: FONT, color: colors.dangerSoft }}>
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-lg hover:brightness-110 transition"
                style={{
                  backgroundColor: colors.button,
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "14px",
                  color: colors.white,
                  padding: "10px 20px",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg hover:brightness-95 transition disabled:opacity-60"
                style={{
                  backgroundColor: colors.primary,
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "14px",
                  color: colors.surfacePanel,
                  padding: "10px 20px",
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}