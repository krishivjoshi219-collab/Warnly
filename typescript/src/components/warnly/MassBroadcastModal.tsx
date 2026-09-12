import React, { useState } from "react";
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
  Radio,
  X,
  Share2,
  Volume2,
  VolumeX,
  Navigation,
  Check,
} from "../Icons";
import { type EarlyWarningAlert } from "../../lib/warnly/early-warning";
import { type SafetyCamp } from "../../lib/warnly/shelters";
import { startSirenAudio, stopSirenAudio } from "../../lib/warnly/siren";
import { COLORS, RADII, FONTS } from "../../theme";

interface Props {
  open: boolean;
  onClose: () => void;
  alert: EarlyWarningAlert | null;
  locationName: string;
  nearestCamp: SafetyCamp | null;
  onOpenCamps: () => void;
}

export const MassBroadcastModal: React.FC<Props> = ({
  open,
  onClose,
  alert,
  locationName,
  nearestCamp,
  onOpenCamps,
}) => {
  const [copied, setCopied] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);

  if (!open || !alert) return null;

  const generateBroadcastText = () => {
    const lines = [
      `?? URGENT DISASTER EARLY WARNING (Warnly)`,
      `HAZARD: ${alert.title.toUpperCase()}`,
      `LOCATION: ${locationName}`,
      `LEAD TIME: ${alert.leadTimeDisplay}`,
      ``,
      `?? IMMEDIATE ACTION REQUIRED:`,
      `${alert.primaryAction}`,
      ...alert.actionSteps.slice(0, 3).map((s, i) => `${i + 1}. ${s}`),
      ``,
    ];

    if (nearestCamp) {
      lines.push(
        `?? NEAREST SAFETY CAMP:`,
        `${nearestCamp.name} (${nearestCamp.distanceKm} km away, +${nearestCamp.elevationGainM}m elevation)`,
        `Directions: ${nearestCamp.navigationUrl}`,
        ``
      );
    }

    lines.push(
      `Broadcasted at ${new Date().toLocaleTimeString()} · FORWARD IMMEDIATELY TO EVACUATE LOVED ONES & SAVE LIVES!`
    );

    return lines.join("\n");
  };

  const handleShare = async () => {
    const text = generateBroadcastText();
    try {
      await Share.share({
        message: text,
        title: `?? EARLY WARNING: ${alert.title}`,
      });
    } catch {
      /* ignore */
    }
  };

  const toggleSiren = () => {
    if (sirenPlaying) {
      stopSirenAudio();
      setSirenPlaying(false);
    } else {
      startSirenAudio();
      setSirenPlaying(true);
    }
  };

  const textPreview = generateBroadcastText();

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        if (sirenPlaying) stopSirenAudio();
        onClose();
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.radioIcon}>
                <Radio size={16} color={COLORS.danger} />
              </View>
              <View>
                <Text style={styles.title}>Mass Alert Distribution</Text>
                <Text style={styles.subtitle}>
                  Save lives: broadcast early warning to family & community
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (sirenPlaying) stopSirenAudio();
                onClose();
              }}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Siren Toggle Pill */}
            <TouchableOpacity
              style={[
                styles.sirenBar,
                sirenPlaying && styles.sirenBarActive,
              ]}
              onPress={toggleSiren}
              activeOpacity={0.8}
            >
              {sirenPlaying ? (
                <VolumeX size={16} color="#FFFFFF" />
              ) : (
                <Volume2 size={16} color={COLORS.danger} />
              )}
              <Text
                style={[
                  styles.sirenText,
                  sirenPlaying && styles.sirenTextActive,
                ]}
              >
                {sirenPlaying ? "STOP EMERGENCY SIREN" : "TEST TWO-TONE SIREN"}
              </Text>
            </TouchableOpacity>

            {/* Broadcast Text Box */}
            <View style={styles.previewBox}>
              <Text style={styles.previewText}>{textPreview}</Text>
            </View>

            {/* Share to WhatsApp Button */}
            <TouchableOpacity
              style={styles.broadcastBtn}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Share2 size={16} color="#FFFFFF" />
              <Text style={styles.broadcastBtnText}>
                Broadcast to WhatsApp / SMS
              </Text>
            </TouchableOpacity>

            {/* Open Camps Button */}
            <TouchableOpacity
              style={styles.campsBtn}
              onPress={onOpenCamps}
              activeOpacity={0.8}
            >
              <Navigation size={14} color={COLORS.safe} />
              <Text style={styles.campsBtnText}>
                View Nearest Evacuation Camps
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: COLORS.dangerBorder,
    maxHeight: "85%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radioIcon: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADII.md,
    padding: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    padding: 6,
  },
  body: {
    paddingHorizontal: 18,
  },
  bodyContent: {
    paddingVertical: 14,
    gap: 12,
  },
  sirenBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderRadius: RADII.lg,
    paddingVertical: 10,
    gap: 8,
  },
  sirenBarActive: {
    backgroundColor: COLORS.danger,
  },
  sirenText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.danger,
  },
  sirenTextActive: {
    color: "#FFFFFF",
  },
  previewBox: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  previewText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: FONTS.mono,
    lineHeight: 16,
  },
  broadcastBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.danger,
    borderRadius: RADII.lg,
    paddingVertical: 13,
    gap: 8,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  broadcastBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  campsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.safeBg,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    borderRadius: RADII.lg,
    paddingVertical: 11,
    gap: 8,
  },
  campsBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.safe,
  },
});
