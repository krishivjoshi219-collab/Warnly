import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import {
  Zap,
  ShieldCheck,
  ShieldAlert,
  Mountain,
  Waves,
  Activity,
  Radar,
  Navigation,
  MapPin,
  Phone,
} from '../components/Icons';
import { useWarnly } from '../lib/warnly/store';
import { strikeAgeColor, SAFETY_RADIUS_KM } from '../lib/warnly/risk';
import { useEarthquakes, useFloodRisk } from '../lib/warnly/hazards';
import { fetchNearbySafetyCamps, type SafetyCamp } from '../lib/warnly/shelters';
import { CRITICAL_GLACIAL_LAKES } from '../lib/warnly/glof';
import { LocationSearch } from '../components/warnly/LocationSearch';
import { LiveOpenStreetMap } from '../components/warnly/LiveOpenStreetMap';
import { LocationPermissionModal } from '../components/warnly/LocationPermissionModal';
import { FadeIn, GlassCard, ScreenHeader, SectionHeader } from '../components/ui';
import { COLORS, RADII, FONTS, SHADOWS, SAFE_TOP_PADDING } from '../theme';

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
    requestHardwareLocation,
    showLocationPrompt,
    setShowLocationPrompt,
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
  const mapWidth = Dimensions.get('window').width - 32;

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

      {/* ── Real Live Multi-Hazard Radar Map (Hero) ── */}
      {coords ? (
        <FadeIn duration={450} delay={80}>
          <LiveOpenStreetMap
            coords={coords}
            width={mapWidth}
            height={390}
            strikes={showLightning ? strikes : []}
            camps={showShelters ? camps : []}
            doppler={showDoppler ? doppler : null}
            onRecenter={requestLocation}
            onSelectLocation={setCustomCoords}
          />
        </FadeIn>
      ) : (
        <FadeIn duration={300}>
          <View style={styles.noLocationCard}>
            <MapPin size={24} color={COLORS.safe} />
            <Text style={styles.noLocationTitle}>No Location Selected</Text>
            <Text style={styles.noLocationSub}>
              Search any city or location above, or tap GPS to activate live radar.
            </Text>
          </View>
        </FadeIn>
      )}

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

      {/* ── Nearest Safe Shelters & Evacuation Camps ── */}
      {showShelters && camps.length > 0 && (
        <FadeIn duration={400} delay={140}>
          <View style={styles.sheltersCard}>
            <View style={styles.sheltersHeader}>
              <View style={styles.shelterHeaderBadge}>
                <ShieldCheck size={14} color="#10B981" />
              </View>
              <View>
                <Text style={styles.sheltersTitle}>NEAREST SAFE CAMPS & DISASTER SHELTERS</Text>
                <Text style={styles.sheltersSubtitle}>
                  {camps.length} verified safe refuges near your location
                </Text>
              </View>
            </View>

            <View style={styles.shelterList}>
              {camps.slice(0, 5).map((camp) => (
                <View key={camp.id} style={styles.shelterItem}>
                  <View style={styles.shelterItemTop}>
                    <View style={styles.shelterBadgeWrap}>
                      <Text style={styles.shelterCategoryBadge}>
                        {camp.category === 'hospital'
                          ? 'TRAUMA HOSPITAL'
                          : camp.category === 'high_ground'
                          ? 'HIGH GROUND'
                          : camp.category === 'assembly_field'
                          ? 'OPEN ASSEMBLY'
                          : 'CIVIL BUNKER'}
                      </Text>
                      {camp.elevationGainM > 0 && (
                        <Text style={styles.shelterElevationBadge}>
                          +{camp.elevationGainM}m elevation
                        </Text>
                      )}
                    </View>
                    <Text style={styles.shelterDistValue}>
                      {camp.distanceKm.toFixed(1)} km
                    </Text>
                  </View>

                  <Text style={styles.shelterName}>{camp.name}</Text>
                  <Text style={styles.shelterAddress} numberOfLines={1}>
                    {camp.address}
                  </Text>

                  <View style={styles.shelterFooter}>
                    <Text style={styles.shelterEta}>
                      ~{camp.walkingTimeMin}m walk · ~{camp.drivingTimeMin}m drive
                    </Text>

                    <View style={styles.shelterActionRow}>
                      {camp.emergencyPhone && (
                        <TouchableOpacity
                          style={styles.callBtn}
                          onPress={() => Linking.openURL(`tel:${camp.emergencyPhone!.replace(/[^0-9+]/g, '')}`)}
                          activeOpacity={0.8}
                        >
                          <Phone size={11} color="#38BDF8" />
                          <Text style={styles.callBtnText}>Call</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.navBtn}
                        onPress={() => {
                          const url =
                            camp.navigationUrl ||
                            `https://www.google.com/maps/dir/?api=1&destination=${camp.lat},${camp.lon}`;
                          Linking.openURL(url);
                        }}
                        activeOpacity={0.8}
                      >
                        <Navigation size={11} color="#FFFFFF" />
                        <Text style={styles.navBtnText}>Navigate</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
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

      {/* ── Hardware Location Permission & Offline Disaster Modal ── */}
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: SAFE_TOP_PADDING,
    paddingBottom: 135,
    gap: 12,
  },

  noLocationCard: {
    backgroundColor: '#0C131F',
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  noLocationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  noLocationSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 17,
  },

  // ── Filter Chips ──
  chipsBar: {
    gap: 8,
    paddingVertical: 4,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
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

  // ── Doppler Advection ──
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

  // ── Nearest Safe Camps List ──
  sheltersCard: {
    backgroundColor: '#091512',
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    padding: 14,
    gap: 12,
  },
  sheltersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shelterHeaderBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheltersTitle: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 1.1,
    color: '#10B981',
  },
  sheltersSubtitle: {
    fontSize: 10,
    color: '#6EE7B7',
    marginTop: 1,
  },
  shelterList: {
    gap: 10,
  },
  shelterItem: {
    backgroundColor: '#0D201A',
    borderRadius: RADII.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.14)',
    gap: 6,
  },
  shelterItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shelterBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shelterCategoryBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: '#34D399',
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shelterElevationBadge: {
    fontSize: 8.5,
    fontWeight: '700',
    fontFamily: FONTS.mono,
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shelterDistValue: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: '#FFFFFF',
  },
  shelterName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shelterAddress: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  shelterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
    marginTop: 2,
  },
  shelterEta: {
    fontSize: 10,
    color: '#6EE7B7',
    fontWeight: '600',
  },
  shelterActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: RADII.md,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  callBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#38BDF8',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    borderRadius: RADII.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  navBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
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
});
