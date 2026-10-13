import { Link } from "react-router-dom";
import {
    SlidersHorizontal,
    Download,
    Eye,
    User,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import AdminLayout from "./AdminLayout";

// Figma values
const BASE = "#091E46"; // dark blue bg Color
const BORDER = "rgba(59,130,246,0.22)"; // loading bar blue 22%
const LIME = "#DBE21C";
const MUTED = "#8A94B8";
const BTN_BG = "rgba(37,42,56,0.5)"; // Figma fill #252A38
const BANNED_TINT = "rgba(89,17,20,0.42)"; // #591114 at 42%
const ROW_BANNED = "rgba(105,0,5,0.35)"; // #690005 at 35% (banned row)
const HEADER_BG = "#120D2A"; // table header bg
const TEXT_PRIMARY = "#D0D0D0"; // Color-primary
const REGISTRY_GREY = "#6B7280"; // Player Registry heading
const LIME_PILL = "#DBEE2A"; // Active pill
const LEVEL_TEXT = "#DEE2F5"; // Level / balance / name text
const STATS = [
    {
        label: "Total Players",
        value: "48,291",
        note: "+12% this month",
        noteColor: "#4ADE80",
        valueColor: "#FFFFFF",
        trend: true,
    },
    {
        label: "Active (30D)",
        value: "31,044",
        note: "Live Session Tracking",
        valueColor: LIME,
    },
    {
        label: "Banned",
        value: "127",
        note: "Flagged for Review",
        valueColor: "#FF9A9A",
    },
];

   const PLAYERS = [
    { id: "#BZ-1001", name: "Mohsin Riaz", email: "mohsin@gmail.com", level: 14, balance: "2,400", status: "Active", joined: "Joined Jan 2026" },
    { id: "#BZ-1001", name: "Mohsin Riaz", email: "mohsin@gmail.com", level: 14, balance: "2,400", status: "Active", joined: "Joined Jan 2026" },
    { id: "#BZ-1001", name: "Mohsin Riaz", email: "mohsin@gmail.com", level: 14, balance: "2,400", status: "Active", joined: "Joined Jan 2026" },
    { id: "#BZ-1004", name: "Unknown X", email: "x@spam.com", level: 1, balance: "0", status: "Banned", joined: "Joined Jan 2026" },
    { id: "#BZ-1001", name: "Mohsin Riaz", email: "mohsin@gmail.com", level: 14, balance: "2,400", status: "Active", joined: "Joined Jan 2026" },
];

const STATUS_STYLE = {
    Active: { color: LIME_PILL, border: "rgba(219,238,42,0.2)", bg: "rgba(219,238,42,0.1)" },
    Banned: { color: "#F87171", border: "#B11A22", bg: BANNED_TINT },
};

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
            <p
                className="text-xs flex items-center gap-1"
                style={{ color: noteColor || MUTED }}
            >
                {trend && <TrendingUp className="w-3 h-3" />}
                {note}
            </p>
        </div>
    );
}

export default function AdminUsers() {
    return (
        <AdminLayout>
            <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-[32px] leading-[40px] font-bold mb-1" style={{ color: TEXT_PRIMARY }}>User Management</h1>
                    <p className="text-sm max-w-[420px]" style={{ color: MUTED }}>
                        Manage player accounts, monitor carrot balances, and oversee platform integrity
                        with administrative controls.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        className="flex items-center justify-center gap-2 text-white text-sm font-medium px-6 h-[46px] rounded-lg hover:brightness-125 transition"
                        style={{ backgroundColor: BTN_BG, border: `1px solid ${BORDER}` }}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filter
                    </button>
                    <button
                        className="flex items-center justify-center gap-2 text-white text-sm font-medium w-[156px] h-[46px] rounded-lg hover:brightness-125 transition"
                        style={{ backgroundColor: BTN_BG, border: `1px solid ${BORDER}` }}
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {STATS.map((s) => (
                    <StatCard key={s.label} {...s} />
                ))}
            </div>

            <div
                className="rounded-xl overflow-hidden"
                style={{
                    backgroundColor: BASE,
                    border: `1px solid ${BORDER}`,
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                }}
            >
                <div className="flex items-center justify-between px-5 py-4">
                    <h2 className="text-base font-normal" style={{ color: REGISTRY_GREY }}>
                        Player Registry
                    </h2>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                        <span>Showing 1-10 of 12,482</span>
                        <button className="hover:text-white transition" aria-label="Previous page">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="hover:text-white transition" aria-label="Next page">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[900px]">
                        <thead>
                            <tr
                                className="text-[14px] leading-6 font-medium uppercase tracking-[0.8px]"
                                style={{
                                    backgroundColor: HEADER_BG,
                                    color: TEXT_PRIMARY,
                                    borderBottom: `1px solid ${BORDER}`,
                                }}
                            >
                                <th className="py-4 pl-5 font-medium">ID</th>
                                <th className="py-4 font-medium">Player</th>
                                <th className="py-4 font-medium">Email</th>
                                <th className="py-4 font-medium">Level</th>
                                <th className="py-4 font-medium leading-tight">
                                    Carrot
                                    <br />
                                    Balance
                                </th>
                                <th className="py-4 font-medium">Status</th>
                                <th className="py-4 pr-6 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PLAYERS.map((p, i) => (
                                <tr
                                   key={i}
                                    style={{
                                        borderTop: "1px solid rgba(255,255,255,0.06)",
                                        backgroundColor: p.status === "Banned" ? ROW_BANNED : "transparent",
                                    }}
                                >
                                    <td
                                        className="py-4 pl-5 text-base font-medium"
                                        style={{ color: REGISTRY_GREY }}
                                    >
                                        {p.id}
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="w-7 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                style={{
                                                    backgroundColor: "#303443",
                                                    border: `1px solid ${BORDER}`,
                                                    color: LIME,
                                                }}
                                            >
                                                <User className="w-4 h-4" />
                                            </span>
                                            <div className="min-w-0">
                                                <p
                                                    className="text-base font-medium leading-6 truncate"
                                                    style={{ color: LEVEL_TEXT }}
                                                >
                                                    {p.name}
                                                </p>
                                                <p
                                                    className="text-base font-medium leading-6"
                                                    style={{ color: REGISTRY_GREY }}
                                                >
                                                    {p.joined}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td
                                        className="py-4 text-base font-normal"
                                        style={{ color: REGISTRY_GREY }}
                                    >
                                        {p.email}
                                    </td>
                                    <td
                                        className="py-4 text-base font-medium"
                                        style={{ color: LEVEL_TEXT }}
                                    >
                                        {p.level}
                                    </td>
                                    <td
                                        className="py-4 text-base font-medium"
                                        style={{ color: LEVEL_TEXT }}
                                    >
                                        {p.balance}
                                    </td>
                                    <td className="py-4">
                                        <span
                                            className="inline-block px-[10px] py-[2px] rounded-full text-[12px] leading-[18px] font-medium"
                                            style={{
                                                backgroundColor: STATUS_STYLE[p.status].bg,
                                                color: STATUS_STYLE[p.status].color,
                                                border: `1px solid ${STATUS_STYLE[p.status].border}`,
                                            }}
                                        >
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-6 text-right">
                                        <Link
                                            to={`/admin/users/${p.id.replace("#", "")}`}
                                            className="text-white/60 hover:text-white transition-colors inline-flex"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

        <div
    className="w-full"
    style={{ height: "81px", backgroundColor: BASE, borderTop: `1px solid ${BORDER}` }}
/>
            </div>
        </AdminLayout>
    );
}