import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AtmosphericTelemetry, AlertLevel } from '../types/convective';
import { COLORS, FONTS, RADII, SPACING } from '../theme';
import { CloudLightning, Gauge, Wind, Radio, RefreshCw, AlertTriangle, ShieldCheck } from './Icons';

interface Props {
  telemetry: AtmosphericTelemetry;
  alertLevel: AlertLevel;
  nearestStrikeKm: number | null;
  onRefreshLive?: () => void;
  isLoadingLive?: boolean;
}

export const TelemetryHUD: React.FC<Props> = ({
  telemetry,
  alertLevel,
  nearestStrikeKm,
  onRefreshLive,
  isLoadingLive,
}) => {
  const isHighCape = telemetry.cape > 1500;
  const isSevereInstability = telemetry.liftedIndex < -2.0;

  const getCapeColor = () => {
    if (telemetry.cape > 2500) return COLORS.danger;
    if (telemetry.cape > 1500) return COLORS.warning;
    return COLORS.safe;
  };

  const getCapeLabel = () => {
    if (telemetry.cape > 2500) return 'EXTREME INITIATION POTENTIAL';
    if (telemetry.cape > 1500) return 'HIGH CONVECTIVE BUILD-UP';
    if (telemetry.cape > 800) return 'MODERATE UNSTABLE';
    return 'STABLE ATMOSPHERE';
  };

  return (
    <View style={styles.container}>
      {/* Two-Tier Risk Assessment Banner */}
      <View
        style={[
          styles.riskBanner,
          {
            backgroundColor:
              alertLevel === AlertLevel.DANGER
                ? COLORS.dangerBg
                : alertLevel === AlertLevel.ADVISORY
                ? COLORS.warningBg
                : alertLevel === AlertLevel.WATCH
                ? COLORS.warningBg
                : COLORS.safeBg,
            borderColor:
              alertLevel === AlertLevel.DANGER
                ? COLORS.dangerBorder
                : alertLevel === AlertLevel.ADVISORY
                ? COLORS.warningBorder
                : alertLevel === AlertLevel.WATCH
                ? COLORS.warningBorder
                : COLORS.safeBorder,
          },
        ]}
      >
        <View style={styles.riskBannerLeft}>
          {alertLevel === AlertLevel.DANGER ? (
            <AlertTriangle size={20} color={COLORS.danger} />
          ) : alertLevel === AlertLevel.ADVISORY ? (
            <CloudLightning size={20} color={COLORS.warning} />
          ) : alertLevel === AlertLevel.WATCH ? (
            <Gauge size={20} color={COLORS.warning} />
          ) : (
            <ShieldCheck size={20} color={COLORS.safe} />
          )}

          <View style={styles.riskTexts}>
            <Text
              style={[
                styles.riskTitle,
                {
                  color:
                    alertLevel === AlertLevel.DANGER
                      ? COLORS.danger
                      : alertLevel === AlertLevel.ADVISORY || alertLevel === AlertLevel.WATCH
                      ? COLORS.warning
                      : COLORS.safe,
                },
              ]}
            >
              {alertLevel === AlertLevel.DANGER
                ? 'TACTICAL EVACUATION MANDATED'
                : alertLevel === AlertLevel.ADVISORY
                ? 'ADVECTION PERIMETER ADVISORY'
                : alertLevel === AlertLevel.WATCH
                ? 'ATMOSPHERIC CONVECTIVE WATCH'
                : 'CALIBRATED BASELINE SAFE'}
            </Text>
            <Text style={styles.riskSubtitle}>
              {alertLevel === AlertLevel.DANGER
                ? `Active lightning inside 10 km danger ring (${nearestStrikeKm?.toFixed(1) ?? '6.8'} km). 30-30 shelter timer running.`
                : alertLevel === AlertLevel.ADVISORY
                ? `Convective storm core advecting toward 10 km ring. ${telemetry.advectionLeadTimeMin || 18} min evacuation lead-time.`
                : alertLevel === AlertLevel.WATCH
                ? `CAPE ${Math.round(telemetry.cape)} J/kg > 1500 J/kg threshold. In-situ initiation likely within 30-60 min.`
                : 'Zero convective lightning or microburst threats detected within 15 km geodesic perimeter.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Primary Atmospheric Indices Grid */}
      <View style={styles.grid}>
        {/* CAPE Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>CAPE (INSTABILITY)</Text>
            <Gauge size={14} color={getCapeColor()} />
          </View>
          <View style={styles.cardValRow}>
            <Text style={[styles.cardValMono, { color: getCapeColor() }]}>
              {Math.round(telemetry.cape)}
            </Text>
            <Text style={styles.cardUnit}>J/kg</Text>
          </View>
          {/* Progress Bar with 1500 J/kg Threshold */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, (telemetry.cape / 3000) * 100)}%`,
                  backgroundColor: getCapeColor(),
                },
              ]}
            />
            {/* 1500 threshold marker */}
            <View style={[styles.thresholdMarker, { left: '50%' }]} />
          </View>
          <Text style={[styles.cardSubText, { color: getCapeColor() }]}>
            {getCapeLabel()}
          </Text>
        </View>

        {/* Lifted Index Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>LIFTED INDEX</Text>
            <CloudLightning
              size={14}
              color={isSevereInstability ? COLORS.danger : COLORS.textMuted}
            />
          </View>
          <View style={styles.cardValRow}>
            <Text
              style={[
                styles.cardValMono,
                {
                  color: isSevereInstability
                    ? COLORS.danger
                    : telemetry.liftedIndex < 0
                    ? COLORS.warning
                    : COLORS.safe,
                },
              ]}
            >
              {telemetry.liftedIndex > 0 ? `+${telemetry.liftedIndex.toFixed(1)}` : telemetry.liftedIndex.toFixed(1)}
            </Text>
            <Text style={styles.cardUnit}>°C</Text>
          </View>
          <Text style={styles.cardSubText}>
            {telemetry.liftedIndex < -4
              ? 'Severe updraft potential'
              : telemetry.liftedIndex < -1
              ? 'Moderate convective updraft'
              : 'Stable adiabatic lapse'}
          </Text>
        </View>

        {/* Storm Velocity Vector Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>STORM ADVECTION</Text>
            <Wind size={14} color={COLORS.warning} />
          </View>
          <View style={styles.cardValRow}>
            <Text style={[styles.cardValMono, { color: COLORS.textPrimary }]}>
              {telemetry.stormSpeedKmh}
            </Text>
            <Text style={styles.cardUnit}>km/h</Text>
          </View>
          <Text style={styles.cardSubText}>
            {telemetry.stormSpeedKmh > 0
              ? `Heading ${telemetry.stormBearingDegrees}° NE • Closing fast`
              : 'Zero lateral advection'}
          </Text>
        </View>

        {/* Radar Reflectivity dBZ */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>RADAR REFLECTIVITY</Text>
            <Radio
              size={14}
              color={telemetry.cloudTopReflectivityDbz >= 45 ? COLORS.danger : COLORS.safe}
            />
          </View>
          <View style={styles.cardValRow}>
            <Text
              style={[
                styles.cardValMono,
                {
                  color:
                    telemetry.cloudTopReflectivityDbz >= 45
                      ? COLORS.danger
                      : telemetry.cloudTopReflectivityDbz >= 35
                      ? COLORS.warning
                      : COLORS.safe,
                },
              ]}
            >
              {telemetry.cloudTopReflectivityDbz}
            </Text>
            <Text style={styles.cardUnit}>dBZ</Text>
          </View>
          <Text style={styles.cardSubText}>
            {telemetry.cloudTopReflectivityDbz >= 45
              ? 'Severe Hail & Lightning Core'
              : telemetry.cloudTopReflectivityDbz >= 30
              ? 'Moderate Rain Cells'
              : 'Light Virga / Scatter'}
          </Text>
        </View>
      </View>

      {/* Telemetry Ingestion Status Footer */}
      <View style={styles.ingestionFooter}>
        <View style={styles.ingestionLeft}>
          <View style={styles.liveIndicator} />
          <Text style={styles.sourceText}>{telemetry.source}</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefreshLive}
          disabled={isLoadingLive}
          activeOpacity={0.7}
        >
          <RefreshCw
            size={12}
            color={COLORS.safe}
          />
          <Text style={styles.refreshText}>
            {isLoadingLive ? 'Syncing...' : 'Live NWP Sync'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  riskBanner: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  riskBannerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  riskTexts: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  riskSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    width: '48.5%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  cardValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  cardValMono: {
    fontFamily: FONTS.mono,
    fontSize: 20,
    fontWeight: '800',
  },
  cardUnit: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#090E17',
    borderRadius: 2,
    position: 'relative',
    marginVertical: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFFFFF',
    zIndex: 5,
  },
  cardSubText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  ingestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A0F18',
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    marginTop: SPACING.sm,
  },
  ingestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.safe,
  },
  sourceText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  refreshText: {
    fontSize: 11,
    color: COLORS.safe,
    fontWeight: '700',
  },
  rotating: {
    transform: [{ rotate: '45deg' }],
  },
});
