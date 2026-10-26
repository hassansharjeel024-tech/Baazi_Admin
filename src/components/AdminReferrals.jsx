import { useMemo, useState } from "react";
import {
  Download,
  Settings2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import DataTable from "./ui/DataTable";

// Top referrers photos (circular)
import topNeonracer from "../assets/topref-neonracer.png";
import topAliKhan from "../assets/topref-ali-khan.png";
import topMohsinRiaz from "../assets/topref-mohsin-riaz.png";
import topVoidx from "../assets/topref-voidx.png";

// Activity log initials boxes (40x40)
import logNeonracer from "../assets/avatar-neonracer.png";
import logAliKhan from "../assets/avatar-ali-khan.png";
import logMohsinRiaz from "../assets/avatar-mohsin-riaz.png";
import logVoidx from "../assets/avatar-voidx.png";
import { colors } from "../theme";

// Top referrers photo size in px (change here if it doesn't match Figma)
const TOPREF_AVATAR_SIZE = 32;

const STAT_CARDS = [
  { label: "TOTAL REFERRALS", value: "6284" },
  { label: "JOINED VIA REFERRALS", value: "4,901" },
  { label: "CARROTS REWARDED", value: "980k" },
  { label: "AVG. REFERRALS/\u200BUSERS", value: "3.4" },
];

const TOP_REFERRERS = [
  { user: "NeonRacer", photo: topNeonracer, referred: 42, joined: 38, earned: "8,400" },
  { user: "Ali Khan", photo: topAliKhan, referred: 31, joined: 28, earned: "6,200" },
  { user: "Mohsin Riaz", photo: topMohsinRiaz, referred: 19, joined: 17, earned: "3,800" },
  { user: "VoidX", photo: topVoidx, referred: 14, joined: 11, earned: "2,800" },
];

const ACTIVITY_LOG = [
  { referrer: "NeonRacer", avatar: logNeonracer, tier: "Tier: Diamond", code: "NEON42", invited: 42, joined: 38, earned: "8,400", lastActivity: "18 Jul 2026" },
  { referrer: "Ali Khan", avatar: logAliKhan, tier: "Tier: Platinum", code: "ALIK31", invited: 31, joined: 28, earned: "6,200", lastActivity: "17 Jul 2026" },
  { referrer: "Mohsin Riaz", avatar: logMohsinRiaz, tier: "Tier: Gold", code: "MOHN19", invited: 19, joined: 17, earned: "3,800", lastActivity: "16 Jul 2026" },
  { referrer: "VoidX", avatar: logVoidx, tier: "Tier: Silver", code: "VOID14", invited: 14, joined: 11, earned: "2,800", lastActivity: "14 Jul 2026" },
];

const SETTINGS = [
  {
    label: "Reward per referral (referrer)",
    value: "200 CARROTS",
    labelWidth: 154,
    valueWidth: 79,
  },
  { label: "Reward for new joiner", value: "100 CARROTS" },
  { label: "Max referrals per user", value: "UNLIMITED" },
];

// Figma-confirmed colors
const CARD_BG = colors.surface;
const CARD_BORDER = colors.border; // colors.accent @ 22%
const TEXT_MUTED = colors.textPrimary;
const TEXT_LIGHT = colors.textLight; // table row text
const TEXT_GREY = colors.textSecondary; // last activity dates
const ACCENT = colors.primaryBright; // Figma text accent on this screen
const TABLE_HEAD_BG = colors.surfaceElevated;
const BUTTON_BORDER = colors.primaryPale;
const CODE_CHIP_BG = colors.backgroundInk;
const AVATAR_BG = colors.surfaceMuted;
const AVATAR_BORDER = colors.borderMid;

const FONT_MONT = { fontFamily: "'Montserrat', sans-serif" };
const FONT_JAKARTA = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const cardStyle = {
  backgroundColor: CARD_BG,
  border: `1px solid ${CARD_BORDER}`,
};

const thStyle = {
  padding: "16px 24px",
  textAlign: "left",
  borderBottom: `1px solid ${CARD_BORDER}`,
};

const numThStyle = {
  ...thStyle,
  textAlign: "right",
  whiteSpace: "nowrap",
  width: "1%",
};

// Top referrers row text (Figma-confirmed)
const nameStyle = {
  fontWeight: 700,
  fontSize: 16,
  lineHeight: "24px",
  color: TEXT_LIGHT,
};

const numCellStyle = {
  ...FONT_JAKARTA,
  fontWeight: 400,
  fontSize: 16,
  lineHeight: "24px",
  color: TEXT_LIGHT,
  padding: "16px 24px",
};

const earnedCellStyle = {
  fontWeight: 500,
  fontSize: 16,
  lineHeight: "24px",
  color: ACCENT,
  padding: "16px 24px",
};

// Activity log row text (Figma-confirmed)
const logNameStyle = {
  ...FONT_JAKARTA,
  fontWeight: 700,
  fontSize: 16,
  lineHeight: "24px",
  color: colors.white,
};

const logCountStyle = {
  ...FONT_JAKARTA,
  fontWeight: 700,
  fontSize: 16,
  lineHeight: "24px",
  color: TEXT_LIGHT,
  padding: "16px 24px",
  textAlign: "center",
};

const logDateStyle = {
  ...FONT_JAKARTA,
  fontWeight: 400,
  fontSize: 16,
  lineHeight: "24px",
  color: TEXT_GREY,
  padding: "16px 24px",
  textAlign: "right",
};

export default function AdminReferrals() {
  const [page, setPage] = useState(1);
  const totalPages = 2;

  const topReferrerColumns = useMemo(
    () => [
      {
        key: "user",
        header: "USER",
        headerStyle: { ...thStyle, width: "100%" },
        cellStyle: { padding: "16px 24px" },
        render: (row) => (
          <div className="flex items-center gap-3">
            <img
              src={row.photo}
              alt={row.user}
              className="rounded-full object-cover shrink-0"
              style={{
                width: TOPREF_AVATAR_SIZE,
                height: TOPREF_AVATAR_SIZE,
                backgroundColor: AVATAR_BG,
              }}
            />
            <span style={nameStyle}>{row.user}</span>
          </div>
        ),
      },
      {
        key: "referred",
        header: "REFERRED",
        headerStyle: numThStyle,
        cellClassName: "text-right",
        cellStyle: numCellStyle,
        accessor: "referred",
      },
      {
        key: "joined",
        header: "JOINED",
        headerStyle: numThStyle,
        cellClassName: "text-right",
        cellStyle: numCellStyle,
        accessor: "joined",
      },
      {
        key: "earned",
        header: "EARNED",
        headerStyle: numThStyle,
        cellClassName: "text-right",
        cellStyle: earnedCellStyle,
        accessor: "earned",
      },
    ],
    []
  );

  const activityColumns = useMemo(
    () => [
      {
        key: "referrer",
        header: "REFERRER",
        headerStyle: { ...thStyle, width: "20.7%" },
        cellStyle: { padding: "16px 24px" },
        render: (row) => (
          <div className="flex items-center gap-3">
            <img
              src={row.avatar}
              alt={row.referrer}
              className="shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                backgroundColor: AVATAR_BG,
                border: `1px solid ${AVATAR_BORDER}`,
              }}
            />
            <div className="min-w-0">
              <p style={logNameStyle}>{row.referrer}</p>
              <p style={{ fontSize: 14, lineHeight: "24px", color: TEXT_GREY }}>{row.tier}</p>
            </div>
          </div>
        ),
      },
      {
        key: "code",
        header: (
          <>
            REFERRAL
            <br />
            CODE
          </>
        ),
        headerStyle: { ...thStyle, width: "18.2%" },
        cellStyle: { padding: "16px 24px" },
        render: (row) => (
          <span
            className="inline-flex items-center rounded"
            style={{
              padding: "2.5px 12px",
              backgroundColor: CODE_CHIP_BG,
              border: `1px solid ${CARD_BORDER}`,
              color: ACCENT,
              fontWeight: 500,
              fontSize: 16,
              lineHeight: "24px",
            }}
          >
            {row.code}
          </span>
        ),
      },
      {
        key: "invited",
        header: "INVITED",
        headerStyle: { ...thStyle, width: "12.4%", textAlign: "center" },
        cellStyle: logCountStyle,
        accessor: "invited",
      },
      {
        key: "joined",
        header: "JOINED",
        headerStyle: { ...thStyle, width: "11.5%", textAlign: "center" },
        cellStyle: logCountStyle,
        accessor: "joined",
      },
      {
        key: "earned",
        header: (
          <>
            CARROTS
            <br />
            EARNED
          </>
        ),
        headerStyle: { ...thStyle, width: "18.7%", textAlign: "right" },
        cellClassName: "text-right",
        cellStyle: earnedCellStyle,
        accessor: "earned",
      },
      {
        key: "lastActivity",
        header: (
          <>
            LAST
            <br />
            ACTIVITY
          </>
        ),
        headerStyle: { ...thStyle, width: "18.5%", textAlign: "right" },
        cellStyle: logDateStyle,
        accessor: "lastActivity",
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div style={FONT_MONT}>
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1
              style={{
                fontWeight: 700,
                fontSize: 32,
                lineHeight: "40px",
                color: TEXT_MUTED,
              }}
            >
              Referrals
            </h1>
            <p
              style={{
                fontWeight: 400,
                fontSize: 16,
                lineHeight: "24px",
                color: TEXT_MUTED,
              }}
            >
              Manage network expansion and conversion performance.
            </p>
          </div>
          <button
            className="flex items-center rounded-lg"
            style={{
              ...FONT_JAKARTA,
              backgroundColor: colors.button,
              border: `1px solid ${CARD_BORDER}`,
              padding: "10px 33.64px 10px 24px",
              gap: "17.62px",
              fontWeight: 600,
              fontSize: 16,
              lineHeight: "24px",
              color: colors.textLight,
            }}
          >
            <Download size={16} color={colors.textLight} />
            Export Data
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className="rounded-xl flex flex-col gap-1"
              style={{ ...cardStyle, padding: "24px 24px 36px 24px" }}
            >
              <p
                style={{
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: "24px",
                  letterSpacing: "-0.8px",
                  textTransform: "uppercase",
                  color: TEXT_MUTED,
                  minHeight: 48,
                }}
              >
                {card.label}
              </p>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 32,
                  lineHeight: "48px",
                  color: colors.white,
                }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[358.4fr_545.6fr] gap-4 mb-8">
          {/* Referral program settings */}
          <div className="rounded-xl flex flex-col" style={cardStyle}>
            <div
              className="flex items-center justify-between"
              style={{
                padding: "24px 23.99px 24px 24px",
                borderBottom: `1px solid ${CARD_BORDER}`,
              }}
            >
              <h2
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: "24px",
                  color: colors.white,
                }}
              >
                Referral program settings
              </h2>
              <Settings2 size={18} color={colors.primaryMuted} />
            </div>

            <div className="flex-1" style={{ padding: "20px 24px 0 24px" }}>
              {SETTINGS.map((setting) => (
                <div
                  key={setting.label}
                  className="flex items-center justify-between gap-4"
                  style={{
                    padding: "18px 0",
                    borderBottom: `1px solid ${CARD_BORDER}`,
                  }}
                >
                  <span
                    style={{
                      width: setting.labelWidth,
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: "24px",
                      color: TEXT_MUTED,
                    }}
                  >
                    {setting.label}
                  </span>
                  <span
                    className="text-right"
                    style={{
                      width: setting.valueWidth,
                      fontWeight: 500,
                      fontSize: 16,
                      lineHeight: "24px",
                      color: ACCENT,
                    }}
                  >
                    {setting.value}
                  </span>
                </div>
              ))}
              <div
                className="flex items-center justify-between gap-4"
                style={{ padding: "18px 0" }}
              >
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: "24px",
                    color: TEXT_MUTED,
                  }}
                >
                  Program status
                </span>
                <span
                  className="flex items-center gap-2"
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: "24px",
                    color: ACCENT,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: ACCENT }}
                  />
                  ACTIVE
                </span>
              </div>
            </div>

            <div style={{ padding: "12px 24px 24px 24px" }}>
              <button
                className="w-full rounded-lg"
                style={{
                  ...FONT_JAKARTA,
                  padding: "12px 0",
                  border: `1px solid ${BUTTON_BORDER}`,
                  backgroundColor: CARD_BG,
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: "24px",
                  color: colors.white,
                }}
              >
                Edit settings
              </button>
            </div>
          </div>

          {/* Top referrers */}
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <div
              className="flex items-center justify-between"
              style={{
                padding: "24px",
                borderBottom: `1px solid ${CARD_BORDER}`,
              }}
            >
              <h2
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: "24px",
                  color: colors.white,
                }}
              >
                Top referrers
              </h2>
              <button
                style={{
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: "24px",
                  color: ACCENT,
                }}
              >
                View all
              </button>
            </div>
            <DataTable
              scrollable={false}
              tableClassName="w-full"
              theadRowStyle={{ backgroundColor: TABLE_HEAD_BG }}
              columns={topReferrerColumns}
              data={TOP_REFERRERS}
              getRowKey={(row) => row.user}
              divided="top"
              divider={`1px solid ${CARD_BORDER}`}
            />
          </div>
        </div>

        {/* Referral activity log */}
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <div
            style={{
              padding: "24px",
              borderBottom: `1px solid ${CARD_BORDER}`,
            }}
          >
            <h2
              style={{
                fontWeight: 600,
                fontSize: 18,
                lineHeight: "24px",
                color: colors.white,
              }}
            >
              Referral activity log
            </h2>
          </div>
          <DataTable
            tableClassName="w-full"
            tableStyle={{ tableLayout: "fixed", minWidth: 900 }}
            theadRowStyle={{ backgroundColor: TABLE_HEAD_BG }}
            columns={activityColumns}
            data={ACTIVITY_LOG}
            getRowKey={(row) => row.code}
            divided="top"
            divider={`1px solid ${CARD_BORDER}`}
          />

          {/* Footer: count + numbered pagination */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: "16px 24px",
              borderTop: `1px solid ${CARD_BORDER}`,
            }}
          >
            <p
              style={{
                fontWeight: 500,
                fontSize: 16,
                lineHeight: "24px",
                color: CARD_BORDER,
              }}
            >
              Showing {ACTIVITY_LOG.length} of 248 referrers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded flex items-center justify-center disabled:opacity-40"
                style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_LIGHT }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="w-8 h-8 rounded flex items-center justify-center text-sm font-medium"
                  style={
                    n === page
                      ? { backgroundColor: ACCENT, color: colors.surfacePanel }
                      : { border: `1px solid ${CARD_BORDER}`, color: TEXT_LIGHT }
                  }
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded flex items-center justify-center disabled:opacity-40"
                style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_LIGHT }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}