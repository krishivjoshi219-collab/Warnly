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
  Platform,
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
  Target,
  ChevronRight,
} from '../components/Icons';
import { useWarnly } from '../lib/warnly/store';
import { levelMeta, SAFETY_RADIUS_KM } from '../lib/warnly/risk';
import { weatherCodeInfo } from '../lib/warnly/weather';
import { LocationSearch } from '../components/warnly/LocationSearch';
import { SafetyCampsModal } from '../components/warnly/SafetyCampsModal';
import { MassBroadcastModal } from '../components/warnly/MassBroadcastModal';
import { GuideModal } from '../components/warnly/GuideModal';
import { FlashToBangModal } from '../components/warnly/FlashToBangModal';
import { LocationPermissionModal } from '../components/warnly/LocationPermissionModal';
import {
  FadeIn,
  Card,
  PulseDot,
  StatusBadge,
  MetricTile,
  Divider,
  TouchScale,
} from '../components/ui';
import { COLORS, RADII, FONTS, SHADOWS, SPACING, SAFE_TOP_PADDING } from '../theme';

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
    refresh,
    isLoading,
    setCustomCoords,
    requestLocation,
    requestHardwareLocation,
    showLocationPrompt,
    setShowLocationPrompt,
    locating,
    coords,
    simulateStorm,
    toggleSimulateStorm,
  } = useWarnly();

  const [campsOpen, setCampsOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [rangerOpen, setRangerOpen] = useState(false);

  const meta = levelMeta[level];
  const wx = weather ? weatherCodeInfo(weather.weatherCode, weather.isDay) : null;

  // Refresh spin animation
  const spinAnim = useRef(new Animated.Value(0)).current;
  const handleRefresh = () => {
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => spinAnim.setValue(0));
    refresh();
  };
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Status colors - restrained
  const statusColor =
    level === 'danger'   ? COLORS.danger  :
    level === 'advisory' ? COLORS.warning :
    COLORS.safe;

  const statusBorder =
    level === 'danger'   ? COLORS.dangerBorder  :
    level === 'advisory' ? COLORS.warningBorder :
    'rgba(255, 255, 255, 0.10)';

  const statusLabel =
    level === 'danger'   ? 'CRITICAL ALERT' :
    level === 'advisory' ? 'WEATHER ADVISORY' :
    'ALL CLEAR';

  const statusVariant =
    level === 'danger'   ? 'danger'  :
    level === 'advisory' ? 'warning' :
    'safe';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Top Bar with Status Bar Clearance ── */}
      <FadeIn duration={200}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.appTitleRow}>
              <Text style={styles.appName}>Warnly</Text>
              <View style={styles.liveTag}>
                <PulseDot color={statusColor} size={5} speed={level === 'safe' ? 3000 : 1200} />
                <Text style={[styles.liveTagText, { color: statusColor }]}>
                  {level === 'safe' ? 'LIVE' : 'ALERT'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => setShowLocationPrompt(true)}
              activeOpacity={0.7}
            >
              <MapPin size={11} color={COLORS.safe} />
              <Text style={styles.locationText} numberOfLines={1}>
                {weather?.place ?? (locating ? 'Acquiring satellite GPS…' : 'Tap to set location')}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={handleRefresh}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.75}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <RefreshCw size={15} color={COLORS.textSecondary} />
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>
      </FadeIn>

      {/* ── Location Search Bar ── */}
      <FadeIn duration={220} delay={20}>
        <LocationSearch
          onSelectCoords={setCustomCoords}
          onUseGPS={requestLocation}
          locating={locating}
        />
      </FadeIn>

      {/* ── DEMO STORM WOW SWITCH ── */}
      <TouchableOpacity
        style={[
          styles.radarCard,
          simulateStorm && { borderColor: COLORS.danger, backgroundColor: COLORS.dangerBg },
        ]}
        onPress={toggleSimulateStorm}
        activeOpacity={0.85}
      >
        <View style={styles.radarCardLeft}>
          <View style={styles.radarCardHeaderRow}>
            <PulseDot color={simulateStorm ? COLORS.danger : COLORS.warning} size={6} speed={900} />
            <Text style={styles.radarCardTitle}>
              {simulateStorm ? 'DEMO SUPERCELL LIVE — TAP TO CLEAR' : 'DEMO: TRIGGER SUPERCELL'}
            </Text>
          </View>
          <Text style={styles.radarCardSubtitle}>
            {simulateStorm
              ? '5 strikes · Doppler intercept ETA 18m · Siren + strobe armed'
              : 'One tap: 5 strikes, Doppler ETA, siren + escape vector for judges'}
          </Text>
        </View>
        <Text style={{ fontSize: 22 }}>{simulateStorm ? '🛑' : '⛈️'}</Text>
      </TouchableOpacity>

      {/* ── PRIMARY STATUS HERO CARD ── */}
      <FadeIn duration={260} delay={40}>
        <View style={[
          styles.heroCard,
          { borderColor: statusBorder },
          level !== 'safe' && (level === 'danger' ? SHADOWS.glowDanger : SHADOWS.glowWarning),
        ]}>
          {/* Top colored accent line */}
          <View style={[styles.heroStripe, { backgroundColor: statusColor }]} />

          <View style={styles.heroInner}>
            {/* Header: Status Badge + Live Timestamp */}
            <View style={styles.heroHeader}>
              <StatusBadge
                label={statusLabel}
                variant={statusVariant}
                dot
                pulsing={level !== 'safe'}
              />
              {weather && (
                <Text style={styles.heroTime}>
                  Updated {new Date(weather.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>

            {/* Core Assessment Row */}
            <View style={styles.heroBody}>
              <View style={styles.heroPercentCol}>
                <Text style={[styles.heroPercent, { color: statusColor }]}>
                  {probability}
                  <Text style={styles.heroPercentSym}>%</Text>
                </Text>
                <Text style={styles.heroPercentLabel}>Threat Index</Text>
              </View>

              <View style={styles.heroTextCol}>
                <Text style={styles.heroTitle} numberOfLines={1}>{meta.label}</Text>
                <Text style={styles.heroSubtitle} numberOfLines={2}>{meta.sub}</Text>
              </View>
            </View>

            {/* Level Bar Indicator */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(4, Math.min(100, probability))}%` as any,
                    backgroundColor: statusColor,
                  },
                ]}
              />
            </View>

            {/* 3 Vital Micro-Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>CAPE</Text>
                <Text style={[
                  styles.metricValue,
                  weather && weather.cape > 1500 ? { color: COLORS.warning } : null
                ]}>
                  {weather ? String(Math.round(weather.cape)) : '—'}
                  <Text style={styles.metricUnit}> J/kg</Text>
                </Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>LIFT INDEX</Text>
                <Text style={[
                  styles.metricValue,
                  weather && weather.liftedIndex < -3 ? { color: COLORS.warning } : null
                ]}>
                  {weather ? weather.liftedIndex.toFixed(1) : '—'}
                  <Text style={styles.metricUnit}> K</Text>
                </Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>LIGHTNING</Text>
                <Text style={[
                  styles.metricValue,
                  nearest ? { color: COLORS.danger } : null
                ]}>
                  {nearest ? `${nearest.distanceKm} km` : '0 Strikes'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </FadeIn>

      {/* ── TACTICAL ACTION STRIP ── */}
      <FadeIn duration={240} delay={60}>
        <View style={styles.quickActions}>
          {[
            {
              icon: <ShieldCheck size={16} color="#FFFFFF" />,
              label: 'Safe Camps',
              sub: 'Shelters',
              onPress: () => setCampsOpen(true),
            },
            {
              icon: <Target size={16} color={COLORS.warning} />,
              label: 'Range Strike',
              sub: 'Sound Speed',
              onPress: () => setRangerOpen(true),
            },
            {
              icon: <Share2 size={16} color={COLORS.danger} />,
              label: 'SOS Mesh',
              sub: 'Offline P2P',
              onPress: () => setBroadcastOpen(true),
            },
            {
              icon: <BookOpen size={16} color={COLORS.textSecondary} />,
              label: 'Evac Guide',
              sub: 'Protocols',
              onPress: () => setGuideOpen(true),
            },
          ].map((action) => (
            <TouchScale
              key={action.label}
              style={styles.quickActionCard}
              onPress={action.onPress}
            >
              <View style={styles.quickActionIconWrap}>{action.icon}</View>
              <Text style={styles.quickActionTitle}>{action.label}</Text>
              <Text style={styles.quickActionSub}>{action.sub}</Text>
            </TouchScale>
          ))}
        </View>
      </FadeIn>

      {/* ── WEATHER OVERVIEW CARD ── */}
      {weather && (
        <FadeIn duration={260} delay={80}>
          <Card style={styles.weatherCard}>
            <View style={styles.weatherCardHeader}>
              <View style={styles.weatherTempRow}>
                <Text style={styles.weatherTemp}>
                  {Math.round(weather.temperature)}°
                </Text>
                <View style={styles.weatherSummaryCol}>
                  <Text style={styles.weatherCondition}>{wx?.label}</Text>
                  <Text style={styles.weatherFeelsLike}>
                    Feels like {Math.round(weather.apparent)}°C
                  </Text>
                </View>
              </View>

              <View style={styles.weatherTelemetryCol}>
                <View style={styles.telemetryItem}>
                  <Wind size={12} color={COLORS.textSecondary} />
                  <Text style={styles.telemetryText}>{Math.round(weather.windSpeed)} km/h</Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Droplets size={12} color={COLORS.textSecondary} />
                  <Text style={styles.telemetryText}>{weather.humidity}%</Text>
                </View>
              </View>
            </View>

            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.weatherGrid}>
              {[
                { label: 'DEW POINT', value: `${Math.round(weather.dewPoint)}°C` },
                { label: 'CLOUD COVER', value: `${weather.cloudCover}%` },
                { label: 'UV INDEX', value: `${weather.uvIndex} / 11` },
                { label: 'PRESSURE', value: `${Math.round(weather.pressure)} hPa` },
              ].map((item) => (
                <View key={item.label} style={styles.weatherGridItem}>
                  <Text style={styles.weatherGridLabel}>{item.label}</Text>
                  <Text style={styles.weatherGridValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </Card>
        </FadeIn>
      )}

      {/* ── LIVE RADAR PREVIEW BANNER ── */}
      <FadeIn duration={260} delay={100}>
        <TouchableOpacity
          style={styles.radarCard}
          onPress={onNavigateRadar}
          activeOpacity={0.88}
        >
          <View style={styles.radarCardLeft}>
            <View style={styles.radarCardHeaderRow}>
              <PulseDot color={COLORS.safe} size={6} speed={2200} />
              <Text style={styles.radarCardTitle}>Multi-Hazard Radar Scope</Text>
            </View>
            <Text style={styles.radarCardSubtitle}>
              {strikes.length > 0
                ? `${strikes.length} strikes detected inside ${SAFETY_RADIUS_KM} km perimeter`
                : `All quiet · Monitoring ${SAFETY_RADIUS_KM} km safety zone`}
            </Text>
            <View style={styles.radarCardActionRow}>
              <Text style={styles.radarCardActionText}>Open Live Scope</Text>
              <ChevronRight size={13} color="#FFFFFF" />
            </View>
          </View>

          {/* Mini Radar Visualizer */}
          <View style={styles.radarVisualWrap}>
            {[0.95, 0.65, 0.35].map((r, i) => (
              <AnimatedRing key={i} size={r} delay={i * 250} danger={nearest != null && i === 0} />
            ))}
            <View style={styles.radarCenterDot} />
          </View>
        </TouchableOpacity>
      </FadeIn>

      {/* ── BOTTOM NOTCH PADDING ── */}
      <View style={{ height: 20 }} />

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
        onOpenCamps={() => { setBroadcastOpen(false); setCampsOpen(true); }}
      />
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <FlashToBangModal
        visible={rangerOpen}
        onClose={() => setRangerOpen(false)}
        ambientTemperatureCelsius={weather ? Math.round(weather.temperature) : 22}
      />
      <LocationPermissionModal
        visible={showLocationPrompt}
        onClose={() => setShowLocationPrompt(false)}
        onSelectCoords={setCustomCoords}
        onRequestHardwareGPS={requestHardwareLocation}
        locating={locating}
      />
    </ScrollView>
  );
};

// ─── RADAR RING COMPONENT ─────────────────────────────────────────────────────
const AnimatedRing: React.FC<{ size: number; delay: number; danger?: boolean }> = ({ size, delay, danger }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.10, duration: 1800, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.40, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const ringSize = 92 * size;
  return (
    <Animated.View style={{
      position: 'absolute',
      width: ringSize,
      height: ringSize,
      borderRadius: ringSize / 2,
      borderWidth: 1,
      borderColor: danger ? COLORS.danger : 'rgba(255, 255, 255, 0.25)',
      opacity,
    }} />
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: SAFE_TOP_PADDING,
    paddingBottom: 110,
    gap: 12,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  topBarLeft: {
    gap: 3,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.6,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroStripe: {
    height: 3,
    width: '100%',
  },
  heroInner: {
    padding: 18,
    gap: 14,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTime: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontFamily: FONTS.mono,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroPercentCol: {
    alignItems: 'flex-start',
  },
  heroPercent: {
    fontSize: 54,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    letterSpacing: -2,
    lineHeight: 58,
  },
  heroPercentSym: {
    fontSize: 22,
    fontWeight: '700',
  },
  heroPercentLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  heroTextCol: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  heroSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
  },
  metricCol: {
    flex: 1,
    gap: 2,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.textTertiary,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textTertiary,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },

  // ── Quick Actions ──
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  quickActionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  quickActionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  quickActionSub: {
    fontSize: 8,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },

  // ── Weather Card ──
  weatherCard: {
    padding: 16,
  },
  weatherCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherTempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherTemp: {
    fontSize: 44,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
    letterSpacing: -2,
    lineHeight: 48,
  },
  weatherSummaryCol: {
    gap: 3,
  },
  weatherCondition: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  weatherFeelsLike: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  weatherTelemetryCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  telemetryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: FONTS.mono,
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherGridItem: {
    alignItems: 'center',
    gap: 3,
  },
  weatherGridLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.textTertiary,
  },
  weatherGridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.mono,
  },

  // ── Radar Card ──
  radarCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radarCardLeft: {
    flex: 1,
    gap: 6,
  },
  radarCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  radarCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  radarCardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  radarCardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  radarCardActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  radarVisualWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
