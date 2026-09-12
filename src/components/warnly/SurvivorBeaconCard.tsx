import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import {
  LifeBuoy,
  BatteryCharging,
  Zap,
  Volume2,
  Eye,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from '../Icons';
import {
  globalBlackbox,
  SurvivorBeaconStatus,
} from '../../lib/warnly/disaster-blackbox';
import { COLORS, RADII, FONTS, SPACING } from '../../theme';

interface Props {
  batteryPercent?: number;
}

export const SurvivorBeaconCard: React.FC<Props> = ({ batteryPercent = 74 }) => {
  const [status, setStatus] = useState<SurvivorBeaconStatus>(() =>
    globalBlackbox.getStatus(batteryPercent)
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const handleArmToggle = () => {
    if (status.isArmed) {
      globalBlackbox.disarmSurvivorBeacon();
    } else {
      globalBlackbox.armSurvivorBeacon();
    }
    setStatus(globalBlackbox.getStatus(batteryPercent));
  };

  const handleOpticalToggle = () => {
    globalBlackbox.toggleOpticalMorse();
    setStatus(globalBlackbox.getStatus(batteryPercent));
  };

  const handleChirpToggle = () => {
    globalBlackbox.toggleAcousticChirp();
    setStatus(globalBlackbox.getStatus(batteryPercent));
  };

  return (
    <View style={[styles.card, status.isArmed && styles.cardArmed]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.badge,
              status.isArmed ? styles.badgeArmed : styles.badgeStandby,
            ]}
          >
            <LifeBuoy size={11} color={status.isArmed ? '#FFFFFF' : COLORS.textMuted} />
            <Text
              style={[
                styles.badgeText,
                status.isArmed ? { color: '#FFFFFF' } : { color: COLORS.textMuted },
              ]}
            >
              {status.isArmed ? 'BEACON ARMED & PULSING' : 'FLIGHT RECORDER STANDBY'}
            </Text>
          </View>
          <Text style={styles.title}>SURVIVOR BEACON & BLACKBOX</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.expandBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>{isExpanded ? 'Hide' : 'Beacon'}</Text>
          {isExpanded ? (
            <ChevronUp size={13} color={COLORS.textSecondary} />
          ) : (
            <ChevronDown size={13} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Ultra-low-power Search and Rescue (SAR) locator mode with optical Morse SOS, ultrasonic acoustic chirp, and crash-proof telemetry logs.
      </Text>

      {/* Main Arming Switch Strip */}
      <View style={styles.armStrip}>
        <View style={styles.armInfo}>
          <Text style={styles.armTitle}>Emergency SAR Survivor Mode</Text>
          <Text style={styles.armDesc}>
            Extends battery life up to {status.batteryEnduranceHours}h by throttling screen and pulsing optical SOS.
          </Text>
        </View>
        <Switch
          value={status.isArmed}
          onValueChange={handleArmToggle}
          trackColor={{ false: COLORS.border, true: COLORS.danger }}
          thumbColor={status.isArmed ? '#FFFFFF' : COLORS.textMuted}
        />
      </View>

      {/* Flight Recorder Telemetry Counter */}
      <View style={styles.telemetryStrip}>
        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryLabel}>LOGGED SAMPLES</Text>
          <Text style={styles.telemetryVal}>{status.recordedPointsCount} Frames</Text>
        </View>
        <View style={styles.telemetryDivider} />
        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryLabel}>SURVIVAL ENDURANCE</Text>
          <Text style={[styles.telemetryVal, { color: COLORS.safe }]}>
            ~{status.batteryEnduranceHours} Hours
          </Text>
        </View>
        <View style={styles.telemetryDivider} />
        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryLabel}>CHIRP FREQUENCY</Text>
          <Text style={styles.telemetryVal}>18 kHz Inaudible</Text>
        </View>
      </View>

      {/* Expanded Controls & Encrypted SAR Payload */}
      {isExpanded && (
        <View style={styles.expandedBox}>
          <View style={styles.controlRow}>
            <View style={styles.controlLabelGroup}>
              <Eye size={14} color={COLORS.warning} />
              <Text style={styles.controlTitle}>Optical Torch Morse SOS</Text>
            </View>
            <Switch
              value={status.opticalMorseActive}
              onValueChange={handleOpticalToggle}
              trackColor={{ false: COLORS.border, true: COLORS.warning }}
              thumbColor={status.opticalMorseActive ? '#FFFFFF' : COLORS.textMuted}
            />
          </View>

          <View style={styles.controlRow}>
            <View style={styles.controlLabelGroup}>
              <Volume2 size={14} color={COLORS.safe} />
              <Text style={styles.controlTitle}>Ultrasonic 18kHz Audio Chirp</Text>
            </View>
            <Switch
              value={status.acousticChirpActive}
              onValueChange={handleChirpToggle}
              trackColor={{ false: COLORS.border, true: COLORS.safe }}
              thumbColor={status.acousticChirpActive ? '#FFFFFF' : COLORS.textMuted}
            />
          </View>

          <View style={styles.sarPayloadBox}>
            <Text style={styles.sarPayloadLabel}>ENCRYPTED SAR BEACON PAYLOAD</Text>
            <Text style={styles.sarPayloadText} numberOfLines={2}>
              {status.sarBeaconText}
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
  cardArmed: {
    borderColor: COLORS.dangerBorder,
    backgroundColor: '#120406',
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
  badgeArmed: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  badgeStandby: {
    backgroundColor: COLORS.backgroundElevated,
    borderColor: COLORS.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 0.3,
  },
  title: {
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
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  armStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundElevated,
    padding: 10,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  armInfo: {
    flex: 1,
    marginRight: 10,
    gap: 2,
  },
  armTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  armDesc: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  telemetryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundElevated,
    padding: 8,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  telemetryLabel: {
    fontSize: 8.5,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
  },
  telemetryVal: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  expandedBox: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  controlLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlTitle: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  sarPayloadBox: {
    backgroundColor: '#070A0F',
    borderRadius: RADII.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 3,
    marginTop: 2,
  },
  sarPayloadLabel: {
    fontSize: 8.5,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  sarPayloadText: {
    fontSize: 10,
    fontFamily: FONTS.mono,
    color: COLORS.safe,
  },
});
