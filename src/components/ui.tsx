import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { COLORS, RADII, FONTS, SHADOWS, SPACING } from '../theme';

// ─── PULSE DOT ─────────────────────────────────────────────────────────────────
// Gentle breathing live indicator
interface PulseDotProps {
  color?: string;
  size?: number;
  speed?: number;
}
export const PulseDot: React.FC<PulseDotProps> = ({
  color = COLORS.safe,
  size = 7,
  speed = 2000,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.5, duration: speed / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.3, duration: speed / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: speed / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: speed / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

// ─── FADE IN ───────────────────────────────────────────────────────────────────
interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  fromY?: number;
}
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 280,
  delay = 0,
  fromY = 10,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;

  useEffect(() => {
    const anim = Animated.parallel([
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
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

// ─── TOUCH SCALE ────────────────────────────────────────────────────────────────
// Apple-style spring scale response for high-touch cards and buttons
export const TouchScale: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  activeScale?: number;
  disabled?: boolean;
}> = ({
  children,
  onPress,
  style,
  activeScale = 0.97,
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: activeScale,
      tension: 250,
      friction: 14,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 250,
      friction: 14,
      useNativeDriver: true,
    }).start();
  };

  if (!onPress) {
    return <View style={style}>{children}</View>;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── CARD ──────────────────────────────────────────────────────────────────────
// Clean, rounded card — the atomic unit of the design system
interface CardProps {
  children: React.ReactNode;
  style?: any;
  noPadding?: boolean;
  variant?: 'default' | 'danger' | 'warning' | 'safe' | 'primary';
  onPress?: () => void;
}
export const Card: React.FC<CardProps> = ({
  children,
  style,
  noPadding = false,
  variant = 'default',
  onPress,
}) => {
  const borderColor =
    variant === 'danger'  ? COLORS.dangerBorder  :
    variant === 'warning' ? COLORS.warningBorder :
    variant === 'safe'    ? COLORS.safeBorder    :
    variant === 'primary' ? COLORS.primaryBorder :
    COLORS.border;

  const shadow =
    variant === 'danger'  ? SHADOWS.glowDanger  :
    variant === 'warning' ? SHADOWS.glowWarning  :
    variant === 'safe'    ? SHADOWS.glowSafe     :
    variant === 'primary' ? SHADOWS.glowPrimary  :
    SHADOWS.sm;

  const inner = (
    <View style={[
      styles.card,
      !noPadding && styles.cardPadded,
      { borderColor },
      shadow,
      style,
    ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchScale onPress={onPress}>
        {inner}
      </TouchScale>
    );
  }

  return inner;
};

// Keep GlassCard as alias for backward compat
export const GlassCard = Card;

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  label: string;
  variant?: 'safe' | 'warning' | 'danger' | 'muted' | 'info' | 'primary';
  dot?: boolean;
  pulsing?: boolean;
  small?: boolean;
}
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label, variant = 'muted', dot = false, pulsing = false, small = false,
}) => {
  const colors = {
    safe:    { bg: COLORS.safeBg,    border: COLORS.safeBorder,    text: COLORS.safeText,    dot: COLORS.safe    },
    warning: { bg: COLORS.warningBg, border: COLORS.warningBorder,  text: COLORS.warning,     dot: COLORS.warning },
    danger:  { bg: COLORS.dangerBg,  border: COLORS.dangerBorder,   text: COLORS.dangerLight, dot: COLORS.danger  },
    muted:   { bg: 'rgba(255,255,255,0.05)', border: COLORS.border, text: COLORS.textTertiary, dot: COLORS.textMuted },
    info:    { bg: COLORS.primaryBg, border: COLORS.primaryBorder,  text: COLORS.primaryLight, dot: COLORS.primary },
    primary: { bg: COLORS.primaryBg, border: COLORS.primaryBorder,  text: COLORS.primaryLight, dot: COLORS.primary },
  }[variant];

  return (
    <View style={[
      styles.badge,
      small && styles.badgeSmall,
      { backgroundColor: colors.bg, borderColor: colors.border },
    ]}>
      {dot && (
        <View style={{ marginRight: 5 }}>
          <PulseDot color={colors.dot} size={5} speed={pulsing ? 1400 : 999999} />
        </View>
      )}
      <Text style={[styles.badgeText, small && styles.badgeTextSmall, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
};

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  label: string;
  right?: React.ReactNode;
  style?: any;
}
export const SectionHeader: React.FC<SectionHeaderProps> = ({ label, right, style }) => (
  <View style={[styles.sectionHeader, style]}>
    <Text style={styles.sectionHeaderText}>{label.toUpperCase()}</Text>
    {right && <View>{right}</View>}
  </View>
);

// ─── SCREEN HEADER ────────────────────────────────────────────────────────────
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'safe' | 'warning' | 'danger' | 'muted' | 'info' | 'primary';
  right?: React.ReactNode;
}
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title, subtitle, badge, badgeVariant = 'muted', right,
}) => (
  <View style={styles.screenHeader}>
    <View style={styles.screenHeaderLeft}>
      {badge && (
        <StatusBadge label={badge} variant={badgeVariant} small />
      )}
      <Text style={styles.screenHeaderTitle}>{title}</Text>
      {subtitle && (
        <Text style={styles.screenHeaderSubtitle}>{subtitle}</Text>
      )}
    </View>
    {right && <View>{right}</View>}
  </View>
);

// ─── METRIC TILE ──────────────────────────────────────────────────────────────
interface MetricTileProps {
  label: string;
  value: string;
  unit?: string;
  accent?: string;
  style?: any;
  size?: 'sm' | 'md';
}
export const MetricTile: React.FC<MetricTileProps> = ({
  label, value, unit, accent = COLORS.textPrimary, style, size = 'md',
}) => (
  <View style={[styles.metricTile, style]}>
    <Text style={styles.metricTileLabel}>{label}</Text>
    <Text style={[
      size === 'sm' ? styles.metricTileValueSm : styles.metricTileValue,
      { color: accent },
    ]}>
      {value}
      {unit ? <Text style={styles.metricTileUnit}> {unit}</Text> : null}
    </Text>
  </View>
);

// ─── GLOW BUTTON ──────────────────────────────────────────────────────────────
interface GlowButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'safe' | 'danger' | 'warning' | 'ghost';
  icon?: React.ReactNode;
  style?: any;
  disabled?: boolean;
  size?: 'sm' | 'md';
}
export const GlowButton: React.FC<GlowButtonProps> = ({
  label, onPress, variant = 'primary', icon, style, disabled, size = 'md',
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };

  const colors = {
    primary: { bg: COLORS.primary,  text: '#000000', shadow: SHADOWS.glowPrimary },
    safe:    { bg: COLORS.safe,     text: '#FFFFFF', shadow: SHADOWS.glowSafe    },
    danger:  { bg: COLORS.danger,   text: '#FFFFFF', shadow: SHADOWS.glowDanger  },
    warning: { bg: COLORS.warning,  text: '#000000', shadow: SHADOWS.glowWarning  },
    ghost:   { bg: 'transparent',   text: COLORS.textSecondary, shadow: SHADOWS.sm },
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled}
      style={style}
    >
      <Animated.View style={[
        styles.glowBtn,
        size === 'sm' && styles.glowBtnSm,
        { backgroundColor: colors.bg },
        variant !== 'ghost' && colors.shadow,
        disabled && styles.glowBtnDisabled,
        { transform: [{ scale }] },
      ]}>
        {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
        <Text style={[styles.glowBtnText, size === 'sm' && styles.glowBtnTextSm, { color: colors.text }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ style?: any }> = ({ style }) => (
  <View style={[styles.divider, style]} />
);

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPadded: {
    padding: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADII.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  badgeTextSmall: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textMuted,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  screenHeaderLeft: {
    gap: 4,
  },
  screenHeaderTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  screenHeaderSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  metricTile: {
    flex: 1,
    gap: 3,
  },
  metricTileLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  metricTileValue: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: -0.5,
  },
  metricTileValueSm: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.mono,
  },
  metricTileUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  glowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: RADII.xl,
    gap: 6,
  },
  glowBtnSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADII.lg,
  },
  glowBtnDisabled: {
    opacity: 0.5,
  },
  glowBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  glowBtnTextSm: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
});
