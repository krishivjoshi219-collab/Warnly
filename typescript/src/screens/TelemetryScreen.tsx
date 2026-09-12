import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { WarnlyEngine } from '../engine/warnly-engine';
import { TelemetryHUD } from '../components/TelemetryHUD';
import { COLORS, FONTS, RADII, SPACING } from '../theme';
import {
  Activity,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  CloudLightning,
} from '../components/Icons';

interface Props {
  engine: WarnlyEngine;
}

export const TelemetryScreen: React.FC<Props> = ({ engine }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    await engine.loadLiveWeatherData();
    setIsLoading(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Activity size={18} color={COLORS.safe} />
          <Text style={styles.headerTitle}>CONVECTIVE TELEMETRY & PHYSICS</Text>
        </View>
        <Text style={styles.headerSub}>Deep Moist Convection Dynamics</Text>
      </View>

      {/* Main Telemetry HUD */}
      <TelemetryHUD
        telemetry={engine.telemetry}
        alertLevel={engine.alertLevel}
        nearestStrikeKm={engine.nearestStrikeKm}
        onRefreshLive={handleRefresh}
        isLoadingLive={isLoading}
      />

      {/* Meteorological Science Breakdown Card */}
      <View style={styles.scienceCard}>
        <View style={styles.scienceHeader}>
          <Sparkles size={16} color={COLORS.safe} />
          <Text style={styles.scienceTitle}>
            ATMOSPHERIC PHYSICS: ADVECTIVE VS IN-SITU
          </Text>
        </View>

        <Text style={styles.scienceIntro}>
          National weather bureau warnings cover thousands of square kilometers, causing severe warning fatigue. Warnly resolves this with honest physics:
        </Text>

        <View style={styles.modelRow}>
          <View style={[styles.modelBadge, { backgroundColor: 'rgba(0, 229, 255, 0.12)' }]}>
            <Text style={[styles.modelBadgeText, { color: COLORS.safe }]}>
              ADVECTING CELLS (~85%)
            </Text>
          </View>
          <Text style={styles.modelDesc}>
            Storm cell active 20–35 km away moving at 30–45 km/h. Warnly calculates closing velocity $V_&#123;vector&#125;$, delivering a genuine{' '}
            <Text style={{ color: COLORS.safe, fontWeight: '700' }}>10–25 minute evacuation window</Text> before the first strike enters the 10 km danger perimeter.
          </Text>
        </View>

        <View style={styles.modelRow}>
          <View style={[styles.modelBadge, { backgroundColor: 'rgba(255, 176, 32, 0.12)' }]}>
            <Text style={[styles.modelBadgeText, { color: COLORS.warning }]}>
              IN-SITU INITIATION (~15%)
            </Text>
          </View>
          <Text style={styles.modelDesc}>
            Rapid convective cloud build-up developing directly overhead. No sensor can predict the millisecond of the first discharge before it happens. Warnly issues a{' '}
            <Text style={{ color: COLORS.warning, fontWeight: '700' }}>Convective Watch</Text> based on CAPE &gt; 1500 J/kg and negative Lifted Index.
          </Text>
        </View>
      </View>

      {/* Compliant Multi-Tier Data Architecture (Section 2.1) */}
      <View style={styles.dataTierCard}>
        <Text style={styles.tierTitle}>COMPLIANT MULTI-TIER TELEMETRY PIPELINE</Text>

        {/* Tier 1 */}
        <View style={styles.tierItem}>
          <View style={styles.tierItemHeader}>
            <View style={styles.tierTag}>
              <Text style={styles.tierTagText}>TIER 1 • FREE PUBLIC DOMAIN</Text>
            </View>
            <Text style={styles.tierStatus}>100% Commercial Legal</Text>
          </View>
          <Text style={styles.tierTech}>
            NOAA GOES-16 & 18 Geostationary Lightning Mapper (GLM) + Open-Meteo ECMWF/GFS Convective Indices.
          </Text>
          <Text style={styles.tierNote}>
            Space-based optical pulse detection every 20s. Zero licensing fee.
          </Text>
        </View>

        {/* Tier 2 */}
        <View style={styles.tierItem}>
          <View style={styles.tierItemHeader}>
            <View style={[styles.tierTag, { backgroundColor: 'rgba(255, 176, 32, 0.15)' }]}>
              <Text style={[styles.tierTagText, { color: COLORS.warning }]}>
                TIER 2 • B2B COMMERCIAL TELEMETRY
              </Text>
            </View>
            <Text style={[styles.tierStatus, { color: COLORS.warning }]}>
              Funded by SaaS Subscriptions
            </Text>
          </View>
          <Text style={styles.tierTech}>
            Vaisala GLD360 / Earth Networks (ENTLN) VLF/LF Time-of-Arrival sensor network.
          </Text>
          <Text style={styles.tierNote}>
            Sub-second precision ground-stroke telemetry with 95%+ detection efficiency.
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
    marginBottom: SPACING.md,
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
  scienceCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  scienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  scienceTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  scienceIntro: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  modelRow: {
    backgroundColor: '#090E17',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#152234',
  },
  modelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
    marginBottom: 6,
  },
  modelBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modelDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  dataTierCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  tierTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  tierItem: {
    backgroundColor: '#090E17',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#152234',
  },
  tierItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tierTag: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  tierTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.safe,
    letterSpacing: 0.4,
  },
  tierStatus: {
    fontSize: 10,
    color: COLORS.safe,
    fontWeight: '600',
  },
  tierTech: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  tierNote: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
