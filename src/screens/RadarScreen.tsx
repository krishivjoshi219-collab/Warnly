import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  Zap,
  ShieldCheck,
  ShieldAlert,
  Mountain,
  Waves,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
} from "../components/Icons";
import { useWarnly } from "../lib/warnly/store";
import { strikeAgeColor, SAFETY_RADIUS_KM } from "../lib/warnly/risk";
import { useEarthquakes, useFloodRisk, quakeColor, type Quake } from "../lib/warnly/hazards";
import { fetchNearbySafetyCamps, type SafetyCamp } from "../lib/warnly/shelters";
import { CRITICAL_GLACIAL_LAKES, type GlacialLakeBasin } from "../lib/warnly/glof";
import { LocationSearch } from "../components/warnly/LocationSearch";
import { COLORS, RADII, FONTS } from "../theme";

const STRIKE_LEGEND = [
  { label: "0–5m Active", age: 3 },
  { label: "5–15m Recent", age: 10 },
  { label: "15–30m Aging", age: 25 },
];

const QUAKE_LEGEND = [
  { label: "< M4.5", color: "#eab308" },
  { label: "M4.5–5.9", color: "#f59e0b" },
  { label: "M6.0+ Strong", color: "#ef4444" },
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
  } = useWarnly();

  const [showLightning, setShowLightning] = useState(true);
  const [showFlood, setShowFlood] = useState(true);
  const [showQuakes, setShowQuakes] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showGlof, setShowGlof] = useState(true);
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
  const scopeSize = Math.min(360, Dimensions.get("window").width - 32);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Title Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Multi-Hazard Radar</Text>
          <Text style={styles.headerSubtitle}>
            Strikes, Doppler radar, GLOF basins & safety camps
          </Text>
        </View>
        <Text style={styles.brandBadge}>RADAR</Text>
      </View>

      {/* Location Search Bar */}
      <LocationSearch
        onSelectCoords={setCustomCoords}
        onUseGPS={requestLocation}
        locating={locating}
      />

      {/* Layer Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsBar}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            showLightning && {
              backgroundColor: "rgba(255, 176, 32, 0.15)",
              borderColor: COLORS.warning,
            },
          ]}
          onPress={() => setShowLightning((v) => !v)}
          activeOpacity={0.7}
        >
          <Zap size={13} color={showLightning ? COLORS.warning : COLORS.textMuted} />
          <Text
            style={[
              styles.chipText,
              showLightning && { color: COLORS.warning },
            ]}
          >
            Lightning ({strikes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            showShelters && {
              backgroundColor: COLORS.safeBg,
              borderColor: COLORS.safe,
            },
          ]}
          onPress={() => setShowShelters((v) => !v)}
          activeOpacity={0.7}
        >
          <ShieldCheck size={13} color={showShelters ? COLORS.safe : COLORS.textMuted} />
          <Text
            style={[
              styles.chipText,
              showShelters && { color: COLORS.safe },
            ]}
          >
            Safe Camps ({camps.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            showGlof && {
              backgroundColor: "rgba(0, 229, 255, 0.15)",
              borderColor: COLORS.safe,
            },
          ]}
          onPress={() => setShowGlof((v) => !v)}
          activeOpacity={0.7}
        >
          <Mountain size={13} color={showGlof ? COLORS.safe : COLORS.textMuted} />
          <Text
            style={[
              styles.chipText,
              showGlof && { color: COLORS.safe },
            ]}
          >
            GLOF Lakes ({CRITICAL_GLACIAL_LAKES.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            showFlood && {
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              borderColor: "#38BDF8",
            },
          ]}
          onPress={() => setShowFlood((v) => !v)}
          activeOpacity={0.7}
        >
          <Waves size={13} color={showFlood ? "#38BDF8" : COLORS.textMuted} />
          <Text
            style={[
              styles.chipText,
              showFlood && { color: "#38BDF8" },
            ]}
          >
            Floods {flood ? `· ${flood.label}` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            showQuakes && {
              backgroundColor: "rgba(255, 42, 77, 0.15)",
              borderColor: COLORS.danger,
            },
          ]}
          onPress={() => setShowQuakes((v) => !v)}
          activeOpacity={0.7}
        >
          <Activity size={13} color={showQuakes ? COLORS.danger : COLORS.textMuted} />
          <Text
            style={[
              styles.chipText,
              showQuakes && { color: COLORS.danger },
            ]}
          >
            Quakes ({quakes.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Geodesic Polar Radar Scope */}
      <View style={[styles.scopeContainer, { width: scopeSize, height: scopeSize }]}>
        {/* 25 km Outer Detection Ring */}
        <View style={[styles.rangeRing, { width: scopeSize * 0.94, height: scopeSize * 0.94, borderRadius: (scopeSize * 0.94) / 2 }]}>
          <Text style={styles.rangeLabel}>25 km</Text>
        </View>

        {/* 15 km Outer Safety Ring */}
        <View style={[styles.rangeRing, { width: scopeSize * 0.68, height: scopeSize * 0.68, borderRadius: (scopeSize * 0.68) / 2, borderStyle: "dashed" }]}>
          <Text style={styles.rangeLabel}>15 km</Text>
        </View>

        {/* 10 km Critical Safety Ring */}
        <View
          style={[
            styles.rangeRing,
            {
              width: scopeSize * 0.44,
              height: scopeSize * 0.44,
              borderRadius: (scopeSize * 0.44) / 2,
              borderColor: breaches.length > 0 ? COLORS.danger : "rgba(255, 42, 77, 0.4)",
              borderWidth: 1.5,
            },
          ]}
        >
          <Text style={[styles.rangeLabel, { color: COLORS.danger }]}>10 km</Text>
        </View>

        {/* Crosshair Axes */}
        <View style={styles.crosshairX} />
        <View style={styles.crosshairY} />

        {/* Center User Pin */}
        <View style={styles.centerMarker}>
          <View style={styles.centerDot} />
          <Text style={styles.centerText}>YOU</Text>
        </View>

        {/* Render Strikes */}
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
                <Text style={styles.strikeMarkerText}>?</Text>
              </View>
            );
          })}

        {/* Render Nearby Safe Camps */}
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
                  {
                    transform: [{ translateX: x }, { translateY: y }],
                  },
                ]}
              >
                <Text style={styles.campMarkerText}>?</Text>
              </View>
            );
          })}
      </View>

      {/* Dynamic Legends Card */}
      <View style={styles.legendsCard}>
        {showLightning && (
          <View style={styles.legendSection}>
            <View style={styles.legendHeaderRow}>
              <Zap size={12} color={COLORS.warning} />
              <Text style={styles.legendSectionTitle}>LIGHTNING STRIKE DECAY</Text>
            </View>
            <View style={styles.legendItemsRow}>
              {STRIKE_LEGEND.map((l) => (
                <View key={l.label} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: strikeAgeColor(l.age) },
                    ]}
                  />
                  <Text style={styles.legendItemText}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {showQuakes && (
          <View style={[styles.legendSection, showLightning && styles.legendBorderTop]}>
            <View style={styles.legendHeaderRow}>
              <Activity size={12} color={COLORS.danger} />
              <Text style={styles.legendSectionTitle}>SEISMIC MAGNITUDE (USGS M2.5+)</Text>
            </View>
            <View style={styles.legendItemsRow}>
              {QUAKE_LEGEND.map((q) => (
                <View key={q.label} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: q.color }]}
                  />
                  <Text style={styles.legendItemText}>{q.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Safety Zone Alert Summary Card */}
      <View style={styles.statusSummaryCard}>
        {breaches.length > 0 ? (
          <ShieldAlert size={22} color={COLORS.danger} />
        ) : (
          <ShieldCheck size={22} color={COLORS.safe} />
        )}
        <View style={styles.statusSummaryTexts}>
          <Text style={styles.statusSummaryTitle}>
            {breaches.length > 0
              ? `${breaches.length} strike(s) inside your 10 km safety ring`
              : "10 km Safety Ring Clear"}
          </Text>
          <Text style={styles.statusSummarySub}>
            {breaches.length > 0
              ? "Immediate danger: Move into enclosed shelter and avoid metal structures."
              : "No electrical storm strikes currently detected inside 10 km."}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  brandBadge: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.safe,
    letterSpacing: 2,
    backgroundColor: COLORS.safeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  chipsBar: {
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  scopeContainer: {
    alignSelf: "center",
    backgroundColor: "rgba(11, 18, 30, 0.95)",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    marginVertical: 4,
  },
  rangeRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.25)",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  rangeLabel: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  crosshairX: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "rgba(30, 45, 68, 0.4)",
  },
  crosshairY: {
    position: "absolute",
    height: "100%",
    width: 1,
    backgroundColor: "rgba(30, 45, 68, 0.4)",
  },
  centerMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.safe,
  },
  centerText: {
    fontSize: 8,
    fontWeight: "900",
    color: COLORS.safe,
    marginTop: 2,
  },
  strikeMarker: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  strikeMarkerText: {
    fontSize: 9,
  },
  campMarker: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.safeGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  campMarkerText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  legendsCard: {
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  legendSection: {
    gap: 6,
  },
  legendBorderTop: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border + "80",
    paddingTop: 8,
  },
  legendHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendSectionTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  legendItemsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendItemText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  statusSummaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  statusSummaryTexts: {
    flex: 1,
  },
  statusSummaryTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  statusSummarySub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
});
