import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
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
} from "../components/Icons";
import { useWarnly } from "../lib/warnly/store";
import { levelMeta, SAFETY_RADIUS_KM } from "../lib/warnly/risk";
import { weatherCodeInfo } from "../lib/warnly/weather";
import { StatusHeaderPill, ThreatCards } from "../components/warnly/ThreatCards";
import { RiskMeter } from "../components/warnly/RiskMeter";
import { LocationSearch } from "../components/warnly/LocationSearch";
import { SafetyCampsModal } from "../components/warnly/SafetyCampsModal";
import { MassBroadcastModal } from "../components/warnly/MassBroadcastModal";
import { GuideModal } from "../components/warnly/GuideModal";
import { COLORS, RADII, FONTS } from "../theme";

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
    level === "danger"
      ? COLORS.danger
      : level === "advisory"
      ? COLORS.warning
      : COLORS.safe;

  const wx = weather ? weatherCodeInfo(weather.weatherCode, weather.isDay) : null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Title Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Risk Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            100% Live Lightning & Rain Intelligence
          </Text>
        </View>
        <Text style={styles.brandBadge}>WARNLY</Text>
      </View>

      {/* Real-time Status Header Pill */}
      <StatusHeaderPill />

      {/* Location Search Bar */}
      <LocationSearch
        onSelectCoords={setCustomCoords}
        onUseGPS={requestLocation}
        locating={locating}
      />

      {/* Rapid Disaster Action Bar */}
      <View style={styles.rapidBar}>
        <TouchableOpacity
          style={[styles.rapidCard, { borderColor: COLORS.safeBorder }]}
          onPress={() => setCampsOpen(true)}
          activeOpacity={0.7}
        >
          <ShieldCheck size={16} color={COLORS.safe} />
          <Text style={styles.rapidCardTitle}>Safe Camps</Text>
          <Text style={styles.rapidCardSub}>High Ground</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.rapidCard, { borderColor: COLORS.dangerBorder }]}
          onPress={() => setBroadcastOpen(true)}
          activeOpacity={0.7}
        >
          <Share2 size={16} color={COLORS.danger} />
          <Text style={styles.rapidCardTitle}>Broadcast SOS</Text>
          <Text style={styles.rapidCardSub}>WhatsApp/SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.rapidCard, { borderColor: COLORS.borderLight }]}
          onPress={() => setGuideOpen(true)}
          activeOpacity={0.7}
        >
          <BookOpen size={16} color={COLORS.safe} />
          <Text style={styles.rapidCardTitle}>GLOF Guide</Text>
          <Text style={styles.rapidCardSub}>Protocols</Text>
        </TouchableOpacity>
      </View>

      {/* Main Risk Card */}
      <View
        style={[
          styles.mainRiskCard,
          {
            borderColor: levelColor + "60",
            backgroundColor:
              level === "danger"
                ? "rgba(255, 42, 77, 0.08)"
                : level === "advisory"
                ? "rgba(255, 176, 32, 0.08)"
                : "rgba(0, 229, 255, 0.05)",
          },
        ]}
      >
        <View style={styles.riskCardHeader}>
          <View style={styles.riskIconTitle}>
            {level === "danger" ? (
              <Zap size={22} color={COLORS.danger} />
            ) : level === "advisory" ? (
              <AlertTriangle size={22} color={COLORS.warning} />
            ) : (
              <CheckCircle2 size={22} color={COLORS.safe} />
            )}
            <View style={styles.riskHeaderTexts}>
              <Text style={[styles.riskLevelLabel, { color: levelColor }]}>
                {meta.label}
              </Text>
              <View style={styles.locationSubRow}>
                <MapPin size={11} color={COLORS.safe} />
                <Text style={styles.locationSubText} numberOfLines={1}>
                  {weather?.place ?? "Locating region…"}
                  {weather
                    ? ` · ${new Date(weather.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : ""}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={refresh}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.safe} />
            ) : (
              <RefreshCw size={14} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Gauge Risk Meter */}
        <RiskMeter
          probability={probability}
          level={level}
          caption={meta.sub}
        />

        {/* Quick Convective Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>CAPE</Text>
            <Text style={styles.statValue}>
              {weather ? Math.round(weather.cape) : "—"}
              <Text style={styles.statUnit}> J/kg</Text>
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>LIFTED INDEX</Text>
            <Text style={styles.statValue}>
              {weather ? weather.liftedIndex.toFixed(1) : "—"}
              <Text style={styles.statUnit}> K</Text>
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>NEAREST STRIKE</Text>
            <Text style={styles.statValue}>
              {nearest ? `${nearest.distanceKm}` : "None"}
              <Text style={styles.statUnit}>{nearest ? " km" : ""}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Multi-Hazard Threat Monitoring Cards */}
      <ThreatCards />

      {/* Live Rain Outlook Banner */}
      {weather && (
        <View style={styles.rainOutlookCard}>
          <View style={styles.rainOutlookIconBox}>
            <CloudRain size={20} color={COLORS.safe} />
          </View>
          <View style={styles.rainOutlookText}>
            <Text style={styles.rainOutlookTitle}>
              Live Rain & Weather Outlook
            </Text>
            <Text style={styles.rainOutlookSummary}>
              {weather.rainSummary}
            </Text>
          </View>
        </View>
      )}

      {/* Main Weather Overview Card */}
      {weather && (
        <View style={styles.weatherCard}>
          <View style={styles.weatherTopRow}>
            <View>
              <Text style={styles.weatherTemp}>
                {Math.round(weather.temperature)}°C
              </Text>
              <Text style={styles.weatherCondition}>
                {wx?.label} · Feels like {Math.round(weather.apparent)}°C
              </Text>
            </View>
            <View style={styles.weatherSideMetrics}>
              <View style={styles.weatherSideItem}>
                <Wind size={13} color={COLORS.safe} />
                <Text style={styles.weatherSideValue}>
                  {Math.round(weather.windSpeed)} km/h
                </Text>
              </View>
              <View style={styles.weatherSideItem}>
                <Droplets size={13} color="#38BDF8" />
                <Text style={styles.weatherSideValue}>
                  {weather.humidity}% humidity
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.weatherBottomRow}>
            <View style={styles.metricColumn}>
              <Text style={styles.metricColumnLabel}>DEW POINT</Text>
              <Text style={styles.metricColumnValue}>
                {Math.round(weather.dewPoint)}°C
              </Text>
            </View>
            <View style={styles.metricColumn}>
              <Text style={styles.metricColumnLabel}>CLOUD COVER</Text>
              <Text style={styles.metricColumnValue}>
                {weather.cloudCover}%
              </Text>
            </View>
            <View style={styles.metricColumn}>
              <Text style={styles.metricColumnLabel}>UV INDEX</Text>
              <Text style={styles.metricColumnValue}>
                {weather.uvIndex} / 11
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Live Weather Radar Preview Card */}
      <TouchableOpacity
        style={styles.radarPreviewCard}
        onPress={onNavigateRadar}
        activeOpacity={0.8}
      >
        <View style={styles.radarPreviewHeader}>
          <View style={styles.radarPreviewTitleRow}>
            <Sparkles size={14} color={COLORS.safe} />
            <Text style={styles.radarPreviewTitle}>Live Weather Radar Map</Text>
          </View>
          <Text style={styles.radarPreviewLink}>Full Screen Map ?</Text>
        </View>
        <View style={styles.radarPreviewScope}>
          <View style={styles.radarRingOuter}>
            <View style={styles.radarRingInner}>
              <Text style={styles.radarCenterLabel}>
                {strikes.length} STRIKES
              </Text>
              <Text style={styles.radarCenterSub}>
                {SAFETY_RADIUS_KM} km safety zone
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Real-Time Safe Zone Active Banner */}
      <View style={styles.safetyRingActiveCard}>
        <ShieldCheck size={20} color={COLORS.safe} />
        <View style={styles.safetyRingActiveTexts}>
          <Text style={styles.safetyRingActiveTitle}>
            Real-Time Safe Zone Active
          </Text>
          <Text style={styles.safetyRingActiveSub}>
            Continuously tracking Blitzortung network sensors, Doppler weather radar & GLOF glacial basins within 25 km.
          </Text>
        </View>
      </View>

      {/* Modals */}
      <SafetyCampsModal
        open={campsOpen}
        onClose={() => setCampsOpen(false)}
        coords={coords}
      />

      <MassBroadcastModal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        alert={{
          id: "home-broadcast",
          kind: "flood",
          severity: "warning",
          title: "Urgent Disaster & Safety Alert",
          leadTimeMinutes: 15,
          leadTimeDisplay: "15 mins advance warning",
          primaryAction: "Evacuate low ground & move to nearest safe camp",
          actionSteps: [
            "Move to high ground at least 30-50m above riverbed.",
            "Avoid low-lying riverbeds, culverts and bridges.",
            "Carry emergency go-bag and keep phones charged.",
          ],
          recommendedShelterType: "high_ground",
          metrics: [],
          timestamp: Date.now(),
        }}
        locationName={weather?.place ?? "Your Area"}
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
  rapidBar: {
    flexDirection: "row",
    gap: 8,
  },
  rapidCard: {
    flex: 1,
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: RADII.lg,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  rapidCardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  rapidCardSub: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  mainRiskCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  riskCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  riskIconTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  riskHeaderTexts: {
    flex: 1,
  },
  riskLevelLabel: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  locationSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationSubText: {
    fontSize: 10,
    color: COLORS.textMuted,
    flex: 1,
  },
  refreshBtn: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    padding: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.md,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  statUnit: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  rainOutlookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 229, 255, 0.08)",
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    padding: 14,
    gap: 12,
  },
  rainOutlookIconBox: {
    backgroundColor: "rgba(0, 229, 255, 0.15)",
    borderRadius: RADII.lg,
    padding: 8,
  },
  rainOutlookText: {
    flex: 1,
  },
  rainOutlookTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  rainOutlookSummary: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  weatherCard: {
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 14,
  },
  weatherTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weatherTemp: {
    fontSize: 38,
    fontWeight: "900",
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  weatherCondition: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  weatherSideMetrics: {
    alignItems: "flex-end",
    gap: 4,
  },
  weatherSideItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  weatherSideValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  weatherBottomRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    justifyContent: "space-around",
  },
  metricColumn: {
    alignItems: "center",
  },
  metricColumnLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  metricColumnValue: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 3,
  },
  radarPreviewCard: {
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  radarPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  radarPreviewTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radarPreviewTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  radarPreviewLink: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.safe,
  },
  radarPreviewScope: {
    height: 160,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radarRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  radarRingInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.safeBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  radarCenterLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.safe,
  },
  radarCenterSub: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  safetyRingActiveCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  safetyRingActiveTexts: {
    flex: 1,
  },
  safetyRingActiveTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  safetyRingActiveSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
    marginTop: 2,
  },
});
