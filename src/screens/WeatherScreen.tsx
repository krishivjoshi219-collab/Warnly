import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  Gauge,
  Zap,
  Umbrella,
  MapPin,
} from '../components/Icons';
import { useWarnly } from '../lib/warnly/store';
import { usePro } from '../lib/warnly/pro';
import { weatherCodeInfo } from '../lib/warnly/weather';
import { LocationSearch } from '../components/warnly/LocationSearch';
import {
  FadeIn,
  GlassCard,
  ScreenHeader,
  SectionHeader,
  Divider,
} from '../components/ui';
import { COLORS, RADII, FONTS, SHADOWS, SPACING, SAFE_TOP_PADDING } from '../theme';

const renderWeatherIcon = (iconName: string, size = 32, color = '#FFFFFF') => {
  switch (iconName) {
    case 'sun': return <Sun size={size} color={color} />;
    case 'cloud-sun': return <CloudSun size={size} color={color} />;
    case 'cloud': return <Cloud size={size} color={color} />;
    case 'cloud-fog': return <CloudFog size={size} color={color} />;
    case 'cloud-drizzle': return <CloudDrizzle size={size} color={color} />;
    case 'cloud-rain': return <CloudRain size={size} color={color} />;
    case 'snowflake': return <Snowflake size={size} color={color} />;
    case 'cloud-lightning': return <CloudLightning size={size} color={color} />;
    default: return <CloudSun size={size} color={color} />;
  }
};

export const WeatherScreen: React.FC = () => {
  const { weather, isLoading, error, setCustomCoords, requestLocation, locating, survival } = useWarnly();
  const { units, setUnits } = usePro();

  const isImp = units === 'imperial';
  const fmtT = (c: number) => (isImp ? Math.round(c * 1.8 + 32) : Math.round(c));
  const unitSym = isImp ? '°F' : '°C';

  const wx = weather ? weatherCodeInfo(weather.weatherCode, weather.isDay) : null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <FadeIn duration={300}>
        <ScreenHeader
          title="Weather"
          subtitle={weather?.place ?? 'Live atmospheric conditions'}
          badge="WEATHER"
          badgeVariant="safe"
        />
      </FadeIn>

      <LocationSearch
        onSelectCoords={setCustomCoords}
        onUseGPS={requestLocation}
        locating={locating}
      />

      {isLoading && !weather ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.safe} />
          <Text style={styles.loadingText}>Fetching atmospheric telemetry…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Failed to load weather: {error.message}</Text>
        </View>
      ) : weather ? (
        <>
          {/* ── Hero Temperature Card ── */}
          <FadeIn duration={400} delay={60}>
            <GlassCard noPadding style={styles.heroCard}>
              {/* Unit switcher */}
              <View style={styles.unitSwitcher}>
                {(['metric', 'imperial'] as const).map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitBtn, units === u && styles.unitBtnActive]}
                    onPress={() => setUnits(u)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.unitBtnText, units === u && styles.unitBtnTextActive]}>
                      {u === 'metric' ? '°C' : '°F'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.heroContent}>
                {/* Location */}
                <View style={styles.heroLocationRow}>
                  <MapPin size={11} color={COLORS.textTertiary} />
                  <Text style={styles.heroLocation}>{weather.place}</Text>
                </View>

                {/* Icon */}
                <View style={styles.heroIconWrap}>
                  {renderWeatherIcon(wx?.icon ?? 'cloud-sun', 52, COLORS.safe)}
                </View>

                {/* Temperature */}
                <Text style={styles.heroTemp}>
                  {fmtT(weather.temperature)}
                  <Text style={styles.heroTempUnit}>{unitSym}</Text>
                </Text>
                <Text style={styles.heroCondition}>{wx?.label}</Text>
                <Text style={styles.heroFeelsLike}>
                  Feels like {fmtT(weather.apparent)}{unitSym} · Dew {fmtT(weather.dewPoint)}{unitSym}
                </Text>

                {/* Wind + humidity quick row */}
                <View style={styles.heroQuickMetrics}>
                  <View style={styles.heroMetricItem}>
                    <Wind size={13} color={COLORS.safe} />
                    <Text style={styles.heroMetricText}>{Math.round(weather.windSpeed)} km/h</Text>
                  </View>
                  <View style={styles.heroMetricDivider} />
                  <View style={styles.heroMetricItem}>
                    <Droplets size={13} color={COLORS.accentSky} />
                    <Text style={styles.heroMetricText}>{weather.humidity}%</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </FadeIn>

          {/* ── Rain Forecast ── */}
          <FadeIn duration={380} delay={100}>
            <GlassCard noPadding style={styles.rainCard}>
              <View style={styles.rainCardInner}>
                <View style={styles.rainCardHeader}>
                  <View style={styles.rainCardIconWrap}>
                    <Umbrella size={18} color={COLORS.safe} />
                  </View>
                  <View style={styles.rainCardText}>
                    <Text style={styles.rainCardTitle}>Rain Forecast</Text>
                    <Text style={styles.rainCardSummary}>{weather.rainSummary}</Text>
                  </View>
                </View>

                {weather.minutely15.length > 0 && (
                  <>
                    <Divider />
                    <SectionHeader label="Next 2 Hours · 15-min intervals" />
                    <View style={styles.microBarsContainer}>
                      {weather.minutely15.map((m, idx) => {
                        const isRain = m.precip > 0.05;
                        const heightPct = isRain ? Math.min(100, Math.max(20, m.precip * 50)) : 10;
                        return (
                          <View key={m.time || idx} style={styles.microBarCol}>
                            <View
                              style={[
                                styles.microBar,
                                {
                                  height: `${heightPct}%`,
                                  backgroundColor: isRain
                                    ? COLORS.accentSky
                                    : COLORS.backgroundElevated,
                                  shadowColor: isRain ? COLORS.accentSky : 'transparent',
                                  shadowOpacity: isRain ? 0.5 : 0,
                                },
                              ]}
                            />
                            {idx % 2 === 0 && (
                              <Text style={styles.microBarLabel}>+{idx * 15}m</Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            </GlassCard>
          </FadeIn>

          {/* ── Native air + flood survival ── */}
          <FadeIn duration={380} delay={125}>
            <View style={styles.metricCard}>
              <Text style={styles.metricCardLabel}>SURVIVAL AIR</Text>
              <Text style={styles.metricCardValue}>{survival.air}</Text>
              <Text style={styles.metricCardHint}>{survival.flood}</Text>
            </View>
          </FadeIn>

          {/* ── 4-Metric Grid ── */}
          <FadeIn duration={380} delay={130}>
            <SectionHeader label="Atmospheric Metrics" />
            <View style={styles.metricsGrid}>
              {[
                {
                  icon: <Wind size={15} color={COLORS.safe} />,
                  label: 'WIND',
                  value: `${Math.round(weather.windSpeed)} km/h`,
                  hint: `Gusts ${Math.round(weather.windGust)} km/h · ${weather.windDirection}°`,
                  accent: COLORS.safe,
                },
                {
                  icon: <Droplets size={15} color={COLORS.accentSky} />,
                  label: 'HUMIDITY',
                  value: `${weather.humidity}%`,
                  hint: `Dew ${Math.round(weather.dewPoint)}°C`,
                  accent: COLORS.accentSky,
                },
                {
                  icon: <Gauge size={15} color={COLORS.warning} />,
                  label: 'PRESSURE',
                  value: `${Math.round(weather.pressure)} hPa`,
                  hint: 'Surface MSL',
                  accent: COLORS.warning,
                },
                {
                  icon: <Zap size={15} color={COLORS.warning} />,
                  label: 'CAPE',
                  value: `${Math.round(weather.cape)} J/kg`,
                  hint: `LI ${weather.liftedIndex.toFixed(1)}`,
                  accent: COLORS.danger,
                },
              ].map((m) => (
                <View key={m.label} style={styles.metricCard}>
                  <View style={styles.metricCardHeader}>
                    {m.icon}
                    <Text style={styles.metricCardLabel}>{m.label}</Text>
                  </View>
                  <Text style={[styles.metricCardValue, { color: m.accent }]}>{m.value}</Text>
                  <Text style={styles.metricCardHint}>{m.hint}</Text>
                </View>
              ))}
            </View>
          </FadeIn>

          {/* ── Hourly Trend ── */}
          <FadeIn duration={400} delay={160}>
            <GlassCard noPadding>
              <View style={styles.trendCardInner}>
                <SectionHeader label="12-Hour Hourly Outlook" right={<Text style={styles.trendSub}>Temp & Rain probability</Text>} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.hourlyRow}>
                    {weather.hourly.map((h) => (
                      <View key={h.time} style={styles.hourlyItem}>
                        <Text style={styles.hourlyTemp}>{fmtT(h.temp)}°</Text>
                        <View style={styles.hourlyBarTrack}>
                          <View
                            style={[
                              styles.hourlyBarFill,
                              { height: Math.max(6, h.precipProb * 0.44) },
                            ]}
                          />
                        </View>
                        <Text style={styles.hourlyTime}>
                          {new Date(h.time).getHours()}h
                        </Text>
                        <Text style={styles.hourlyProb}>{h.precipProb}%</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </GlassCard>
          </FadeIn>

          {/* ── 7-Day Forecast ── */}
          <FadeIn duration={400} delay={190}>
            <GlassCard noPadding>
              <View style={styles.dailyCardInner}>
                <SectionHeader
                  label="7-Day Forecast"
                  right={<Text style={styles.trendSub}>Open-Meteo Global Sync</Text>}
                />
                <View style={styles.dailyList}>
                  {weather.daily.map((d, i) => {
                    const dayWx = weatherCodeInfo(d.code);
                    const dayName =
                      i === 0
                        ? 'Today'
                        : new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' });
                    return (
                      <View key={d.date} style={[styles.dailyItem, i === 0 && styles.dailyItemFirst]}>
                        <View style={styles.dailyDate}>
                          <Text style={[styles.dailyDayName, i === 0 && { color: COLORS.safe }]}>
                            {dayName}
                          </Text>
                          <Text style={styles.dailyDateNum}>
                            {new Date(d.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                          </Text>
                        </View>
                        <View style={styles.dailyIcon}>
                          {renderWeatherIcon(dayWx.icon, 16, COLORS.safe)}
                          <Text style={styles.dailyCondition} numberOfLines={1}>{dayWx.label}</Text>
                        </View>
                        <View style={styles.dailyRain}>
                          <Droplets size={9} color={COLORS.accentSky} />
                          <Text style={styles.dailyRainText}>{d.precipProb}%</Text>
                        </View>
                        <View style={styles.dailyTemps}>
                          <Text style={styles.dailyTempMax}>{fmtT(d.max)}°</Text>
                          <Text style={styles.dailyTempMin}>{fmtT(d.min)}°</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </GlassCard>
          </FadeIn>
        </>
      ) : null}
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
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 14,
  },
  loadingText: { fontSize: 13, color: COLORS.textSecondary },
  errorBox: {
    padding: 16,
    borderRadius: RADII.xl,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  errorText: { fontSize: 12, color: COLORS.danger },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: COLORS.card,
    position: 'relative',
  },
  unitSwitcher: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 2,
    zIndex: 10,
  },
  unitBtn: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADII.full,
  },
  unitBtnActive: { backgroundColor: '#FFFFFF' },
  unitBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.textTertiary },
  unitBtnTextActive: { color: '#000000' },

  heroContent: {
    padding: 22,
    alignItems: 'center',
    gap: 2,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  heroLocation: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  heroIconWrap: { marginVertical: 6 },
  heroTemp: {
    fontSize: 64,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
    letterSpacing: -3,
    lineHeight: 70,
  },
  heroTempUnit: { fontSize: 32, fontWeight: '700', letterSpacing: 0 },
  heroCondition: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  heroFeelsLike: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  heroQuickMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 0,
    width: '80%',
    justifyContent: 'center',
  },
  heroMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  heroMetricDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  },
  heroMetricText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // ── Rain Card ──
  rainCard: {
    backgroundColor: 'rgba(0,229,255,0.05)',
    borderColor: COLORS.safeBorder,
  },
  rainCardInner: { padding: 14, gap: 8 },
  rainCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rainCardIconWrap: {
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  rainCardText: { flex: 1 },
  rainCardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  rainCardSummary: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, lineHeight: 16 },
  microBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 48,
    gap: 5,
    marginTop: 4,
  },
  microBarCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  microBar: {
    width: '75%',
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 2,
  },
  microBarLabel: {
    fontSize: 7,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  // ── Metrics Grid ──
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 3,
  },
  metricCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  metricCardLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.7 },
  metricCardValue: { fontSize: 18, fontWeight: '900', fontFamily: FONTS.mono },
  metricCardHint: { fontSize: 10, color: COLORS.textTertiary, marginTop: 1 },

  // ── Trend Card ──
  trendCardInner: { padding: 14, gap: 10 },
  trendSub: { fontSize: 10, color: COLORS.textMuted },
  hourlyRow: { flexDirection: 'row', gap: 14, paddingTop: 6, paddingBottom: 2, alignItems: 'flex-end' },
  hourlyItem: { alignItems: 'center', gap: 4 },
  hourlyTemp: { fontSize: 11, fontWeight: '700', fontFamily: FONTS.mono, color: COLORS.textPrimary },
  hourlyBarTrack: {
    height: 44,
    width: 12,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: 3,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  hourlyBarFill: {
    backgroundColor: COLORS.safe,
    borderRadius: 3,
  },
  hourlyTime: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted },
  hourlyProb: { fontSize: 8, fontWeight: '700', color: COLORS.accentSky },

  // ── Daily Card ──
  dailyCardInner: { padding: 14, gap: 10 },
  dailyList: { gap: 0 },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dailyItemFirst: {
    // no special style needed
  },
  dailyDate: { width: 52 },
  dailyDayName: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary },
  dailyDateNum: { fontSize: 9, color: COLORS.textMuted, marginTop: 1 },
  dailyIcon: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  dailyCondition: { fontSize: 11, color: COLORS.textSecondary },
  dailyRain: { flexDirection: 'row', alignItems: 'center', gap: 3, width: 42 },
  dailyRainText: { fontSize: 11, color: COLORS.accentSky, fontWeight: '700' },
  dailyTemps: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dailyTempMax: { fontSize: 13, fontWeight: '800', fontFamily: FONTS.mono, color: COLORS.textPrimary },
  dailyTempMin: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.textMuted },
});
