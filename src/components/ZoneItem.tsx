import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MonitoredZone, AlertLevel } from '../types/convective';
import { COLORS, FONTS, RADII, SPACING } from '../theme';
import {
  Home,
  GraduationCap,
  Tractor,
  HardHat,
  Trophy,
  Anchor,
  Phone,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from './Icons';

interface Props {
  zone: MonitoredZone;
  onRemove: (id: string) => void;
}

export const ZoneItem: React.FC<Props> = ({ zone, onRemove }) => {
  const isDanger = zone.alertLevel === AlertLevel.DANGER;
  const isAdvisory = zone.alertLevel === AlertLevel.ADVISORY;

  const getCategoryIcon = () => {
    switch (zone.category) {
      case 'HOME':
        return <Home size={16} color={COLORS.safe} />;
      case 'SCHOOL':
        return <GraduationCap size={16} color={COLORS.warning} />;
      case 'FARMLAND':
        return <Tractor size={16} color="#10B981" />;
      case 'WORKSITE':
        return <HardHat size={16} color="#F97316" />;
      case 'ATHLETIC_FIELD':
        return <Trophy size={16} color="#EAB308" />;
      case 'MARINA':
        return <Anchor size={16} color="#38BDF8" />;
    }
  };

  const statusColor = isDanger
    ? COLORS.danger
    : isAdvisory
    ? COLORS.warning
    : COLORS.safe;

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: isDanger
            ? COLORS.dangerBorder
            : isAdvisory
            ? COLORS.warningBorder
            : COLORS.border,
          backgroundColor: isDanger ? '#140608' : COLORS.card,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={styles.iconCircle}>{getCategoryIcon()}</View>
          <View>
            <Text style={styles.zoneName}>{zone.name}</Text>
            <Text style={styles.categoryText}>
              {zone.category} • {zone.radiusKm} KM RADIUS
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.alertBadge,
            {
              backgroundColor: isDanger
                ? COLORS.dangerBg
                : isAdvisory
                ? COLORS.warningBg
                : COLORS.safeBg,
              borderColor: statusColor,
            },
          ]}
        >
          {isDanger ? (
            <AlertTriangle size={11} color={statusColor} />
          ) : isAdvisory ? (
            <Zap size={11} color={statusColor} />
          ) : (
            <ShieldCheck size={11} color={statusColor} />
          )}
          <Text style={[styles.alertText, { color: statusColor }]}>
            {zone.alertLevel}
          </Text>
        </View>
      </View>

      {/* Geodesic Strike Status */}
      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>NEAREST STRIKE</Text>
          <Text
            style={[
              styles.statVal,
              { color: zone.nearestStrikeKm !== null ? statusColor : COLORS.textMuted },
            ]}
          >
            {zone.nearestStrikeKm !== null
              ? `${zone.nearestStrikeKm.toFixed(1)} km`
              : 'CLEAR (>15km)'}
          </Text>
        </View>

        <View style={styles.statCol}>
          <Text style={styles.statLabel}>STRIKES IN PERIMETER</Text>
          <Text
            style={[
              styles.statVal,
              { color: zone.activeStrikesInside > 0 ? COLORS.danger : COLORS.safe },
            ]}
          >
            {zone.activeStrikesInside}
          </Text>
        </View>

        <View style={styles.statCol}>
          <Text style={styles.statLabel}>PRIMARY CONTACT</Text>
          <Text style={styles.contactName} numberOfLines={1}>
            {zone.contactName || 'Unassigned'}
          </Text>
        </View>
      </View>

      {/* Action Row */}
      <View style={styles.actionRow}>
        {zone.contactPhone ? (
          <View style={styles.phoneChip}>
            <Phone size={11} color={COLORS.safe} />
            <Text style={styles.phoneText}>{zone.contactPhone}</Text>
          </View>
        ) : (
          <View />
        )}

        <TouchableOpacity
          onPress={() => onRemove(zone.id)}
          style={styles.deleteBtn}
          activeOpacity={0.7}
        >
          <Trash2 size={13} color={COLORS.textMuted} />
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F1826',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
    borderWidth: 1,
  },
  alertText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#090E17',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#152032',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  statVal: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  contactName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.safe,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
