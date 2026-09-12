import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
} from "react-native";
import {
  Zap,
  Mountain,
  Waves,
  Activity,
  X,
  Volume2,
  Share2,
  Navigation,
} from "../Icons";
import { useWarnly } from "../../lib/warnly/store";
import { useEarthquakes, useFloodRisk } from "../../lib/warnly/hazards";
import { computeEarlyWarnings, type EarlyWarningSummary } from "../../lib/warnly/early-warning";
import { fetchNearbySafetyCamps, type SafetyCamp } from "../../lib/warnly/shelters";
import { ShelterTimer } from "./ShelterTimer";
import { MassBroadcastModal } from "./MassBroadcastModal";
import { SafetyCampsModal } from "./SafetyCampsModal";
import { startSirenAudio, stopSirenAudio } from "../../lib/warnly/siren";
import { NativeEmergency } from "../../lib/warnly/native-emergency";
import { COLORS, RADII, FONTS } from "../../theme";

export const EmergencyOverlay: React.FC = () => {
  const {
    coords,
    level,
    nearest,
    probability,
    strikes,
    weather,
    alertDismissedAt,
    dismissAlert,
    shelterUntil,
  } = useWarnly();

  const quakesQ = useEarthquakes(coords);
  const floodQ = useFloodRisk(coords);

  const [earlySummary, setEarlySummary] = useState<EarlyWarningSummary | null>(null);
  const [nearestCamp, setNearestCamp] = useState<SafetyCamp | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [campsOpen, setCampsOpen] = useState(false);

  useEffect(() => {
    if (!coords) return;
    computeEarlyWarnings(coords, weather, strikes, floodQ.data, quakesQ.data ?? []).then((res) => {
      setEarlySummary(res);
    });
    fetchNearbySafetyCamps(coords).then((camps) => {
      if (camps.length > 0) setNearestCamp(camps[0]);
    });
  }, [coords?.lat, coords?.lon, strikes, floodQ.data, quakesQ.data, weather]);

  const topAlert = earlySummary?.topAlert;
  const isCritical = level === "danger" || earlySummary?.hasCriticalEarlyAlert;
  const title = topAlert?.title ?? "LIGHTNING DANGER DETECTED";
  const primaryAction = topAlert?.primaryAction ?? "GET INDOORS NOW - 30/30 RULE ACTIVE";

  useEffect(() => {
    if (isCritical && !alertDismissedAt) {
      startSirenAudio();
      NativeEmergency.postCriticalAlert(title, primaryAction);
      return () => {
        stopSirenAudio();
      };
    } else {
      stopSirenAudio();
    }
  }, [isCritical, alertDismissedAt, title, primaryAction]);

  if (!isCritical || alertDismissedAt) return null;

  const getHazardIcon = () => {
    switch (topAlert?.kind) {
      case "glof":
        return <Mountain size={24} color={COLORS.danger} />;
      case "flood":
        return <Waves size={24} color={COLORS.danger} />;
      case "earthquake":
        return <Activity size={24} color={COLORS.danger} />;
      default:
        return <Zap size={24} color={COLORS.danger} />;
    }
  };
  const actionSteps = topAlert?.actionSteps ?? [
    "Get indoors now — enter a fully enclosed building or hard-topped vehicle.",
    "Stay away from windows, plumbing, corded devices, and exterior walls.",
    "Avoid tall isolated trees, open fields, and bodies of water.",
    "Stay sheltered for 30 minutes after the last thunderclap.",
  ];

  return (
    <>
      <Modal visible={true} animationType="fade" transparent={true}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>{getHazardIcon()}</View>
              <View style={styles.headerText}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>
                  {topAlert
                    ? `${topAlert.leadTimeDisplay} · ${weather?.place ?? "Your Zone"}`
                    : `Nearest strike ${nearest ? `${nearest.distanceKm} km away` : "inside your ring"}`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={dismissAlert}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
              {level === "danger" && <ShelterTimer until={shelterUntil} />}

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.broadcastBtn}
                  onPress={() => setBroadcastOpen(true)}
                  activeOpacity={0.8}
                >
                  <Share2 size={13} color="#FFFFFF" />
                  <Text style={styles.broadcastBtnText}>Broadcast SOS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.campsBtn}
                  onPress={() => setCampsOpen(true)}
                  activeOpacity={0.8}
                >
                  <Navigation size={13} color={COLORS.safe} />
                  <Text style={styles.campsBtnText}>Nearest Safe Camp</Text>
                </TouchableOpacity>
              </View>

              {/* Primary Action Box */}
              <View style={styles.primaryActionBox}>
                <Text style={styles.primaryActionLabel}>MANDATORY SAFETY ACTION</Text>
                <Text style={styles.primaryActionText}>{primaryAction}</Text>
              </View>

              {/* Steps List */}
              <View style={styles.stepsContainer}>
                {actionSteps.map((step, i) => (
                  <View key={i} style={styles.stepItem}>
                    <Text style={styles.stepNumber}>{i + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              {/* Dismiss Button */}
              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={dismissAlert}
                activeOpacity={0.8}
              >
                <Text style={styles.dismissBtnText}>Acknowledge & Dismiss Alert</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <MassBroadcastModal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        alert={
          topAlert ?? {
            id: "lightning-overlay",
            kind: "lightning",
            severity: "critical",
            title: "Lightning Intrusion Breach",
            leadTimeMinutes: 0,
            leadTimeDisplay: "Immediate Strike Breach",
            primaryAction: "Seek enclosed shelter immediately",
            actionSteps,
            recommendedShelterType: "shelter",
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
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    borderColor: COLORS.danger,
    maxHeight: "90%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dangerBg,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dangerBorder,
  },
  iconContainer: {
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.danger,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 18,
  },
  bodyContent: {
    paddingVertical: 14,
    gap: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  broadcastBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.danger,
    borderRadius: RADII.lg,
    paddingVertical: 11,
    gap: 6,
  },
  broadcastBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  campsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 11,
    gap: 6,
  },
  campsBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.safe,
  },
  primaryActionBox: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADII.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
    padding: 12,
  },
  primaryActionLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.danger,
    letterSpacing: 0.5,
  },
  primaryActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 3,
    lineHeight: 16,
  },
  stepsContainer: {
    gap: 8,
  },
  stepItem: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.md,
    padding: 10,
    gap: 10,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "900",
    fontFamily: FONTS.mono,
    color: COLORS.danger,
  },
  stepText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  dismissBtn: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 4,
  },
  dismissBtnText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
});
