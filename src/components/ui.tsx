/**
 * Warnly Shared UI Primitives
 * Reusable building blocks for consistent, premium UI across all screens.
 * All animations use React Native's Animated API — zero external deps.
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, RADII, SPACING, FONTS, SHADOWS, TYPE } from '../theme';

// ─── PULSE DOT ──────────────────────────────────────────────────────────────
// Animated breathing dot for live status indicators.
interface PulseDotProps {
  color?: string;
  size?: number;
  speed?: number; // ms per cycle
}

export const PulseDot: React.FC<PulseDotProps> = ({
  color = COLORS.safe,
  size = 8,
  speed = 1600,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.45,
            duration: speed * 0.5,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.25,
            duration: speed * 0.5,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: speed * 0.5,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.9,
            duration: speed * 0.5,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [speed]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer glow ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size * 2,
          height: size * 2,
          borderRadius: size,
          backgroundColor: color,
          transform: [{ scale }],
          opacity,
        }}
      />
      {/* Core dot */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

// ─── FADE IN VIEW ────────────────────────────────────────────────────────────
// Smooth entrance animation for any content.
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 300,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

// ─── GLASS CARD ──────────────────────────────────────────────────────────────
// The base card primitive — glassy, elevated, premium border.
interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  accentColor?: string;
  elevated?: boolean;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  accentColor,
  elevated = false,
  noPadding = false,
}) => {
  return (
    <View
      style={[
        styles.glassCard,
        elevated && styles.glassCardElevated,
        accentColor && {
          borderColor: accentColor + '30',
          shadowColor: accentColor,
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 8,
        },
        !noPadding && styles.glassCardPadding,
        style,
      ]}
    >
      {/* Subtle top-edge highlight for depth illusion */}
      <View style={styles.glassTopEdge} />
      {children}
    </View>
  );
};

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
// Screen section labels — creates visual hierarchy without nested cards.
interface SectionHeaderProps {
  label: string;
  right?: ReactNode;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ label, right, style }) => (
  <View style={[styles.sectionHeader, style]}>
    <Text style={styles.sectionLabel}>{label}</Text>
    {right}
  </View>
);

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
type BadgeVariant = 'safe' | 'warning' | 'danger' | 'muted' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  pulsing?: boolean;
}

const BADGE_VARIANTS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  safe:    { bg: COLORS.safeBg,    text: COLORS.safe,    border: COLORS.safeBorder },
  warning: { bg: COLORS.warningBg, text: COLORS.warning, border: COLORS.warningBorder },
  danger:  { bg: COLORS.dangerBg,  text: COLORS.danger,  border: COLORS.dangerBorder },
  muted:   { bg: 'rgba(255,255,255,0.05)', text: COLORS.textTertiary, border: COLORS.border },
  info:    { bg: 'rgba(59,130,246,0.1)', text: COLORS.accentBlue, border: 'rgba(59,130,246,0.3)' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'muted',
  dot = false,
  pulsing = false,
}) => {
  const { bg, text, border } = BADGE_VARIANTS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      {dot && <PulseDot color={text} size={5} speed={pulsing ? 1600 : 99999} />}
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

// ─── METRIC TILE ────────────────────────────────────────────────────────────
// Small data tile — used in stats rows and grids.
interface MetricTileProps {
  label: string;
  value: string;
  unit?: string;
  accent?: string;
  style?: ViewStyle;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  unit,
  accent = COLORS.textPrimary,
  style,
}) => (
  <View style={[styles.metricTile, style]}>
    <Text style={styles.metricTileLabel}>{label}</Text>
    <View style={styles.metricTileValueRow}>
      <Text style={[styles.metricTileValue, { color: accent }]}>{value}</Text>
      {unit && <Text style={styles.metricTileUnit}>{unit}</Text>}
    </View>
  </View>
);

// ─── GLOW BUTTON ────────────────────────────────────────────────────────────
// Premium CTA button with colored glow shadow.
interface GlowButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'safe' | 'danger' | 'ghost' | 'warning';
  icon?: ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  label,
  onPress,
  variant = 'safe',
  icon,
  disabled = false,
  style,
  small = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const bgMap = {
    safe:    COLORS.safe,
    danger:  COLORS.danger,
    warning: COLORS.warning,
    ghost:   'transparent',
  };
  const textMap = {
    safe:    COLORS.textInverted,
    danger:  '#FFFFFF',
    warning: COLORS.textInverted,
    ghost:   COLORS.textSecondary,
  };
  const borderMap = {
    safe:    COLORS.safe,
    danger:  COLORS.danger,
    warning: COLORS.warning,
    ghost:   COLORS.border,
  };
  const glowMap = {
    safe:    SHADOWS.glowSafe,
    danger:  SHADOWS.glowDanger,
    warning: SHADOWS.glowWarning,
    ghost:   {},
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        disabled={disabled}
        style={[
          styles.glowBtn,
          small && styles.glowBtnSmall,
          {
            backgroundColor: bgMap[variant],
            borderColor: borderMap[variant],
          },
          variant !== 'ghost' && glowMap[variant],
          disabled && styles.glowBtnDisabled,
        ]}
      >
        {icon && <View style={styles.glowBtnIcon}>{icon}</View>}
        <Text style={[styles.glowBtnText, { color: textMap[variant] }, small && styles.glowBtnTextSmall]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── DIVIDER ────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.divider, style]} />
);

// ─── SCREEN HEADER ──────────────────────────────────────────────────────────
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
  right?: ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeVariant = 'safe',
  right,
}) => (
  <View style={styles.screenHeader}>
    <View style={styles.screenHeaderLeft}>
      <Text style={styles.screenHeaderTitle}>{title}</Text>
      {subtitle && <Text style={styles.screenHeaderSubtitle}>{subtitle}</Text>}
    </View>
    <View style={styles.screenHeaderRight}>
      {badge && <StatusBadge label={badge} variant={badgeVariant} />}
      {right}
    </View>
  </View>
);

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  glassCardElevated: {
    backgroundColor: COLORS.surfaceRaised,
    ...SHADOWS.lg,
  },
  glassCardPadding: {
    padding: SPACING.lg,
  },
  glassTopEdge: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: SPACING.xs,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  metricTile: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricTileLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricTileValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  metricTileValue: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    lineHeight: 20,
  },
  metricTileUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textTertiary,
    marginBottom: 2,
  },

  glowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: RADII.xl,
    paddingVertical: 13,
    paddingHorizontal: 20,
    gap: 7,
  },
  glowBtnSmall: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: RADII.lg,
  },
  glowBtnDisabled: {
    opacity: 0.45,
  },
  glowBtnIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  glowBtnTextSmall: {
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },

  screenHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: SPACING.xs,
  },
  screenHeaderLeft: {
    flex: 1,
  },
  screenHeaderTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  screenHeaderSubtitle: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 3,
    fontWeight: '500',
  },
  screenHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
});
