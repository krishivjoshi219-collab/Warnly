import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { WarnlyEngine } from './engine/warnly-engine';
import { AlertLevel } from './types/convective';
import { COLORS, FONTS, RADII, SPACING } from './theme';
import { MobileFrame } from './components/MobileFrame';
import { BottomTabBar, ActiveTab } from './components/BottomTabBar';
import { EmergencyIntrusionModal } from './components/EmergencyIntrusionModal';
import { RadarScreen } from './screens/RadarScreen';
import { TelemetryScreen } from './screens/TelemetryScreen';
import { SheltersScreen } from './screens/SheltersScreen';
import { FamilyShieldScreen } from './screens/FamilyShieldScreen';
import { SimulatorScreen } from './screens/SimulatorScreen';
import { Volume2, VolumeX, ShieldAlert, Zap, Radio } from './components/Icons';

// Single global convective engine instance
const engine = new WarnlyEngine();

export const App: React.FC = () => {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('RADAR');

  // Subscribe to engine state updates
  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const isDanger = engine.alertLevel === AlertLevel.DANGER;
  const isAdvisory = engine.alertLevel === AlertLevel.ADVISORY;
  const isWatch = engine.alertLevel === AlertLevel.WATCH;

  const statusColor = isDanger
    ? COLORS.danger
    : isAdvisory
    ? COLORS.warning
    : isWatch
    ? COLORS.warning
    : COLORS.safe;

  const timerFormatted = `${Math.floor(engine.timerRemainingSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(engine.timerRemainingSeconds % 60)
    .toString()
    .padStart(2, '0')}`;

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'RADAR':
        return <RadarScreen engine={engine} />;
      case 'TELEMETRY':
        return <TelemetryScreen engine={engine} />;
      case 'SHELTERS':
        return <SheltersScreen engine={engine} />;
      case 'FAMILY':
        return <FamilyShieldScreen engine={engine} />;
      case 'LAB':
        return <SimulatorScreen engine={engine} />;
    }
  };

  return (
    <MobileFrame>
      <View style={styles.appContainer}>
        {/* Sticky Tactical Header */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.brandTitle}>WARNLY</Text>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: isDanger
                    ? COLORS.dangerBg
                    : isAdvisory
                    ? COLORS.warningBg
                    : isWatch
                    ? COLORS.warningBg
                    : COLORS.safeBg,
                  borderColor: statusColor,
                },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusPillText, { color: statusColor }]}>
                {engine.alertLevel}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* Quick Mute Toggle */}
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => engine.toggleMute()}
              activeOpacity={0.7}
            >
              {engine.isSoundMuted ? (
                <VolumeX size={15} color={COLORS.textMuted} />
              ) : (
                <Volume2 size={15} color={COLORS.safe} />
              )}
            </TouchableOpacity>

            {/* Emergency Intrusion manual trigger / restore */}
            {isDanger && (
              <TouchableOpacity
                style={styles.dangerShortcutPill}
                onPress={() => engine.showEmergencyModal()}
                activeOpacity={0.8}
              >
                <Zap size={12} color="#FFFFFF" />
                <Text style={styles.dangerShortcutText}>{timerFormatted}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Screen Viewport */}
        <View style={styles.screenContainer}>{renderActiveScreen()}</View>

        {/* Bottom Tab Bar */}
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertLevel={engine.alertLevel}
          hasDanger={isDanger}
        />

        {/* FR-04: Emergency Intrusion Full-Screen Modal */}
        <EmergencyIntrusionModal
          visible={engine.isEmergencyModalMounted}
          timerFormatted={timerFormatted}
          strikeCount={engine.timerStrikeCount}
          nearestStrikeKm={engine.nearestStrikeKm}
          nearestStrikeIntensityKa={engine.nearestStrikeIntensityKa}
          isSirenPlaying={engine.siren.isPlaying}
          isSoundMuted={engine.isSoundMuted}
          nearestShelter={engine.selectedShelter}
          onToggleSiren={() => {
            if (engine.siren.isPlaying) engine.siren.stopSiren();
            else engine.siren.startSiren();
          }}
          onToggleMute={() => engine.toggleMute()}
          onNavigateShelter={(shelter) => {
            engine.selectShelter(shelter);
            setActiveTab('SHELTERS');
          }}
          onMinimize={() => engine.dismissEmergencyModal()}
        />
      </View>
    </MobileFrame>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: '#0A0F18',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 90,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADII.sm,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    backgroundColor: '#121A28',
    padding: 6,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dangerShortcutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.sm,
  },
  dangerShortcutText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
});
