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
  Target,
} from '../components/Icons';
import { useWarnly } from '../lib/warnly/store';
import { levelMeta, SAFETY_RADIUS_KM } from '../lib/warnly/risk';
import { weatherCodeInfo } from '../lib/warnly/weather';
import { StatusHeaderPill, ThreatCards } from '../components/warnly/ThreatCards';
import { RiskMeter } from '../components/warnly/RiskMeter';
import { LocationSearch } from '../components/warnly/LocationSearch';
import { DopplerVectorCard } from '../components/warnly/DopplerVectorCard';
import { TacticalTimelineCard } from '../components/warnly/TacticalTimelineCard';
import { FlashToBangModal } from '../components/warnly/FlashToBangModal';
import { TopographicEscapeCard } from '../components/warnly/TopographicEscapeCard';
import { WhisperMeshCard } from '../components/warnly/WhisperMeshCard';
import { SurvivorBeaconCard } from '../components/warnly/SurvivorBeaconCard';
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
    doppler,
    barometer,
    connectionState,
  } = useWarnly();

  const [campsOpen, setCampsOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [rangerOpen, setRangerOpen] = useState(false);

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
      {/* ── Screen Top Bar (Aviation & Weather Console Header) ── */}
      <FadeIn duration={250}>
        <View style={styles.topHeader}>
          <View style={styles.topHeaderLeft}>
            <View style={styles.systemStatusRow}>
              <View
                style={[
                  styles.livePulseDot,
                  {
                    backgroundColor:
                      level === 'danger'
                        ? COLORS.danger
                        : level === 'advisory'
                        ? COLORS.warning
                        : '#10B981',
                  },
                ]}
              />
              <Text style={styles.systemStatusText}>
                {level === 'danger'
                  ? 'ACTIVE SEVERE WEATHER WATCH'
                  : level === 'advisory'
                  ? 'ELEVATED CONVECTIVE SURGE'
                  : 'SYSTEM OPERATIONAL'}
              </Text>
            </View>
            <Text style={styles.appTitle}>Warnly Radar</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={handleRefresh}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <RefreshCw size={15} color="#94A3B8" />
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>
      </FadeIn>

      {/* ── Location Search (Integrated & Compact) ── */}
      <LocationSearch
        onSelectCoords={setCustomCoords}
        onUseGPS={requestLocation}
        locating={locating}
      />

      {/* ── Primary Atmospheric Risk Console ── */}
      <FadeIn duration={350} delay={60}>
        <View style={styles.riskCard}>
          {/* Subtle semantic top accent line */}
          <View
            style={[
              styles.riskCardTopEdge,
              {
                backgroundColor:
                  level === 'danger'
                    ? COLORS.danger
                    : level === 'advisory'
                    ? COLORS.warning
                    : '#10B981',
              },
            ]}
          />

          {/* Card Meta Bar */}
          <View style={styles.riskCardMeta}>
            <View style={styles.riskCardMetaLeft}>
              <Text style={styles.assessmentLabel}>CONVECTIVE THREAT ASSESSMENT</Text>
              {weather && (
                <View style={styles.locationRow}>
                  <MapPin size={11} color="#64748B" />
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

          {/* Precision Calibrated Gauge */}
          <RiskMeter probability={probability} level={level} caption={meta.sub} />

          {/* Integrated Telemetry HUD Strip */}
          <View style={styles.statsStrip}>
            <MetricTile
              label="CAPE INSTABILITY"
              value={weather ? String(Math.round(weather.cape)) : '—'}
              unit="J/kg"
              accent={weather && weather.cape > 1500 ? COLORS.warning : '#FFFFFF'}
              style={styles.statsTile}
            />
            <View style={styles.statsDivider} />
            <MetricTile
              label="LIFTED INDEX"
              value={weather ? weather.liftedIndex.toFixed(1) : '—'}
              unit="K"
              accent={weather && weather.liftedIndex < -3 ? COLORS.warning : '#FFFFFF'}
              style={styles.statsTile}
            />
            <View style={styles.statsDivider} />
            <MetricTile
              label="LIGHTNING ACTIVITY"
              value={nearest ? `${nearest.distanceKm} km` : '0 Strikes'}
              unit=""
              accent={nearest ? COLORS.danger : '#FFFFFF'}
              style={styles.statsTile}
            />
          </View>
        </View>
      </FadeIn>

      {/* ── Pre-Impact Tactical Action Timeline (Synced with Doppler ETA) ── */}
      <FadeIn duration={350} delay={75}>
        <TacticalTimelineCard etaMinutes={doppler?.cells[0]?.etaMinutes ?? null} />
      </FadeIn>

      {/* ── Tactical Action Strip ── */}
      <FadeIn duration={350} delay={90}>
        <View style={styles.tacticalActionStrip}>
          <TouchableOpacity
            style={styles.tacticalActionItem}
            onPress={() => setCampsOpen(true)}
            activeOpacity={0.75}
          >
            <View style={styles.tacticalActionIconWrap}>
              <ShieldCheck size={16} color="#10B981" />
            </View>
            <View style={styles.tacticalActionTextWrap}>
              <Text style={styles.tacticalActionTitle}>Safe Camps</Text>
              <Text style={styles.tacticalActionSub}>3 Stations</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.tacticalActionDivider} />

          <TouchableOpacity
            style={styles.tacticalActionItem}
            onPress={() => setRangerOpen(true)}
            activeOpacity={0.75}
          >
            <View style={[styles.tacticalActionIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <Target size={16} color={COLORS.warning} />
            </View>
            <View style={styles.tacticalActionTextWrap}>
              <Text style={[styles.tacticalActionTitle, { color: COLORS.warning }]}>Range Strike</Text>
              <Text style={styles.tacticalActionSub}>Sound Speed</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.tacticalActionDivider} />

          <TouchableOpacity
            style={styles.tacticalActionItem}
            onPress={() => setBroadcastOpen(true)}
            activeOpacity={0.75}
          >
            <View style={[styles.tacticalActionIconWrap, styles.tacticalActionIconSos]}>
              <Share2 size={16} color={COLORS.danger} />
            </View>
            <View style={styles.tacticalActionTextWrap}>
              <Text style={[styles.tacticalActionTitle, { color: COLORS.danger }]}>Mesh SOS</Text>
              <Text style={styles.tacticalActionSub}>P2P Beacon</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.tacticalActionDivider} />

          <TouchableOpacity
            style={styles.tacticalActionItem}
            onPress={() => setGuideOpen(true)}
            activeOpacity={0.75}
          >
            <View style={styles.tacticalActionIconWrap}>
              <BookOpen size={16} color="#38BDF8" />
            </View>
            <View style={styles.tacticalActionTextWrap}>
              <Text style={styles.tacticalActionTitle}>Evac Guide</Text>
              <Text style={styles.tacticalActionSub}>Protocols</Text>
            </View>
          </TouchableOpacity>
        </View>
      </FadeIn>

      {/* ── Live Doppler Convective Vectors & Barometric Tendency ── */}
      <FadeIn duration={400} delay={120}>
        <DopplerVectorCard
          doppler={doppler}
          barometer={barometer}
          onOpenRadar={() => onNavigateRadar && onNavigateRadar()}
        />
      </FadeIn>

      {/* ── Topographic Flash-Flood Escape Corridors ── */}
      <FadeIn duration={400} delay={130}>
        <TopographicEscapeCard
          latitude={coords?.lat ?? 30.3165}
          longitude={coords?.lon ?? 78.0322}
          elevationMeters={1620}
          rainAccumulationMm={weather ? Math.round(weather.humidity * 0.5) : 35}
          pressureDeltaHpa={barometer?.delta1hHpa ?? -1.4}
        />
      </FadeIn>

      {/* ── Zero-Infrastructure WhisperMesh Network ── */}
      <FadeIn duration={400} delay={140}>
        <WhisperMeshCard />
      </FadeIn>

      {/* ── Disaster Blackbox & Survivor Beacon ── */}
      <FadeIn duration={400} delay={150}>
        <SurvivorBeaconCard batteryPercent={78} />
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
      <FlashToBangModal
        visible={rangerOpen}
        onClose={() => setRangerOpen(false)}
        ambientTemperatureCelsius={weather ? Math.round(weather.temperature) : 22}
      />
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

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#070A0F', // Pure Obsidian Dark
  },
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 135,
    gap: 12,
  },
  // ── Console Top Bar ──
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  topHeaderLeft: {
    gap: 3,
  },
  systemStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  systemStatusText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 1.2,
    color: COLORS.textTertiary,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  refreshBtn: {
    backgroundColor: '#111824',
    borderRadius: RADII.full,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Risk Card ──
  riskCard: {
    backgroundColor: '#0C131F',
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 2,
  },
  riskCardTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  riskCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  riskCardMetaLeft: {
    gap: 3,
  },
  assessmentLabel: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 1.2,
    color: '#64748B',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // ── Tactical Action Strip ──
  tacticalActionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C131F',
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tacticalActionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  tacticalActionDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  tacticalActionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tacticalActionIconSos: {
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  tacticalActionTextWrap: {
    gap: 1,
  },
  tacticalActionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  tacticalActionSub: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },

  // ── Stats strip ──
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: -16,
    paddingHorizontal: 12,
  },
  statsTile: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.07)',
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
