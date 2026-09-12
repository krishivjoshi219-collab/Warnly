import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import {
  Mountain,
  ShieldCheck,
  Home,
  Building,
  Activity,
  X,
  Navigation,
  Phone,
  Clock,
} from "../Icons";
import {
  fetchNearbySafetyCamps,
  type SafetyCamp,
  type ShelterCategory,
} from "../../lib/warnly/shelters";
import type { Coords } from "../../lib/warnly/types";
import { COLORS, RADII, FONTS } from "../../theme";

interface Props {
  open: boolean;
  onClose: () => void;
  coords: Coords | null;
  preferredCategory?: ShelterCategory;
}

export const SafetyCampsModal: React.FC<Props> = ({
  open,
  onClose,
  coords,
  preferredCategory,
}) => {
  const [selectedCat, setSelectedCat] = useState<ShelterCategory | "all">(
    preferredCategory ?? "all"
  );
  const [camps, setCamps] = useState<SafetyCamp[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !coords) return;
    setLoading(true);
    fetchNearbySafetyCamps(
      coords,
      selectedCat === "all" ? undefined : selectedCat
    )
      .then((res) => {
        setCamps(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, coords?.lat, coords?.lon, selectedCat]);

  const categories = [
    { id: "all", label: "All Safe Points" },
    { id: "high_ground", label: "High Ground (Flood/GLOF)" },
    { id: "shelter", label: "Storm Shelters" },
    { id: "assembly_field", label: "Open Fields" },
    { id: "hospital", label: "Hospitals" },
  ] as const;

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Mountain size={18} color={COLORS.safe} />
                <Text style={styles.title}>Safety Camps & Evacuation</Text>
              </View>
              <Text style={styles.subtitle}>
                Emergency relief camps, high ground ridges & hospitals
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Category Chips Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryBar}
          >
            {categories.map((c) => {
              const active = selectedCat === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.catChip,
                    active && styles.catChipActive,
                  ]}
                  onPress={() => setSelectedCat(c.id as any)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      active && styles.catChipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* List of camps */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.safe} />
                <Text style={styles.loadingText}>
                  Scanning for nearest verified relief centers & high ground…
                </Text>
              </View>
            ) : camps.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>
                  No designated camps found for this filter in the immediate vicinity.
                </Text>
              </View>
            ) : (
              camps.map((camp) => {
                const isHighGround = camp.category === "high_ground";
                return (
                  <View
                    key={camp.id}
                    style={[
                      styles.campCard,
                      isHighGround && styles.highGroundCard,
                    ]}
                  >
                    <View style={styles.campHeader}>
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: isHighGround
                                ? COLORS.safeBg
                                : camp.category === "hospital"
                                ? COLORS.dangerBg
                                : COLORS.warningBg,
                              borderColor: isHighGround
                                ? COLORS.safeBorder
                                : camp.category === "hospital"
                                ? COLORS.dangerBorder
                                : COLORS.warningBorder,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color: isHighGround
                                  ? COLORS.safe
                                  : camp.category === "hospital"
                                  ? COLORS.danger
                                  : COLORS.warning,
                              },
                            ]}
                          >
                            {camp.categoryLabel}
                          </Text>
                        </View>
                        {camp.elevationGainM > 0 && (
                          <View style={styles.elevationBadge}>
                            <Text style={styles.elevationText}>
                              +{camp.elevationGainM}m ELEVATION
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.distanceText}>
                        {camp.distanceKm} km
                      </Text>
                    </View>

                    <Text style={styles.campName}>{camp.name}</Text>
                    <Text style={styles.campAddress}>{camp.address}</Text>

                    <View style={styles.metricsRow}>
                      <View style={styles.metricItem}>
                        <Clock size={11} color={COLORS.textMuted} />
                        <Text style={styles.metricText}>
                          Walk ~{camp.walkingTimeMin} min · Drive ~{camp.drivingTimeMin} min
                        </Text>
                      </View>
                      {camp.emergencyPhone && (
                        <View style={styles.metricItem}>
                          <Phone size={11} color={COLORS.safe} />
                          <Text style={styles.phoneText}>
                            {camp.emergencyPhone}
                          </Text>
                        </View>
                      )}
                    </View>

                    {camp.features.length > 0 && (
                      <View style={styles.featuresList}>
                        {camp.features.map((f, i) => (
                          <Text key={i} style={styles.featureItem}>
                            • {f}
                          </Text>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.navigateBtn}
                      onPress={() => Linking.openURL(camp.navigationUrl)}
                      activeOpacity={0.8}
                    >
                      <Navigation size={13} color="#070A0F" />
                      <Text style={styles.navigateBtnText}>
                        Navigate via Maps
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: COLORS.safeBorder,
    maxHeight: "85%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    padding: 6,
  },
  categoryBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.full,
    backgroundColor: COLORS.backgroundElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    backgroundColor: COLORS.safe,
    borderColor: COLORS.safe,
  },
  catChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  catChipTextActive: {
    color: "#070A0F",
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 30,
    gap: 12,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  campCard: {
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 6,
  },
  highGroundCard: {
    borderColor: COLORS.safeBorder,
    backgroundColor: "rgba(0, 229, 255, 0.04)",
  },
  campHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADII.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  elevationBadge: {
    backgroundColor: COLORS.backgroundElevated,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  elevationText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: FONTS.mono,
    color: COLORS.safe,
  },
  campName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  campAddress: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  phoneText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.safe,
  },
  featuresList: {
    gap: 2,
    marginTop: 4,
  },
  featureItem: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  navigateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.safe,
    borderRadius: RADII.md,
    paddingVertical: 8,
    gap: 6,
    marginTop: 6,
  },
  navigateBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#070A0F",
  },
});
