import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { HardenedShelter } from '../types/convective';
import { COLORS, FONTS, RADII, SPACING } from '../theme';
import {
  AlertOctagon,
  Volume2,
  VolumeX,
  Shield,
  ArrowRight,
  Minimize2,
  PhoneCall,
  Zap,
} from './Icons';

interface Props {
  visible: boolean;
  timerFormatted: string;
  strikeCount: number;
  nearestStrikeKm: number | null;
  nearestStrikeIntensityKa: number;
  isSirenPlaying: boolean;
  isSoundMuted: boolean;
  nearestShelter: HardenedShelter | null;
  onToggleSiren: () => void;
  onToggleMute: () => void;
  onNavigateShelter: (shelter: HardenedShelter) => void;
  onMinimize: () => void;
}

export const EmergencyIntrusionModal: React.FC<Props> = ({
  visible,
  timerFormatted,
  strikeCount,
  nearestStrikeKm,
  nearestStrikeIntensityKa,
  isSirenPlaying,
  isSoundMuted,
  nearestShelter,
  onToggleSiren,
  onToggleMute,
  onNavigateShelter,
  onMinimize,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <View style={styles.fullscreenContainer}>
        {/* Top Emergency Action Header */}
        <View style={styles.topBar}>
          <View style={styles.topBadge}>
            <AlertOctagon size={18} color="#FFFFFF" />
            <Text style={styles.topBadgeText}>TACTICAL EVACUATION OVERLAY</Text>
          </View>
          <TouchableOpacity
            onPress={onMinimize}
            style={styles.minimizeButton}
            activeOpacity={0.7}
          >
            <Minimize2 size={16} color={COLORS.textPrimary} />
            <Text style={styles.minimizeText}>Minimize</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pulsing Danger Epicenter Header */}
          <View style={styles.heroDangerCard}>
            <View style={styles.heroHeader}>
              <Zap size={22} color={COLORS.danger} />
              <Text style={styles.heroTitle}>CRITICAL 10 KM BREACH</Text>
            </View>

            <Text style={styles.heroSummary}>
              Cloud-to-ground lightning has breached the 10.0 km safety perimeter.
              Thunder acoustic boundary active. Over 30% of casualties occur when leaving shelter prematurely.
            </Text>

            {/* Massive 30-30 Countdown Timer Display */}
            <View style={styles.timerBox}>
              <Text style={styles.timerLabel}>AUTOMATED 30-30 SHELTERING CLOCK</Text>
              <Text style={styles.timerDigits}>{timerFormatted}</Text>
              <Text style={styles.timerSub}>
                Resets to 30:00 on each strike inside 10 km • Detected:{' '}
                <Text style={styles.timerStrikeCount}>{strikeCount} strikes</Text>
              </Text>
            </View>

            {/* Nearest Strike Telemetry */}
            <View style={styles.telemetryStrip}>
              <View style={styles.telemetryCol}>
                <Text style={styles.telemetryLabel}>NEAREST STRIKE</Text>
                <Text style={styles.telemetryVal}>
                  {nearestStrikeKm !== null ? `${nearestStrikeKm.toFixed(1)} km` : '0.0 km'}
                </Text>
              </View>
              <View style={styles.telemetryDivider} />
              <View style={styles.telemetryCol}>
                <Text style={styles.telemetryLabel}>PEAK DISCHARGE</Text>
                <Text style={[styles.telemetryVal, { color: COLORS.danger }]}>
                  {nearestStrikeIntensityKa} kA
                </Text>
              </View>
              <View style={styles.telemetryDivider} />
              <View style={styles.telemetryCol}>
                <Text style={styles.telemetryLabel}>SAFETY STATUS</Text>
                <Text style={[styles.telemetryVal, { color: COLORS.danger }]}>
                  SHELTER NOW
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Siren & Audio Controls */}
          <View style={styles.audioControlsRow}>
            <TouchableOpacity
              style={[
                styles.sirenToggleBtn,
                { backgroundColor: isSirenPlaying ? COLORS.danger : '#1C2638' },
              ]}
              onPress={onToggleSiren}
              activeOpacity={0.8}
            >
              <Volume2 size={16} color="#FFFFFF" />
              <Text style={styles.sirenBtnText}>
                {isSirenPlaying ? 'SILENCE 880Hz SIREN' : 'TRIGGER 880Hz SIREN'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.muteBtn}
              onPress={onToggleMute}
              activeOpacity={0.8}
            >
              {isSoundMuted ? (
                <VolumeX size={16} color={COLORS.textMuted} />
              ) : (
                <Volume2 size={16} color={COLORS.safe} />
              )}
            </TouchableOpacity>
          </View>

          {/* Hardened Shelters Tactical Shortcut */}
          {nearestShelter && (
            <TouchableOpacity
              style={styles.shelterShortcut}
              onPress={() => {
                onNavigateShelter(nearestShelter);
                onMinimize();
              }}
              activeOpacity={0.85}
            >
              <View style={styles.shelterIconBox}>
                <Shield size={20} color={COLORS.safe} />
              </View>
              <View style={styles.shelterTexts}>
                <Text style={styles.shelterTag}>CLOSEST HARDENED SHELTER</Text>
                <Text style={styles.shelterName}>{nearestShelter.name}</Text>
                <Text style={styles.shelterMeta}>
                  {nearestShelter.distanceKm} km • {nearestShelter.walkingTimeMinutes} min walk • Heading {nearestShelter.bearingDegrees}°
                </Text>
              </View>
              <ArrowRight size={18} color={COLORS.safe} />
            </TouchableOpacity>
          )}

          {/* Mandatory Safety Instructions */}
          <View style={styles.protocolCard}>
            <Text style={styles.protocolHeader}>MANDATORY INDOOR SURVIVAL PROTOCOL</Text>

            <View style={styles.protocolStep}>
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Enter Substantial Building</Text>
                <Text style={styles.stepDesc}>
                  Enter a reinforced masonry building or enclosed all-metal vehicle immediately. Do NOT shelter in open sheds or picnic tents.
                </Text>
              </View>
            </View>

            <View style={styles.protocolStep}>
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Avoid Conductive Conduits</Text>
                <Text style={styles.stepDesc}>
                  Stay away from electrical outlets, wired electronics, plumbing fixtures, and concrete walls containing steel rebar.
                </Text>
              </View>
            </View>

            <View style={styles.protocolStep}>
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Never Stand Under Solitary Trees</Text>
                <Text style={styles.stepDesc}>
                  Ground currents and side-flashes jump from tree trunks. If trapped outdoors, crouch low with feet together.
                </Text>
              </View>
            </View>

            <View style={styles.protocolStep}>
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Enforce Full 30-Minute Hold</Text>
                <Text style={styles.stepDesc}>
                  Remain sheltered until the countdown reaches 00:00. Any new strike inside 10 km automatically restarts the clock.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#070204',
    paddingTop: SPACING.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 42, 77, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dangerBorder,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  minimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.sm,
  },
  minimizeText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  heroDangerCard: {
    backgroundColor: '#120407',
    borderRadius: RADII.xl,
    borderWidth: 2,
    borderColor: COLORS.danger,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.danger,
    letterSpacing: 1,
  },
  heroSummary: {
    fontSize: 12,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: SPACING.md,
  },
  timerBox: {
    backgroundColor: '#000000',
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    width: '100%',
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.danger,
    letterSpacing: 1,
    marginBottom: 4,
  },
  timerDigits: {
    fontFamily: FONTS.mono,
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  timerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  timerStrikeCount: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  telemetryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#1A060A',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 77, 0.25)',
  },
  telemetryCol: {
    alignItems: 'center',
    flex: 1,
  },
  telemetryDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 42, 77, 0.25)',
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  telemetryVal: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  audioControlsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sirenToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADII.md,
  },
  sirenBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  muteBtn: {
    backgroundColor: '#162030',
    borderRadius: RADII.md,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shelterShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1A28',
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: 12,
  },
  shelterIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelterTexts: {
    flex: 1,
  },
  shelterTag: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.safe,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  shelterName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  shelterMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  protocolCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  protocolHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  protocolStep: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.md,
  },
  stepNumBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
