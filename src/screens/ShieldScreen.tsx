import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from "react-native";
import {
  Crown,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Plus,
  Trash2,
  Volume2,
  Users,
  X,
  Navigation,
} from "../components/Icons";
import { usePro, formatDistance } from "../lib/warnly/pro";
import { useWarnly } from "../lib/warnly/store";
import { distanceKm, SAFETY_RADIUS_KM } from "../lib/warnly/risk";
import type { Coords } from "../lib/warnly/types";
import { LocationSearch } from "../components/warnly/LocationSearch";
import { PaywallModal } from "../components/warnly/PaywallModal";
import { COLORS, RADII, FONTS, SHADOWS, SPACING, SAFE_TOP_PADDING } from "../theme";
import { FadeIn, ScreenHeader, SectionHeader, GlassCard, StatusBadge, GlowButton, PulseDot } from "../components/ui";

export const ShieldScreen: React.FC = () => {
  const {
    isPro,
    openPaywall,
    places,
    addPlace,
    removePlace,
    startSiren,
    stopSiren,
    sirenActive,
    units,
  } = usePro();

  const { coords, weather, strikes, level, survival } = useWarnly();

  const [showAddModal, setShowAddModal] = useState(false);
  const [label, setLabel] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null);
  const [placeName, setPlaceName] = useState("");

  const handleAdd = () => {
    if (!selectedCoords) return;
    const ok = addPlace({
      label: label.trim() || "Monitored Zone",
      name: placeName || "Custom Location",
      lat: selectedCoords.lat,
      lon: selectedCoords.lon,
    });
    if (ok) {
      setShowAddModal(false);
      setLabel("");
      setSelectedCoords(null);
      setPlaceName("");
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Title Header */}
      <FadeIn duration={300}>
        <ScreenHeader
          title="Family Shield"
          subtitle="Multi-zone rings for loved ones & properties"
          badge="SHIELD"
          badgeVariant="safe"
        />
      </FadeIn>

      {/* Pro Tier Banner */}
      <View style={styles.proBanner}>
        <View style={styles.proBannerLeft}>
          <View style={styles.crownIconBox}>
            <Crown size={16} color={COLORS.safe} />
          </View>
          <View style={styles.proBannerTexts}>
            <View style={styles.proTitleRow}>
              <Text style={styles.proTitle}>
                {isPro ? "WARNLY PRO ACTIVE" : "FAMILY SHIELD FREE TIER"}
              </Text>
              <View
                style={[
                  styles.capBadge,
                  isPro ? styles.capBadgePro : styles.capBadgeFree,
                ]}
              >
                <Text
                  style={[
                    styles.capBadgeText,
                    isPro ? styles.capBadgeTextPro : styles.capBadgeTextFree,
                  ]}
                >
                  {isPro ? "UNLIMITED" : "1 place cap"}
                </Text>
              </View>
            </View>
            <Text style={styles.proSubtitle}>
              {isPro
                ? "All zones continuously monitored with instant breach push alerts"
                : "Free tier monitors 1 remote place. Upgrade for unlimited family rings."}
            </Text>
          </View>
        </View>
        {!isPro && (
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => openPaywall("Unlock unlimited Family Shield rings with Pro.")}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Primary Device Current Location Ring */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>YOUR CURRENT LOCATION (PRIMARY)</Text>
      </View>
      <View
        style={[
          styles.primaryPlaceCard,
          level === "danger" && styles.dangerCard,
        ]}
      >
        <View style={styles.primaryLeft}>
          <View
            style={[
              styles.shieldIconBox,
              level === "danger" ? styles.dangerIconBox : styles.safeIconBox,
            ]}
          >
            {level === "danger" ? (
              <ShieldAlert size={18} color={COLORS.danger} />
            ) : (
              <ShieldCheck size={18} color={COLORS.safe} />
            )}
          </View>
          <View>
            <View style={styles.primaryNameRow}>
              <Text style={styles.primaryName}>My Primary Device</Text>
              <View style={styles.gpsLiveBadge}>
                <Text style={styles.gpsLiveText}>GPS LIVE</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={11} color={COLORS.safe} />
              <Text style={styles.locationText} numberOfLines={1}>
                {weather?.place ?? "Locating region…"}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            level === "danger"
              ? styles.statusDanger
              : level === "advisory"
              ? styles.statusAdvisory
              : styles.statusSafe,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              level === "danger"
                ? styles.statusTextDanger
                : level === "advisory"
                ? styles.statusTextAdvisory
                : styles.statusTextSafe,
            ]}
          >
            {level === "danger" ? "DANGER" : level === "advisory" ? "ADVISORY" : "SAFE"}
          </Text>
        </View>
      </View>

      {/* Monitored Family Places */}
      <View style={styles.sectionHeaderBetween}>
        <Text style={styles.sectionTitle}>
          MONITORED FAMILY PLACES ({places.length})
        </Text>
        <TouchableOpacity
          style={styles.addPlaceBtn}
          onPress={() => {
            if (!isPro && places.length >= 1) {
              openPaywall("Family Shield tracks unlimited places with Warnly Pro.");
            } else {
              setShowAddModal(true);
            }
          }}
          activeOpacity={0.7}
        >
          <Plus size={13} color={COLORS.safe} />
          <Text style={styles.addPlaceBtnText}>Add Place</Text>
        </TouchableOpacity>
      </View>

      {places.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyStateTitle}>No Family Places Added</Text>
          <Text style={styles.emptyStateSubtitle}>
            Add your children's school, parents' home, or holiday property to monitor lightning and flood threats in real time.
          </Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Plus size={14} color="#070A0F" />
            <Text style={styles.addFirstBtnText}>Add First Family Ring</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placesList}>
          {places.map((p) => {
            const distFromMe = coords
              ? Math.round(distanceKm(coords, { lat: p.lat, lon: p.lon }) * 10) / 10
              : null;

            const placeStrikes = strikes.filter((s) => {
              const d = distanceKm({ lat: p.lat, lon: p.lon }, { lat: s.lat, lon: s.lon });
              return d <= SAFETY_RADIUS_KM;
            });

            const isPlaceDanger = placeStrikes.length > 0;

            return (
              <View
                key={p.id}
                style={[
                  styles.placeCard,
                  isPlaceDanger && styles.dangerCard,
                ]}
              >
                <View style={styles.placeCardLeft}>
                  <View
                    style={[
                      styles.shieldIconBox,
                      isPlaceDanger ? styles.dangerIconBox : styles.safeIconBox,
                    ]}
                  >
                    {isPlaceDanger ? (
                      <ShieldAlert size={18} color={COLORS.danger} />
                    ) : (
                      <ShieldCheck size={18} color={COLORS.safe} />
                    )}
                  </View>
                  <View style={styles.placeCardTexts}>
                    <Text style={styles.placeLabel}>{p.label}</Text>
                    <Text style={styles.placeName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.placeCoords}>
                      {distFromMe != null ? `${formatDistance(distFromMe, units)} away · ` : ""}
                      Lat {p.lat.toFixed(2)}°, Lon {p.lon.toFixed(2)}°
                    </Text>
                  </View>
                </View>

                <View style={styles.placeCardRight}>
                  <View
                    style={[
                      styles.statusPill,
                      isPlaceDanger ? styles.statusDanger : styles.statusSafe,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isPlaceDanger ? styles.statusTextDanger : styles.statusTextSafe,
                      ]}
                    >
                      {isPlaceDanger ? `${placeStrikes.length} STRIKES` : "CLEAR"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removePlace(p.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Native family pact + care */}
      <View style={styles.sirenCard}>
        <Text style={styles.sirenTitle}>FAMILY PACT · {survival.custody}</Text>
        <Text style={styles.sirenSubtitle}>{survival.directive} — {survival.fallback}</Text>
        <Text style={styles.sirenSubtitle}>{survival.reserve} · {survival.calm}</Text>
      </View>

      {/* Emergency Siren Broadcast Card */}
      <View style={styles.sirenCard}>
        <View style={styles.sirenHeader}>
          <Volume2 size={16} color={COLORS.danger} />
          <Text style={styles.sirenTitle}>EMERGENCY SIREN BROADCAST</Text>
        </View>
        <Text style={styles.sirenSubtitle}>
          Test the two-tone 960Hz/640Hz acoustic emergency sound designed to wake sleeping households.
        </Text>
        <TouchableOpacity
          style={[
            styles.sirenBtn,
            sirenActive && { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
          ]}
          onPress={() => {
            if (sirenActive) {
              stopSiren();
            } else {
              startSiren();
            }
          }}
          activeOpacity={0.8}
        >
          <Volume2 size={15} color={sirenActive ? "#FFFFFF" : COLORS.danger} />
          <Text
            style={[
              styles.sirenBtnText,
              sirenActive && { color: "#FFFFFF" },
            ]}
          >
            {sirenActive ? "Stop Emergency Siren" : "Test Two-Tone Emergency Siren"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Place Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Safety Ring</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>LABEL (E.G. MOM'S HOUSE, KIDS' SCHOOL)</Text>
              <TextInput
                style={styles.textInput}
                value={label}
                onChangeText={setLabel}
                placeholder="Enter place label…"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.inputLabel}>SEARCH LOCATION</Text>
              <LocationSearch
                onSelectCoords={(c) => setSelectedCoords(c)}
                onUseGPS={() => {
                  if (coords) setSelectedCoords(coords);
                }}
              />

              {selectedCoords && (
                <View style={styles.selectedCoordsBox}>
                  <Text style={styles.selectedCoordsText}>
                    Selected: Lat {selectedCoords.lat.toFixed(3)}°, Lon {selectedCoords.lon.toFixed(3)}°
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  !selectedCoords && styles.saveBtnDisabled,
                ]}
                onPress={handleAdd}
                disabled={!selectedCoords}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>Save Family Ring</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PaywallModal />
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
    paddingTop: SAFE_TOP_PADDING,
    paddingBottom: 110,
    gap: 12,
  },
  proBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    padding: 14,
    gap: 10,
  },
  proBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  crownIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADII.md,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  proBannerTexts: {
    flex: 1,
  },
  proTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  proTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  capBadge: {
    borderRadius: RADII.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  capBadgePro: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  capBadgeFree: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  capBadgeText: {
    fontSize: 8,
    fontWeight: "800",
  },
  capBadgeTextPro: {
    color: "#10B981",
  },
  capBadgeTextFree: {
    color: COLORS.textTertiary,
  },
  proSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  upgradeBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: RADII.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  upgradeBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionHeaderBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  addPlaceBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  addPlaceBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  primaryPlaceCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...SHADOWS.sm,
  },
  dangerCard: {
    borderColor: COLORS.dangerBorder,
    backgroundColor: COLORS.dangerBg,
  },
  primaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  shieldIconBox: {
    borderRadius: RADII.lg,
    padding: 8,
  },
  safeIconBox: {
    backgroundColor: COLORS.safeBg,
  },
  dangerIconBox: {
    backgroundColor: COLORS.dangerBg,
  },
  primaryNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  primaryName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  gpsLiveBadge: {
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.sm,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  gpsLiveText: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.safe,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  statusPill: {
    borderRadius: RADII.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusSafe: {
    backgroundColor: COLORS.safeBg,
  },
  statusAdvisory: {
    backgroundColor: COLORS.warningBg,
  },
  statusDanger: {
    backgroundColor: COLORS.dangerBg,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  statusTextSafe: {
    color: COLORS.safe,
  },
  statusTextAdvisory: {
    color: COLORS.warning,
  },
  statusTextDanger: {
    color: COLORS.danger,
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...SHADOWS.sm,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  emptyStateSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 16,
    maxWidth: 280,
  },
  addFirstBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.safe,
    borderRadius: RADII.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    marginTop: 6,
    ...SHADOWS.glowSafe,
  },
  addFirstBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#070A0F",
  },
  placesList: {
    gap: 8,
  },
  placeCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...SHADOWS.sm,
  },
  placeCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  placeCardTexts: {
    flex: 1,
  },
  placeLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  placeName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  placeCoords: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  placeCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  sirenCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
    ...SHADOWS.sm,
  },
  sirenHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sirenTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  sirenSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  sirenBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    paddingVertical: 12,
    gap: 7,
    marginTop: 4,
  },
  sirenBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.danger,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: COLORS.safeBorder,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  modalCloseBtn: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    padding: 6,
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  selectedCoordsBox: {
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.md,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  selectedCoordsText: {
    fontSize: 11,
    color: COLORS.safe,
    fontWeight: "700",
  },
  saveBtn: {
    backgroundColor: COLORS.safe,
    borderRadius: RADII.lg,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#070A0F",
  },
});
