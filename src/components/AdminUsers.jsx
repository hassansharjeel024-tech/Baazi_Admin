import { useMemo } from "react";
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
import DataTable from "./ui/DataTable";
import { colors } from "../theme";

// Figma values
const BASE = colors.surface; // dark blue bg Color
const BORDER = colors.border; // loading bar blue 22%
const LIME = colors.primary;
const MUTED = colors.textSubtle;
const BTN_BG = colors.buttonGhost; // Figma fill colors.surfaceMuted
const BANNED_TINT = colors.dangerBannedBg;
const ROW_BANNED = colors.dangerRowBg;
const HEADER_BG = colors.surfaceElevated; // table header bg
const TEXT_PRIMARY = colors.textPrimary; // Color-primary
const REGISTRY_GREY = colors.textSecondary; // Player Registry heading
const LIME_PILL = colors.primaryBright; // Active pill
const LEVEL_TEXT = colors.textLight; // Level / balance / name text
const STATS = [
    {
        label: "Total Players",
        value: "48,291",
        note: "+12% this month",
        noteColor: colors.successSoft,
        valueColor: colors.white,
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
        valueColor: colors.dangerBright,
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
    Active: { color: LIME_PILL, border: colors.primaryBg20, bg: colors.primaryBg10 },
    Banned: { color: colors.dangerBanned, border: colors.dangerBorder, bg: BANNED_TINT },
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
    const userColumns = useMemo(
        () => [
            {
                key: "id",
                header: "ID",
                headerClassName: "py-4 pl-5",
                cellClassName: "py-4 pl-5 text-base font-medium",
                cellStyle: { color: REGISTRY_GREY },
                accessor: "id",
            },
            {
                key: "player",
                header: "Player",
                headerClassName: "py-4",
                cellClassName: "py-4",
                render: (p) => (
                    <div className="flex items-center gap-3">
                        <span
                            className="w-7 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                                backgroundColor: colors.borderDark,
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
                ),
            },
            {
                key: "email",
                header: "Email",
                headerClassName: "py-4",
                cellClassName: "py-4 text-base font-normal",
                cellStyle: { color: REGISTRY_GREY },
                accessor: "email",
            },
            {
                key: "level",
                header: "Level",
                headerClassName: "py-4",
                cellClassName: "py-4 text-base font-medium",
                cellStyle: { color: LEVEL_TEXT },
                accessor: "level",
            },
            {
                key: "balance",
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
                accessor: "balance",
            },
            {
                key: "status",
                header: "Status",
                headerClassName: "py-4",
                cellClassName: "py-4",
                render: (p) => (
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
                ),
            },
            {
                key: "actions",
                header: "Actions",
                headerClassName: "py-4 pr-6 text-right",
                cellClassName: "py-4 pr-6 text-right",
                render: (p) => (
                    <Link
                        to={`/admin/users/${p.id.replace("#", "")}`}
                        className="text-white/60 hover:text-white transition-colors inline-flex"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                ),
            },
        ],
        []
    );

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
                    boxShadow: `0 25px 50px -12px ${colors.shadow}`,
                }}
            >
                <div className="flex items-center justify-between px-5 py-4">
                    <h2 className="text-base font-normal" style={{ color: REGISTRY_GREY }}>
                        Player Registry
                    </h2>
                    <div className="flex items-center gap-2 text-xs" style={{ color: colors.white70 }}>
                        <span>Showing 1-10 of 12,482</span>
                        <button className="hover:text-white transition" aria-label="Previous page">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="hover:text-white transition" aria-label="Next page">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <DataTable
                    tableClassName="w-full text-left text-sm min-w-[900px]"
                    theadRowStyle={{
                        backgroundColor: HEADER_BG,
                        borderBottom: `1px solid ${BORDER}`,
                    }}
                    columns={userColumns}
                    data={PLAYERS}
                    getRowKey={(_, i) => i}
                    divided="top"
                    divider={`1px solid ${colors.borderSubtle}`}
                    getRowStyle={(p) => ({
                        backgroundColor: p.status === "Banned" ? ROW_BANNED : "transparent",
                    })}
                />

        <div
    className="w-full"
    style={{ height: "81px", backgroundColor: BASE, borderTop: `1px solid ${BORDER}` }}
/>
            </div>
        </AdminLayout>
    );
}