import { useMemo, useState } from "react";
import { Download, ChevronDown, ChevronLeft, ChevronRight, User } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { useListPaymentsQuery } from "../services/api/paymentApi";
import { useGetCoinPackagesQuery } from "../services/api/coinPackageApi";
import { useListUserRewardsQuery } from "../services/api/userRewardApi";
import { getErrorMessage } from "../lib/apiHelpers";
import { colors } from "../theme";

const PAGE_SIZE = 4;

// key wale cards live hain, baaki ki API abhi nahi hai
const STATS = [
  { key: "carrots", label: "Total Carrots Distributed", value: "2.14M", noteColor: colors.primaryBright, note: "All users, all time" },
  { key: "coins", label: "Total Coins Distributed", value: "841K", noteColor: colors.accentSoft, note: "Purchased + Free" },
  { key: "redeemed", label: "Carrots Redeemed", value: "980K", noteColor: colors.dangerSoft, note: "Via rewards shop" },
  { key: "users", label: "Users with Transactions", value: "4,829", noteColor: colors.textLight, note: "Active all time" },
  { key: "revenue", label: "Coin Purchases Revenue", value: "$1800", noteColor: colors.primaryBright, note: "This Month" },
];

// Distribution bars: API nahi hai, static
const CARROT_DIST = [
  { label: "Game target achieved", value: "940K", pct: 75, color: colors.primaryBright },
  { label: "Daily login / streak", value: "420K", pct: 45, color: colors.accentSoft },
  { label: "Referral bonus", value: "310K", pct: 32, color: colors.chartPurple },
];

const COIN_DIST = [
  { label: "Bundle purchase", value: "620K", pct: 65, color: colors.accentPrimary },
  { label: "Daily free coins", value: "118K", pct: 18, color: colors.chartPurpleAccent },
  { label: "Streak bonus", value: "62K", pct: 12, color: colors.accentDeep },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "Coin Purchase", label: "Coin Purchase" },
  { value: "Redemption", label: "Redemption" },
];

const PERIOD_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "month", label: "This month" },
  { value: "30d", label: "Last 30 days" },
];

const BORDER_COLOR = colors.border;
const ROW_BORDER = colors.borderSoft;
const CARD_STYLE = { backgroundColor: colors.surface, borderColor: BORDER_COLOR };

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 });

function formatMoney(n) {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function formatDateTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

function exportCsv(rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const header = ["Txn ID", "User ID", "Date", "Type", "Description", "Amount"];
  const lines = rows.map((r) =>
    [r.txn, r.userId, new Date(r.date).toISOString(), r.type, r.desc, r.amount].map(esc).join(",")
  );
  const csv = [header.map(esc).join(","), ...lines].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "wallet-events.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function DistBar({ label, value, pct, color }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between font-['Montserrat'] font-medium text-xs leading-4 tracking-[0.6px]">
        <span style={{ color: colors.textPrimary }}>{label}</span>
        <span style={{ color: colors.textLight }}>{value}</span>
      </div>
      <div className="w-full h-3 rounded-full" style={{ backgroundColor: colors.surface }}>
        <div className="h-3 rounded-[4px]" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Dropdown({ value, onChange, options }) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none font-['Montserrat'] font-normal text-sm leading-5 pl-4 pr-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-bright"
        style={{ backgroundColor: colors.surface, borderColor: BORDER_COLOR, color: colors.textPrimary }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: colors.textPrimary }}
      />
    </div>
  );
}

const TH = "py-6 px-4 font-['Montserrat'] font-medium text-xs leading-4 tracking-[0.6px] uppercase align-middle";
const TD = "py-4 px-4 align-middle";
const PAGE_BTN =
  "h-[34px] min-w-[30px] px-3 rounded-[4px] border flex items-center justify-center font-['Montserrat'] font-medium text-xs transition";

export default function AdminWallet() {
  const {
    data: payments = null,
    isLoading: paymentsLoading,
    isError: paymentsIsError,
    error: paymentsError,
  } = useListPaymentsQuery();
  const {
    data: claimsData,
    isLoading: rewardsLoading,
    isError: rewardsIsError,
    error: rewardsError,
  } = useListUserRewardsQuery();
  const { data: packages = [], isLoading: packagesLoading } = useGetCoinPackagesQuery();

  const data = {
    loading: paymentsLoading || rewardsLoading || packagesLoading,
    payments: paymentsIsError ? null : payments,
    rewards: rewardsIsError ? null : (claimsData?.rewards ?? null),
    packages,
    errors: [
      ...(paymentsIsError ? [getErrorMessage(paymentsError, "Failed to load payments")] : []),
      ...(rewardsIsError ? [getErrorMessage(rewardsError, "Failed to load redemptions")] : []),
    ],
  };

  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [page, setPage] = useState(1);

  // ---- live stat cards ----
  const liveValues = useMemo(() => {
    const now = new Date();
    const result = { redeemed: null, revenue: null };

    if (data.rewards) {
      const carrots = data.rewards
        .filter((r) => r.status !== 4)
        .reduce((sum, r) => sum + Number(r.reward?.carrot || 0), 0);
      result.redeemed = compactNumber.format(carrots);
    }

    if (data.payments) {
      const revenue = data.payments
        .filter((p) => {
          if (p.status !== 2) return false;
          const d = new Date(p.created_at);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        })
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      result.revenue = formatMoney(revenue);
    }

    return result;
  }, [data.rewards, data.payments]);

  const stats = STATS.map((s) => {
    if (s.key === "redeemed") return { ...s, value: data.loading ? "-" : liveValues.redeemed ?? "-" };
    if (s.key === "revenue") return { ...s, value: data.loading ? "-" : liveValues.revenue ?? "-" };
    return s;
  });

  // ---- Top bundles ----
  const topBundles = useMemo(() => {
    if (!data.payments) return null;
    const priceById = new Map(data.packages.map((k) => [k.id, k.price]));
    const groups = new Map();

    data.payments
      .filter((p) => p.status === 2)
      .forEach((p) => {
        const id = p.coin_package_id;
        const cur = groups.get(id) || {
          id,
          name: p.coin_package?.title || `Package #${id}`,
          amount: Number(p.amount || 0),
          count: 0,
        };
        cur.count += 1;
        groups.set(id, cur);
      });

    return [...groups.values()]
      .map((g) => ({
        id: g.id,
        name: g.name,
        price: formatMoney(Number(priceById.get(g.id) ?? g.amount)),
        count: g.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [data.payments, data.packages]);

  // ---- Economy events (coin purchases + redemptions) ----
  const events = useMemo(() => {
    const list = [];

    (data.payments || [])
      .filter((p) => p.status === 2)
      .forEach((p) => {
        list.push({
          txn: `PAY-${p.id}`,
          userId: p.user_id,
          date: p.created_at,
          type: "Coin Purchase",
          desc: `${p.coin_package?.title || "Coin package"} · ${formatMoney(Number(p.amount || 0))}`,
          amount: `+${Number(p.total_coin || 0).toLocaleString()}`,
          positive: true,
        });
      });

    (data.rewards || [])
      .filter((r) => r.status !== 4)
      .forEach((r) => {
        const carrot = Number(r.reward?.carrot || 0);
        list.push({
          txn: `RDM-${r.id}`,
          userId: r.user_id,
          date: r.created_at,
          type: "Redemption",
          desc: `${r.reward?.name || "Reward"} · ${carrot.toLocaleString()} carrots`,
          amount: `-${carrot.toLocaleString()}`,
          positive: false,
        });
      });

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.payments, data.rewards]);

  const filtered = useMemo(() => {
    const now = new Date();
    return events.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      const d = new Date(e.date);
      if (periodFilter === "month") {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      if (periodFilter === "30d") {
        return now - d <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  }, [events, typeFilter, periodFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filtered.length);

  const startNum = Math.max(1, Math.min(safePage - 1, totalPages - 2));
  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => startNum + i);

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-7 flex-wrap gap-3">
        <div>
          <h1 className="font-['Montserrat'] font-bold text-[32px] leading-[40px]" style={{ color: colors.textPrimary }}>
            Wallet
          </h1>
          <p className="font-['Montserrat'] font-normal text-base leading-6" style={{ color: colors.textPrimary }}>
            Centralized management for in-game currency and transaction audits.
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center w-[156px] h-[46px] pl-3 gap-[17.62px] rounded-lg border hover:brightness-110 transition disabled:opacity-50"
          style={{ backgroundColor: colors.button, borderColor: BORDER_COLOR, color: colors.textLight }}
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="font-['Plus_Jakarta_Sans'] font-semibold text-base leading-6 whitespace-nowrap">
            Export Data
          </span>
        </button>
      </div>

      {data.errors.length > 0 && (
        <div
          className="mb-6 rounded-lg px-4 py-3 text-sm font-['Montserrat']"
          style={{
            color: colors.dangerSoft,
            backgroundColor: colors.dangerBg10,
            border: `1px solid ${colors.dangerBg25}`,
          }}
        >
          {data.errors.join(" | ")}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 rounded-xl border px-6 pt-6 pb-11 min-h-[207px]"
            style={CARD_STYLE}
          >
            <p
              className="font-['Montserrat'] font-medium text-xs leading-4 tracking-[0.6px] uppercase min-h-[32px]"
              style={{ color: colors.textSecondary }}
            >
              {s.label}
            </p>
            <p className="font-['Montserrat'] font-bold text-[37px] leading-[48px] text-white">
              {s.value}
            </p>
            <div className="border-t pt-[10px]" style={{ borderColor: BORDER_COLOR }}>
              <p className="font-['Montserrat'] font-medium text-sm leading-5" style={{ color: s.noteColor }}>
                {s.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div
          className="flex flex-col gap-8 rounded-2xl border px-8 pt-[31.5px] pb-8 lg:min-h-[352px]"
          style={CARD_STYLE}
        >
          <h2 className="font-['Montserrat'] font-semibold text-lg leading-6" style={{ color: colors.textPrimary }}>
            Carrot distribution by type
          </h2>
          {CARROT_DIST.map((d) => (
            <DistBar key={d.label} {...d} />
          ))}
        </div>

        <div
          className="flex flex-col gap-8 rounded-2xl border px-8 pt-[31.5px] pb-8 lg:min-h-[352px]"
          style={CARD_STYLE}
        >
          <h2 className="font-['Montserrat'] font-semibold text-lg leading-6" style={{ color: colors.textPrimary }}>
            Coin distribution by type
          </h2>
          {COIN_DIST.map((d) => (
            <DistBar key={d.label} {...d} />
          ))}
        </div>

        <div
          className="flex flex-col gap-6 rounded-2xl border p-8 lg:min-h-[352px]"
          style={CARD_STYLE}
        >
          <h2 className="font-['Montserrat'] font-semibold text-lg leading-6" style={{ color: colors.textPrimary }}>
            Top Bundles
          </h2>
          <div className="flex flex-col gap-4">
            {data.loading && (
              <p className="font-['Montserrat'] text-sm" style={{ color: colors.textSecondary }}>
                Loading bundles...
              </p>
            )}
            {!data.loading && topBundles && topBundles.length === 0 && (
              <p className="font-['Montserrat'] text-sm" style={{ color: colors.textSecondary }}>
                No purchases yet.
              </p>
            )}
            {!data.loading && !topBundles && (
              <p className="font-['Montserrat'] text-sm" style={{ color: colors.dangerSoft }}>
                Could not load bundles.
              </p>
            )}
            {(topBundles || []).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border p-3"
                style={{ borderColor: BORDER_COLOR }}
              >
                <div>
                  <p className="font-['Montserrat'] font-bold text-sm leading-5" style={{ color: colors.textPrimary }}>
                    {b.name}
                  </p>
                  <p
                    className="font-['Montserrat'] font-medium text-xs leading-4 tracking-[0.6px]"
                    style={{ color: colors.textSecondary }}
                  >
                    {b.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-['Montserrat'] font-bold text-sm leading-5" style={{ color: colors.primaryBright }}>
                    {b.count.toLocaleString()}
                  </p>
                  <p
                    className="font-['Montserrat'] font-medium text-[10px] leading-4 tracking-[0.6px]"
                    style={{ color: colors.muted40 }}
                  >
                    SOLD
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={CARD_STYLE}>
        <div
          className="flex items-center justify-between flex-wrap gap-3 p-6 border-b"
          style={{ borderColor: BORDER_COLOR }}
        >
          <h2 className="font-['Montserrat'] font-bold text-[32px] leading-[40px]" style={{ color: colors.textPrimary }}>
            Recent Economy Events
          </h2>
          <div className="flex items-center gap-4">
            <Dropdown
              value={typeFilter}
              onChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
              options={TYPE_OPTIONS}
            />
            <Dropdown
              value={periodFilter}
              onChange={(v) => {
                setPeriodFilter(v);
                setPage(1);
              }}
              options={PERIOD_OPTIONS}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left min-w-[920px]">
            <colgroup>
              <col style={{ width: 94 }} />
              <col style={{ width: 169 }} />
              <col style={{ width: 102 }} />
              <col style={{ width: 142 }} />
              <col style={{ width: 211 }} />
              <col style={{ width: 91 }} />
              <col style={{ width: 111 }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: colors.surfaceElevated, borderBottom: `1px solid ${BORDER_COLOR}`, color: colors.textPrimary }}>
                <th className={`${TH} pl-6 pr-2`}>Txn ID</th>
                <th className={TH}>User</th>
                <th className={TH}>
                  <span className="block max-w-[50px]">Date &amp; Time</span>
                </th>
                <th className={TH}>Type</th>
                <th className={TH}>Description</th>
                <th className={`${TH} text-right`}>Amount</th>
                <th className={`${TH} text-right pr-6`}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.loading && (
                <tr>
                  <td colSpan={7} className="py-6 pl-6 font-['Montserrat'] text-sm" style={{ color: colors.textSecondary }}>
                    Loading events...
                  </td>
                </tr>
              )}

              {!data.loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 pl-6 font-['Montserrat'] text-sm" style={{ color: colors.textSecondary }}>
                    No economy events found.
                  </td>
                </tr>
              )}

              {pageItems.map((e, i) => (
                <tr
                  key={e.txn}
                  style={i < pageItems.length - 1 ? { borderBottom: `1px solid ${ROW_BORDER}` } : undefined}
                >
                  <td
                    className={`${TD} pl-6 pr-2 whitespace-nowrap font-['Montserrat'] font-medium text-xs leading-4 tracking-[0.6px]`}
                    style={{ color: colors.textSecondary }}
                  >
                    {e.txn}
                  </td>
                  <td className={TD}>
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: colors.buttonAlt, color: colors.primary }}
                      >
                        <User className="w-4 h-4" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-['Montserrat'] font-bold text-sm leading-5" style={{ color: colors.textPrimary }}>
                          User #{e.userId}
                        </span>
                        <span className="font-['Montserrat'] font-normal text-[10px] leading-[15px]" style={{ color: colors.textSecondary }}>
                          USR-{String(e.userId).padStart(5, "0")}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={TD}>
                    <p className="max-w-[54px] font-['Montserrat'] font-normal text-sm leading-5" style={{ color: colors.textSecondary }}>
                      {formatDateTime(e.date)}
                    </p>
                  </td>
                  <td className={TD}>
                    <span
                      className="inline-block rounded-full border px-[10px] py-[2px] font-['Montserrat'] font-bold text-[10px] leading-[15px] uppercase whitespace-nowrap text-center"
                      style={{
                        backgroundColor: colors.primaryBg10,
                        borderColor: colors.primaryBg20,
                        color: colors.primary,
                      }}
                    >
                      {e.type}
                    </span>
                  </td>
                  <td className={TD}>
                    <p className="max-w-[128px] font-['Montserrat'] font-normal text-sm leading-5" style={{ color: colors.textSecondary }}>
                      {e.desc}
                    </p>
                  </td>
                  <td
                    className={`${TD} text-right font-['Montserrat'] font-bold text-base leading-6`}
                    style={{ color: e.positive ? colors.primary : colors.dangerSoft }}
                  >
                    {e.amount}
                  </td>
                  {/* Balance: API mein nahi hai */}
                  <td
                    className={`${TD} pr-6 text-right font-['Montserrat'] font-medium text-xs leading-4 tracking-[0.6px]`}
                    style={{ color: colors.textPrimary }}
                  >
                    -
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="flex items-center justify-between flex-wrap gap-3 p-6 border-t"
          style={{ borderColor: BORDER_COLOR }}
        >
          <span
            className="font-['Montserrat'] font-medium text-base leading-4 tracking-[0.6px]"
            style={{ color: colors.textSecondary }}
          >
            Showing {from}-{to} of {filtered.length} events
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className={`${PAGE_BTN} disabled:opacity-40`}
              style={{ backgroundColor: colors.surface, borderColor: colors.borderDark, color: colors.textSecondary }}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={PAGE_BTN}
                style={
                  n === safePage
                    ? { backgroundColor: colors.primaryBright, borderColor: colors.primaryBright, color: colors.surface, fontWeight: 700 }
                    : { backgroundColor: colors.surface, borderColor: colors.borderDark, color: colors.textSecondary }
                }
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className={`${PAGE_BTN} disabled:opacity-40`}
              style={{ backgroundColor: colors.surface, borderColor: colors.borderDark, color: colors.textSecondary }}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}