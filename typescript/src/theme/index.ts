import { Platform } from 'react-native';

export const COLORS = {
  // Deep Atmospheric Aerospace Obsidian Palette (OLED Battery Saver < 2% drain)
  background: '#070A0F',
  backgroundElevated: '#0D131D',
  card: '#121A27',
  cardHover: '#182335',
  cardActive: '#1D2A40',
  border: '#1E2D44',
  borderLight: '#2A3C5A',
  borderAccent: '#3B527A',

  // Critical Danger / Tactical Evacuation
  danger: '#FF2A4D',
  dangerDark: '#8F1025',
  dangerLight: '#FFE5EA',
  dangerBg: 'rgba(255, 42, 77, 0.12)',
  dangerBorder: 'rgba(255, 42, 77, 0.38)',
  dangerGlow: 'rgba(255, 42, 77, 0.25)',

  // Atmospheric Convective Watch / Advisory
  warning: '#FFB020',
  warningDark: '#8A5600',
  warningLight: '#FFF7E6',
  warningBg: 'rgba(255, 176, 32, 0.12)',
  warningBorder: 'rgba(255, 176, 32, 0.35)',
  warningGlow: 'rgba(255, 176, 32, 0.20)',

  // Safe Baseline / Precision Telemetry Tracking
  safe: '#00E5FF',
  safeGreen: '#10B981',
  safeBg: 'rgba(0, 229, 255, 0.10)',
  safeBorder: 'rgba(0, 229, 255, 0.30)',
  safeGlow: 'rgba(0, 229, 255, 0.20)',

  // Text Hierarchy
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDisabled: '#475569',
  textInverted: '#070A0F',

  // Accent & Utilities
  accentBlue: '#38BDF8',
  accentIndigo: '#6366F1',
  accentPurple: '#A855F7',
  overlayBg: 'rgba(5, 8, 14, 0.88)',
  glassBg: 'rgba(18, 26, 39, 0.75)',
};

export const FONTS = {
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADII = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  glowDanger: {
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  glowSafe: {
    shadowColor: COLORS.safe,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
};
