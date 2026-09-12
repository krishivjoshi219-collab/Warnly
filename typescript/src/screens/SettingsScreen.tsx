import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  Crown,
  Sparkles,
  Zap,
  Sliders,
  Radio,
  BellRing,
  Volume2,
  Activity,
  RefreshCw,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from "../components/Icons";
import { usePro, formatDistance } from "../lib/warnly/pro";
import { useWarnly } from "../lib/warnly/store";
import { checkAllFeedHealth, type FeedStatus } from "../lib/warnly/feed-health";
import { PaywallModal } from "../components/warnly/PaywallModal";
import { GuideModal } from "../components/warnly/GuideModal";
import { NativeEmergency } from "../lib/warnly/native-emergency";
import { COLORS, RADII, FONTS } from "../theme";

export const SettingsScreen: React.FC = () => {
  const {
    isPro,
    toggleProDemo,
    openPaywall,
    units,
    setUnits,
    alertRadiusKm,
    setAlertRadiusKm,
    startSiren,
    apiKeys,
    setApiKey,
  } = usePro();

  const { simulateStorm, toggleSimulateStorm } = useWarnly();
  const [feeds, setFeeds] = useState<FeedStatus[]>([]);
  const [checkingFeeds, setCheckingFeeds] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [isDndGranted, setIsDndGranted] = useState(false);

  const checkDnd = async () => {
    try {
      const granted = await NativeEmergency.checkDndPermission();
      setIsDndGranted(granted);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    NativeEmergency.setupEmergencyNotificationChannel();
    checkDnd();
  }, []);

  const runFeedCheck = async () => {
    setCheckingFeeds(true);
    try {
      const results = await checkAllFeedHealth();
      setFeeds(results);
    } catch {
      /* ignore */
    } finally {
      setCheckingFeeds(false);
    }
  };

  useEffect(() => {
    runFeedCheck();
  }, []);

  const radii = [5, 10, 15, 20, 25];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Title Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Safety zones, units & emergency audio
          </Text>
        </View>
        <Text style={styles.brandBadge}>CONFIG</Text>
      </View>

      {/* Warnly Pro Subscription Section */}
      <View style={styles.proCard}>
        <View style={styles.proHeader}>
          <View style={styles.crownIconBox}>
            <Crown size={18} color={COLORS.safe} />
          </View>
          <View style={styles.proTitleContainer}>
            <View style={styles.proTitleRow}>
              <Text style={styles.proTitleText}>Warnly Pro</Text>
              <View
                style={[
                  styles.proBadge,
                  isPro ? styles.proBadgeActive : styles.proBadgeFree,
                ]}
              >
                <Text
                  style={[
                    styles.proBadgeText,
                    isPro ? styles.proBadgeTextActive : styles.proBadgeTextFree,
                  ]}
                >
                  {isPro ? "ACTIVE" : "FREE PLAN"}
                </Text>
              </View>
            </View>
            <Text style={styles.proSubtitleText}>
              {isPro
                ? "Unlimited places, priority radar, and critical siren alerts."
                : "Upgrade to unlock unlimited Family Shield places & precision alerts."}
            </Text>
          </View>
        </View>

        <View style={styles.proButtonsRow}>
          {!isPro && (
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => openPaywall("Unlock all features with Warnly Pro.")}
              activeOpacity={0.8}
            >
              <Sparkles size={14} color="#070A0F" />
              <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={toggleProDemo}
            activeOpacity={0.8}
          >
            <Text style={styles.demoBtnText}>
              {isPro ? "Reset Demo Pro" : "Toggle Pro Demo"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Storm & Strike Simulator */}
      <View style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.iconBox,
                simulateStorm && { backgroundColor: COLORS.dangerBg },
              ]}
            >
              <Zap
                size={18}
                color={simulateStorm ? COLORS.danger : COLORS.warning}
              />
            </View>
            <View style={styles.settingTexts}>
              <View style={styles.titleWithBadge}>
                <Text style={styles.settingTitle}>Storm Simulator</Text>
                {simulateStorm && (
                  <View style={styles.liveDemoBadge}>
                    <Text style={styles.liveDemoBadgeText}>LIVE DEMO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.settingDesc}>
                Simulates active thunderstorm code (95) with decaying strikes.
              </Text>
            </View>
          </View>

          <Switch
            value={simulateStorm}
            onValueChange={toggleSimulateStorm}
            trackColor={{ false: COLORS.border, true: COLORS.danger }}
            thumbColor={simulateStorm ? "#FFFFFF" : COLORS.textMuted}
          />
        </View>
      </View>

      {/* Measurement Units */}
      <View style={styles.settingCard}>
        <View style={styles.cardHeaderSmall}>
          <Sliders size={13} color={COLORS.safe} />
          <Text style={styles.cardHeaderSmallTitle}>UNITS OF MEASUREMENT</Text>
        </View>

        <View style={styles.unitsRow}>
          <TouchableOpacity
            style={[
              styles.unitCard,
              units === "metric" && styles.unitCardActive,
            ]}
            onPress={() => setUnits("metric")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.unitCardTitle,
                units === "metric" && styles.unitCardTitleActive,
              ]}
            >
              Metric
            </Text>
            <Text style={styles.unitCardSub}>Kilometers (km) · °C · mm/hr</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.unitCard,
              units === "imperial" && styles.unitCardActive,
            ]}
            onPress={() => setUnits("imperial")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.unitCardTitle,
                units === "imperial" && styles.unitCardTitleActive,
              ]}
            >
              Imperial
            </Text>
            <Text style={styles.unitCardSub}>Miles (mi) · °F · in/hr</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alert Monitoring Radius */}
      <View style={styles.settingCard}>
        <View style={styles.radiusHeaderRow}>
          <View style={styles.cardHeaderSmall}>
            <Radio size={13} color={COLORS.safe} />
            <Text style={styles.cardHeaderSmallTitle}>STRIKE ALERT RING RADIUS</Text>
          </View>
          <Text style={styles.radiusValueText}>
            {formatDistance(alertRadiusKm, units)}
          </Text>
        </View>
        <Text style={styles.settingDesc}>
          Strikes detected within this distance trigger immediate shelter alarms.
        </Text>

        <View style={styles.radiiRow}>
          {radii.map((km) => {
            const active = alertRadiusKm === km;
            return (
              <TouchableOpacity
                key={km}
                style={[styles.radiusBtn, active && styles.radiusBtnActive]}
                onPress={() => setAlertRadiusKm(km)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.radiusBtnText,
                    active && styles.radiusBtnTextActive,
                  ]}
                >
                  {km} km
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Emergency Siren Audio Test */}
      <View style={styles.settingCard}>
        <View style={styles.cardHeaderSmall}>
          <BellRing size={13} color={COLORS.danger} />
          <Text style={styles.cardHeaderSmallTitle}>EMERGENCY SIREN AUDIO TEST</Text>
        </View>
        <Text style={styles.settingDesc}>
          Synthesizes a 760Hz/960Hz dual-frequency oscillation that penetrates background noise.
        </Text>
        <TouchableOpacity
          style={styles.sirenTestBtn}
          onPress={startSiren}
          activeOpacity={0.8}
        >
          <Volume2 size={15} color={COLORS.danger} />
          <Text style={styles.sirenTestBtnText}>
            Test Two-Tone Emergency Siren
          </Text>
        </TouchableOpacity>
      </View>

      {/* Critical Life-Safety & Do Not Disturb (DND) Bypass */}
      <View style={styles.settingCard}>
        <View style={styles.radiusHeaderRow}>
          <View style={styles.cardHeaderSmall}>
            <BellRing size={13} color={COLORS.safe} />
            <Text style={styles.cardHeaderSmallTitle}>CRITICAL ALERTS & DND BYPASS</Text>
          </View>
          <View
            style={[
              styles.dndBadge,
              { backgroundColor: isDndGranted ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)" },
            ]}
          >
            <Text
              style={[
                styles.dndBadgeText,
                { color: isDndGranted ? COLORS.safe : COLORS.warning },
              ]}
            >
              {isDndGranted ? "DND BYPASS ACTIVE" : "PERMISSION REQUIRED"}
            </Text>
          </View>
        </View>

        <Text style={styles.settingDesc}>
          Routes life-safety sirens through Android hardware USAGE_ALARM (STREAM_ALARM) and sets high-priority breakthrough notifications to punch through Do Not Disturb (DND) and Silent mode.
        </Text>

        <View style={styles.dndActionRow}>
          <TouchableOpacity
            style={[
              styles.dndBtn,
              isDndGranted ? styles.dndBtnGranted : styles.dndBtnRequired,
            ]}
            onPress={() => {
              NativeEmergency.requestDndPermission();
              setTimeout(checkDnd, 2000);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.dndBtnText}>
              {isDndGranted ? "Configure System DND Access" : "Grant DND Override Access"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dndTestBtn}
            onPress={() => {
              NativeEmergency.postCriticalAlert(
                "WARNLY CRITICAL TEST ALERT",
                "Life-safety breakthrough alert verified on high-priority alarm channel."
              );
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.dndTestBtnText}>Test Alert</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App & Offline Readiness State */}
      <View style={styles.settingCard}>
        <View style={styles.cardHeaderSmall}>
          <Smartphone size={13} color={COLORS.safe} />
          <Text style={styles.cardHeaderSmallTitle}>APP INSTALLATION & OFFLINE STATE</Text>
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>App Architecture</Text>
          <View style={styles.stateValueRow}>
            <CheckCircle2 size={12} color={COLORS.safe} />
            <Text style={styles.stateValueText}>Pure React Native Engine</Text>
          </View>
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>Offline Storage</Text>
          <Text style={[styles.stateValueText, { color: COLORS.safe }]}>
            Cached & Ready
          </Text>
        </View>
      </View>

      {/* Real-Time Data Feeds Live Health Monitor */}
      <View style={styles.settingCard}>
        <View style={styles.feedsHeader}>
          <View style={styles.feedsHeaderLeft}>
            <View style={styles.activityIconBox}>
              <Activity size={16} color={COLORS.safe} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Real-Time Data Feeds (Live Health)</Text>
              <Text style={styles.settingDesc}>
                Live round-trip ping monitor for all disaster networks
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.pingBtn}
            onPress={runFeedCheck}
            disabled={checkingFeeds}
            activeOpacity={0.8}
          >
            {checkingFeeds ? (
              <ActivityIndicator size="small" color={COLORS.safe} />
            ) : (
              <RefreshCw size={12} color={COLORS.safe} />
            )}
            <Text style={styles.pingBtnText}>
              {checkingFeeds ? "Pinging…" : "Test Feeds"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feeds List */}
        <View style={styles.feedsList}>
          {feeds.map((f) => (
            <View key={f.id} style={styles.feedItem}>
              <View style={styles.feedItemLeft}>
                <View style={styles.feedNameRow}>
                  <View
                    style={[
                      styles.feedStatusDot,
                      {
                        backgroundColor:
                          f.status === "online" ? COLORS.safe : COLORS.danger,
                      },
                    ]}
                  />
                  <Text style={styles.feedName}>{f.name}</Text>
                </View>
                <Text style={styles.feedDesc} numberOfLines={1}>
                  {f.description}
                </Text>
                {f.error && (
                  <Text style={styles.feedError}>{f.error}</Text>
                )}
              </View>
              <View style={styles.feedItemRight}>
                <View
                  style={[
                    styles.feedBadge,
                    {
                      backgroundColor:
                        f.status === "online" ? COLORS.safeBg : COLORS.dangerBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.feedBadgeText,
                      {
                        color:
                          f.status === "online" ? COLORS.safe : COLORS.danger,
                      },
                    ]}
                  >
                    {f.status === "online" ? `ONLINE (${f.latencyMs}ms)` : "OFFLINE"}
                  </Text>
                </View>
                {f.httpCode && (
                  <Text style={styles.feedHttpCode}>HTTP {f.httpCode}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Enterprise Custom API Keys Form */}
      <View style={styles.settingCard}>
        <Text style={styles.settingTitle}>Optional Enterprise API Keys</Text>
        <Text style={styles.settingDesc}>
          Add your custom API key if you subscribe to dedicated commercial tiers.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputFieldLabel}>TOMORROW.IO API KEY</Text>
          <TextInput
            style={styles.keyInput}
            value={apiKeys?.tomorrowIo ?? ""}
            onChangeText={(t) => setApiKey("tomorrowIo", t)}
            placeholder="Enter Tomorrow.io key for sub-minute radar"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputFieldLabel}>OPENWEATHERMAP API KEY</Text>
          <TextInput
            style={styles.keyInput}
            value={apiKeys?.openWeather ?? ""}
            onChangeText={(t) => setApiKey("openWeather", t)}
            placeholder="Enter OpenWeather OneCall 3.0 key"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputFieldLabel}>OPEN-METEO COMMERCIAL KEY</Text>
          <TextInput
            style={styles.keyInput}
            value={apiKeys?.openMeteoCommercial ?? ""}
            onChangeText={(t) => setApiKey("openMeteoCommercial", t)}
            placeholder="Enter commercial API key for unlimited calls"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
          />
        </View>
      </View>

      {/* Read Disaster Evacuation Protocols Button */}
      <TouchableOpacity
        style={styles.guideLinkCard}
        onPress={() => setGuideOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.guideLinkLeft}>
          <BookOpen size={16} color={COLORS.safe} />
          <Text style={styles.guideLinkText}>Read Disaster Evacuation Protocols</Text>
        </View>
        <ChevronRight size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      <PaywallModal />
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
  proCard: {
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    padding: 16,
    gap: 14,
  },
  proHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  crownIconBox: {
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.md,
    padding: 8,
  },
  proTitleContainer: {
    flex: 1,
  },
  proTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  proTitleText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  proBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  proBadgeActive: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  proBadgeFree: {
    backgroundColor: COLORS.safeBg,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  proBadgeTextActive: {
    color: "#10B981",
  },
  proBadgeTextFree: {
    color: COLORS.safe,
  },
  proSubtitleText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
    lineHeight: 15,
  },
  proButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  upgradeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.safe,
    borderRadius: RADII.lg,
    paddingVertical: 10,
    gap: 6,
  },
  upgradeBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#070A0F",
  },
  demoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.backgroundElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  settingCard: {
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconBox: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.md,
    padding: 8,
  },
  settingTexts: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  liveDemoBadge: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADII.sm,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  liveDemoBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.danger,
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  cardHeaderSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardHeaderSmallTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  unitsRow: {
    flexDirection: "row",
    gap: 8,
  },
  unitCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  unitCardActive: {
    borderColor: COLORS.safe,
    backgroundColor: "rgba(0, 229, 255, 0.08)",
  },
  unitCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textSecondary,
  },
  unitCardTitleActive: {
    color: COLORS.safe,
  },
  unitCardSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  radiusHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  radiusValueText: {
    fontSize: 13,
    fontWeight: "800",
    fontFamily: FONTS.mono,
    color: COLORS.safe,
  },
  radiiRow: {
    flexDirection: "row",
    gap: 6,
  },
  radiusBtn: {
    flex: 1,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    alignItems: "center",
  },
  radiusBtnActive: {
    backgroundColor: COLORS.safe,
    borderColor: COLORS.safe,
  },
  radiusBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textMuted,
  },
  radiusBtnTextActive: {
    color: "#070A0F",
  },
  sirenTestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    paddingVertical: 10,
    gap: 6,
  },
  sirenTestBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.danger,
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  stateLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  stateValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stateValueText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  feedsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  feedsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  activityIconBox: {
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.md,
    padding: 6,
  },
  pingBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pingBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.safe,
  },
  feedsList: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 8,
  },
  feedItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + "40",
  },
  feedItemLeft: {
    flex: 1,
  },
  feedNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  feedStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  feedName: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  feedDesc: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  feedError: {
    fontSize: 9,
    color: COLORS.danger,
    marginTop: 2,
  },
  feedItemRight: {
    alignItems: "flex-end",
  },
  feedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  feedBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    fontFamily: FONTS.mono,
  },
  feedHttpCode: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    marginTop: 2,
  },
  inputGroup: {
    gap: 4,
  },
  inputFieldLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  keyInput: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  guideLinkCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  guideLinkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  guideLinkText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  dndBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dndBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dndActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  dndBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADII.md,
    alignItems: "center",
    justifyContent: "center",
  },
  dndBtnGranted: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  dndBtnRequired: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  dndBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  dndTestBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADII.md,
    backgroundColor: COLORS.backgroundElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dndTestBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.safe,
  },
});
