import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { WarnlyEngine } from '../engine/warnly-engine';
import { COLORS, FONTS, RADII, SPACING } from '../theme';
import { startSirenAudio, stopSirenAudio } from '../lib/warnly/siren';
import {
  FlaskConical,
  Play,
  Volume2,
  VolumeX,
  Flame,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
} from '../components/Icons';

interface Props {
  engine: WarnlyEngine;
}

export const SimulatorScreen: React.FC<Props> = ({ engine }) => {
  const isDanger = engine.alertLevel === 'DANGER';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FlaskConical size={18} color={COLORS.safe} />
          <Text style={styles.headerTitle}>DISASTER SIMULATION LAB</Text>
        </View>
        <Text style={styles.headerSub}>
          Live Meteorological Scenario Injection & Verification Suite
        </Text>
      </View>

      {/* Active Scenario Indicator Card */}
      <View style={styles.scenarioActiveCard}>
        <Text style={styles.activeLabel}>CURRENT ACTIVE SCENARIO</Text>
        <Text style={styles.activeTitle}>{engine.activeScenario}</Text>
        <View style={styles.activeMetaRow}>
          <Text style={styles.activeMeta}>
            Alert: <Text style={{ color: isDanger ? COLORS.danger : COLORS.safe, fontWeight: '800' }}>{engine.alertLevel}</Text>
          </Text>
          <Text style={styles.activeMeta}>•</Text>
          <Text style={styles.activeMeta}>
            Strikes Tracked: <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>{engine.strikes.length}</Text>
          </Text>
          <Text style={styles.activeMeta}>•</Text>
          <Text style={styles.activeMeta}>
            30-30 Clock:{' '}
            <Text style={{ fontWeight: '800', color: engine.isTimerRunning ? COLORS.danger : COLORS.textMuted }}>
              {engine.isTimerRunning ? 'RUNNING' : 'IDLE'}
            </Text>
          </Text>
        </View>
      </View>

      {/* Scenario Injection Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>INJECT TACTICAL ATMOSPHERIC SCENARIOS</Text>

        {/* 1. Calm Baseline */}
        <TouchableOpacity
          style={styles.scenarioBtn}
          onPress={() => engine.runScenarioCalm()}
          activeOpacity={0.8}
        >
          <View style={styles.scenarioBtnLeft}>
            <View style={[styles.scenarioDot, { backgroundColor: COLORS.safe }]} />
            <View>
              <Text style={styles.scenarioBtnTitle}>1. Calm Baseline (Safe State)</Text>
              <Text style={styles.scenarioBtnDesc}>
                CAPE 240 J/kg • 0 strikes • System safe baseline
              </Text>
            </View>
          </View>
          <Play size={14} color={COLORS.safe} />
        </TouchableOpacity>

        {/* 2. Convective Watch */}
        <TouchableOpacity
          style={styles.scenarioBtn}
          onPress={() => engine.runScenarioConvectiveWatch()}
          activeOpacity={0.8}
        >
          <View style={styles.scenarioBtnLeft}>
            <View style={[styles.scenarioDot, { backgroundColor: COLORS.warning }]} />
            <View>
              <Text style={styles.scenarioBtnTitle}>2. In-Situ Convective Watch (FR-02)</Text>
              <Text style={styles.scenarioBtnDesc}>
                CAPE 2450 J/kg • Lifted Index -4.2°C • Pre-initiation watch
              </Text>
            </View>
          </View>
          <Play size={14} color={COLORS.warning} />
        </TouchableOpacity>

        {/* 3. Advection Supercell */}
        <TouchableOpacity
          style={styles.scenarioBtn}
          onPress={() => engine.runScenarioAdvectionApproaching()}
          activeOpacity={0.8}
        >
          <View style={styles.scenarioBtnLeft}>
            <View style={[styles.scenarioDot, { backgroundColor: '#F97316' }]} />
            <View>
              <Text style={styles.scenarioBtnTitle}>3. Advecting Supercell (18 min Lead)</Text>
              <Text style={styles.scenarioBtnDesc}>
                Cell 28 km away @ 42 km/h • Deterministic advance window
              </Text>
            </View>
          </View>
          <Play size={14} color="#F97316" />
        </TouchableOpacity>

        {/* 4. Danger Breach */}
        <TouchableOpacity
          style={[styles.scenarioBtn, styles.scenarioBtnDanger]}
          onPress={() => engine.runScenarioDangerBreach()}
          activeOpacity={0.8}
        >
          <View style={styles.scenarioBtnLeft}>
            <View style={[styles.scenarioDot, { backgroundColor: COLORS.danger }]} />
            <View>
              <Text style={[styles.scenarioBtnTitle, { color: COLORS.danger }]}>
                4. 10 km Danger Breach (FR-01, FR-03, FR-04)
              </Text>
              <Text style={styles.scenarioBtnDesc}>
                Strike at 6.8 km • Mounts Intrusion Card • 30-30 timer starts
              </Text>
            </View>
          </View>
          <Play size={14} color={COLORS.danger} />
        </TouchableOpacity>

        {/* 5. Subsequent Strike (30-30 Reset) */}
        <TouchableOpacity
          style={[styles.scenarioBtn, styles.scenarioBtnDanger]}
          onPress={() => engine.runScenarioSubsequentStrike()}
          activeOpacity={0.8}
        >
          <View style={styles.scenarioBtnLeft}>
            <RotateCcw size={14} color={COLORS.danger} style={{ marginRight: 2 }} />
            <View>
              <Text style={[styles.scenarioBtnTitle, { color: COLORS.danger }]}>
                5. Secondary Strike at 2.4 km (30-30 Reset)
              </Text>
              <Text style={styles.scenarioBtnDesc}>
                Resets 30:00 timer back to full 30 minutes!
              </Text>
            </View>
          </View>
          <RotateCcw size={14} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      {/* Hardware & Transducer Verification Suite (FR-05) */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>HARDWARE TRANSDUCER & ACOUSTIC LAB</Text>

        <View style={styles.hardwareGrid}>
          {/* Bi-tonal siren */}
          <TouchableOpacity
            style={[
              styles.hardwareBtn,
              engine.siren.isPlaying && styles.hardwareBtnActiveDanger,
            ]}
            onPress={() => {
              if (engine.siren.isPlaying) {
                engine.siren.stopSiren();
                stopSirenAudio();
              } else {
                engine.siren.startSiren();
                startSirenAudio();
              }
            }}
            activeOpacity={0.8}
          >
            <Volume2
              size={18}
              color={engine.siren.isPlaying ? '#FFFFFF' : COLORS.safe}
            />
            <Text style={styles.hardwareBtnTitle}>
              {engine.siren.isPlaying ? 'STOP SIREN' : 'TEST 880Hz/440Hz SIREN'}
            </Text>
            <Text style={styles.hardwareBtnSub}>Web Audio Oscillator</Text>
          </TouchableOpacity>

          {/* Tactical Chirp */}
          <TouchableOpacity
            style={styles.hardwareBtn}
            onPress={() => engine.siren.playTacticalChirp()}
            activeOpacity={0.8}
          >
            <Zap size={18} color={COLORS.safe} />
            <Text style={styles.hardwareBtnTitle}>TACTICAL CHIRP</Text>
            <Text style={styles.hardwareBtnSub}>1200 Hz Beep</Text>
          </TouchableOpacity>

          {/* Morse Strobe */}
          <TouchableOpacity
            style={[
              styles.hardwareBtn,
              engine.strobe.isRunning && styles.hardwareBtnActiveWarning,
            ]}
            onPress={() => {
              if (engine.strobe.isRunning) engine.strobe.stop();
              else engine.strobe.start();
            }}
            activeOpacity={0.8}
          >
            <Flame
              size={18}
              color={engine.strobe.isRunning ? '#000000' : COLORS.warning}
            />
            <Text
              style={[
                styles.hardwareBtnTitle,
                engine.strobe.isRunning && { color: '#000000' },
              ]}
            >
              {engine.strobe.isRunning ? 'STOP STROBE' : 'MORSE SOS STROBE'}
            </Text>
            <Text
              style={[
                styles.hardwareBtnSub,
                engine.strobe.isRunning && { color: '#222222' },
              ]}
            >
              Camera Torch & Screen
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mobile OS Notification Matrix Mockup (Section 3.1) */}
      <View style={styles.sectionCard}>
        <View style={styles.osHeader}>
          <Smartphone size={16} color={COLORS.safe} />
          <Text style={styles.sectionHeader}>MOBILE OS NOTIFICATION SPECIFICATION</Text>
        </View>

        <View style={styles.osBox}>
          <Text style={styles.osTitle}>iOS 15+ TIME-SENSITIVE NOTIFICATIONS</Text>
          <Text style={styles.osDesc}>
            Uses `UNNotificationInterruptionLevelTimeSensitive` to punch through Focus and Sleep modes without requiring the restricted 99%-rejected Critical Alerts entitlement. Live Activities and Dynamic Island stream real-time distance and 30-30 timer.
          </Text>
        </View>

        <View style={styles.osBox}>
          <Text style={styles.osTitle}>ANDROID HIGH-PRIORITY INTRUSION</Text>
          <Text style={styles.osDesc}>
            Utilizes `NotificationManager.IMPORTANCE_HIGH` heads-up display combined with `USE_FULL_SCREEN_INTENT` to wake the screen and mount the survival overlay even during lockscreen or Do Not Disturb.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 80,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.8,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  scenarioActiveCard: {
    backgroundColor: '#090E17',
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  activeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.safe,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  activeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  activeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  scenarioBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#080C14',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  scenarioBtnDanger: {
    borderColor: 'rgba(255, 42, 77, 0.3)',
    backgroundColor: '#110508',
  },
  scenarioBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  scenarioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scenarioBtnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scenarioBtnDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  hardwareGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  hardwareBtn: {
    flex: 1,
    backgroundColor: '#080C14',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hardwareBtnActiveDanger: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  hardwareBtnActiveWarning: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  hardwareBtnTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  hardwareBtnSub: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  osHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  osBox: {
    backgroundColor: '#080C14',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  osTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.safe,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  osDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
});
