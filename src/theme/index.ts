import { Platform } from 'react-native';

// ─── WARNLY DESIGN SYSTEM v2.0 ───────────────────────────────────────────────
// Inspired by Tamagui's constraint-based token system, Linear's dark theme,
// and modern aerospace HUD aesthetics.
// Base: OLED-black, 3-layer elevation, color-accurate glow system.

export const COLORS = {
  // ── Base Surfaces (3-layer elevation) ──────────────────────────────────────
  background: '#060A10',        // True OLED black-blue — battery saver
  backgroundElevated: '#0C1422', // Layer 1: navigation, sidebars
  card: '#101E30',               // Layer 2: card surfaces
  cardHover: '#162539',          // Layer 2 active
  cardActive: '#1C2E46',         // Layer 2 pressed
  surface: '#0E1A2C',            // Layer 3: modals, sheets
  surfaceRaised: '#142234',      // Layer 3 elevated

  // ── Borders (tuned for dark glass feel) ──────────────────────────────────
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.10)',
  borderMedium: 'rgba(255,255,255,0.14)',
  borderAccent: 'rgba(0,229,255,0.25)',

  // ── Cyan Accent (Safe / Primary) ──────────────────────────────────────────
  // Linear-style cool cyan — communicates safety & precision
  safe: '#00E5FF',
  safeGreen: '#10B981',
  safeDeep: '#00B8CC',
  safeBg: 'rgba(0,229,255,0.07)',
  safeBgHover: 'rgba(0,229,255,0.12)',
  safeBorder: 'rgba(0,229,255,0.22)',
  safeGlow: 'rgba(0,229,255,0.18)',
  safeText: '#67E8F9',           // Lighter safe text on dark

  // ── Red (Danger / Critical) ─────────────────────────────────────────────
  danger: '#FF3355',
  dangerDeep: '#CC1A3D',
  dangerLight: '#FF6680',
  dangerBg: 'rgba(255,51,85,0.09)',
  dangerBgHover: 'rgba(255,51,85,0.14)',
  dangerBorder: 'rgba(255,51,85,0.32)',
  dangerGlow: 'rgba(255,51,85,0.22)',

  // ── Amber (Warning / Advisory) ──────────────────────────────────────────
  warning: '#FFBA08',
  warningDeep: '#CC9500',
  warningBg: 'rgba(255,186,8,0.09)',
  warningBgHover: 'rgba(255,186,8,0.14)',
  warningBorder: 'rgba(255,186,8,0.30)',
  warningGlow: 'rgba(255,186,8,0.18)',

  // ── Accent Palette ────────────────────────────────────────────────────────
  accentBlue: '#3B82F6',
  accentIndigo: '#6366F1',
  accentPurple: '#8B5CF6',
  accentViolet: '#7C3AED',
  accentSky: '#38BDF8',
  accentEmerald: '#10B981',

  // ── Text Hierarchy (6-level) ──────────────────────────────────────────────
  textPrimary: '#F0F6FF',         // Headlines
  textSecondary: '#8FA3BE',       // Supporting text
  textTertiary: '#5A7393',        // Captions
  textMuted: '#3D5572',           // Disabled / placeholder
  textInverted: '#060A10',        // On bright backgrounds

  // ── Glass / Overlay ───────────────────────────────────────────────────────
  glassLight: 'rgba(14,26,44,0.72)',
  glassDark: 'rgba(6,10,16,0.88)',
  overlayBg: 'rgba(2,6,12,0.92)',
  backdropBlur: 'rgba(6,10,16,0.78)',

  // ── Chart / Data Visualization ───────────────────────────────────────────
  chartBlue: '#3B82F6',
  chartCyan: '#06B6D4',
  chartEmerald: '#10B981',
  chartAmber: '#F59E0B',
  chartRed: '#EF4444',
};

// ─── TYPOGRAPHY SCALE ─────────────────────────────────────────────────────────
// Based on a fluid type scale — 1.25 ratio (Major Third).
// Designed for readability at emergency-glance speeds.

export const FONTS = {
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace',
  }),
  sans: Platform.select({
    ios: '-apple-system',
    android: 'Roboto',
    default: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  }),
};

export const TYPE = {
  // Display — hero numbers, radar ring labels
  display3xl: { fontSize: 72, fontWeight: '900' as const, lineHeight: 80 },
  display2xl: { fontSize: 56, fontWeight: '900' as const, lineHeight: 64 },
  displayXl: { fontSize: 44, fontWeight: '800' as const, lineHeight: 52 },
  displayLg: { fontSize: 36, fontWeight: '800' as const, lineHeight: 44 },

  // Heading — card titles, section headers
  headingXl: { fontSize: 26, fontWeight: '800' as const, lineHeight: 32 },
  headingLg: { fontSize: 22, fontWeight: '800' as const, lineHeight: 28 },
  headingMd: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  headingSm: { fontSize: 15, fontWeight: '700' as const, lineHeight: 20 },

  // Body — main reading text
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },

  // Label — badges, chips, captions
  labelLg: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 0.2 },
  labelMd: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.3 },
  labelSm: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.3 },
  labelXs: { fontSize: 9,  fontWeight: '700' as const, letterSpacing: 0.6 },

  // Mono — telemetry values, timestamps
  monoLg: { fontSize: 16, fontWeight: '700' as const },
  monoMd: { fontSize: 13, fontWeight: '600' as const },
  monoSm: { fontSize: 11, fontWeight: '600' as const },
};

// ─── SPACING SCALE ────────────────────────────────────────────────────────────
// 4pt grid system — same as Tamagui/shadcn
export const SPACING = {
  px: 1,
  '0.5': 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,

  // Semantic aliases
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ─── BORDER RADII ─────────────────────────────────────────────────────────────
export const RADII = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  full: 9999,
};

// ─── SHADOWS ──────────────────────────────────────────────────────────────────
// Tuned for OLED — dark shadows are invisible; use colored glows instead.
export const SHADOWS = {
  // Neutral dark shadows
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 12,
  },

  // Colored glows (bottom-centered for lifted card feel)
  glowSafe: {
    shadowColor: COLORS.safe,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  glowDanger: {
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  glowWarning: {
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
};

// ─── ANIMATION DURATIONS ──────────────────────────────────────────────────────
export const DURATIONS = {
  instant: 80,
  fast: 150,
  normal: 250,
  slow: 380,
  verySlow: 550,
};

// ─── EASING VALUES ────────────────────────────────────────────────────────────
// These match iOS spring feel (not available as constants but useful for docs)
export const EASING_NOTES = {
  // Use Easing.out(Easing.cubic) for entrances
  // Use Easing.in(Easing.cubic) for exits
  // Use Easing.bezier(0.34, 1.56, 0.64, 1) for spring-like bounces
};
