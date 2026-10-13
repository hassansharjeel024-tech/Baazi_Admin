import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  listUserRewards,
  getUserReward,
  updateUserRewardStatus,
} from "../services/userRewardService";
import { getRewards } from "../services/rewardService";

const FONT = "'Montserrat', sans-serif";
const PAGE_SIZE = 5;

const C = {
  card: "#091E46",
  border: "rgba(59,130,246,0.22)",
  bar: "#120D2A",
  headerLine: "#464833",
  rowLine: "rgba(59,130,246,0.12)",
  text: "#DEE2F5",
  primary: "#D0D0D0",
  grey: "#6B7280",
  lime: "#DBEE2A",
  yellow: "#DBE21C",
  navy: "#091E46",
  slate: "#26346E",
  pageBorder: "rgba(222,226,245,0.5)",
};

const HEADERS = ["Request ID", "User", "Reward", "Carrots", "Submitted", "Status", "Actions"];

// API: 1 = Processing, 2 = Shipped, 3 = Delivered, 4 = Cancelled
const STATUS_LABEL = { 1: "Pending", 2: "Shipped", 3: "Delivered", 4: "Rejected" };

const STATUS_STYLE = {
  Pending: { bg: "rgba(255,141,88,0.2)", color: "#FF8D58" },
  Shipped: { bg: "rgba(59,130,246,0.3)", color: "#BFD4FF" },
  Delivered: { bg: "rgba(120,255,71,0.2)", color: "#DBEE2A" },
  Rejected: { bg: "rgba(255,97,97,0.2)", color: "#FF6161" },
};
const FALLBACK_STYLE = { bg: "rgba(255,255,255,0.1)", color: "#9CA3AF" };

const ACTION_BTN = "h-7 px-3 rounded text-[13px] font-bold text-white transition hover:brightness-125 disabled:opacity-50";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RowActions({ item, busy, onApprove, onReject, onDeliver, onView }) {
  if (item.status === 1) {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled={busy}
          onClick={onApprove}
          className="h-7 px-3 rounded text-[13px] font-bold transition hover:brightness-95 disabled:opacity-50"
          style={{ backgroundColor: C.lime, color: C.navy }}
        >
          Approve
        </button>
        <button disabled={busy} onClick={onReject} className={ACTION_BTN} style={{ backgroundColor: C.slate }}>
          Reject
        </button>
      </div>
    );
  }
  if (item.status === 2) {
    return (
      <button disabled={busy} onClick={onDeliver} className={ACTION_BTN} style={{ backgroundColor: C.slate }}>
        Mark Delivered
      </button>
    );
  }
  return (
    <button onClick={onView} className={ACTION_BTN} style={{ backgroundColor: C.slate }}>
      View
    </button>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2" style={{ borderBottom: `1px solid ${C.rowLine}` }}>
      <span className="text-xs uppercase tracking-[1px]" style={{ color: C.grey }}>
        {label}
      </span>
      <span className="text-sm text-right" style={{ color: C.text }}>
        {value || "-"}
      </span>
    </div>
  );
}

export default function AdminRedemptions() {
  const navigate = useNavigate();

  const [state, setState] = useState({ loading: true, error: "", items: [], rewards: [] });
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState({}); // id -> user object, ya false agar load na ho saka
  const [actingId, setActingId] = useState(null);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [detail, setDetail] = useState(null);
  const requestedUsers = useRef(new Set());

  // ---- data load ----
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [claimsRes, rewardsRes] = await Promise.allSettled([listUserRewards(), getRewards()]);
      if (cancelled) return;

      if (claimsRes.status === "rejected") {
        setState({
          loading: false,
          error: claimsRes.reason?.message || "Failed to load redemptions",
          items: [],
          rewards: [],
        });
        return;
      }

      const items = [...claimsRes.value.rewards].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setState({
        loading: false,
        error: "",
        items,
        rewards: rewardsRes.status === "fulfilled" ? rewardsRes.value : [],
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- derived data ----
  const stats = useMemo(() => {
    const items = state.items;
    return {
      total: items.length,
      pending: items.filter((r) => r.status === 1).length,
      approved: items.filter((r) => r.status === 2 || r.status === 3).length,
      rejected: items.filter((r) => r.status === 4).length,
    };
  }, [state.items]);

  const rewardOptions = useMemo(() => {
    if (state.rewards.length > 0) return state.rewards.map((r) => ({ id: r.id, name: r.name }));
    const seen = new Map();
    state.items.forEach((r) => {
      if (r.reward) seen.set(r.reward_id, r.reward.name);
    });
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [state.rewards, state.items]);

  const filtered = useMemo(
    () => (filter ? state.items.filter((r) => String(r.reward_id) === filter) : state.items),
    [state.items, filter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  // List mein user ka naam nahi hota: sirf nazar aane wali rows ka detail laate hain
  useEffect(() => {
    pageItems.forEach((r) => {
      if (requestedUsers.current.has(r.id)) return;
      requestedUsers.current.add(r.id);
      getUserReward(r.id)
        .then((full) => setUsers((u) => ({ ...u, [r.id]: full?.user || false })))
        .catch(() => setUsers((u) => ({ ...u, [r.id]: false })));
    });
  }, [pageItems]);

  function userLabel(item) {
    const u = users[item.id];
    if (u === undefined) return "...";
    if (!u) return `User #${item.user_id}`;
    return u.display_name || u.username || `User #${item.user_id}`;
  }

  // ---- actions ----
  async function changeStatus(item, status, successText) {
    setActingId(item.id);
    setNotice({ type: "", text: "" });
    try {
      await updateUserRewardStatus(item.id, status);
      setState((s) => ({
        ...s,
        items: s.items.map((r) => (r.id === item.id ? { ...r, status } : r)),
      }));
      setNotice({ type: "success", text: successText });
    } catch (err) {
      setNotice({ type: "error", text: err?.message || "Failed to update status" });
    } finally {
      setActingId(null);
    }
  }

  function handleReject(item) {
    if (!window.confirm(`Reject request #RDM-${item.id}? This cannot be undone.`)) return;
    changeStatus(item, 4, `Request #RDM-${item.id} rejected.`);
  }

  async function openDetail(item) {
    setDetail({ id: item.id, loading: true, error: "", data: null });
    try {
      const data = await getUserReward(item.id);
      setDetail({ id: item.id, loading: false, error: "", data });
    } catch (err) {
      setDetail({ id: item.id, loading: false, error: err?.message || "Failed to load details", data: null });
    }
  }

  // ---- pagination ----
  const startNum = Math.max(1, Math.min(safePage - 1, totalPages - 2));
  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => startNum + i);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filtered.length);

  const statCards = [
    { label: "Total Requests", value: stats.total, color: "#FFFFFF" },
    { label: "Pending", value: stats.pending, color: "#FF8D58" },
    { label: "Approved", value: stats.approved, color: "#78FF47" },
    { label: "Rejected", value: stats.rejected, color: "#FF6161" },
  ];

  return (
    <AdminLayout>
      <div style={{ fontFamily: FONT }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-3">
          <div>
            <h1 className="text-[32px] leading-10 font-bold" style={{ color: C.primary }}>
              Redemptions
            </h1>
            <p className="text-base leading-6" style={{ color: C.primary }}>
              Review and process prize claims from the gaming ecosystem.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/rewards")}
            className="inline-flex items-center justify-center gap-2 w-[189px] px-6 py-2.5 rounded-full text-base font-bold transition hover:brightness-95"
            style={{
              backgroundColor: C.yellow,
              color: C.navy,
              boxShadow: "0 0 15px rgba(221,238,42,0.15)",
            }}
          >
            <PlusCircle className="w-5 h-5" />
            Add Reward
          </button>
        </div>

        {notice.text && (
          <div
            className="mb-6 rounded-lg px-4 py-3 text-sm"
            style={
              notice.type === "success"
                ? {
                    color: C.lime,
                    backgroundColor: "rgba(219,238,42,0.1)",
                    border: "1px solid rgba(219,238,42,0.2)",
                  }
                : {
                    color: "#FF6161",
                    backgroundColor: "rgba(255,97,97,0.1)",
                    border: "1px solid rgba(255,97,97,0.25)",
                  }
            }
          >
            {notice.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-1 rounded-xl p-6 pb-9"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
            >
              <p
                className="text-base leading-6 font-medium uppercase tracking-[-0.8px]"
                style={{ color: C.primary }}
              >
                {s.label}
              </p>
              <p className="text-[32px] leading-[48px] font-bold" style={{ color: s.color }}>
                {state.loading ? "-" : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
        >
          {/* Filter */}
          <div className="p-6">
            <div className="relative inline-block">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none w-[145px] h-[38px] pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                style={{
                  backgroundColor: C.bar,
                  border: `1px solid ${C.border}`,
                  color: C.text,
                }}
              >
                <option value="">All Rewards</option>
                {rewardOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: C.text }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[860px]">
              <thead>
                <tr
                  className="h-12"
                  style={{ backgroundColor: C.bar, borderBottom: `1px solid ${C.headerLine}` }}
                >
                  {HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-3 first:pl-6 last:pr-6 text-[10px] leading-[15px] font-medium uppercase tracking-[1px] whitespace-nowrap"
                      style={{ color: C.grey }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.loading && (
                  <tr className="h-[81px]">
                    <td colSpan={7} className="pl-6 text-sm" style={{ color: C.grey }}>
                      Loading redemptions...
                    </td>
                  </tr>
                )}

                {!state.loading && state.error && (
                  <tr className="h-[81px]">
                    <td colSpan={7} className="pl-6 text-sm" style={{ color: "#FF6161" }}>
                      {state.error}
                    </td>
                  </tr>
                )}

                {!state.loading && !state.error && filtered.length === 0 && (
                  <tr className="h-[81px]">
                    <td colSpan={7} className="pl-6 text-sm" style={{ color: C.grey }}>
                      No redemption requests found.
                    </td>
                  </tr>
                )}

                {pageItems.map((r, i) => {
                  const label = STATUS_LABEL[r.status] || "Unknown";
                  const style = STATUS_STYLE[label] || FALLBACK_STYLE;
                  return (
                    <tr
                      key={r.id}
                      className="h-[81px]"
                      style={i > 0 ? { borderTop: `1px solid ${C.rowLine}` } : undefined}
                    >
                      <td
                        className="px-3 first:pl-6 text-base font-medium whitespace-nowrap"
                        style={{ color: C.lime }}
                      >
                        #RDM-{r.id}
                      </td>
                      <td
                        className="px-3 text-sm font-semibold whitespace-nowrap"
                        style={{ color: C.text }}
                      >
                        {userLabel(r)}
                      </td>
                      <td className="px-3 text-sm whitespace-nowrap" style={{ color: C.text }}>
                        {r.reward?.name || "-"}
                      </td>
                      <td
                        className="px-3 text-sm font-medium whitespace-nowrap"
                        style={{ color: C.text }}
                      >
                        {Number(r.reward?.carrot || 0).toLocaleString()}
                      </td>
                      <td className="px-3 text-sm whitespace-nowrap" style={{ color: C.text }}>
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-3 whitespace-nowrap">
                        <span
                          className="inline-block px-2 py-[3px] rounded text-[10px] leading-[14px] font-bold tracking-[0.5px]"
                          style={{ backgroundColor: style.bg, color: style.color }}
                        >
                          {label.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 last:pr-6 whitespace-nowrap">
                        <RowActions
                          item={r}
                          busy={actingId === r.id}
                          onApprove={() => changeStatus(r, 2, `Request #RDM-${r.id} approved and marked as shipped.`)}
                          onReject={() => handleReject(r)}
                          onDeliver={() => changeStatus(r, 3, `Request #RDM-${r.id} marked as delivered.`)}
                          onView={() => openDetail(r)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div
            className="flex items-center justify-between flex-wrap gap-3 p-6"
            style={{ borderTop: `1px solid ${C.rowLine}` }}
          >
            <span className="text-base leading-6 font-medium" style={{ color: C.primary }}>
              Showing {from}-{to} of {filtered.length} requests
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="w-8 h-8 rounded flex items-center justify-center transition hover:brightness-125 disabled:opacity-40"
                style={{ backgroundColor: C.bar, border: `1px solid ${C.headerLine}`, color: C.text }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="w-8 h-8 rounded text-sm font-semibold transition hover:brightness-125"
                  style={
                    n === safePage
                      ? { backgroundColor: C.lime, border: `1px solid ${C.lime}`, color: C.navy }
                      : { backgroundColor: C.bar, border: `1px solid ${C.headerLine}`, color: C.text }
                  }
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="w-8 h-8 rounded flex items-center justify-center transition hover:brightness-125 disabled:opacity-40"
                style={{ backgroundColor: C.bar, border: `1px solid ${C.headerLine}`, color: C.text }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View modal: Figma mein design nahi tha, theme ke mutabiq banaya hai */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", fontFamily: FONT }}
          onClick={() => setDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] rounded-2xl p-6"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: C.primary }}>
                Request #RDM-{detail.id}
              </h2>
              <button onClick={() => setDetail(null)} aria-label="Close" style={{ color: C.grey }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {detail.loading && (
              <p className="text-sm" style={{ color: C.grey }}>
                Loading details...
              </p>
            )}
            {detail.error && (
              <p className="text-sm" style={{ color: "#FF6161" }}>
                {detail.error}
              </p>
            )}

            {detail.data && (
              <div>
                <DetailRow label="User" value={detail.data.user?.display_name} />
                <DetailRow label="Username" value={detail.data.user?.username} />
                <DetailRow label="Email" value={detail.data.user?.email} />
                <DetailRow label="Reward" value={detail.data.reward?.name} />
                <DetailRow label="Description" value={detail.data.reward?.description} />
                <DetailRow
                  label="Carrots"
                  value={Number(detail.data.reward?.carrot || 0).toLocaleString()}
                />
                <DetailRow label="Status" value={STATUS_LABEL[detail.data.status] || "Unknown"} />
                <DetailRow label="Submitted" value={formatDate(detail.data.created_at)} />
                <DetailRow label="Last updated" value={formatDate(detail.data.updated_at)} />
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}