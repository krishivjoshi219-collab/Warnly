import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  MapPin,
  RefreshCw,
  Wind,
  Droplets,
  CloudRain,
  ShieldCheck,
  Share2,
  BookOpen,
  Sparkles,
} from '../components/Icons';
import { useWarnly } from '../lib/warnly/store';
import { levelMeta, SAFETY_RADIUS_KM } from '../lib/warnly/risk';
import { weatherCodeInfo } from '../lib/warnly/weather';
import { StatusHeaderPill, ThreatCards } from '../components/warnly/ThreatCards';
import { RiskMeter } from '../components/warnly/RiskMeter';
import { LocationSearch } from '../components/warnly/LocationSearch';
import { SafetyCampsModal } from '../components/warnly/SafetyCampsModal';
import { MassBroadcastModal } from '../components/warnly/MassBroadcastModal';
import { GuideModal } from '../components/warnly/GuideModal';
import {
  FadeIn,
  GlassCard,
  GlowButton,
  MetricTile,
  PulseDot,
  SectionHeader,
  ScreenHeader,
  Divider,
} from '../components/ui';
import { COLORS, RADII, FONTS, SHADOWS, SPACING } from '../theme';

interface Props {
  onNavigateRadar?: () => void;
}

export const HomeScreen: React.FC<Props> = ({ onNavigateRadar }) => {
  const {
    level,
    probability,
    weather,
    strikes,
    nearest,
    geoError,
    refresh,
    isLoading,
    setCustomCoords,
    requestLocation,
    locating,
    coords,
  } = useWarnly();

  const [campsOpen, setCampsOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const meta = levelMeta[level];
  const levelColor =
    level === 'danger' ? COLORS.danger : level === 'advisory' ? COLORS.warning : COLORS.safe;

  const wx = weather ? weatherCodeInfo(weather.weatherCode, weather.isDay) : null;

  // ── Refresh button spin ─────────────────────────────────────────────────
  const spinAnim = useRef(new Animated.Value(0)).current;
  const handleRefresh = () => {
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => spinAnim.setValue(0));
    refresh();
  };
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const riskCardBg =
    level === 'danger'
      ? 'rgba(255,51,85,0.07)'
      : level === 'advisory'
      ? 'rgba(255,186,8,0.07)'
      : 'rgba(0,229,255,0.04)';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Screen Header ── */}
      <FadeIn duration={300}>
        <ScreenHeader
          title="Risk Dashboard"
          subtitle="Real-time lightning & hazard intelligence"
          badge="WARNLY"
          badgeVariant="safe"
          right={
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={handleRefresh}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.safe} />
              ) : (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <RefreshCw size={15} color={COLORS.textSecondary} />
                </Animated.View>
              )}
            </TouchableOpacity>
          }
        />
      </FadeIn>

      {/* ── Live Status Pill ── */}
      <FadeIn duration={350} delay={50}>
        <StatusHeaderPill />
      </FadeIn>

      {/* ── Location Search ── */}
      <LocationSearch
        onSelectCoords={setCustomCoords}
        onUseGPS={requestLocation}
        locating={locating}
      />

      {/* ── Quick Action Strip ── */}
      <FadeIn duration={350} delay={100}>
        <View style={styles.quickStrip}>
          <QuickAction
            icon={<ShieldCheck size={15} color={COLORS.safe} />}
            label="Safe Camps"
            sub="High Ground"
            accent={COLORS.safe}
            onPress={() => setCampsOpen(true)}
          />
          <QuickAction
            icon={<Share2 size={15} color={COLORS.danger} />}
            label="Broadcast SOS"
            sub="WhatsApp/SMS"
            accent={COLORS.danger}
            onPress={() => setBroadcastOpen(true)}
          />
          <QuickAction
            icon={<BookOpen size={15} color={COLORS.accentSky} />}
            label="GLOF Guide"
            sub="Protocols"
            accent={COLORS.accentSky}
            onPress={() => setGuideOpen(true)}
          />
        </View>
      </FadeIn>

      {/* ── Main Risk Card ── */}
      <FadeIn duration={400} delay={120}>
        <View
          style={[
            styles.riskCard,
            {
              borderColor: levelColor + '30',
            },
            level === 'danger' && SHADOWS.glowDanger,
            level === 'advisory' && SHADOWS.glowWarning,
            level === 'safe' && SHADOWS.glowSafe,
          ]}
        >
          {/* Subtle top-edge highlight */}
          <View style={[styles.riskCardTopEdge, { backgroundColor: levelColor + '35' }]} />

          {/* Card header: icon + location + level */}
          <View style={styles.riskCardHeader}>
            <View style={styles.riskCardHeaderLeft}>
              {/* Status icon */}
              <View style={[styles.riskIconBox, { backgroundColor: levelColor + '18' }]}>
                {level === 'danger' ? (
                  <Zap size={20} color={COLORS.danger} />
                ) : level === 'advisory' ? (
                  <AlertTriangle size={20} color={COLORS.warning} />
                ) : (
                  <CheckCircle2 size={20} color={COLORS.safe} />
                )}
              </View>

              <View style={styles.riskCardTitles}>
                <Text style={[styles.riskLevelLabel, { color: levelColor }]}>{meta.label}</Text>
                {/* Location sub-row */}
                {weather && (
                  <View style={styles.locationRow}>
                    <MapPin size={10} color={COLORS.textMuted} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {weather.place} ·{' '}
                      {new Date(weather.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Risk Meter gauge */}
          <RiskMeter probability={probability} level={level} caption={meta.sub} />

          {/* Stats strip */}
          <Divider style={{ marginVertical: 0 }} />
          <View style={styles.statsStrip}>
            <MetricTile
              label="CAPE"
              value={weather ? String(Math.round(weather.cape)) : '—'}
              unit="J/kg"
              accent={COLORS.warning}
              style={styles.statsTile}
            />
            <View style={styles.statsDivider} />
            <MetricTile
              label="LI INDEX"
              value={weather ? weather.liftedIndex.toFixed(1) : '—'}
              unit="K"
              accent={COLORS.accentSky}
              style={styles.statsTile}
            />
            <View style={styles.statsDivider} />
            <MetricTile
              label="NEAREST ⚡"
              value={nearest ? String(nearest.distanceKm) : 'None'}
              unit={nearest ? ' km' : ''}
              accent={nearest ? COLORS.danger : COLORS.safe}
              style={styles.statsTile}
            />
          </View>
        </View>
      </FadeIn>

      {/* ── Multi-Hazard Threat Cards ── */}
      <FadeIn duration={400} delay={150}>
        <ThreatCards />
      </FadeIn>

      {/* ── Rain Outlook Banner ── */}
      {weather && (
        <FadeIn duration={350} delay={180}>
          <GlassCard
            accentColor={COLORS.safe}
            style={styles.rainBanner}
            noPadding
          >
            <View style={styles.rainBannerInner}>
              <View style={styles.rainBannerIconWrap}>
                <CloudRain size={20} color={COLORS.safe} />
              </View>
              <View style={styles.rainBannerText}>
                <Text style={styles.rainBannerTitle}>Rain & Weather Outlook</Text>
                <Text style={styles.rainBannerSummary}>{weather.rainSummary}</Text>
              </View>
            </View>
          </GlassCard>
        </FadeIn>
      )}

      {/* ── Weather Overview Card ── */}
      {weather && (
        <FadeIn duration={400} delay={200}>
          <GlassCard style={styles.weatherCard} noPadding>
            <View style={styles.weatherCardInner}>
              {/* Temperature + condition */}
              <View style={styles.weatherTopRow}>
                <View>
                  <Text style={styles.weatherTemp}>
                    {Math.round(weather.temperature)}°
                    <Text style={styles.weatherTempUnit}>C</Text>
                  </Text>
                  <Text style={styles.weatherCondition}>
                    {wx?.label} · feels {Math.round(weather.apparent)}°C
                  </Text>
                </View>

                <View style={styles.weatherMetrics}>
                  <View style={styles.weatherMetricRow}>
                    <Wind size={12} color={COLORS.safe} />
                    <Text style={styles.weatherMetricText}>
                      {Math.round(weather.windSpeed)} km/h
                    </Text>
                  </View>
                  <View style={styles.weatherMetricRow}>
                    <Droplets size={12} color={COLORS.accentSky} />
                    <Text style={styles.weatherMetricText}>{weather.humidity}%</Text>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.weatherDivider} />

              {/* Bottom stats row */}
              <View style={styles.weatherBottomRow}>
                {[
                  { label: 'DEW POINT', val: `${Math.round(weather.dewPoint)}°C` },
                  { label: 'CLOUD COVER', val: `${weather.cloudCover}%` },
                  { label: 'UV INDEX', val: `${weather.uvIndex}/11` },
                ].map((m) => (
                  <View key={m.label} style={styles.weatherBottomItem}>
                    <Text style={styles.weatherBottomLabel}>{m.label}</Text>
                    <Text style={styles.weatherBottomVal}>{m.val}</Text>
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>
        </FadeIn>
      )}

      {/* ── Radar Preview Card ── */}
      <FadeIn duration={400} delay={220}>
        <TouchableOpacity
          style={styles.radarCard}
          onPress={onNavigateRadar}
          activeOpacity={0.88}
        >
          {/* Top bar */}
          <View style={styles.radarCardHeader}>
            <View style={styles.radarCardTitleRow}>
              <PulseDot color={COLORS.safe} size={6} speed={1800} />
              <Text style={styles.radarCardTitle}>Live Weather Radar</Text>
            </View>
            <View style={styles.radarCardChevron}>
              <Text style={styles.radarOpenText}>Full Screen</Text>
              <Sparkles size={11} color={COLORS.safe} />
            </View>
          </View>

          {/* Radar scope visualization */}
          <View style={styles.radarScope}>
            {/* Concentric rings */}
            {[0.94, 0.64, 0.36].map((r, i) => (
              <AnimatedRing
                key={i}
                size={r}
                color={COLORS.safe}
                delay={i * 200}
                dashed={i === 1}
              />
            ))}
            {/* Center marker */}
            <View style={styles.radarCenter}>
              <View style={styles.radarCenterDot} />
            </View>
            {/* Strike count */}
            <View style={styles.radarStrikeLabel}>
              <Text style={styles.radarStrikeCount}>{strikes.length}</Text>
              <Text style={styles.radarStrikeText}>ACTIVE STRIKES</Text>
            </View>
          </View>
        </TouchableOpacity>
      </FadeIn>

      {/* ── Safety Zone Card ── */}
      <FadeIn duration={350} delay={240}>
        <GlassCard style={styles.safeZoneCard} noPadding>
          <View style={styles.safeZoneInner}>
            <View style={styles.safeZoneIconWrap}>
              <ShieldCheck size={18} color={COLORS.safe} />
            </View>
            <View style={styles.safeZoneText}>
              <Text style={styles.safeZoneTitle}>Real-Time Safety Zone Active</Text>
              <Text style={styles.safeZoneSub}>
                Continuously monitoring Blitzortung lightning network, Doppler radar & GLOF glacial basins within {SAFETY_RADIUS_KM} km.
              </Text>
            </View>
          </View>
        </GlassCard>
      </FadeIn>

      {/* Modals */}
      <SafetyCampsModal open={campsOpen} onClose={() => setCampsOpen(false)} coords={coords} />
      <MassBroadcastModal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        alert={{
          id: 'home-broadcast',
          kind: 'flood',
          severity: 'warning',
          title: 'Urgent Disaster & Safety Alert',
          leadTimeMinutes: 15,
          leadTimeDisplay: '15 mins advance warning',
          primaryAction: 'Evacuate low ground & move to nearest safe camp',
          actionSteps: [
            'Move to high ground at least 30-50m above riverbed.',
            'Avoid low-lying riverbeds, culverts and bridges.',
            'Carry emergency go-bag and keep phones charged.',
          ],
          recommendedShelterType: 'high_ground',
          metrics: [],
          timestamp: Date.now(),
        }}
        locationName={weather?.place ?? 'Your Area'}
        nearestCamp={null}
        onOpenCamps={() => {
          setBroadcastOpen(false);
          setCampsOpen(true);
        }}
      />
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </ScrollView>
  );
};

// ─── ANIMATED RADAR RING ────────────────────────────────────────────────────
const AnimatedRing: React.FC<{
  size: number;
  color: string;
  delay: number;
  dashed?: boolean;
}> = ({ size, color, delay, dashed = false }) => {
  const opacity = useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 1800,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const scopeSize = 160;
  const ringSize = scopeSize * size;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: ringSize,
        height: ringSize,
        borderRadius: ringSize / 2,
        borderWidth: 1,
        borderColor: color,
        borderStyle: dashed ? 'dashed' : 'solid',
        opacity,
      }}
    />
  );
};

// ─── QUICK ACTION CHIP ───────────────────────────────────────────────────────
const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  sub: string;
  accent: string;
  onPress: () => void;
}> = ({ icon, label, sub, accent, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 300, friction: 14, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[styles.quickActionWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.quickAction, { borderColor: accent + '25' }]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: accent + '14' }]}>{icon}</View>
        <Text style={styles.quickActionLabel}>{label}</Text>
        <Text style={styles.quickActionSub}>{sub}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 135,
    gap: 12,
  },
  refreshBtn: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Quick Strip ──
  quickStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionWrap: {
    flex: 1,
  },
  quickAction: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 5,
    ...SHADOWS.sm,
  },
  quickActionIcon: {
    width: 34,
    height: 34,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  quickActionSub: {
    fontSize: 9.5,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },

  // ── Risk Card ──
  riskCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['3xl'],
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  riskCardTopEdge: {
    height: 1.5,
    marginHorizontal: 16,
    marginTop: 1,
    borderRadius: 1,
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  riskCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  riskIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskCardTitles: {
    flex: 1,
  },
  riskLevelLabel: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.textTertiary,
    flex: 1,
  },

  // ── Stats strip ──
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(12,20,34,0.4)',
  },
  statsTile: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 2,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },

  // ── Rain Banner ──
  rainBanner: {
    borderColor: COLORS.safeBorder,
    backgroundColor: COLORS.card,
  },
  rainBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rainBannerIconWrap: {
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  rainBannerText: {
    flex: 1,
  },
  rainBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rainBannerSummary: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },

  // ── Weather Card ──
  weatherCard: {
    backgroundColor: COLORS.card,
  },
  weatherCardInner: {
    padding: 18,
  },
  weatherTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
    lineHeight: 54,
    letterSpacing: -2,
  },
  weatherTempUnit: {
    fontSize: 22,
    fontWeight: '700',
  },
  weatherCondition: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  weatherMetrics: {
    alignItems: 'flex-end',
    gap: 5,
  },
  weatherMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weatherMetricText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  weatherDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  weatherBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherBottomItem: {
    alignItems: 'center',
  },
  weatherBottomLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.7,
  },
  weatherBottomVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: FONTS.mono,
    marginTop: 4,
  },

  // ── Radar Card ──
  radarCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['3xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  radarCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radarCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  radarCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  radarCardChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  radarOpenText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.safe,
  },
  radarScope: {
    height: 160,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCenterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.safe,
    shadowColor: COLORS.safe,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  radarStrikeLabel: {
    position: 'absolute',
    bottom: 16,
    alignItems: 'center',
  },
  radarStrikeCount: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    color: COLORS.safe,
    lineHeight: 22,
  },
  radarStrikeText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },

  // ── Safe Zone ──
  safeZoneCard: {
    backgroundColor: COLORS.card,
  },
  safeZoneInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  safeZoneIconWrap: {
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.lg,
    padding: 9,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  safeZoneText: {
    flex: 1,
  },
  safeZoneTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  safeZoneSub: {
    fontSize: 10,
    color: COLORS.textTertiary,
    lineHeight: 14,
    marginTop: 3,
  },
});
