import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import {
  Zap,
  ShieldCheck,
  ShieldAlert,
  Mountain,
  Waves,
  Activity,
  MapPin,
  CheckCircle2,
  Radar,
  Navigation,
} from '../components/Icons';
import { useWarnly } from '../lib/warnly/store';
import { strikeAgeColor, SAFETY_RADIUS_KM } from '../lib/warnly/risk';
import { useEarthquakes, useFloodRisk, type Quake } from '../lib/warnly/hazards';
import { fetchNearbySafetyCamps, type SafetyCamp } from '../lib/warnly/shelters';
import { CRITICAL_GLACIAL_LAKES } from '../lib/warnly/glof';
import { LocationSearch } from '../components/warnly/LocationSearch';
import { FadeIn, GlassCard, PulseDot, ScreenHeader, SectionHeader, StatusBadge } from '../components/ui';
import { COLORS, RADII, FONTS, SHADOWS, SPACING } from '../theme';

const STRIKE_LEGEND = [
  { label: '0–5m Active', age: 3 },
  { label: '5–15m Recent', age: 10 },
  { label: '15–30m Aging', age: 25 },
];

const QUAKE_LEGEND = [
  { label: '< M4.5', color: '#EAB308' },
  { label: 'M4.5–5.9', color: '#F59E0B' },
  { label: 'M6.0+ Strong', color: '#EF4444' },
];

export const RadarScreen: React.FC = () => {
  const {
    strikes,
    level,
    weather,
    coords,
    setCustomCoords,
    requestLocation,
    locating,
    doppler,
  } = useWarnly();

  const [showDoppler, setShowDoppler] = useState(true);
  const [showLightning, setShowLightning] = useState(true);
  const [showFlood, setShowFlood] = useState(true);
  const [showQuakes, setShowQuakes] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showGlof, setShowGlof] = useState(true);
  const [showShockwave, setShowShockwave] = useState(true);
  const [showEscape, setShowEscape] = useState(true);
  const [camps, setCamps] = useState<SafetyCamp[]>([]);

  const quakesQ = useEarthquakes(coords);
  const floodQ = useFloodRisk(coords);
  const quakes = quakesQ.data ?? [];
  const flood = floodQ.data ?? null;

  useEffect(() => {
    if (!coords) return;
    fetchNearbySafetyCamps(coords).then((res) => setCamps(res));
  }, [coords?.lat, coords?.lon]);

  const breaches = strikes.filter((s) => s.distanceKm <= SAFETY_RADIUS_KM);
  const scopeSize = Math.min(340, Dimensions.get('window').width - 32);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <FadeIn duration={300}>
        <ScreenHeader
          title="Multi-Hazard Radar"
          subtitle="Strikes, doppler, GLOF basins & safety camps"
          badge="RADAR"
          badgeVariant="safe"
        />
      </FadeIn>

      <LocationSearch
        onSelectCoords={setCustomCoords}
        onUseGPS={requestLocation}
        locating={locating}
      />

      {/* ── Layer Filter Chips ── */}
      <FadeIn duration={350} delay={60}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsBar}
        >
          {[
            { id: 'doppler', label: `Doppler (${doppler?.cellCount ?? 0})`, icon: Radar, active: showDoppler, color: '#38BDF8', onToggle: () => setShowDoppler((v) => !v) },
            { id: 'lightning', label: `Strikes (${strikes.length})`, icon: Zap, active: showLightning, color: COLORS.warning, onToggle: () => setShowLightning((v) => !v) },
            { id: 'shockwave', label: 'Sonic Boom Wave', icon: Zap, active: showShockwave, color: '#F59E0B', onToggle: () => setShowShockwave((v) => !v) },
            { id: 'escape', label: 'Escape Ridge (+95m)', icon: Navigation, active: showEscape, color: '#10B981', onToggle: () => setShowEscape((v) => !v) },
            { id: 'shelters', label: `Safe Camps (${camps.length})`, icon: ShieldCheck, active: showShelters, color: '#10B981', onToggle: () => setShowShelters((v) => !v) },
            { id: 'glof', label: `GLOF Basins (${CRITICAL_GLACIAL_LAKES.length})`, icon: Mountain, active: showGlof, color: '#38BDF8', onToggle: () => setShowGlof((v) => !v) },
            { id: 'flood', label: `Hydrology`, icon: Waves, active: showFlood, color: '#38BDF8', onToggle: () => setShowFlood((v) => !v) },
            { id: 'quakes', label: `Seismic (${quakes.length})`, icon: Activity, active: showQuakes, color: COLORS.danger, onToggle: () => setShowQuakes((v) => !v) },
          ].map((chip) => {
            const Icon = chip.icon;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[
                  styles.chip,
                  chip.active && { backgroundColor: chip.color + '18', borderColor: chip.color + '60' },
                ]}
                onPress={chip.onToggle}
                activeOpacity={0.8}
              >
                <Icon size={12} color={chip.active ? chip.color : COLORS.textMuted} />
                <Text
                  style={[
                    styles.chipText,
                    { color: chip.active ? chip.color : COLORS.textSecondary },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </FadeIn>

      {/* ── Radar Scope ── */}
      <FadeIn duration={450} delay={100}>
        <View style={[styles.scopeOuter, { width: scopeSize, height: scopeSize }]}>
          {/* Animated sweep line */}
          <SweepLine scopeSize={scopeSize} />

          {/* Range rings */}
          {[0.94, 0.68, 0.44].map((r, i) => {
            const size = scopeSize * r;
            const isCritical = i === 2;
            return (
              <View
                key={i}
                style={[
                  styles.rangeRing,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor:
                      isCritical && breaches.length > 0
                        ? COLORS.danger + '90'
                        : i === 1
                        ? COLORS.safe + '20'
                        : COLORS.safe + '30',
                    borderStyle: i === 1 ? 'dashed' : 'solid',
                    borderWidth: isCritical ? 1.5 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rangeLabel,
                    { color: isCritical ? COLORS.danger + '90' : COLORS.textMuted },
                  ]}
                >
                  {i === 0 ? '25 km' : i === 1 ? '15 km' : '10 km'}
                </Text>
              </View>
            );
          })}

          {/* Crosshairs */}
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />

          {/* Center You pin */}
          <View style={styles.centerPin}>
            <PulseDot color={COLORS.safe} size={10} speed={2000} />
            <Text style={styles.centerPinLabel}>YOU</Text>
          </View>

          {/* Strike markers */}
          {showLightning &&
            strikes.map((s) => {
              const rad = ((s.bearingDeg - 90) * Math.PI) / 180;
              const distRatio = Math.min(1, s.distanceKm / 25);
              const radius = (scopeSize * 0.94 * 0.5) * distRatio;
              const x = radius * Math.cos(rad);
              const y = radius * Math.sin(rad);
              const dotColor = strikeAgeColor(s.ageMin);
              return (
                <View
                  key={s.id}
                  style={[
                    styles.strikeMarker,
                    {
                      transform: [{ translateX: x }, { translateY: y }],
                      backgroundColor: dotColor,
                      shadowColor: dotColor,
                    },
                  ]}
                >
                  <Zap size={9} color="#070A0F" />
                </View>
              );
            })}

          {/* Sonic Shockwave Wavefront Ring (expanding outward at 343 m/s) */}
          {showShockwave && strikes.length > 0 && (() => {
            const s = strikes[0];
            const rad = ((s.bearingDeg - 90) * Math.PI) / 180;
            const distRatio = Math.min(1, s.distanceKm / 25);
            const radius = (scopeSize * 0.94 * 0.5) * distRatio;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);
            return <SonicShockwaveRing key="shockwave" x={x} y={y} maxRadius={scopeSize * 0.42} />;
          })()}

          {/* Topographic High-Ground Escape Ridge Waypoint */}
          {showEscape && (() => {
            const escapeBearing = 42;
            const rad = ((escapeBearing - 90) * Math.PI) / 180;
            const radius = (scopeSize * 0.94 * 0.5) * 0.48;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);
            return (
              <View
                key="escape-ridge"
                style={[
                  styles.escapeMarker,
                  { transform: [{ translateX: x }, { translateY: y }] },
                ]}
              >
                <Mountain size={11} color="#10B981" />
                <Text style={styles.escapeMarkerLabel}>+95m RIDGE</Text>
              </View>
            );
          })()}

          {/* Camp markers */}
          {showShelters &&
            camps.slice(0, 5).map((c) => {
              const rad = ((c.bearingDeg - 90) * Math.PI) / 180;
              const distRatio = Math.min(1, c.distanceKm / 25);
              const radius = (scopeSize * 0.94 * 0.5) * distRatio;
              const x = radius * Math.cos(rad);
              const y = radius * Math.sin(rad);
              return (
                <View
                  key={c.id}
                  style={[
                    styles.campMarker,
                    { transform: [{ translateX: x }, { translateY: y }] },
                  ]}
                >
                  <ShieldCheck size={11} color="#FFFFFF" />
                </View>
              );
            })}

          {/* Doppler Storm Cell Blips */}
          {showDoppler &&
            doppler?.cells.map((cell) => {
              const rad = ((cell.bearingDeg - 90) * Math.PI) / 180;
              const distRatio = Math.min(1, cell.distanceKm / 25);
              const radius = (scopeSize * 0.94 * 0.5) * distRatio;
              const x = radius * Math.cos(rad);
              const y = radius * Math.sin(rad);
              const cellColor = cell.severity === 'EXTREME' ? COLORS.danger : '#F59E0B';
              return (
                <View
                  key={cell.id}
                  style={[
                    styles.dopplerMarker,
                    {
                      transform: [{ translateX: x }, { translateY: y }],
                      borderColor: cellColor,
                    },
                  ]}
                >
                  <View style={[styles.dopplerCore, { backgroundColor: cellColor }]} />
                  <Text style={[styles.dopplerMarkerLabel, { color: cellColor }]}>
                    {cell.id}
                  </Text>
                </View>
              );
            })}
        </View>
      </FadeIn>

      {/* ── Doppler Storm Cell Advection Tracker ── */}
      {showDoppler && doppler && doppler.cellCount > 0 && (
        <FadeIn duration={400} delay={130}>
          <View style={styles.dopplerTableCard}>
            <View style={styles.dopplerTableHeader}>
              <Radar size={13} color="#38BDF8" />
              <Text style={styles.dopplerTableTitle}>DOPPLER ADVECTION TRACKER</Text>
            </View>

            {doppler.cells.map((cell) => (
              <View key={cell.id} style={styles.cellRow}>
                <View style={styles.cellRowLeft}>
                  <View
                    style={[
                      styles.cellSeverityDot,
                      { backgroundColor: cell.severity === 'EXTREME' ? COLORS.danger : '#F59E0B' },
                    ]}
                  />
                  <View>
                    <Text style={styles.cellRowName}>{cell.name}</Text>
                    <Text style={styles.cellRowSub}>
                      {cell.reflectivityDbz} dBZ · {cell.distanceKm} km @ {cell.bearingDeg}°
                    </Text>
                  </View>
                </View>

                <View style={styles.cellRowRight}>
                  <Text style={[styles.cellRowEta, cell.willIntercept && { color: COLORS.danger }]}>
                    {cell.willIntercept ? `ETA ${cell.etaMinutes}m` : 'Clear'}
                  </Text>
                  <Text style={styles.cellRowVector}>
                    {cell.speedKmh} km/h @ {cell.headingDeg}°
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </FadeIn>
      )}

      {/* ── Legends ── */}
      <FadeIn duration={350} delay={150}>
        <GlassCard noPadding>
          <View style={styles.legendsInner}>
            {showLightning && (
              <View style={styles.legendSection}>
                <SectionHeader label="Lightning Decay" />
                <View style={styles.legendItems}>
                  {STRIKE_LEGEND.map((l) => (
                    <View key={l.label} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: strikeAgeColor(l.age) }]} />
                      <Text style={styles.legendText}>{l.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {showQuakes && (
              <View style={[styles.legendSection, showLightning && styles.legendBorderTop]}>
                <SectionHeader label="Seismic Magnitude (USGS M2.5+)" />
                <View style={styles.legendItems}>
                  {QUAKE_LEGEND.map((q) => (
                    <View key={q.label} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: q.color }]} />
                      <Text style={styles.legendText}>{q.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </GlassCard>
      </FadeIn>

      {/* ── Safety Zone Alert ── */}
      <FadeIn duration={350} delay={180}>
        <View
          style={[
            styles.safetyCard,
            breaches.length > 0
              ? { backgroundColor: COLORS.dangerBg, borderColor: COLORS.dangerBorder, ...SHADOWS.glowDanger }
              : { backgroundColor: COLORS.safeBg, borderColor: COLORS.safeBorder },
          ]}
        >
          {breaches.length > 0 ? (
            <ShieldAlert size={24} color={COLORS.danger} />
          ) : (
            <ShieldCheck size={24} color={COLORS.safe} />
          )}
          <View style={styles.safetyTexts}>
            <Text style={[styles.safetyTitle, { color: breaches.length > 0 ? COLORS.danger : COLORS.safe }]}>
              {breaches.length > 0
                ? `${breaches.length} strike(s) inside 10 km ring`
                : '10 km Safety Ring Clear'}
            </Text>
            <Text style={styles.safetySub}>
              {breaches.length > 0
                ? 'Immediate danger — seek enclosed shelter and avoid metal structures.'
                : 'No electrical storm strikes detected inside 10 km perimeter.'}
            </Text>
          </View>
        </View>
      </FadeIn>
    </ScrollView>
  );
};

// ─── SONIC SHOCKWAVE EXPANSION RING (343 m/s) ──────────────────────────────
const SonicShockwaveRing: React.FC<{
  x: number;
  y: number;
  maxRadius: number;
}> = ({ x, y, maxRadius }) => {
  const scale = useRef(new Animated.Value(0.08)).current;
  const opacity = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 2500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: maxRadius * 2,
        height: maxRadius * 2,
        borderRadius: maxRadius,
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        borderStyle: 'dashed',
        transform: [
          { translateX: x - maxRadius },
          { translateY: y - maxRadius },
          { scale },
        ],
        opacity,
      }}
    />
  );
};

// ─── ANIMATED RADAR SWEEP ─────────────────────────────────────────────────────
const SweepLine: React.FC<{ scopeSize: number }> = ({ scopeSize }) => {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sweep = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    sweep.start();
    return () => sweep.stop();
  }, []);

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.sweepContainer,
        {
          width: scopeSize,
          height: scopeSize,
          transform: [{ rotate: rotateDeg }],
        },
      ]}
    >
      {/* Sweep cone: a 90-degree wedge rendered with border trick */}
      <View style={styles.sweepLine} />
      <View
        style={[
          styles.sweepFade,
          { width: scopeSize / 2, height: scopeSize / 2 },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 135,
    gap: 12,
  },

  chipsBar: {
    gap: 8,
    paddingVertical: 4,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Scope ──
  scopeOuter: {
    alignSelf: 'center',
    backgroundColor: 'rgba(8,18,32,0.98)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  rangeRing: {
    position: 'absolute',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 6,
    paddingLeft: 8,
  },
  rangeLabel: {
    fontSize: 8,
    fontFamily: FONTS.mono,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  crosshairH: {
    position: 'absolute',
    width: '90%',
    height: 1,
    backgroundColor: 'rgba(0,229,255,0.06)',
  },
  crosshairV: {
    position: 'absolute',
    height: '90%',
    width: 1,
    backgroundColor: 'rgba(0,229,255,0.06)',
  },
  centerPin: {
    alignItems: 'center',
    gap: 3,
  },
  centerPinLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: COLORS.safe,
    letterSpacing: 1,
  },
  strikeMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  strikeMarkerText: { fontSize: 10 },
  campMarker: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0C1A14',
    borderWidth: 1.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campMarkerText: { fontSize: 10 },
  dopplerMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12,19,31,0.9)',
  },
  dopplerCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dopplerMarkerLabel: {
    position: 'absolute',
    bottom: -11,
    fontSize: 7.5,
    fontFamily: FONTS.mono,
    fontWeight: '800',
  },
  dopplerTableCard: {
    backgroundColor: '#0C131F',
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    gap: 10,
  },
  dopplerTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dopplerTableTitle: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 1.2,
    color: '#64748B',
  },
  cellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  cellRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cellSeverityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cellRowName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cellRowSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  cellRowRight: {
    alignItems: 'flex-end',
    gap: 1,
  },
  cellRowEta: {
    fontSize: 11.5,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: '#10B981',
  },
  cellRowVector: {
    fontSize: 9.5,
    color: '#64748B',
    fontFamily: FONTS.mono,
  },

  // ── Sweep ──
  sweepContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sweepLine: {
    position: 'absolute',
    width: '50%',
    height: 1,
    backgroundColor: COLORS.safe + '60',
    right: '50%',
    top: '50%',
    transformOrigin: 'right center',
  },
  sweepFade: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },

  // ── Legends ──
  legendsInner: {
    padding: 14,
    gap: 8,
  },
  legendSection: { gap: 6 },
  legendBorderTop: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // ── Safety Card ──
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  safetyTexts: { flex: 1 },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  safetySub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
  escapeMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  escapeMarkerLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: '#10B981',
    marginTop: 1,
  },
});
