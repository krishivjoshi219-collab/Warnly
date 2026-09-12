import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import {
  Zap,
  Waves,
  Activity,
  Mountain,
  Clock,
  Share2,
  Navigation,
  ChevronRight,
} from '../Icons';
import { useWarnly } from '../../lib/warnly/store';
import { useEarthquakes, useFloodRisk } from '../../lib/warnly/hazards';
import { evaluateGlofRisk, type GlofRiskAssessment } from '../../lib/warnly/glof';
import { computeEarlyWarnings, type EarlyWarningSummary } from '../../lib/warnly/early-warning';
import { fetchNearbySafetyCamps, type SafetyCamp } from '../../lib/warnly/shelters';
import { MassBroadcastModal } from './MassBroadcastModal';
import { SafetyCampsModal } from './SafetyCampsModal';
import { GuideModal } from './GuideModal';
import { PulseDot, FadeIn, GlassCard, SectionHeader, StatusBadge } from '../ui';
import { COLORS, RADII, FONTS, SHADOWS, SPACING } from '../../theme';

// ─── STATUS HEADER PILL ──────────────────────────────────────────────────────
export const StatusHeaderPill: React.FC = () => {
  const { level, probability } = useWarnly();

  const isDanger = level === 'danger';
  const isAdvisory = level === 'advisory';

  const color = isDanger ? COLORS.danger : isAdvisory ? COLORS.warning : COLORS.safe;
  const bg = isDanger ? COLORS.dangerBg : isAdvisory ? COLORS.warningBg : COLORS.safeBg;
  const border = isDanger ? COLORS.dangerBorder : isAdvisory ? COLORS.warningBorder : COLORS.safeBorder;
  const text = isDanger
    ? 'CRITICAL THREAT ACTIVE'
    : isAdvisory
    ? 'ADVISORY MONITORING'
    : 'ALL SYSTEMS SAFE';

  // Shimmer animation for the pill
  const shimmerX = useRef(new Animated.Value(-100)).current;
  useEffect(() => {
    if (isDanger || isAdvisory) {
      const shimmer = Animated.loop(
        Animated.timing(shimmerX, {
          toValue: 300,
          duration: 2200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [isDanger, isAdvisory]);

  return (
    <FadeIn duration={350}>
      <View style={[styles.statusPill, { backgroundColor: bg, borderColor: border }]}>
        <PulseDot
          color={color}
          size={7}
          speed={isDanger ? 900 : isAdvisory ? 1400 : 2400}
        />
        <Text style={[styles.pillText, { color }]}>{text}</Text>
        <View style={[styles.pillDivider, { backgroundColor: color + '30' }]} />
        <Text style={[styles.pillProb, { color: color + 'CC' }]}>
          {probability}%
        </Text>
      </View>
    </FadeIn>
  );
};

// ─── THREAT CARDS ────────────────────────────────────────────────────────────
export const ThreatCards: React.FC = () => {
  const { coords, strikes, nearest, weather, level } = useWarnly();
  const [glof, setGlof] = useState<GlofRiskAssessment | null>(null);
  const [earlySummary, setEarlySummary] = useState<EarlyWarningSummary | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [campsOpen, setCampsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [nearestCamp, setNearestCamp] = useState<SafetyCamp | null>(null);

  const quakesQ = useEarthquakes(coords);
  const floodQ = useFloodRisk(coords);
  const quake = quakesQ.data?.[0];
  const flood = floodQ.data;

  useEffect(() => {
    if (!coords) return;
    const dischargeSurge =
      flood?.discharge != null && flood?.dischargeMax != null && flood.discharge > 0
        ? flood.dischargeMax / flood.discharge
        : 1;

    evaluateGlofRisk(
      coords,
      weather?.temperature ?? 20,
      flood?.rainNow ?? weather?.precipitation ?? 0,
      dischargeSurge
    ).then((res) => setGlof(res));

    computeEarlyWarnings(coords, weather, strikes, flood, quakesQ.data ?? []).then((res) => {
      setEarlySummary(res);
    });

    fetchNearbySafetyCamps(coords).then((camps) => {
      if (camps.length > 0) setNearestCamp(camps[0]);
    });
  }, [coords?.lat, coords?.lon, strikes, flood, quake, weather?.temperature]);

  return (
    <View style={styles.container}>
      {/* ── Early Warning Banner ── */}
      {earlySummary?.topAlert && (
        <FadeIn duration={400}>
          <View
            style={[
              styles.earlyBanner,
              earlySummary.hasCriticalEarlyAlert
                ? styles.earlyBannerCritical
                : styles.earlyBannerAdvisory,
            ]}
          >
            {/* Top row: timer + badge */}
            <View style={styles.earlyBannerTop}>
              <View style={styles.earlyBannerLeadRow}>
                <Clock
                  size={13}
                  color={earlySummary.hasCriticalEarlyAlert ? COLORS.danger : COLORS.warning}
                />
                <Text
                  style={[
                    styles.earlyBannerLead,
                    { color: earlySummary.hasCriticalEarlyAlert ? COLORS.danger : COLORS.warning },
                  ]}
                >
                  {earlySummary.topAlert.leadTimeDisplay}
                </Text>
              </View>
              <StatusBadge
                label={earlySummary.hasCriticalEarlyAlert ? 'CRITICAL' : 'ADVISORY'}
                variant={earlySummary.hasCriticalEarlyAlert ? 'danger' : 'warning'}
              />
            </View>

            <Text style={styles.earlyBannerTitle}>{earlySummary.topAlert.title}</Text>
            <Text style={styles.earlyBannerAction}>{earlySummary.topAlert.primaryAction}</Text>

            {/* Action buttons */}
            <View style={styles.earlyBannerActions}>
              <TouchableOpacity
                style={styles.earlyBtnGhost}
                onPress={() => setCampsOpen(true)}
                activeOpacity={0.85}
              >
                <Navigation size={12} color={COLORS.safe} />
                <Text style={styles.earlyBtnTextGhost}>Nearby Safe Camps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.earlyBtnGhost}
                onPress={() => setGuideOpen(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.earlyBtnTextGhost}>Safety Protocols</Text>
              </TouchableOpacity>
            </View>
          </View>
        </FadeIn>
      )}

      {/* ── Section Header ── */}
      <SectionHeader label="Live Hazard Monitor" style={{ marginTop: earlySummary?.topAlert ? 4 : 0 }} />

      {/* ── Hazard Cards Grid ── */}
      <View style={styles.hazardGrid}>
        {/* GLOF */}
        <HazardCard
          icon={<Mountain size={18} color={COLORS.safe} />}
          iconBg="rgba(0,229,255,0.12)"
          title="GLOF Basins"
          subtitle={
            glof?.nearestGlacialLake
              ? `${glof.nearestGlacialLake.lake.name} · ${glof.nearestGlacialLake.distanceKm} km`
              : 'Himalayan corridors'
          }
          status={glof?.riskLevel?.toUpperCase() ?? 'SAFE'}
          statusVariant={
            glof?.riskLevel === 'warning' ? 'danger' : glof?.riskLevel === 'watch' ? 'warning' : 'safe'
          }
          onPress={() => setGuideOpen(true)}
        />

        {/* Flood */}
        <HazardCard
          icon={<Waves size={18} color={COLORS.accentSky} />}
          iconBg="rgba(56,189,248,0.12)"
          title="Flash Floods"
          subtitle={`${flood?.rainNow ?? 0} mm/hr · ${flood?.label ?? 'No flood risk'}`}
          status={flood?.level ? flood.level.toUpperCase() : 'SAFE'}
          statusVariant={
            flood?.level === 'severe' || flood?.level === 'high'
              ? 'danger'
              : flood?.level === 'moderate'
              ? 'warning'
              : 'safe'
          }
          onPress={() => setGuideOpen(true)}
        />

        {/* Lightning */}
        <HazardCard
          icon={<Zap size={18} color={COLORS.warning} />}
          iconBg="rgba(255,186,8,0.12)"
          title="Lightning"
          subtitle={
            strikes.length > 0
              ? `${strikes.length} strikes · ${nearest?.distanceKm ?? 0} km nearest`
              : '0 strikes in zone'
          }
          status={level.toUpperCase()}
          statusVariant={
            level === 'danger' ? 'danger' : level === 'advisory' ? 'warning' : 'safe'
          }
          onPress={() => setGuideOpen(true)}
        />

        {/* Seismic */}
        <HazardCard
          icon={<Activity size={18} color={COLORS.danger} />}
          iconBg="rgba(255,51,85,0.12)"
          title="Seismic"
          subtitle={
            quake
              ? `M${quake.mag.toFixed(1)} · ${quake.distanceKm} km`
              : 'No major tremors'
          }
          status={quake ? `M${quake.mag.toFixed(1)}` : 'CALM'}
          statusVariant={
            quake && quake.mag >= 5.5 ? 'danger' : quake && quake.mag >= 4.0 ? 'warning' : 'safe'
          }
          onPress={() => setGuideOpen(true)}
        />
      </View>

      {/* ── Modals ── */}
      <MassBroadcastModal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        alert={
          earlySummary?.topAlert ?? {
            id: 'home-broadcast',
            kind: 'flood',
            severity: 'warning',
            title: 'Urgent Disaster & Safety Alert',
            leadTimeMinutes: 15,
            leadTimeDisplay: '15 mins advance warning',
            primaryAction: 'Evacuate low ground & move to nearest safe camp',
            actionSteps: [
              'Move to high ground at least 30-50m above riverbed.',
              'Stay away from low bridges and riverbanks.',
              'Carry an emergency go-bag and monitor alerts.',
            ],
            recommendedShelterType: 'high_ground',
            metrics: [],
            timestamp: Date.now(),
          }
        }
        locationName={weather?.place ?? 'Your Area'}
        nearestCamp={nearestCamp}
        onOpenCamps={() => {
          setBroadcastOpen(false);
          setCampsOpen(true);
        }}
      />
      <SafetyCampsModal open={campsOpen} onClose={() => setCampsOpen(false)} coords={coords} />
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </View>
  );
};

// ─── HAZARD CARD ─────────────────────────────────────────────────────────────
// Individual card in the 2×2 hazard grid
type BadgeVariant = 'safe' | 'warning' | 'danger' | 'muted' | 'info';

const BADGE_COLORS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  safe:    { bg: COLORS.safeBg,    text: COLORS.safe,    border: COLORS.safeBorder },
  warning: { bg: COLORS.warningBg, text: COLORS.warning, border: COLORS.warningBorder },
  danger:  { bg: COLORS.dangerBg,  text: COLORS.danger,  border: COLORS.dangerBorder },
  muted:   { bg: 'rgba(255,255,255,0.05)', text: COLORS.textTertiary, border: COLORS.border },
  info:    { bg: 'rgba(59,130,246,0.1)',  text: COLORS.accentBlue,  border: 'rgba(59,130,246,0.3)' },
};

interface HazardCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  status: string;
  statusVariant: BadgeVariant;
  onPress: () => void;
}

const HazardCard: React.FC<HazardCardProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  status,
  statusVariant,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const badgeCfg = BADGE_COLORS[statusVariant];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 14, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[styles.hazardCardWrap, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.hazardCard,
          statusVariant === 'danger' && { borderColor: COLORS.dangerBorder, ...SHADOWS.glowDanger },
          statusVariant === 'warning' && { borderColor: COLORS.warningBorder, ...SHADOWS.glowWarning },
        ]}
        onPress={handlePress}
        activeOpacity={1}
      >
        {/* Top: icon + status badge */}
        <View style={styles.hazardCardTop}>
          <View style={[styles.hazardIconBox, { backgroundColor: iconBg }]}>{icon}</View>
          <View style={[styles.hazardBadge, { backgroundColor: badgeCfg.bg, borderColor: badgeCfg.border }]}>
            <Text style={[styles.hazardBadgeText, { color: badgeCfg.text }]}>{status}</Text>
          </View>
        </View>

        {/* Bottom: name + sub */}
        <Text style={styles.hazardTitle}>{title}</Text>
        <Text style={styles.hazardSub} numberOfLines={2}>{subtitle}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    gap: 10,
  },

  // ── Status Pill ──
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.full,
    borderWidth: 1,
    gap: 7,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  pillDivider: {
    width: 1,
    height: 12,
  },
  pillProb: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.mono,
  },

  // ── Early Warning Banner ──
  earlyBanner: {
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  earlyBannerAdvisory: {
    backgroundColor: 'rgba(255,186,8,0.07)',
    borderColor: COLORS.warningBorder,
  },
  earlyBannerCritical: {
    backgroundColor: 'rgba(255,51,85,0.08)',
    borderColor: COLORS.dangerBorder,
    ...SHADOWS.glowDanger,
  },
  earlyBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earlyBannerLeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  earlyBannerLead: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  earlyBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  earlyBannerAction: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  earlyBannerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  earlyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADII.lg,
    paddingVertical: 10,
    gap: 6,
    ...SHADOWS.glowDanger,
  },
  earlyBtnTextDanger: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  earlyBtnGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADII.lg,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: COLORS.backgroundElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  earlyBtnTextGhost: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.safe,
  },

  // ── Hazard Grid ──
  hazardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hazardCardWrap: {
    flex: 1,
    minWidth: '47%',
  },
  hazardCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 4,
    ...SHADOWS.sm,
  },
  hazardCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  hazardIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hazardBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.sm,
    borderWidth: 1,
  },
  hazardBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hazardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.1,
  },
  hazardSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
});
