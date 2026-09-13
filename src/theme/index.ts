import { Platform, StatusBar } from 'react-native';

// ─── WARNLY DESIGN SYSTEM v4.0 (EXECUTIVE MONOCHROME) ────────────────────────
// High-end minimalist design language. Inspired by Apple Weather, Linear, Vercel,
// and modern aerospace HUD instruments.
// Core principle: Pure OLED blacks and dark graphite/zinc neutrals.
// NO saturated navy blues. NO neon vibecoding. Restrained, authoritative, ultra-clean.

export const COLORS = {
  // ── Base Surfaces (OLED True Black & Zinc Hierarchy) ─────────────────────
  background:         '#000000',   // True Pitch Black for OLED & maximum contrast
  backgroundElevated: '#0C0C0E',   // Layer 1: Elevated sub-panels
  card:               '#141417',   // Layer 2: Primary cards (neutral zinc graphite)
  cardHover:          '#1A1A1E',   // Layer 2 active / hover
  cardActive:         '#222227',   // Layer 2 pressed
  surface:            '#18181C',   // Layer 3: Modals, bottom sheets
  surfaceRaised:      '#202025',   // Layer 3 elevated elements

  // ── High-Precision Borders (Crisp Hairline Material) ─────────────────────
  border:        'rgba(255, 255, 255, 0.08)',
  borderLight:   'rgba(255, 255, 255, 0.14)',
  borderMedium:  'rgba(255, 255, 255, 0.22)',
  borderAccent:  'rgba(255, 255, 255, 0.30)',

  // ── Executive Brand Accent — Pure White & Silver ─────────────────────────
  primary:       '#FFFFFF',        // High-contrast pure white
  primaryLight:  '#E4E4E7',        // Zinc-200
  primaryBg:     'rgba(255, 255, 255, 0.08)',
  primaryBgHover:'rgba(255, 255, 255, 0.14)',
  primaryBorder: 'rgba(255, 255, 255, 0.20)',
  primaryGlow:   'rgba(255, 255, 255, 0.15)',

  // ── Semantic Alerts (Strictly reserved for status) ────────────────────────
  // Safe / Clear (Refined Emerald)
  safe:          '#10B981',
  safeBg:        'rgba(16, 185, 129, 0.10)',
  safeBorder:    'rgba(16, 185, 129, 0.25)',
  safeText:      '#34D399',
  safeGreen:     '#10B981',
  safeDeep:      '#059669',
  safeGlow:      'rgba(16, 185, 129, 0.20)',
  safeBgHover:   'rgba(16, 185, 129, 0.16)',

  // Warning / Advisory (Solar Amber)
  warning:       '#F59E0B',
  warningBg:     'rgba(245, 158, 11, 0.10)',
  warningBorder: 'rgba(245, 158, 11, 0.28)',
  warningDeep:   '#D97706',
  warningGlow:   'rgba(245, 158, 11, 0.20)',
  warningBgHover:'rgba(245, 158, 11, 0.16)',

  // Danger / Critical (Signal Crimson)
  danger:        '#EF4444',
  dangerLight:   '#F87171',
  dangerBg:      'rgba(239, 68, 68, 0.10)',
  dangerBorder:  'rgba(239, 68, 68, 0.30)',
  dangerDeep:    '#DC2626',
  dangerGlow:    'rgba(239, 68, 68, 0.25)',
  dangerBgHover: 'rgba(239, 68, 68, 0.16)',

  // Neutral Accent Accents
  accentSky:     '#38BDF8',
  accentBlue:    '#60A5FA',
  accentIndigo:  '#818CF8',
  accentPurple:  '#A78BFA',
  accentViolet:  '#C084FC',
  accentEmerald: '#34D399',

  // ── Typography Hierarchy (Crisp White to Neutral Zinc Grays) ─────────────
  textPrimary:   '#FFFFFF',        // 100% Crisp White
  textSecondary: '#A1A1AA',        // Zinc-400: Clear legible subtitle text
  textTertiary:  '#71717A',        // Zinc-500: Subdued metadata & units
  textMuted:     '#52525B',        // Zinc-600: Placeholders & inactive controls
  textInverted:  '#09090B',        // Deep Black for text on bright white badges

  // ── Translucent Glass Materials ──────────────────────────────────────────
  glassLight:    'rgba(24, 24, 28, 0.80)',
  glassDark:     'rgba(12, 12, 14, 0.92)',
  overlayBg:     'rgba(0, 0, 0, 0.85)',
  backdropBlur:  'rgba(10, 10, 12, 0.88)',

  // Chart Visualizations
  chartBlue:     '#38BDF8',
  chartCyan:     '#22D3EE',
  chartEmerald:  '#10B981',
  chartAmber:    '#F59E0B',
  chartRed:      '#EF4444',
};

// ─── SAFE AREA UTILITIES ──────────────────────────────────────────────────────
export const SAFE_TOP_PADDING =
  Platform.OS === 'android' ? ((StatusBar as any)?.currentHeight ?? 36) + 12 : 52;

// ─── TYPOGRAPHY HIERARCHY ─────────────────────────────────────────────────────
export const FONTS = {
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: '"JetBrains Mono", "SF Mono", Menlo, monospace',
  }),
  sans: Platform.select({
    ios: '-apple-system',
    android: 'Roboto',
    default: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  }),
};

export const TYPE = {
  display3xl: { fontSize: 64, fontWeight: '900' as const, lineHeight: 70 },
  display2xl: { fontSize: 48, fontWeight: '800' as const, lineHeight: 54 },
  displayXl:  { fontSize: 38, fontWeight: '800' as const, lineHeight: 44 },
  displayLg:  { fontSize: 32, fontWeight: '800' as const, lineHeight: 38 },

  headingXl:  { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  headingLg:  { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  headingMd:  { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  headingSm:  { fontSize: 15, fontWeight: '600' as const, lineHeight: 20 },

  bodyLg:     { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd:     { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm:     { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },

  labelLg:    { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.2 },
  labelMd:    { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.3 },
  labelSm:    { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.4 },
  labelXs:    { fontSize: 9,  fontWeight: '700' as const, letterSpacing: 0.6 },

  monoLg:     { fontSize: 16, fontWeight: '700' as const },
  monoMd:     { fontSize: 13, fontWeight: '600' as const },
  monoSm:     { fontSize: 11, fontWeight: '600' as const },
};

// ─── SPACING SCALE ────────────────────────────────────────────────────────────
export const SPACING = {
  px:   1,
  '0.5': 2,
  1:    4,
  1.5:  6,
  2:    8,
  2.5:  10,
  3:    12,
  3.5:  14,
  4:    16,
  5:    20,
  6:    24,
  7:    28,
  8:    32,
  9:    36,
  10:   40,
  12:   48,
  14:   56,
  16:   64,
  20:   80,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

// ─── BORDER RADII ─────────────────────────────────────────────────────────────
export const RADII = {
  none: 0,
  xs:   4,
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  '2xl': 22,
  '3xl': 28,
  '4xl': 36,
  full: 9999,
};

// ─── SHADOWS ──────────────────────────────────────────────────────────────────
export const SHADOWS = {
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
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
    elevation: 12,
  },
  glowSafe: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  glowDanger: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 6,
  },
  glowWarning: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  glowPrimary: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const DURATIONS = {
  instant:  80,
  fast:     150,
  normal:   240,
  slow:     360,
  verySlow: 500,
};

export const EASING_NOTES = {};
