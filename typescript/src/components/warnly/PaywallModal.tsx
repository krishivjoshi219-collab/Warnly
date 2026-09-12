import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Crown, X, Check, Sparkles } from "../Icons";
import { OFFERINGS, usePro } from "../../lib/warnly/pro";
import { COLORS, RADII, FONTS } from "../../theme";

const FEATURES = [
  "Multi-Zone Family Shield — track unlimited places",
  "Critical Siren & Do Not Disturb override",
  "Hyper-local 5 km precision radar",
  "Upstream flash flood & glacial surge alerts",
  "Ad-free, high-priority background refresh",
];

export const PaywallModal: React.FC = () => {
  const { paywallOpen, closePaywall, paywallReason, toggleProDemo, isPro } = usePro();
  const [selected, setSelected] = useState<string>("yearly");

  if (!paywallOpen) return null;

  const activate = () => {
    if (!isPro) toggleProDemo();
    closePaywall();
  };

  return (
    <Modal
      visible={paywallOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closePaywall}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.proBadge}>
              <Crown size={14} color={COLORS.safe} />
              <Text style={styles.proBadgeText}>WARNLY PRO</Text>
            </View>
            <TouchableOpacity
              onPress={closePaywall}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <Text style={styles.heading}>Never Miss a Critical Warning</Text>
            <Text style={styles.subheading}>
              {paywallReason || "Protect every place and person that matters to you."}
            </Text>

            {/* Features List */}
            <View style={styles.featuresList}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.checkBubble}>
                    <Check size={11} color={COLORS.safe} />
                  </View>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            {/* Offerings Selector */}
            <View style={styles.offeringsContainer}>
              {OFFERINGS.map((o) => {
                const active = selected === o.id;
                return (
                  <TouchableOpacity
                    key={o.id}
                    style={[
                      styles.offeringCard,
                      active && styles.offeringCardActive,
                    ]}
                    onPress={() => setSelected(o.id)}
                    activeOpacity={0.8}
                  >
                    <View>
                      <View style={styles.offeringTitleRow}>
                        <Text style={styles.offeringTitle}>{o.title}</Text>
                        {o.badge && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountBadgeText}>{o.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.offeringNote}>{o.note}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceText}>{o.price}</Text>
                      <Text style={styles.periodText}>{o.period}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={activate}
              activeOpacity={0.85}
            >
              <Sparkles size={16} color="#070A0F" />
              <Text style={styles.ctaBtnText}>
                {selected === "lifetime" ? "Unlock Lifetime Access" : "Start 3-Day Free Trial"}
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
    borderColor: COLORS.safeBorder,
    maxHeight: "90%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.safe,
    letterSpacing: 0.5,
  },
  closeBtn: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
  },
  bodyContent: {
    paddingVertical: 10,
    gap: 14,
  },
  heading: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  subheading: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: -8,
  },
  featuresList: {
    gap: 10,
    paddingVertical: 4,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkBubble: {
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.full,
    padding: 3,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  offeringsContainer: {
    gap: 8,
  },
  offeringCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  offeringCardActive: {
    borderColor: COLORS.safe,
    backgroundColor: "rgba(0, 229, 255, 0.08)",
  },
  offeringTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  offeringTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  discountBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderRadius: RADII.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#10B981",
  },
  offeringNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  periodText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.safe,
    borderRadius: RADII.xl,
    paddingVertical: 14,
    gap: 8,
    marginTop: 6,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#070A0F",
  },
});
