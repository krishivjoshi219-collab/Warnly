import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import type { RiskLevel } from '../../lib/warnly/types';
import { COLORS, FONTS, RADII, SHADOWS } from '../../theme';

interface Props {
  probability: number;
  level: RiskLevel;
  caption: string;
}

const LEVEL_CONFIG = {
  safe: {
    color: COLORS.safe,
    glow: COLORS.safeGlow,
    bg: 'rgba(0,229,255,0.06)',
    label: 'SAFE',
    ring: COLORS.safe + '40',
  },
  advisory: {
    color: COLORS.warning,
    glow: COLORS.warningGlow,
    bg: 'rgba(255,186,8,0.06)',
    label: 'ADVISORY',
    ring: COLORS.warning + '40',
  },
  danger: {
    color: COLORS.danger,
    glow: COLORS.dangerGlow,
    bg: 'rgba(255,51,85,0.08)',
    label: 'DANGER',
    ring: COLORS.danger + '40',
  },
} as const;

export const RiskMeter: React.FC<Props> = ({ probability, level, caption }) => {
  const cfg = LEVEL_CONFIG[level];

  // ── Animate the number counting up ──────────────────────────────────────
  const displayValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(displayValue, {
      toValue: probability,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [probability]);

  // ── Pulse animation for the outer ring when danger ───────────────────────
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (level === 'danger') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScale, {
              toValue: 1.04,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0.4,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(ringScale, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      ringScale.setValue(1);
      ringOpacity.setValue(0.8);
    }
  }, [level]);

  // Interpolated displayed number
  const displayNum = displayValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Outer ambient glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: cfg.color + '22',
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
            shadowColor: cfg.color,
          },
        ]}
      />

      {/* Main meter body */}
      <View
        style={[
          styles.meterBody,
          {
            backgroundColor: cfg.bg,
            borderColor: cfg.color + '35',
            ...SHADOWS.glowSafe,
            shadowColor: cfg.color,
          },
        ]}
      >
        {/* Inner dashed accent ring */}
        <View
          style={[
            styles.innerRing,
            { borderColor: cfg.color + '28' },
          ]}
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Level label */}
          <View style={[styles.levelBadge, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '30' }]}>
            <Text style={[styles.levelBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>

          {/* Big probability number */}
          <View style={styles.numRow}>
            <AnimatedNumber animValue={displayValue} color={cfg.color} />
            <Text style={[styles.percentSign, { color: cfg.color }]}>%</Text>
          </View>

          {/* Caption */}
          <Text style={styles.caption} numberOfLines={2}>
            {caption}
          </Text>
        </View>
      </View>

      {/* Probability bar track below the ring */}
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: cfg.color,
              width: displayValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              shadowColor: cfg.color,
            },
          ]}
        />
      </View>
      <View style={styles.barLabels}>
        <Text style={styles.barLabelText}>0%</Text>
        <Text style={styles.barLabelText}>50%</Text>
        <Text style={styles.barLabelText}>100%</Text>
      </View>
    </View>
  );
};

// ── Helper: Animated integer counter ───────────────────────────────────────
const AnimatedNumber: React.FC<{ animValue: Animated.Value; color: string }> = ({ animValue, color }) => {
  // We use a listener + state approach for the animated counter display
  const [num, setNum] = React.useState(0);
  React.useEffect(() => {
    const id = animValue.addListener(({ value }) => {
      setNum(Math.round(value));
    });
    return () => animValue.removeListener(id);
  }, [animValue]);

  return (
    <Text style={[styles.probabilityNum, { color }]}>{num}</Text>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  glowRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    top: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 0,
  },
  meterBody: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  innerRing: {
    position: 'absolute',
    width: 178,
    height: 178,
    borderRadius: 89,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  levelBadge: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: RADII.full,
    borderWidth: 1,
  },
  levelBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  probabilityNum: {
    fontSize: 52,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    lineHeight: 58,
    letterSpacing: -2,
  },
  percentSign: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    marginLeft: 1,
  },
  caption: {
    fontSize: 10,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 16,
  },
  barTrack: {
    marginTop: 14,
    width: 200,
    height: 3,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  barFill: {
    height: '100%',
    borderRadius: RADII.full,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 2,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginTop: 4,
  },
  barLabelText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
  },
});
