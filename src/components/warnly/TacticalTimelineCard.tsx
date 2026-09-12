import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
} from '../Icons';
import { globalTacticalTimeline, TacticalTimelinePhase } from '../../lib/warnly/tactical-timeline';
import { COLORS, RADII, FONTS, SPACING } from '../../theme';

interface Props {
  etaMinutes: number | null;
}

export const TacticalTimelineCard: React.FC<Props> = ({ etaMinutes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [, setRefreshKey] = useState(0);

  const activePhase = globalTacticalTimeline.evaluatePhase(etaMinutes);
  const allPhases = globalTacticalTimeline.getAllPhases();

  const handleToggleItem = (itemId: string) => {
    globalTacticalTimeline.toggleItem(itemId);
    setRefreshKey((k) => k + 1);
  };

  const getUrgencyBadge = (urgency: TacticalTimelinePhase['urgencyLevel']) => {
    switch (urgency) {
      case 'IMMINENT':
        return { label: 'IMMINENT IMPACT', bg: COLORS.dangerBg, border: COLORS.dangerBorder, text: COLORS.danger };
      case 'HIGH':
        return { label: 'STEPPED LEADER', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: COLORS.danger };
      case 'MEDIUM':
        return { label: 'OUTFLOW BOUNDARY', bg: COLORS.warningBg, border: COLORS.warningBorder, text: COLORS.warning };
      case 'POST_STORM':
        return { label: '30/30 CLEARANCE', bg: COLORS.safeBg, border: COLORS.safeBorder, text: COLORS.safe };
      default:
        return { label: 'APPROACHING', bg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.25)', text: COLORS.accentSky };
    }
  };

  const badge = getUrgencyBadge(activePhase.urgencyLevel);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Clock size={11} color={badge.text} />
            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
          </View>
          <Text style={styles.phaseTitle}>{activePhase.title}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.expandBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>{isExpanded ? 'Collapse' : 'Actions'}</Text>
          {isExpanded ? (
            <ChevronUp size={13} color={COLORS.textSecondary} />
          ) : (
            <ChevronDown size={13} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.summaryText}>{activePhase.summary}</Text>

      {/* Progress Phase Pips */}
      <View style={styles.pipsTrack}>
        {allPhases.map((phase) => {
          const isActive = phase.phaseId === activePhase.phaseId;
          return (
            <View key={phase.phaseId} style={styles.pipCol}>
              <View
                style={[
                  styles.pipBar,
                  isActive
                    ? styles.pipBarActive
                    : phase.urgencyLevel === 'IMMINENT'
                    ? styles.pipBarImminent
                    : styles.pipBarInactive,
                ]}
              />
              <Text style={[styles.pipLabel, isActive && styles.pipLabelActive]}>
                {phase.phaseId === 'T_PLUS_30' ? 'T+30m' : `T-${phase.targetMinutes}m`}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Checklist Action Items (Default showing active phase items, expanded showing all) */}
      <View style={styles.actionList}>
        {(isExpanded ? allPhases.flatMap((p) => p.items) : activePhase.items).map((item) => {
          const completed = globalTacticalTimeline.isItemCompleted(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.actionRow, completed && styles.actionRowDone]}
              onPress={() => handleToggleItem(item.id)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.checkbox,
                  completed && styles.checkboxDone,
                  item.priority === 'CRITICAL' && !completed && styles.checkboxCritical,
                ]}
              >
                {completed && <CheckCircle2 size={13} color={COLORS.safe} />}
              </View>

              <View style={styles.actionContent}>
                <View style={styles.actionTitleRow}>
                  <Text
                    style={[
                      styles.actionTitle,
                      completed && styles.actionTitleDone,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {item.priority === 'CRITICAL' && !completed && (
                    <View style={styles.criticalPill}>
                      <Text style={styles.criticalText}>CRITICAL</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionDetail} numberOfLines={2}>
                  {item.detail}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADII.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 0.4,
  },
  phaseTitle: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  expandText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  summaryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  pipsTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    paddingVertical: 2,
  },
  pipCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pipBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  pipBarActive: {
    backgroundColor: COLORS.warning,
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  pipBarImminent: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  pipBarInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pipLabel: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
  },
  pipLabelActive: {
    color: COLORS.warning,
    fontWeight: '800',
  },
  actionList: {
    gap: 7,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.backgroundElevated,
    padding: 9,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionRowDone: {
    opacity: 0.6,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxDone: {
    borderColor: COLORS.safe,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  checkboxCritical: {
    borderColor: COLORS.danger,
  },
  actionContent: {
    flex: 1,
    gap: 2,
  },
  actionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  criticalPill: {
    backgroundColor: COLORS.dangerBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  criticalText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.danger,
    fontFamily: FONTS.mono,
  },
  actionDetail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
});
