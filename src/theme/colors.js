/**
 * Centralized Baazi Admin color system.
 * Use `colors` for semantic tokens. Prefer these over raw HEX/RGBA in components.
 */

/** Raw palette — unique values used across the app (do not use directly in UI). */
export const palette = {
  white: "#FFFFFF",
  black: "#000000",

  // Brand / lime accents
  lime: "#DBE21C",
  limeBright: "#DBEE2A",
  limeDark: "#BFD100",
  limePale: "#FDFFEA",
  limeMuted: "#C7C8AD",

  // Surfaces / navy
  navy: "#091E46",
  navyDeep: "#0F111A",
  navyDarkest: "#0A0E27",
  navyInk: "#090E1B",
  tableHeader: "#120D2A",
  panel: "#1F2544",
  formBg: "#0B1330",
  formSurface: "#111B45",
  chipBg: "#1A1E00",

  // Blues
  blue: "#3B82F6",
  bluePrimary: "#0053DB",
  blueSoft: "#B4C5FF",
  blueMuted: "#BFD4FF",
  blueDeep: "#1B3A7D",
  blueNav: "#153778",
  slate: "#1F2D63",
  slateAlt: "#1F2C73",
  slateButton: "#26346E",
  indigo: "#334A74",
  indigoMuted: "#3D465F",

  // Neutrals / text
  textPrimary: "#D0D0D0",
  textSecondary: "#6B7280",
  textLight: "#DEE2F5",
  textMuted: "#9CA3AF",
  textSubtle: "#8A94B8",
  borderOlive: "#464833",
  borderDark: "#303443",
  borderMid: "#242B3D",
  surfaceMuted: "#252A38",

  // Purple / charts
  purple: "#DDB8FF",
  purpleAccent: "#8C2AE3",

  // Status / feedback
  success: "#78FF47",
  successSoft: "#4ADE80",
  warning: "#FF8D58",
  danger: "#FF6161",
  dangerSoft: "#FFB4AB",
  dangerBright: "#FF9A9A",
  dangerBanned: "#F87171",
  dangerBorder: "#B11A22",
  dangerBg: "#591114",
  dangerRow: "#690005",
  processing: "#93000A",

  // External brand (login Google mark)
  googleBlue: "#4285F4",
  googleGreen: "#34A853",
  googleYellow: "#FBBC05",
  googleRed: "#EA4335",

  // Supporting tones (only used via alpha())
  inputBorder: "#8B919E",
  limeGlow: "#DDEE2A",
  violet: "#BC7EF4",
  olive: "#6B7224",
  loginGreen: "#00FF87",
};

/** Parse #RGB / #RRGGBB / #RRGGBBAA → { r, g, b } */
function hexToRgb(hex) {
  let h = String(hex).replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length === 8) h = h.slice(0, 6);
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Build rgba() from a palette hex + alpha 0–1 */
export function alpha(hex, opacity) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * Semantic theme tokens — use these in components.
 * Changing a value here updates every consumer.
 */
export const colors = {
  // Brand
  primary: palette.lime,
  primaryBright: palette.limeBright,
  primaryDark: palette.limeDark,
  primaryPale: palette.limePale,
  primaryMuted: palette.limeMuted,

  // Layout
  background: palette.navyDeep,
  backgroundPage: palette.navy,
  backgroundInk: palette.navyInk,
  backgroundDarkest: palette.navyDarkest,
  surface: palette.navy,
  surfaceElevated: palette.tableHeader,
  surfacePanel: palette.panel,
  surfaceForm: palette.formBg,
  surfaceFormAlt: palette.formSurface,
  surfaceMuted: palette.surfaceMuted,
  surfaceChip: palette.chipBg,

  // Accents / interactive blues
  accent: palette.blue,
  accentPrimary: palette.bluePrimary,
  accentSoft: palette.blueSoft,
  accentMuted: palette.blueMuted,
  accentDeep: palette.blueDeep,
  accentNav: palette.blueNav,
  button: palette.slate,
  buttonAlt: palette.slateAlt,
  buttonStrong: palette.slateButton,
  indigo: palette.indigo,
  indigoMuted: palette.indigoMuted,

  // Text
  text: palette.textPrimary,
  textPrimary: palette.textPrimary,
  textSecondary: palette.textSecondary,
  textLight: palette.textLight,
  textMuted: palette.textMuted,
  textSubtle: palette.textSubtle,
  textInverse: palette.white,
  white: palette.white,
  black: palette.black,

  // Borders
  border: alpha(palette.blue, 0.22),
  borderSoft: alpha(palette.blue, 0.12),
  borderStrong: alpha(palette.blue, 0.3),
  borderSubtle: alpha(palette.white, 0.06),
  borderFaint: alpha(palette.white, 0.08),
  borderMuted: alpha(palette.white, 0.1),
  borderLight: alpha(palette.white, 0.12),
  borderWhite18: alpha(palette.white, 0.18),
  borderWhite20: alpha(palette.white, 0.2),
  borderOlive: alpha(palette.borderOlive, 0.3),
  borderOliveSolid: palette.borderOlive,
  borderDark: palette.borderDark,
  borderMid: palette.borderMid,
  borderInput: alpha(palette.inputBorder, 0.2),
  borderLogin: alpha(palette.blue, 0.13),

  // Overlays / shadows
  overlay: alpha(palette.black, 0.6),
  shadow: alpha(palette.black, 0.25),
  skeleton: alpha(palette.white, 0.08),
  rowHover: alpha(palette.white, 0.06),

  // Primary tints (lime)
  primaryBg10: alpha(palette.limeBright, 0.1),
  primaryBg15: alpha(palette.lime, 0.15),
  primaryBg18: alpha(palette.lime, 0.18),
  primaryBg20: alpha(palette.limeBright, 0.2),
  primaryBg30: alpha(palette.limeBright, 0.3),
  primaryGlow: alpha(palette.limeGlow, 0.15),
  primarySoft05: alpha(palette.lime, 0.05),

  // Accent blue tints
  accentBg10: alpha(palette.bluePrimary, 0.1),
  accentBg20: alpha(palette.bluePrimary, 0.2),
  accentBg22: alpha(palette.blue, 0.22),
  accentSoftBg: alpha(palette.blueSoft, 0.17),

  // Charts / misc accents
  chartPurple: palette.purple,
  chartPurpleAccent: palette.purpleAccent,
  chartPurpleBg: alpha(palette.purple, 0.13),
  violetGlow: alpha(palette.violet, 0.6),
  oliveBg10: alpha(palette.olive, 0.1),

  // Status
  success: palette.success,
  successSoft: palette.successSoft,
  successBg: alpha(palette.success, 0.2),
  warning: palette.warning,
  warningBg10: alpha(palette.warning, 0.1),
  warningBg20: alpha(palette.warning, 0.2),
  warningBg25: alpha(palette.warning, 0.25),
  danger: palette.danger,
  dangerSoft: palette.dangerSoft,
  dangerBright: palette.dangerBright,
  dangerBanned: palette.dangerBanned,
  dangerBorder: palette.dangerBorder,
  dangerBg10: alpha(palette.danger, 0.1),
  dangerBg20: alpha(palette.danger, 0.2),
  dangerBg25: alpha(palette.danger, 0.25),
  dangerSoftBg10: alpha(palette.dangerSoft, 0.1),
  dangerBannedBg: alpha(palette.dangerBg, 0.42),
  dangerRowBg: alpha(palette.dangerRow, 0.35),
  processingBg: alpha(palette.processing, 0.2),
  mutedBg: alpha(palette.white, 0.1),

  // Login / external
  googleBlue: palette.googleBlue,
  googleGreen: palette.googleGreen,
  googleYellow: palette.googleYellow,
  googleRed: palette.googleRed,
  loginGreenGlow: alpha(palette.loginGreen, 0.3),
  loginDot: alpha(palette.white, 0.18),
  muted40: alpha(palette.textSecondary, 0.4),
  white70: alpha(palette.white, 0.7),
  buttonGhost: alpha(palette.surfaceMuted, 0.5),
  textLight50: alpha(palette.textLight, 0.5),
};

/** Common status badge styles used by redemptions / dashboard */
export const statusColors = {
  pending: { bg: colors.warningBg20, color: colors.warning },
  processing: { bg: colors.processingBg, color: colors.dangerSoft },
  approved: { bg: colors.successBg, color: colors.success },
  shipped: { bg: colors.accentBg20, color: colors.accentPrimary },
  delivered: { bg: colors.primaryBg20, color: colors.primaryBright },
  rejected: { bg: colors.dangerBg20, color: colors.danger },
  cancelled: { bg: colors.mutedBg, color: colors.textMuted },
  active: { bg: colors.primaryBg20, color: colors.primaryBright },
  outOfStock: { bg: colors.accentBg20, color: colors.accentSoft },
  expired: { bg: colors.mutedBg, color: colors.textMuted },
  banned: {
    bg: colors.dangerBannedBg,
    color: colors.dangerBanned,
    border: colors.dangerBorder,
  },
};

export default colors;
