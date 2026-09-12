import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import type { RiskLevel } from '../../lib/warnly/types';
import { COLORS, FONTS, RADII } from '../../theme';

interface Props {
  probability: number;
  level: RiskLevel;
  caption: string;
}

const LEVEL_CONFIG = {
  safe: {
    color: '#10B981',
    label: 'ALL CLEAR',
    badgeBg: 'rgba(16,185,129,0.12)',
    badgeBorder: 'rgba(16,185,129,0.26)',
    headline: 'Stable Atmospheric Envelope',
    subText: 'Zero convective cloud-to-ground strikes within local radar radius.',
  },
  advisory: {
    color: '#F59E0B',
    label: 'ADVISORY WATCH',
    badgeBg: 'rgba(245,158,11,0.14)',
    badgeBorder: 'rgba(245,158,11,0.32)',
    headline: 'Convective Instability Detected',
    subText: 'Moderate updraft energy detected. Monitor live Doppler radar scan.',
  },
  danger: {
    color: '#EF4444',
    label: 'CRITICAL THREAT',
    badgeBg: 'rgba(239,68,68,0.16)',
    badgeBorder: 'rgba(239,68,68,0.36)',
    headline: 'Severe Thunderstorm & Flash Hazard',
    subText: 'High-frequency strike activity and rapid convective cell formation.',
  },
} as const;

export const RiskMeter: React.FC<Props> = ({ probability, level, caption }) => {
  const cfg = LEVEL_CONFIG[level];

  // Animated numerical value
  const displayValue = useRef(new Animated.Value(0)).current;
  // Animated bar pip position (0 to 100%)
  const pipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(displayValue, {
        toValue: probability,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(pipAnim, {
        toValue: Math.min(Math.max(probability, 0), 100),
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [probability]);

  const leftInterpolate = pipAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* ── Top Assessment Readout ── */}
      <View style={styles.readoutRow}>
        {/* Left Column: Big Tabular Metric */}
        <View style={styles.metricColumn}>
          <View style={styles.figureRow}>
            <AnimatedNumber animValue={displayValue} color="#FFFFFF" />
            <Text style={styles.percentSign}>%</Text>
          </View>
          <Text style={styles.metricLabel}>THREAT INDEX</Text>
        </View>

        {/* Vertical Separator */}
        <View style={styles.readoutDivider} />

        {/* Right Column: Status Verdict & Meteorological Diagnostics */}
        <View style={styles.verdictColumn}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: cfg.badgeBg, borderColor: cfg.badgeBorder }]}>
              <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
              <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={styles.verdictHeadline} numberOfLines={1}>
            {cfg.headline}
          </Text>
          <Text style={styles.verdictSub} numberOfLines={2}>
            {caption || cfg.subText}
          </Text>
        </View>
      </View>

      {/* ── Calibrated Horizon Threat Spectrum Bar ── */}
      <View style={styles.spectrumContainer}>
        <View style={styles.spectrumTrack}>
          {/* Segment 1: Normal / Safe (0 - 30%) */}
          <View style={[styles.segment, styles.segmentSafe]}>
            <Text style={styles.segmentLabel}>CLEAR</Text>
          </View>
          <View style={styles.segmentDivider} />

          {/* Segment 2: Advisory (30 - 70%) */}
          <View style={[styles.segment, styles.segmentAdvisory]}>
            <Text style={styles.segmentLabel}>ADVISORY</Text>
          </View>
          <View style={styles.segmentDivider} />

          {/* Segment 3: Danger (70 - 100%) */}
          <View style={[styles.segment, styles.segmentDanger]}>
            <Text style={styles.segmentLabel}>CRITICAL</Text>
          </View>

          {/* Precision Indicator Pip */}
          <Animated.View
            style={[
              styles.indicatorPip,
              {
                left: leftInterpolate,
                borderColor: cfg.color,
              },
            ]}
          >
            <View style={[styles.indicatorInnerDot, { backgroundColor: cfg.color }]} />
          </Animated.View>
        </View>

        {/* Scale Range Ticks */}
        <View style={styles.scaleTicksRow}>
          <Text style={styles.scaleTickText}>0%</Text>
          <Text style={styles.scaleTickText}>30%</Text>
          <Text style={styles.scaleTickText}>70%</Text>
          <Text style={styles.scaleTickText}>100%</Text>
        </View>
      </View>
    </View>
  );
};

// ── Helper: Animated integer counter ───────────────────────────────────────
const AnimatedNumber: React.FC<{ animValue: Animated.Value; color: string }> = ({ animValue, color }) => {
  const [num, setNum] = React.useState(0);
  React.useEffect(() => {
    const id = animValue.addListener(({ value }) => {
      setNum(Math.round(value));
    });
    return () => animValue.removeListener(id);
  }, [animValue]);

  return <Text style={[styles.probabilityNum, { color }]}>{num}</Text>;
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 4,
    gap: 16,
  },
  // ── Readout Row ──
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  metricColumn: {
    alignItems: 'flex-start',
    minWidth: 105,
  },
  figureRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  probabilityNum: {
    fontSize: 58,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    lineHeight: 64,
    letterSpacing: -1.5,
  },
  percentSign: {
    fontSize: 22,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 3,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 1.2,
    color: '#64748B',
    marginTop: -2,
  },
  readoutDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  verdictColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 0.8,
  },
  verdictHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  verdictSub: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },

  // ── Spectrum Gauge ──
  spectrumContainer: {
    gap: 5,
  },
  spectrumTrack: {
    position: 'relative',
    flexDirection: 'row',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSafe: {
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  segmentAdvisory: {
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  segmentDanger: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  segmentDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  segmentLabel: {
    fontSize: 8,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.4)',
  },
  indicatorPip: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 14,
    marginLeft: -7,
    borderRadius: 7,
    backgroundColor: '#0E1522',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 4,
  },
  indicatorInnerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  scaleTicksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  scaleTickText: {
    fontSize: 8.5,
    fontFamily: FONTS.mono,
    fontWeight: '600',
    color: '#64748B',
  },
});
