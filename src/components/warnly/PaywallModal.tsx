import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Crown, X, Check, Sparkles, RefreshCw } from "../Icons";
import { OFFERINGS, usePro } from "../../lib/warnly/pro";
import { COLORS, RADII, FONTS } from "../../theme";
import type { PurchasesPackage } from "react-native-purchases";

const FEATURES = [
  "Multi-Zone Family Shield — track unlimited places",
  "Critical Siren & Do Not Disturb hardware override",
  "Hyper-local 5 km precision radar & METAR nowcasts",
  "Upstream flash flood & glacial surge alerts",
  "Ad-free, high-priority background refresh",
];

export const PaywallModal: React.FC = () => {
  const {
    paywallOpen,
    closePaywall,
    paywallReason,
    toggleProDemo,
    isPro,
    rcPackages,
    purchasePackage,
    restorePurchases,
    rcInitialized,
    loadingOfferings,
  } = usePro();

  const [selectedId, setSelectedId] = useState<string>("yearly");
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!paywallOpen) return null;

  const handlePurchase = async () => {
    setFeedback(null);

    // If RevenueCat has loaded real packages, use the RevenueCat purchase flow
    if (rcPackages && rcPackages.length > 0) {
      const targetPkg = rcPackages.find((p) => p.identifier === selectedId) || rcPackages[0];
      if (targetPkg) {
        setPurchasing(true);
        try {
          const res = await purchasePackage(targetPkg);
          if (res.success) {
            setFeedback("Subscription activated successfully!");
            setTimeout(() => {
              closePaywall();
            }, 1200);
          } else if (res.userCancelled) {
            setFeedback(null);
          } else if (res.error) {
            setFeedback(res.error);
          }
        } catch (err: any) {
          setFeedback(err?.message || "Purchase failed. Check sandbox account.");
        } finally {
          setPurchasing(false);
        }
        return;
      }
    }

    // Fallback sandbox / demo mode
    if (!isPro) toggleProDemo();
    setFeedback("Sandbox demo tier activated!");
    setTimeout(() => {
      closePaywall();
    }, 800);
  };

  const handleRestore = async () => {
    setRestoring(true);
    setFeedback(null);
    try {
      const res = await restorePurchases();
      if (res.success && res.isPro) {
        setFeedback("Purchases restored! Warnly Pro active.");
        setTimeout(() => closePaywall(), 1200);
      } else {
        setFeedback("No active subscriptions found for this account.");
      }
    } catch (err: any) {
      setFeedback(err?.message || "Failed to restore purchases.");
    } finally {
      setRestoring(false);
    }
  };

  const hasRcPackages = rcPackages && rcPackages.length > 0;

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
              <Text style={styles.proBadgeText}>WARNLY ASTRA PRO</Text>
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

            {/* Offerings Selector (Dynamic RevenueCat packages or local fallback) */}
            <View style={styles.offeringsContainer}>
              {loadingOfferings && (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={COLORS.safe} />
                  <Text style={styles.loadingText}>Fetching RevenueCat Offerings...</Text>
                </View>
              )}

              {hasRcPackages
                ? rcPackages.map((pkg: PurchasesPackage) => {
                    const active = selectedId === pkg.identifier;
                    const isYearly = pkg.identifier.toLowerCase().includes("year") || pkg.packageType === "ANNUAL";
                    return (
                      <TouchableOpacity
                        key={pkg.identifier}
                        style={[
                          styles.offeringCard,
                          active && styles.offeringCardActive,
                        ]}
                        onPress={() => setSelectedId(pkg.identifier)}
                        activeOpacity={0.8}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={styles.offeringTitleRow}>
                            <Text style={styles.offeringTitle}>
                              {pkg.product.title || pkg.identifier}
                            </Text>
                            {isYearly && (
                              <View style={styles.discountBadge}>
                                <Text style={styles.discountBadgeText}>Save 45%</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.offeringNote}>
                            {pkg.product.description || "Full Astra Defense Access"}
                          </Text>
                        </View>
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceText}>{pkg.product.priceString}</Text>
                          <Text style={styles.periodText}>
                            {isYearly ? "per year" : "per month"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                : OFFERINGS.map((o) => {
                    const active = selectedId === o.id;
                    return (
                      <TouchableOpacity
                        key={o.id}
                        style={[
                          styles.offeringCard,
                          active && styles.offeringCardActive,
                        ]}
                        onPress={() => setSelectedId(o.id)}
                        activeOpacity={0.8}
                      >
                        <View style={{ flex: 1 }}>
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

            {/* Feedback Message */}
            {feedback && (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackText}>{feedback}</Text>
              </View>
            )}

            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.ctaBtn, purchasing && styles.ctaBtnDisabled]}
              onPress={handlePurchase}
              disabled={purchasing}
              activeOpacity={0.85}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color="#070A0F" />
              ) : (
                <>
                  <Sparkles size={16} color="#070A0F" />
                  <Text style={styles.ctaBtnText}>
                    {selectedId === "lifetime"
                      ? "Unlock Lifetime Access"
                      : "Start 3-Day Free Trial"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Restore Purchases & Sandbox Footer */}
            <View style={styles.footerRow}>
              <TouchableOpacity
                onPress={handleRestore}
                disabled={restoring}
                style={styles.restoreBtn}
                activeOpacity={0.7}
              >
                {restoring ? (
                  <ActivityIndicator size="small" color={COLORS.textSecondary} />
                ) : (
                  <>
                    <RefreshCw size={12} color={COLORS.textSecondary} />
                    <Text style={styles.restoreBtnText}>Restore Purchases</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
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
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 11,
    color: COLORS.safe,
    fontFamily: FONTS.mono,
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
    marginLeft: 8,
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
  feedbackBox: {
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 11,
    color: COLORS.safe,
    fontWeight: "600",
    textAlign: "center",
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
  ctaBtnDisabled: {
    opacity: 0.7,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#070A0F",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  restoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  restoreBtnText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});
