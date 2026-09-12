import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Mountain,
  Navigation,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from '../Icons';
import {
  TopographicEscapeEngine,
  TopographicEscapePlan,
} from '../../lib/warnly/topographic-escape';
import { COLORS, RADII, FONTS, SPACING } from '../../theme';

interface Props {
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  rainAccumulationMm?: number;
  pressureDeltaHpa?: number;
}

export const TopographicEscapeCard: React.FC<Props> = ({
  latitude,
  longitude,
  elevationMeters = 1620,
  rainAccumulationMm = 45,
  pressureDeltaHpa = -1.8,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const plan = TopographicEscapeEngine.computeEscapeVector(
    latitude,
    longitude,
    elevationMeters,
    rainAccumulationMm,
    pressureDeltaHpa
  );

  const isExtreme = plan.hydraulicRiskLevel === 'EXTREME_FLASH_FLOOD';
  const isHigh = plan.hydraulicRiskLevel === 'HIGH_RUNOFF';

  const riskColor = isExtreme ? COLORS.danger : isHigh ? COLORS.warning : COLORS.safe;

  return (
    <View style={[styles.card, isExtreme && styles.cardDanger]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: `${riskColor}15`, borderColor: `${riskColor}40` }]}>
            <Mountain size={11} color={riskColor} />
            <Text style={[styles.badgeText, { color: riskColor }]}>
              {plan.hydraulicRiskLevel.replace(/_/g, ' ')}
            </Text>
          </View>
          <Text style={styles.cardTitle}>TOPOGRAPHIC ESCAPE CORRIDOR</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.expandBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>{isExpanded ? 'Hide' : 'Terrain'}</Text>
          {isExpanded ? (
            <ChevronUp size={13} color={COLORS.textSecondary} />
          ) : (
            <ChevronDown size={13} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.catchmentText}>{plan.catchmentStatus}</Text>

      {/* Primary Escape Vector HUD */}
      <View style={styles.vectorHud}>
        <View style={styles.vectorDirectionCol}>
          <View style={styles.compassBox}>
            <Navigation size={18} color={COLORS.safe} style={{ transform: [{ rotate: '42deg' }] }} />
          </View>
          <View>
            <Text style={styles.vectorLabel}>ESCAPE AZIMUTH</Text>
            <Text style={styles.vectorBearing}>{plan.recommendedBearingCardinal}</Text>
          </View>
        </View>

        <View style={styles.vectorDivider} />

        <View style={styles.vectorElevationCol}>
          <View style={styles.elevationPill}>
            <ArrowUpRight size={13} color={COLORS.safe} />
            <Text style={styles.elevationGainText}>+{plan.elevationGainRequiredMeters}m</Text>
          </View>
          <Text style={styles.elevationTarget}>
            Target: {plan.targetRidgeElevationMeters}m MSL
          </Text>
        </View>

        <View style={styles.vectorDivider} />

        <View style={styles.ascentCol}>
          <Text style={styles.vectorLabel}>ASCENT TIME</Text>
          <Text style={styles.ascentVal}>~{plan.estimatedAscentMinutes} min</Text>
        </View>
      </View>

      {/* Survival Directive Banner */}
      <View style={styles.directiveBanner}>
        <Text style={styles.directiveText}>{plan.survivalGuideline}</Text>
      </View>

      {/* Expanded Terrain & Hazard Details */}
      {isExpanded && (
        <View style={styles.expandedDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>SAFE HAVEN WAYPOINT</Text>
            <Text style={styles.detailVal}>{plan.primaryEscapeRoute.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>TRAIL GRADIENT</Text>
            <Text style={styles.detailVal}>
              {plan.primaryEscapeRoute.slopeGradientPercent}% (Navigable Bedrock)
            </Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.detailLabel, { color: COLORS.danger }]}>HAZARD TO AVOID</Text>
            <Text style={[styles.detailVal, { color: COLORS.danger }]} numberOfLines={2}>
              {plan.hazardCorridorToAvoid}
            </Text>
          </View>
        </View>
      )}
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
  cardDanger: {
    borderColor: COLORS.dangerBorder,
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
    letterSpacing: 0.3,
  },
  cardTitle: {
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
  catchmentText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  vectorHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundElevated,
    padding: 10,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vectorDirectionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compassBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vectorLabel: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
  },
  vectorBearing: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  vectorDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  vectorElevationCol: {
    alignItems: 'center',
    gap: 2,
  },
  elevationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  elevationGainText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    color: COLORS.safe,
  },
  elevationTarget: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    color: COLORS.textSecondary,
  },
  ascentCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  ascentVal: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  directiveBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.safe,
    padding: 9,
    borderRadius: RADII.sm,
  },
  directiveText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    lineHeight: 15,
  },
  expandedDetails: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
});
