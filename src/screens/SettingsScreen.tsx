import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
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
} from '../components/Icons';
import { usePro, formatDistance } from '../lib/warnly/pro';
import { useWarnly } from '../lib/warnly/store';
import { checkAllFeedHealth, type FeedStatus } from '../lib/warnly/feed-health';
import { PaywallModal } from '../components/warnly/PaywallModal';
import { GuideModal } from '../components/warnly/GuideModal';
import { NativeEmergency } from '../lib/warnly/native-emergency';
import { startSirenAudio, stopSirenAudio } from '../lib/warnly/siren';
import {
  FadeIn,
  GlassCard,
  GlowButton,
  PulseDot,
  ScreenHeader,
  SectionHeader,
  StatusBadge,
  Divider,
} from '../components/ui';
import { COLORS, RADII, FONTS, SHADOWS, SPACING, SAFE_TOP_PADDING } from '../theme';

export const SettingsScreen: React.FC = () => {
  const {
    isPro, toggleProDemo, openPaywall, units, setUnits,
    alertRadiusKm, setAlertRadiusKm, startSiren, stopSiren, sirenActive,
    apiKeys, setApiKey,
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
    } catch { /* ignore */ }
  };

  useEffect(() => {
    NativeEmergency.setupEmergencyNotificationChannel();
    checkDnd();
    runFeedCheck();
  }, []);

  const runFeedCheck = async () => {
    setCheckingFeeds(true);
    try {
      const results = await checkAllFeedHealth();
      setFeeds(results);
    } catch { /* ignore */ }
    finally { setCheckingFeeds(false); }
  };

  const radii = [5, 10, 15, 20, 25];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <FadeIn duration={300}>
        <ScreenHeader
          title="Settings"
          subtitle="Safety zones, units & emergency audio"
          badge="CONFIG"
          badgeVariant="muted"
        />
      </FadeIn>

      {/* ── Pro Card ── */}
      <FadeIn duration={380} delay={50}>
        <View style={[styles.proCard, isPro && styles.proCardActive]}>
          {/* Top edge highlight for PRO */}
          {isPro && <View style={styles.proCardHighlight} />}

          <View style={styles.proCardTop}>
            <View style={[styles.proIconBox, isPro && { backgroundColor: COLORS.safeBg }]}>
              <Crown size={20} color={isPro ? COLORS.safe : COLORS.textSecondary} />
            </View>
            <View style={styles.proCardTitles}>
              <View style={styles.proTitleRow}>
                <Text style={styles.proName}>Warnly Pro</Text>
                <StatusBadge
                  label={isPro ? 'ACTIVE' : 'FREE'}
                  variant={isPro ? 'safe' : 'muted'}
                  dot={isPro}
                  pulsing={isPro}
                />
              </View>
              <Text style={styles.proDesc}>
                {isPro
                  ? 'Unlimited places, priority radar, critical siren alerts.'
                  : 'Upgrade to unlock unlimited Family Shield & precision alerts.'}
              </Text>
            </View>
          </View>

          <Divider />

          <View style={styles.proActions}>
            {!isPro && (
              <GlowButton
                label="Upgrade to Pro"
                variant="primary"
                icon={<Sparkles size={13} color="#000000" />}
                onPress={() => openPaywall('Unlock all features with Warnly Pro.')}
                style={{ flex: 1 }}
              />
            )}
            <TouchableOpacity
              style={[styles.ghostBtn, !isPro && { flex: 0 }]}
              onPress={toggleProDemo}
              activeOpacity={0.8}
            >
              <Text style={styles.ghostBtnText}>{isPro ? 'Reset Demo' : 'Demo Mode'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FadeIn>

      {/* ── Storm Simulator ── */}
      <FadeIn duration={380} delay={80}>
        <SectionHeader label="Simulator" />
        <GlassCard
          style={[simulateStorm && { borderColor: COLORS.dangerBorder, ...SHADOWS.glowDanger }]}
          noPadding
        >
          <View style={styles.settingRow}>
            <View style={[styles.settingIconBox, simulateStorm && { backgroundColor: COLORS.dangerBg }]}>
              <Zap size={18} color={simulateStorm ? COLORS.danger : COLORS.warning} />
            </View>
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={styles.settingTitle}>Storm Simulator</Text>
                {simulateStorm && (
                  <StatusBadge label="LIVE DEMO" variant="danger" dot pulsing />
                )}
              </View>
              <Text style={styles.settingDesc}>
                Simulates active thunderstorm (code 95) with decaying strikes.
              </Text>
            </View>
            <Switch
              value={simulateStorm}
              onValueChange={toggleSimulateStorm}
              trackColor={{ false: COLORS.border, true: COLORS.danger }}
              thumbColor={simulateStorm ? '#FFFFFF' : COLORS.textMuted}
            />
          </View>
        </GlassCard>
      </FadeIn>

      {/* ── Units ── */}
      <FadeIn duration={380} delay={100}>
        <SectionHeader label="Measurement Units" />
        <View style={styles.unitsRow}>
          {(['metric', 'imperial'] as const).map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.unitCard, units === u && styles.unitCardActive]}
              onPress={() => setUnits(u)}
              activeOpacity={0.8}
            >
              {units === u && (
                <View style={styles.unitCheck}>
                  <CheckCircle2 size={12} color="#FFFFFF" />
                </View>
              )}
              <Text style={[styles.unitCardTitle, units === u && { color: '#FFFFFF' }]}>
                {u === 'metric' ? 'Metric' : 'Imperial'}
              </Text>
              <Text style={styles.unitCardSub}>
                {u === 'metric' ? 'km · °C · mm/hr' : 'mi · °F · in/hr'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </FadeIn>

      {/* ── Alert Radius ── */}
      <FadeIn duration={380} delay={120}>
        <SectionHeader
          label="Strike Alert Radius"
          right={
            <Text style={styles.radiusValue}>{formatDistance(alertRadiusKm, units)}</Text>
          }
        />
        <GlassCard noPadding>
          <View style={styles.radiiPicker}>
            {radii.map((km) => {
              const active = alertRadiusKm === km;
              return (
                <TouchableOpacity
                  key={km}
                  style={[styles.radiusChip, active && styles.radiusChipActive]}
                  onPress={() => setAlertRadiusKm(km)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.radiusChipText, active && styles.radiusChipTextActive]}>
                    {km} km
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.radiusHint}>
            Strikes within this distance trigger immediate shelter alarms.
          </Text>
        </GlassCard>
      </FadeIn>

      {/* ── Siren Test ── */}
      <FadeIn duration={380} delay={140}>
        <SectionHeader label="Emergency Siren" />
        <GlassCard noPadding>
          <View style={styles.sirenCardInner}>
            <View style={styles.sirenCardHeader}>
              <View style={[styles.settingIconBox, { backgroundColor: COLORS.dangerBg, borderColor: COLORS.dangerBorder }]}>
                <BellRing size={18} color={COLORS.danger} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Two-Tone Emergency Siren</Text>
                <Text style={styles.settingDesc}>
                  760Hz/960Hz dual-frequency oscillation that penetrates background noise.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.sirenBtn,
                sirenActive && { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
              ]}
              onPress={() => sirenActive ? stopSiren() : startSiren()}
              activeOpacity={0.85}
            >
              {sirenActive && <PulseDot color="#FFFFFF" size={6} speed={600} />}
              <Volume2 size={15} color={sirenActive ? '#FFFFFF' : COLORS.danger} />
              <Text style={[styles.sirenBtnText, sirenActive && { color: '#FFFFFF' }]}>
                {sirenActive ? 'Stop Emergency Siren' : 'Test Two-Tone Siren'}
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </FadeIn>

      {/* ── DND Bypass ── */}
      <FadeIn duration={380} delay={160}>
        <SectionHeader
          label="Critical Alerts & DND Bypass"
          right={
            <StatusBadge
              label={isDndGranted ? 'DND ACTIVE' : 'PERMISSION NEEDED'}
              variant={isDndGranted ? 'safe' : 'warning'}
              dot
              pulsing={isDndGranted}
            />
          }
        />
        <GlassCard noPadding>
          <View style={styles.dndCardInner}>
            <Text style={styles.dndDesc}>
              Routes life-safety sirens through Android USAGE_ALARM (STREAM_ALARM) and sets high-priority notifications to punch through Do Not Disturb and Silent mode.
            </Text>
            <View style={styles.dndActions}>
              <TouchableOpacity
                style={[styles.dndBtn, isDndGranted ? styles.dndBtnGranted : styles.dndBtnRequired]}
                onPress={() => { NativeEmergency.requestDndPermission(); setTimeout(checkDnd, 2000); }}
                activeOpacity={0.85}
              >
                <Text style={[styles.dndBtnText, { color: isDndGranted ? COLORS.safe : COLORS.warning }]}>
                  {isDndGranted ? 'Configure DND Access' : 'Grant DND Override'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dndTestBtn}
                onPress={() => {
                  NativeEmergency.postCriticalAlert('WARNLY TEST', 'Life-safety breakthrough verified.');
                  startSirenAudio();
                  setTimeout(() => stopSirenAudio(), 4000);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.dndTestBtnText}>Test Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </FadeIn>

      {/* ── App State ── */}
      <FadeIn duration={380} delay={180}>
        <SectionHeader label="Installation & Offline State" />
        <GlassCard noPadding>
          <View style={styles.stateCardInner}>
            {[
              { label: 'App Architecture', value: 'Pure React Native', ok: true },
              { label: 'Offline Storage', value: 'Cached & Ready', ok: true },
            ].map((row, i) => (
              <View key={row.label} style={[styles.stateRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 4 }]}>
                <Text style={styles.stateLabel}>{row.label}</Text>
                <View style={styles.stateValueRow}>
                  {row.ok && <CheckCircle2 size={11} color={COLORS.safe} />}
                  <Text style={[styles.stateValue, row.ok && { color: COLORS.safe }]}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </GlassCard>
      </FadeIn>

      {/* ── Data Feed Health ── */}
      <FadeIn duration={380} delay={200}>
        <SectionHeader
          label="Real-Time Data Feeds"
          right={
            <TouchableOpacity
              style={styles.pingBtn}
              onPress={runFeedCheck}
              disabled={checkingFeeds}
              activeOpacity={0.8}
            >
              {checkingFeeds ? (
                <ActivityIndicator size="small" color={COLORS.safe} />
              ) : (
                <RefreshCw size={11} color={COLORS.safe} />
              )}
              <Text style={styles.pingBtnText}>{checkingFeeds ? 'Pinging…' : 'Ping All'}</Text>
            </TouchableOpacity>
          }
        />
        <GlassCard noPadding>
          <View style={styles.feedsList}>
            {feeds.length === 0 && !checkingFeeds && (
              <Text style={styles.feedsEmptyText}>Tap "Ping All" to check feed health</Text>
            )}
            {feeds.map((f, i) => (
              <View key={f.id} style={[styles.feedItem, i < feeds.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                <View style={styles.feedItemLeft}>
                  <View style={styles.feedNameRow}>
                    <PulseDot
                      color={f.status === 'online' ? COLORS.safe : COLORS.danger}
                      size={6}
                      speed={f.status === 'online' ? 2000 : 800}
                    />
                    <Text style={styles.feedName}>{f.name}</Text>
                  </View>
                  <Text style={styles.feedDesc} numberOfLines={1}>{f.description}</Text>
                  {f.error && <Text style={styles.feedError}>{f.error}</Text>}
                </View>
                <View style={styles.feedItemRight}>
                  <View style={[
                    styles.feedBadge,
                    { backgroundColor: f.status === 'online' ? COLORS.safeBg : COLORS.dangerBg }
                  ]}>
                    <Text style={[styles.feedBadgeText, { color: f.status === 'online' ? COLORS.safe : COLORS.danger }]}>
                      {f.status === 'online' ? `${f.latencyMs}ms` : 'OFFLINE'}
                    </Text>
                  </View>
                  {f.httpCode && <Text style={styles.feedCode}>HTTP {f.httpCode}</Text>}
                </View>
              </View>
            ))}
          </View>
        </GlassCard>
      </FadeIn>

      {/* ── Enterprise API Keys ── */}
      <FadeIn duration={380} delay={220}>
        <SectionHeader label="Enterprise API Keys" />
        <GlassCard noPadding>
          <View style={styles.apiKeysInner}>
            <Text style={styles.apiKeysDesc}>
              Add your custom API key if you subscribe to dedicated commercial tiers.
            </Text>
            {[
              { key: 'tomorrowIo' as const, label: 'TOMORROW.IO API KEY', placeholder: 'Enter Tomorrow.io key for sub-minute radar' },
              { key: 'openWeather' as const, label: 'OPENWEATHERMAP API KEY', placeholder: 'Enter OpenWeather OneCall 3.0 key' },
              { key: 'openMeteoCommercial' as const, label: 'OPEN-METEO COMMERCIAL KEY', placeholder: 'Enter commercial API key for unlimited calls' },
            ].map((field) => (
              <View key={field.key} style={styles.apiKeyGroup}>
                <Text style={styles.apiKeyLabel}>{field.label}</Text>
                <TextInput
                  style={styles.apiKeyInput}
                  value={apiKeys?.[field.key] ?? ''}
                  onChangeText={(t) => setApiKey(field.key, t)}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                />
              </View>
            ))}
          </View>
        </GlassCard>
      </FadeIn>

      {/* ── Guide Link ── */}
      <FadeIn duration={380} delay={240}>
        <TouchableOpacity
          style={styles.guideLinkCard}
          onPress={() => setGuideOpen(true)}
          activeOpacity={0.85}
        >
          <View style={styles.guideLinkLeft}>
            <View style={[styles.settingIconBox, { backgroundColor: COLORS.safeBg, borderColor: COLORS.safeBorder }]}>
              <BookOpen size={16} color={COLORS.safe} />
            </View>
            <Text style={styles.guideLinkText}>Disaster Evacuation Protocols</Text>
          </View>
          <ChevronRight size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
      </FadeIn>

      <PaywallModal />
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: SAFE_TOP_PADDING,
    paddingBottom: 110,
    gap: 12,
  },

  // ── Pro Card ──
  proCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 18,
    gap: 14,
    ...SHADOWS.md,
  },
  proCardActive: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...SHADOWS.glowPrimary,
  },
  proCardHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 1,
  },
  proCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  proIconBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADII.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  proCardTitles: { flex: 1 },
  proTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  proName: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  proDesc: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 16 },
  proActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  ghostBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: RADII.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },

  // ── Common setting row ──
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  settingIconBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADII.md,
    padding: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 2,
  },
  settingTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  settingDesc: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 15 },

  // ── Units ──
  unitsRow: { flexDirection: 'row', gap: 8 },
  unitCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    position: 'relative',
  },
  unitCardActive: {
    borderColor: 'rgba(255, 255, 255, 0.30)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  unitCheck: { position: 'absolute', top: 10, right: 10 },
  unitCardTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 2 },
  unitCardSub: { fontSize: 10, color: COLORS.textMuted },

  // ── Radius ──
  radiusValue: { fontSize: 13, fontWeight: '800', fontFamily: FONTS.mono, color: '#FFFFFF' },
  radiiPicker: {
    flexDirection: 'row',
    gap: 6,
    padding: 14,
    paddingBottom: 8,
  },
  radiusChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADII.lg,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  radiusChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    ...SHADOWS.glowPrimary,
  },
  radiusChipText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  radiusChipTextActive: { color: '#000000', fontWeight: '900' },
  radiusHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    paddingHorizontal: 14,
    paddingBottom: 12,
    lineHeight: 14,
  },

  // ── Siren ──
  sirenCardInner: { padding: 14, gap: 12 },
  sirenCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sirenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    paddingVertical: 12,
    gap: 7,
  },
  sirenBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.danger,
  },

  // ── DND ──
  dndCardInner: { padding: 14, gap: 12 },
  dndDesc: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 16 },
  dndActions: { flexDirection: 'row', gap: 8 },
  dndBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dndBtnGranted: {
    backgroundColor: 'rgba(16,185,129,0.10)',
    borderColor: 'rgba(16,185,129,0.28)',
  },
  dndBtnRequired: {
    backgroundColor: COLORS.warningBg,
    borderColor: COLORS.warningBorder,
  },
  dndBtnText: { fontSize: 12, fontWeight: '800' },
  dndTestBtn: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.backgroundElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dndTestBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.safe },

  // ── App State ──
  stateCardInner: { padding: 14, gap: 4 },
  stateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  stateLabel: { fontSize: 12, color: COLORS.textSecondary },
  stateValueRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stateValue: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },

  // ── Feed Health ──
  pingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  pingBtnText: { fontSize: 10, fontWeight: '700', color: COLORS.safe },
  feedsList: { padding: 12 },
  feedsEmptyText: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', paddingVertical: 8 },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 8,
  },
  feedItemLeft: { flex: 1 },
  feedNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 2 },
  feedName: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary },
  feedDesc: { fontSize: 9, color: COLORS.textMuted },
  feedError: { fontSize: 9, color: COLORS.danger, marginTop: 2 },
  feedItemRight: { alignItems: 'flex-end', gap: 3 },
  feedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  feedBadgeText: { fontSize: 9, fontWeight: '800', fontFamily: FONTS.mono },
  feedCode: { fontSize: 8, color: COLORS.textMuted, fontFamily: FONTS.mono },

  // ── API Keys ──
  apiKeysInner: { padding: 14, gap: 12 },
  apiKeysDesc: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 15 },
  apiKeyGroup: { gap: 5 },
  apiKeyLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.7 },
  apiKeyInput: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: COLORS.textPrimary,
  },

  // ── Guide Link ──
  guideLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  guideLinkLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  guideLinkText: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
});
