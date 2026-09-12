import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  Zap,
  Waves,
  Activity,
  Mountain,
  Clock,
  ChevronRight,
  ShieldCheck,
  Share2,
  Navigation,
} from "../Icons";
import { useWarnly } from "../../lib/warnly/store";
import { useEarthquakes, useFloodRisk, floodMeta } from "../../lib/warnly/hazards";
import { evaluateGlofRisk, type GlofRiskAssessment } from "../../lib/warnly/glof";
import { computeEarlyWarnings, type EarlyWarningSummary } from "../../lib/warnly/early-warning";
import { fetchNearbySafetyCamps, type SafetyCamp } from "../../lib/warnly/shelters";
import { MassBroadcastModal } from "./MassBroadcastModal";
import { SafetyCampsModal } from "./SafetyCampsModal";
import { GuideModal } from "./GuideModal";
import { COLORS, RADII, FONTS } from "../../theme";

export const StatusHeaderPill: React.FC = () => {
  const { level, probability } = useWarnly();
  const isDanger = level === "danger";
  const isAdvisory = level === "advisory";

  const color = isDanger ? COLORS.danger : isAdvisory ? COLORS.warning : COLORS.safe;
  const bg = isDanger ? COLORS.dangerBg : isAdvisory ? COLORS.warningBg : COLORS.safeBg;
  const border = isDanger ? COLORS.dangerBorder : isAdvisory ? COLORS.warningBorder : COLORS.safeBorder;
  const text = isDanger ? "CRITICAL THREAT ACTIVE" : isAdvisory ? "ADVISORY MONITORING" : "ALL SYSTEMS SAFE";

  return (
    <View style={[styles.statusPill, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.pulseDot, { backgroundColor: color }]} />
      <Text style={[styles.statusPillText, { color }]}>{text}</Text>
      <Text style={styles.statusPillProb}>· {probability}% Risk</Text>
    </View>
  );
};

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
      {/* 10+ Min Early Warning Highlight Banner */}
      {earlySummary?.topAlert && (
        <View
          style={[
            styles.earlyAlertBanner,
            earlySummary.hasCriticalEarlyAlert && styles.earlyAlertBannerCritical,
          ]}
        >
          <View style={styles.earlyAlertTop}>
            <View style={styles.earlyAlertLeadRow}>
              <Clock
                size={14}
                color={
                  earlySummary.hasCriticalEarlyAlert
                    ? COLORS.danger
                    : COLORS.warning
                }
              />
              <Text
                style={[
                  styles.earlyAlertLeadText,
                  {
                    color: earlySummary.hasCriticalEarlyAlert
                      ? COLORS.danger
                      : COLORS.warning,
                  },
                ]}
              >
                {earlySummary.topAlert.leadTimeDisplay}
              </Text>
            </View>
            <View
              style={[
                styles.earlyAlertBadge,
                {
                  backgroundColor: earlySummary.hasCriticalEarlyAlert
                    ? COLORS.danger
                    : COLORS.warningBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.earlyAlertBadgeText,
                  {
                    color: earlySummary.hasCriticalEarlyAlert
                      ? "#FFFFFF"
                      : COLORS.warning,
                  },
                ]}
              >
                {earlySummary.hasCriticalEarlyAlert ? "CRITICAL ALERT" : "EARLY ADVISORY"}
              </Text>
            </View>
          </View>

          <Text style={styles.earlyAlertTitle}>{earlySummary.topAlert.title}</Text>
          <Text style={styles.earlyAlertAction}>
            {earlySummary.topAlert.primaryAction}
          </Text>

          <View style={styles.earlyAlertButtons}>
            <TouchableOpacity
              style={styles.earlyAlertShareBtn}
              onPress={() => setBroadcastOpen(true)}
              activeOpacity={0.8}
            >
              <Share2 size={13} color="#FFFFFF" />
              <Text style={styles.earlyAlertShareText}>Broadcast SOS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.earlyAlertCampBtn}
              onPress={() => setCampsOpen(true)}
              activeOpacity={0.8}
            >
              <Navigation size={13} color={COLORS.safe} />
              <Text style={styles.earlyAlertCampText}>Safe Camps</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Multi-Hazard Threat Monitoring Cards List */}
      <View style={styles.hazardCardsList}>
        {/* 1. GLOF Glacial Lake Outburst Card */}
        <TouchableOpacity
          style={styles.threatCard}
          onPress={() => setGuideOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.threatCardHeader}>
            <View style={styles.threatIconTitle}>
              <View style={[styles.hazardIconBox, { backgroundColor: "rgba(0, 229, 255, 0.15)" }]}>
                <Mountain size={16} color={COLORS.safe} />
              </View>
              <View>
                <Text style={styles.threatName}>GLOF Glacial Basins</Text>
                <Text style={styles.threatSub}>
                  {glof?.nearestGlacialLake
                    ? `${glof.nearestGlacialLake.lake.name} (${glof.nearestGlacialLake.distanceKm} km)`
                    : "High Mountain Asia & Himalayan Corridors"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.threatStatusBadge,
                {
                  backgroundColor:
                    glof?.riskLevel === "warning"
                      ? COLORS.dangerBg
                      : glof?.riskLevel === "watch"
                      ? COLORS.warningBg
                      : COLORS.safeBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.threatStatusText,
                  {
                    color:
                      glof?.riskLevel === "warning"
                        ? COLORS.danger
                        : glof?.riskLevel === "watch"
                        ? COLORS.warning
                        : COLORS.safe,
                  },
                ]}
              >
                {glof?.riskLevel?.toUpperCase() ?? "SAFE"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. Flash Flood & River Surge Card */}
        <TouchableOpacity
          style={styles.threatCard}
          onPress={() => setGuideOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.threatCardHeader}>
            <View style={styles.threatIconTitle}>
              <View style={[styles.hazardIconBox, { backgroundColor: "rgba(56, 189, 248, 0.15)" }]}>
                <Waves size={16} color="#38BDF8" />
              </View>
              <View>
                <Text style={styles.threatName}>Flash Floods & Surges</Text>
                <Text style={styles.threatSub}>
                  Rain: {flood?.rainNow ?? 0} mm/hr · {flood?.label ?? "No flood risk"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.threatStatusBadge,
                {
                  backgroundColor:
                    flood?.level === "severe" || flood?.level === "high"
                      ? COLORS.dangerBg
                      : flood?.level === "moderate"
                      ? COLORS.warningBg
                      : COLORS.safeBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.threatStatusText,
                  {
                    color:
                      flood?.level === "severe" || flood?.level === "high"
                        ? COLORS.danger
                        : flood?.level === "moderate"
                        ? COLORS.warning
                        : COLORS.safe,
                  },
                ]}
              >
                {flood?.level ? flood.level.toUpperCase() : "SAFE"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. Lightning Convective Threat Card */}
        <TouchableOpacity
          style={styles.threatCard}
          onPress={() => setGuideOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.threatCardHeader}>
            <View style={styles.threatIconTitle}>
              <View style={[styles.hazardIconBox, { backgroundColor: "rgba(255, 176, 32, 0.15)" }]}>
                <Zap size={16} color={COLORS.warning} />
              </View>
              <View>
                <Text style={styles.threatName}>Lightning Strikes</Text>
                <Text style={styles.threatSub}>
                  {strikes.length > 0
                    ? `${strikes.length} active strikes · Nearest ${nearest?.distanceKm ?? 0} km`
                    : "0 strikes detected in safety zone"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.threatStatusBadge,
                {
                  backgroundColor:
                    level === "danger"
                      ? COLORS.dangerBg
                      : level === "advisory"
                      ? COLORS.warningBg
                      : COLORS.safeBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.threatStatusText,
                  {
                    color:
                      level === "danger"
                        ? COLORS.danger
                        : level === "advisory"
                        ? COLORS.warning
                        : COLORS.safe,
                  },
                ]}
              >
                {level.toUpperCase()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 4. Earthquakes (Seismic) Card */}
        <TouchableOpacity
          style={styles.threatCard}
          onPress={() => setGuideOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.threatCardHeader}>
            <View style={styles.threatIconTitle}>
              <View style={[styles.hazardIconBox, { backgroundColor: "rgba(255, 42, 77, 0.15)" }]}>
                <Activity size={16} color={COLORS.danger} />
              </View>
              <View>
                <Text style={styles.threatName}>Seismic Activity</Text>
                <Text style={styles.threatSub}>
                  {quake
                    ? `M${quake.mag.toFixed(1)} · ${quake.distanceKm} km away (${quake.place})`
                    : "No major seismic tremors within sensing range"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.threatStatusBadge,
                {
                  backgroundColor:
                    quake && quake.mag >= 5.5
                      ? COLORS.dangerBg
                      : quake && quake.mag >= 4.0
                      ? COLORS.warningBg
                      : COLORS.safeBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.threatStatusText,
                  {
                    color:
                      quake && quake.mag >= 5.5
                        ? COLORS.danger
                        : quake && quake.mag >= 4.0
                        ? COLORS.warning
                        : COLORS.safe,
                  },
                ]}
              >
                {quake ? `M${quake.mag.toFixed(1)}` : "CALM"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <MassBroadcastModal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        alert={
          earlySummary?.topAlert ?? {
            id: "home-broadcast",
            kind: "flood",
            severity: "warning",
            title: "Urgent Disaster & Safety Alert",
            leadTimeMinutes: 15,
            leadTimeDisplay: "15 mins advance warning",
            primaryAction: "Evacuate low ground & move to nearest safe camp",
            actionSteps: [
              "Move to high ground at least 30-50m above riverbed.",
              "Stay away from low bridges and riverbanks.",
              "Carry an emergency go-bag and monitor alerts.",
            ],
            recommendedShelterType: "high_ground",
            metrics: [],
            timestamp: Date.now(),
          }
        }
        locationName={weather?.place ?? "Your Area"}
        nearestCamp={nearestCamp}
        onOpenCamps={() => {
          setBroadcastOpen(false);
          setCampsOpen(true);
        }}
      />

      <SafetyCampsModal
        open={campsOpen}
        onClose={() => setCampsOpen(false)}
        coords={coords}
      />

      <GuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADII.full,
    borderWidth: 1,
    gap: 6,
    marginBottom: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statusPillProb: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  earlyAlertBanner: {
    backgroundColor: "rgba(255, 176, 32, 0.1)",
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    padding: 14,
    gap: 8,
  },
  earlyAlertBannerCritical: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
  },
  earlyAlertTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  earlyAlertLeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  earlyAlertLeadText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  earlyAlertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  earlyAlertBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  earlyAlertTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  earlyAlertAction: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  earlyAlertButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  earlyAlertShareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.danger,
    borderRadius: RADII.md,
    paddingVertical: 8,
    gap: 6,
  },
  earlyAlertShareText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  earlyAlertCampBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    gap: 6,
  },
  earlyAlertCampText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.safe,
  },
  hazardCardsList: {
    gap: 8,
  },
  threatCard: {
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  threatCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  threatIconTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  hazardIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADII.md,
    alignItems: "center",
    justifyContent: "center",
  },
  threatName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  threatSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  threatStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  threatStatusText: {
    fontSize: 9,
    fontWeight: "800",
  },
});
