import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { AlertLevel, NotificationPreview } from '../types/convective';
import { COLORS, FONTS, RADII, SPACING } from '../theme';
import { ShieldAlert, Zap, Timer, Radio, ChevronDown, ChevronUp, Bell } from './Icons';

interface Props {
  preview: NotificationPreview;
  alertLevel: AlertLevel;
  nearestStrikeKm: number | null;
  timerFormatted: string;
  isTimerRunning: boolean;
  onPressExpand?: () => void;
}

export const DynamicIsland: React.FC<Props> = ({
  preview,
  alertLevel,
  nearestStrikeKm,
  timerFormatted,
  isTimerRunning,
  onPressExpand,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isDanger = alertLevel === AlertLevel.DANGER;
  const isAdvisory = alertLevel === AlertLevel.ADVISORY;
  const isWatch = alertLevel === AlertLevel.WATCH;

  const accentColor = isDanger
    ? COLORS.danger
    : isAdvisory
    ? COLORS.warning
    : isWatch
    ? COLORS.warning
    : COLORS.safe;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setIsExpanded(!isExpanded);
          onPressExpand?.();
        }}
        style={[
          styles.island,
          isExpanded ? styles.islandExpanded : styles.islandCollapsed,
          { borderColor: isDanger ? COLORS.dangerBorder : COLORS.borderLight },
        ]}
      >
        {/* Collapsed Pill View */}
        <View style={styles.compactRow}>
          <View style={styles.leftPill}>
            <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
            <Zap size={14} color={accentColor} />
            <Text style={[styles.compactTitle, { color: accentColor }]}>
              {isDanger
                ? 'TACTICAL DANGER'
                : isAdvisory
                ? 'STORM ADVISORY'
                : isWatch
                ? 'CONVECTIVE WATCH'
                : 'WARNLY LIVE'}
            </Text>
          </View>

          <View style={styles.rightPill}>
            {isTimerRunning ? (
              <View style={styles.timerChip}>
                <Timer size={12} color={COLORS.danger} />
                <Text style={styles.timerMono}>{timerFormatted}</Text>
              </View>
            ) : nearestStrikeKm !== null ? (
              <Text style={styles.distMono}>{nearestStrikeKm.toFixed(1)} km</Text>
            ) : (
              <Text style={styles.safeTag}>100% OK</Text>
            )}
            {isExpanded ? (
              <ChevronUp size={14} color={COLORS.textMuted} />
            ) : (
              <ChevronDown size={14} color={COLORS.textMuted} />
            )}
          </View>
        </View>

        {/* Expanded Rich Card View */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />

            <View style={styles.expandedHeader}>
              <View style={styles.expandedTagRow}>
                <Bell size={13} color={COLORS.textMuted} />
                <Text style={styles.systemTag}>
                  iOS 15+ Time-Sensitive • Live Activities
                </Text>
              </View>
              <Text style={styles.timeTag}>{preview.timestamp}</Text>
            </View>

            <Text style={styles.expandedTitle}>{preview.title}</Text>
            <Text style={styles.expandedBody}>{preview.body}</Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>NEAREST STRIKE</Text>
                <Text style={[styles.metricValue, { color: accentColor }]}>
                  {nearestStrikeKm !== null ? `${nearestStrikeKm.toFixed(1)} km` : 'CLEAR (>15km)'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>30-30 SHELTER CLOCK</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: isTimerRunning ? COLORS.danger : COLORS.textMuted },
                  ]}
                >
                  {isTimerRunning ? timerFormatted : 'STANDBY'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>DISPATCH DELAY</Text>
                <Text style={[styles.metricValue, { color: COLORS.safe }]}>
                  &lt; 1.5s (RAM)
                </Text>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
    zIndex: 99,
  },
  island: {
    backgroundColor: '#000000',
    borderRadius: RADII.xl,
    borderWidth: 1,
    width: '100%',
    maxWidth: 440,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  islandCollapsed: {
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
  },
  islandExpanded: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 42, 77, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.sm,
    gap: 4,
  },
  timerMono: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  distMono: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  safeTag: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.safe,
  },
  expandedContent: {
    marginTop: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: '#1C2638',
    marginBottom: SPACING.sm,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expandedTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  systemTag: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  timeTag: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  expandedBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0A0F18',
    padding: 8,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: '#182438',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  metricValue: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
  },
});
