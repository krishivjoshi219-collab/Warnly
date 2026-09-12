import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HardenedShelter } from '../types/convective';
import { COLORS, FONTS, RADII, SPACING } from '../theme';
import {
  Shield,
  Compass,
  Mountain,
  BatteryCharging,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Navigation,
} from './Icons';

interface Props {
  shelter: HardenedShelter;
  isSelected: boolean;
  onSelect: (shelter: HardenedShelter) => void;
  offlineDirections: string[];
}

export const ShelterCard: React.FC<Props> = ({
  shelter,
  isSelected,
  onSelect,
  offlineDirections,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeLabel = (type: HardenedShelter['type']) => {
    switch (type) {
      case 'CONCRETE_BUNKER':
        return 'REINFORCED BUNKER';
      case 'SUBTERRANEAN_METRO':
        return 'SUBTERRANEAN METRO';
      case 'COMMUNITY_CIVIL_SHELTER':
        return 'CIVIL DEFENSE FACILITY';
      case 'REINFORCED_SCHOOL':
        return 'FARADAY REINFORCED HALL';
    }
  };

  return (
    <View
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        { borderColor: isSelected ? COLORS.safe : COLORS.border },
      ]}
    >
      <TouchableOpacity
        onPress={() => onSelect(shelter)}
        activeOpacity={0.8}
        style={styles.cardHeader}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.typeBadge, isSelected && styles.typeBadgeSelected]}>
            <Shield size={12} color={isSelected ? COLORS.textInverted : COLORS.safe} />
            <Text
              style={[
                styles.typeText,
                { color: isSelected ? COLORS.textInverted : COLORS.safe },
              ]}
            >
              {getTypeLabel(shelter.type)}
            </Text>
          </View>
          <Text style={styles.shelterName}>{shelter.name}</Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.distanceVal}>{shelter.distanceKm} km</Text>
          <Text style={styles.walkTime}>{shelter.walkingTimeMinutes} min walk</Text>
        </View>
      </TouchableOpacity>

      {/* Telemetry Metrics Bar */}
      <View style={styles.metricsBar}>
        <View style={styles.metricItem}>
          <Compass size={13} color={COLORS.textMuted} />
          <Text style={styles.metricText}>
            Heading <Text style={styles.metricMono}>{shelter.bearingDegrees}°</Text>
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Mountain size={13} color={COLORS.textMuted} />
          <Text style={styles.metricText}>
            High-Ground <Text style={styles.metricMono}>+{shelter.highGroundAdvantageMeters}m</Text>
          </Text>
        </View>

        <View style={styles.amenities}>
          {shelter.hasBackupPower && (
            <BatteryCharging size={14} color={COLORS.safe} />
          )}
          {shelter.hasFirstAid && (
            <HeartPulse size={14} color={COLORS.danger} />
          )}
          <Text style={styles.capacityText}>Cap: {shelter.capacity}</Text>
        </View>
      </View>

      <Text style={styles.accessNotes}>{shelter.accessNotes}</Text>

      {/* Expand Directions Button */}
      <TouchableOpacity
        style={styles.expandRow}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.expandLeft}>
          <Navigation size={13} color={COLORS.safe} />
          <Text style={styles.expandText}>
            {isExpanded ? 'Hide Offline Navigation Guidance' : 'View Offline Walking Route'}
          </Text>
        </View>
        {isExpanded ? (
          <ChevronUp size={16} color={COLORS.textMuted} />
        ) : (
          <ChevronDown size={16} color={COLORS.textMuted} />
        )}
      </TouchableOpacity>

      {/* Expandable Offline Directions */}
      {isExpanded && (
        <View style={styles.directionsBox}>
          {offlineDirections.map((step, idx) => (
            <View key={idx} style={styles.directionStepRow}>
              <Text style={styles.directionStepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardSelected: {
    backgroundColor: '#0E1724',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.sm,
    marginBottom: 4,
  },
  typeBadgeSelected: {
    backgroundColor: COLORS.safe,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  shelterName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  distanceVal: {
    fontFamily: FONTS.mono,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.safe,
  },
  walkTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0F18',
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  metricMono: {
    fontFamily: FONTS.mono,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  amenities: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capacityText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
  },
  accessNotes: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
    marginBottom: SPACING.sm,
  },
  expandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  expandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.safe,
  },
  directionsBox: {
    backgroundColor: '#070A0F',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  directionStepRow: {
    marginBottom: 6,
  },
  directionStepText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
