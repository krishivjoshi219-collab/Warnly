import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { WarnlyEngine } from '../engine/warnly-engine';
import { GeodesicRadar } from '../components/GeodesicRadar';
import { DynamicIsland } from '../components/DynamicIsland';
import { AlertLevel, DemographicProfileId } from '../types/convective';
import { COLORS, FONTS, RADII, SPACING } from '../theme';
import {
  Zap,
  Volume2,
  VolumeX,
  Radio,
  Flame,
  AlertOctagon,
  Shield,
  Layers,
} from '../components/Icons';

interface Props {
  engine: WarnlyEngine;
}

export const RadarScreen: React.FC<Props> = ({ engine }) => {
  const isDanger = engine.alertLevel === AlertLevel.DANGER;
  const isAdvisory = engine.alertLevel === AlertLevel.ADVISORY;
  const isWatch = engine.alertLevel === AlertLevel.WATCH;

  const timerFormatted = `${Math.floor(engine.timerRemainingSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(engine.timerRemainingSeconds % 60)
    .toString()
    .padStart(2, '0')}`;

  const [activeProfile, setActiveProfile] = useState<DemographicProfileId>('general');

  const handleProfileSelect = (id: DemographicProfileId) => {
    setActiveProfile(id);
    engine.setDemographicProfile(id);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* iOS Live Activity / Dynamic Island Mockup Banner */}
      <DynamicIsland
        preview={engine.getNotificationPreview()}
        alertLevel={engine.alertLevel}
        nearestStrikeKm={engine.nearestStrikeKm}
        timerFormatted={timerFormatted}
        isTimerRunning={engine.isTimerRunning}
        onPressExpand={() => {
          if (isDanger) engine.showEmergencyModal();
        }}
      />

      {/* Target Demographic Profile Selector Pill Bar */}
      <View style={styles.profileBar}>
        <View style={styles.profileBarHeader}>
          <Layers size={13} color={COLORS.textMuted} />
          <Text style={styles.profileBarTitle}>DEMOGRAPHIC PROFILE SAFETY RULES</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.profileChipsRow}
        >
          {(
            [
              { id: 'general', label: 'Civilian Shield' },
              { id: 'agriculture', label: '🌾 Agriculture' },
              { id: 'construction', label: '🏗️ OSHA 10-mi' },
              { id: 'athletics', label: '⚽ Athletics 30-30' },
              { id: 'maritime', label: '⛵ Maritime' },
            ] as const
          ).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.profileChip,
                activeProfile === item.id && styles.profileChipActive,
              ]}
              onPress={() => handleProfileSelect(item.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.profileChipText,
                  activeProfile === item.id && styles.profileChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Primary Geodesic Defense Radar Scope */}
      <GeodesicRadar
        strikes={engine.strikes}
        alertLevel={engine.alertLevel}
        userLat={engine.userLatitude}
        userLon={engine.userLongitude}
        stormSpeedKmh={engine.telemetry.stormSpeedKmh}
        stormBearingDeg={engine.telemetry.stormBearingDegrees}
        leadTimeMinutes={engine.telemetry.advectionLeadTimeMin}
      />

      {/* Critical Quick Actions Bar */}
      <View style={styles.quickActionsGrid}>
        {/* Siren Toggle */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            engine.siren.isPlaying && styles.actionButtonDanger,
          ]}
          onPress={() => {
            if (engine.siren.isPlaying) {
              engine.siren.stopSiren();
            } else {
              engine.siren.startSiren();
            }
          }}
          activeOpacity={0.8}
        >
          <Volume2
            size={18}
            color={engine.siren.isPlaying ? '#FFFFFF' : COLORS.textPrimary}
          />
          <View>
            <Text style={styles.actionBtnTitle}>880Hz Bi-Tonal Siren</Text>
            <Text style={styles.actionBtnSub}>
              {engine.siren.isPlaying ? 'ACTIVE • TAP TO STOP' : 'Software Audio DAC'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Optical SOS Strobe Toggle */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            engine.strobe.isRunning && styles.actionButtonWarning,
          ]}
          onPress={() => {
            if (engine.strobe.isRunning) {
              engine.strobe.stop();
            } else {
              engine.strobe.start();
            }
          }}
          activeOpacity={0.8}
        >
          <Flame
            size={18}
            color={engine.strobe.isRunning ? '#000000' : COLORS.warning}
          />
          <View>
            <Text
              style={[
                styles.actionBtnTitle,
                engine.strobe.isRunning && { color: '#000000' },
              ]}
            >
              Morse SOS Strobe
            </Text>
            <Text
              style={[
                styles.actionBtnSub,
                engine.strobe.isRunning && { color: '#222222' },
              ]}
            >
              {engine.strobe.isRunning ? 'FLASHING ... --- ...' : 'Screen & Torch'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Active Strikes Feed Summary */}
      <View style={styles.feedCard}>
        <View style={styles.feedHeader}>
          <View style={styles.feedHeaderLeft}>
            <Radio size={14} color={COLORS.safe} />
            <Text style={styles.feedTitle}>REAL-TIME CONVECTIVE TELEMETRY FEED</Text>
          </View>
          <Text style={styles.strikeCountTag}>
            {engine.strikes.length} STRIKES TRACKED
          </Text>
        </View>

        {engine.strikes.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Shield size={24} color={COLORS.safe} />
            <Text style={styles.emptyFeedTitle}>Perimeter Clear</Text>
            <Text style={styles.emptyFeedSub}>
              No cloud-to-ground or in-cloud strikes within the 15 km geodesic safety perimeter.
            </Text>
          </View>
        ) : (
          engine.strikes.slice(0, 4).map((s) => {
            const ageMins = Math.round((Date.now() - s.timestamp) / (60 * 1000));
            const isInsideDanger = s.distanceKm <= 10.0;

            return (
              <View
                key={s.id}
                style={[
                  styles.strikeRow,
                  isInsideDanger && styles.strikeRowDanger,
                ]}
              >
                <View style={styles.strikeRowLeft}>
                  <View
                    style={[
                      styles.strikeDot,
                      {
                        backgroundColor: isInsideDanger
                          ? COLORS.danger
                          : COLORS.warning,
                      },
                    ]}
                  />
                  <View>
                    <Text style={styles.strikeIdText}>{s.id}</Text>
                    <Text style={styles.strikeMetaText}>
                      {s.provider} • {s.type === 'CG' ? 'Cloud-Ground' : 'In-Cloud'}
                    </Text>
                  </View>
                </View>

                <View style={styles.strikeRowRight}>
                  <Text
                    style={[
                      styles.strikeDistText,
                      { color: isInsideDanger ? COLORS.danger : COLORS.textPrimary },
                    ]}
                  >
                    {s.distanceKm.toFixed(1)} km
                  </Text>
                  <Text style={styles.strikeAgeText}>
                    {ageMins === 0 ? 'Just now' : `${ageMins}m ago`} • {s.intensityKa} kA
                  </Text>
                </View>
              </View>
            );
          })
        )}
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
    paddingTop: SPACING.sm,
    paddingBottom: 80,
  },
  profileBar: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  profileBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  profileBarTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  profileChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  profileChip: {
    backgroundColor: '#0B1018',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  profileChipActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: COLORS.safe,
  },
  profileChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  profileChipTextActive: {
    color: COLORS.safe,
    fontWeight: '800',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  actionButtonDanger: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  actionButtonWarning: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  actionBtnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionBtnSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  feedCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  feedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  strikeCountTag: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.safe,
  },
  emptyFeed: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: 6,
  },
  emptyFeedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyFeedSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
  strikeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#090E17',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#141E2D',
  },
  strikeRowDanger: {
    borderColor: 'rgba(255, 42, 77, 0.3)',
    backgroundColor: '#120508',
  },
  strikeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strikeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  strikeIdText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  strikeMetaText: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  strikeRowRight: {
    alignItems: 'flex-end',
  },
  strikeDistText: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    fontWeight: '800',
  },
  strikeAgeText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
