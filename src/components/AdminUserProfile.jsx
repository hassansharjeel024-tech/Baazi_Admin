import { useState } from "react";
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
  SlidersHorizontal,
  Download,
  Users2,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import profileAvatar from "../assets/profile-avatar.png";
import { colors } from "../theme";
const USER = {
  name: "Mohsin Riaz",
  initials: "MR",
  email: "mohsin@mail.com",
  joined: "Joined Jan 12, 2026",
  location: "Pakistan",
  status: "ACTIVE",
  level: "LEVEL 14",
  lastSeen: "Last seen 18 Jul 2026",
  ref: "Ref: MOHN19",
};

const STAT_CARDS = [
  { label: "CARROT BALANCE", value: "2400", icon: Receipt, valueColor: colors.textLight },
  { label: "XP / COINS EARNED", value: "696", icon: Zap, valueColor: colors.primary },
  { label: "TOTAL TRANSACTIONS", value: "9", icon: ArrowLeftRight, valueColor: colors.violetGlow },
];

const TABS = [
  { label: "Transactions", icon: Receipt },
  { label: "Tasks & XP", icon: Zap },
  { label: "Redemptions", icon: Gift },
  { label: "Referrals", icon: Users2 },
];

const TRANSACTIONS = [
  {
    icon: ShoppingBag,
    iconColor: colors.primaryBright,
    iconSize: 18,
    iconBg: colors.oliveBg10,
    title: "Purchased Mega Pack",
    subtitle: "Stripe · Card ending 4242 · $9.99",
    amount: "+10,000",
    unit: "CARROTS",
  },
  {
    icon: Trophy,
    iconColor: colors.accentSoft,
    iconSize: 18,
    iconBg: colors.accentBg10,
    title: "Task reward — Eat 20 apples",
    subtitle: "Snake Classic · Level 14",
    amount: "+20",
    unit: "XP COINS",
  },
  {
    icon: Gift,
    iconColor: colors.dangerSoft,
    iconSize: 20,
    iconBg: colors.dangerSoftBg10,
    title: "Redemption — AirPods Pro",
    subtitle: "Redemption #RDM-1040",
    amount: "-20,000",
    unit: "CARROTS",
  },
];

const BASE = colors.surface;
const BORDER = colors.border;
const LIME = colors.primary;

const cardStyle = {
  backgroundColor: BASE,
  border: `1px solid ${BORDER}`,
};

const btnStyle = {
  backgroundColor: colors.surfaceMuted,
  border: `1px solid ${BORDER}`,
};

// Figma: Background+HorizontalBorder / Footer-Pagination
const PANEL_HEADER_BG = colors.surfaceElevated;
const PANEL_HEADER_BORDER = colors.borderDark;

// Figma: List Item border
const ROW_BORDER = colors.accentSoftBg;

export default function AdminUserProfile() {
  const [activeTab, setActiveTab] = useState("Transactions");
  const [page, setPage] = useState(1);
  const totalPages = 2;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[32px] leading-[40px] font-bold" style={{ color: colors.textPrimary }}>
            {USER.name} - User Profile
          </h1>
          <p className="text-base leading-6 mt-1 max-w-xl" style={{ color: colors.textPrimary }}>
            Manage player accounts, monitor carrot balances, and oversee
            platform integrity with administrative controls.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
  className="flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white hover:brightness-125 transition h-[46px]"
  style={{ ...btnStyle, paddingTop: "21.5px", paddingRight: "24px", paddingBottom: "22px", paddingLeft: "24px" }}
>
  <SlidersHorizontal size={16} />
  Filter
</button>
          <button
  className="flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white hover:brightness-125 transition w-[156px] h-[46px]"
  style={{ ...btnStyle, paddingTop: "10px", paddingRight: "33.64px", paddingBottom: "10px", paddingLeft: "24px" }}
>
  <Download size={16} />
  Export CSV
</button>
        </div>
      </div>

      {/* Profile header card */}
      <div className="rounded-xl p-6 mb-6" style={cardStyle}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
             <img
  src={profileAvatar}
  alt="Profile Avatar"
  className="rounded-full"
  style={{ width: "92.28px", height: "96px" }}
/>

            
            </div>
            <div>
              <p className="text-base leading-6 font-normal" style={{ color: colors.white }}>{USER.name}</p>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} />
                  {USER.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {USER.joined}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {USER.location}
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-2 mt-3">
               <span
  className="px-3 py-1 rounded-full text-xs font-medium"
  style={{ color: colors.primaryBright, backgroundColor: colors.primaryBg20, border: `1px solid ${colors.primaryBg30}` }}
>
  {USER.status}
</span>
               <span
  className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
  style={{ backgroundColor: colors.accentPrimary }}
>
  {USER.level} 
</span>
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Circle size={6} fill="currentColor" />
                  {USER.lastSeen}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Hash size={12} />
                  {USER.ref}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
        <button
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
  className="flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white hover:brightness-110 transition w-[150px]"
  style={{ backgroundColor: colors.accentPrimary, border: `1px solid ${colors.accentPrimary}`, paddingTop: "10px", paddingBottom: "10px", paddingLeft: "44.02px", paddingRight: "44.02px" }}
>
  <KeyRound size={16} />
  Reset Password
</button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl p-5" style={cardStyle}>
              <div className="flex items-center gap-2 text-xs text-gray-400 tracking-wide mb-2">
                <Icon size={14} />
                {card.label}
              </div>
             <p
  className="text-[48px] leading-[56px] font-extrabold"
  style={{ color: card.valueColor || colors.white, letterSpacing: "-0.96px" }}
>
  {card.value}
</p>
            </div>
          );
        })}
      </div>

      {/* Tabbed panel */}
      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        {/* Tab bar header — Figma: Background+HorizontalBorder, fill colors.surfaceElevated, border-bottom colors.borderDark */}
        <div
          className="flex items-center gap-2 py-6 px-8"
          style={{
            backgroundColor: PANEL_HEADER_BG,
            borderBottom: `1px solid ${PANEL_HEADER_BORDER}`,
          }}
        >
          {TABS.map(({ label, icon: Icon }) => {
            const active = activeTab === label;
            return (
                           <button
                key={label}
                onClick={() => setActiveTab(label)}
                className="flex items-center gap-2 px-4 py-2 rounded-md transition"
                style={{
                  backgroundColor: active ? colors.primaryBg15 : "transparent",
                  fontFamily: "'Montserrat', sans-serif",
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

        <div className="p-5">
          {activeTab === "Transactions" ? (
            <>
              <div className="space-y-3">
                {TRANSACTIONS.map((tx) => {
                  const Icon = tx.icon;
                  const negative = tx.amount.startsWith("-");
                  return (
                    <div
                      key={tx.title}
                      className="flex items-center justify-between rounded-xl p-4"
                      style={{ border: `1px solid ${ROW_BORDER}` }}
                    >
                      <div className="flex items-center gap-3">
                                                <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: tx.iconBg }}
                        >
                          <Icon size={tx.iconSize} style={{ color: tx.iconColor }} />
                        </div>
                        <div>
                                                    <p
                            style={{
                              fontFamily: "'Montserrat', sans-serif",
                              fontWeight: 400,
                              fontSize: "16px",
                              lineHeight: "24px",
                              color: colors.textPrimary,
                            }}
                          >
                            {tx.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {tx.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                                               <p
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 500,
                            fontSize: "24px",
                            lineHeight: "36px",
                            textAlign: "right",
                            color: negative ? colors.dangerSoft : colors.primary,
                          }}
                        >
                          {tx.amount}
                        </p>
                                                <p
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 500,
                            fontSize: "16px",
                            lineHeight: "24px",
                            letterSpacing: "-0.8px",
                            textAlign: "right",
                            textTransform: "uppercase",
                            color: colors.textSecondary,
                          }}
                        >
                          {tx.unit}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer / Pagination — Figma: fill colors.surfaceElevated, border-top colors.borderDark */}
              <div 
                               className="flex items-center justify-between mt-5 -mx-5 -mb-5 py-6 px-8"
                style={{
                  backgroundColor: PANEL_HEADER_BG,
                  borderTop: `1px solid ${PANEL_HEADER_BORDER}`,
                }}
              >
                <p className="text-sm text-gray-400">
                  Showing 1-4 of 9 transactions
                </p>
                <div className="flex items-center gap-1.5">
                                    <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-md flex items-center justify-center disabled:opacity-40"
                    style={{ color: colors.textSecondary }}
                  >
                    <ChevronLeft size={12} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                                           <button
                        key={n}
                        onClick={() => setPage(n)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium"
                        style={
                          n === page
                            ? { backgroundColor: LIME, color: colors.backgroundDarkest }
                            : { color: colors.textMuted, border: `1px solid ${colors.borderDark}` }
                        }
                      >
                        {n}
                      </button>
                    )
                  )}
                                   <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-10 h-10 rounded-md flex items-center justify-center disabled:opacity-40"
                    style={{ color: colors.textSecondary }}
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">
              No {activeTab.toLowerCase()} data yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}