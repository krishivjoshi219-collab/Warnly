import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
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
} from "../components/Icons";
import { useWarnly } from "../lib/warnly/store";
import { usePro } from "../lib/warnly/pro";
import { weatherCodeInfo } from "../lib/warnly/weather";
import { LocationSearch } from "../components/warnly/LocationSearch";
import { COLORS, RADII, FONTS } from "../theme";

const renderWeatherIcon = (iconName: string, size = 32, color = COLORS.safe) => {
  switch (iconName) {
    case "sun":
      return <Sun size={size} color={color} />;
    case "cloud-sun":
      return <CloudSun size={size} color={color} />;
    case "cloud":
      return <Cloud size={size} color={color} />;
    case "cloud-fog":
      return <CloudFog size={size} color={color} />;
    case "cloud-drizzle":
      return <CloudDrizzle size={size} color={color} />;
    case "cloud-rain":
      return <CloudRain size={size} color={color} />;
    case "snowflake":
      return <Snowflake size={size} color={color} />;
    case "cloud-lightning":
      return <CloudLightning size={size} color={color} />;
    default:
      return <CloudSun size={size} color={color} />;
  }
};

export const WeatherScreen: React.FC = () => {
  const { weather, isLoading, error, setCustomCoords, requestLocation, locating } =
    useWarnly();
  const { units, setUnits } = usePro();

  const isImp = units === "imperial";
  const fmtT = (c: number) => (isImp ? Math.round(c * 1.8 + 32) : Math.round(c));
  const unitSym = isImp ? "°F" : "°C";

  const wx = weather ? weatherCodeInfo(weather.weatherCode, weather.isDay) : null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Title Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Weather</Text>
          <Text style={styles.headerSubtitle}>
            {weather?.place ?? "Live atmospheric conditions"}
          </Text>
        </View>
        <Text style={styles.brandBadge}>WEATHER</Text>
      </View>

      {/* Location Search Bar */}
      <LocationSearch
        onSelectCoords={setCustomCoords}
        onUseGPS={requestLocation}
        locating={locating}
      />

      {isLoading && !weather ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.safe} />
          <Text style={styles.loadingText}>Fetching atmospheric telemetry…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load weather: {error.message}</Text>
        </View>
      ) : weather ? (
        <>
          {/* Main Temperature Card */}
          <View style={styles.mainTempCard}>
            {/* Unit Switcher Top-Right */}
            <View style={styles.unitSwitcher}>
              <TouchableOpacity
                style={[
                  styles.unitBtn,
                  !isImp && styles.unitBtnActive,
                ]}
                onPress={() => setUnits("metric")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.unitBtnText,
                    !isImp && styles.unitBtnTextActive,
                  ]}
                >
                  °C
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.unitBtn,
                  isImp && styles.unitBtnActive,
                ]}
                onPress={() => setUnits("imperial")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.unitBtnText,
                    isImp && styles.unitBtnTextActive,
                  ]}
                >
                  °F
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.placeRow}>
              <MapPin size={13} color={COLORS.safe} />
              <Text style={styles.placeText}>{weather.place}</Text>
            </View>

            <View style={styles.iconCenter}>
              {renderWeatherIcon(wx?.icon ?? "cloud-sun", 46, COLORS.safe)}
            </View>

            <Text style={styles.bigTemp}>
              {fmtT(weather.temperature)}{unitSym}
            </Text>

            <Text style={styles.conditionText}>{wx?.label}</Text>
            <Text style={styles.subTempText}>
              Feels like {fmtT(weather.apparent)}{unitSym} · Dew point {fmtT(weather.dewPoint)}{unitSym}
            </Text>
          </View>

          {/* Real-time Rain Forecast Box */}
          <View style={styles.rainBox}>
            <View style={styles.rainHeaderRow}>
              <Umbrella size={18} color={COLORS.safe} />
              <View style={styles.rainHeaderText}>
                <Text style={styles.rainBoxTitle}>Rain Forecast Update</Text>
                <Text style={styles.rainBoxSummary}>{weather.rainSummary}</Text>
              </View>
            </View>

            {/* 15-Minute Rain Probability Micro-Chart */}
            {weather.minutely15.length > 0 && (
              <View style={styles.rainMicroChart}>
                <Text style={styles.chartTitle}>NEXT 2 HOURS (15-MIN INTERVALS)</Text>
                <View style={styles.barsContainer}>
                  {weather.minutely15.map((m, idx) => {
                    const isRain = m.precip > 0.05;
                    const heightPct = isRain ? Math.min(100, Math.max(25, m.precip * 50)) : 12;
                    return (
                      <View key={m.time || idx} style={styles.barColumn}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${heightPct}%`,
                              backgroundColor: isRain ? "#38BDF8" : COLORS.backgroundElevated,
                            },
                          ]}
                        />
                        <Text style={styles.barLabel}>+{idx * 15}m</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* 4-Metric Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Wind size={14} color={COLORS.safe} />
                <Text style={styles.metricCardLabel}>WIND</Text>
              </View>
              <Text style={styles.metricCardValue}>
                {Math.round(weather.windSpeed)} km/h
              </Text>
              <Text style={styles.metricCardHint}>
                Gusts {Math.round(weather.windGust)} km/h · {weather.windDirection}°
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Droplets size={14} color="#38BDF8" />
                <Text style={styles.metricCardLabel}>HUMIDITY</Text>
              </View>
              <Text style={styles.metricCardValue}>{weather.humidity}%</Text>
              <Text style={styles.metricCardHint}>
                Dew point {Math.round(weather.dewPoint)}°C
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Gauge size={14} color={COLORS.warning} />
                <Text style={styles.metricCardLabel}>PRESSURE</Text>
              </View>
              <Text style={styles.metricCardValue}>
                {Math.round(weather.pressure)} hPa
              </Text>
              <Text style={styles.metricCardHint}>Surface MSL pressure</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Zap size={14} color={COLORS.warning} />
                <Text style={styles.metricCardLabel}>CAPE ENERGY</Text>
              </View>
              <Text style={styles.metricCardValue}>
                {Math.round(weather.cape)} J/kg
              </Text>
              <Text style={styles.metricCardHint}>
                Lifted Index {weather.liftedIndex.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* 12-Hour Hourly Trend */}
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendTitle}>12-Hour Hourly Outlook</Text>
              <Text style={styles.trendSub}>Temp & Rain Probability</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.hourlyContainer}>
                {weather.hourly.map((h) => (
                  <View key={h.time} style={styles.hourlyItem}>
                    <Text style={styles.hourlyTemp}>{fmtT(h.temp)}°</Text>
                    <View style={styles.hourlyBarTrack}>
                      <View
                        style={[
                          styles.hourlyBarFill,
                          { height: Math.max(8, h.precipProb * 0.45) },
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

          {/* 7-Day Daily Forecast List */}
          <View style={styles.dailyCard}>
            <View style={styles.dailyHeader}>
              <Text style={styles.dailyTitle}>7-Day Real Daily Forecast</Text>
              <Text style={styles.dailySub}>Open-Meteo Global Sync</Text>
            </View>

            <View style={styles.dailyList}>
              {weather.daily.map((d, i) => {
                const dayWx = weatherCodeInfo(d.code);
                const dayName =
                  i === 0
                    ? "Today"
                    : new Date(d.date).toLocaleDateString(undefined, { weekday: "short" });

                return (
                  <View key={d.date} style={styles.dailyItem}>
                    <View style={styles.dailyDateCol}>
                      <Text style={styles.dailyDayName}>{dayName}</Text>
                      <Text style={styles.dailyDateNum}>
                        {new Date(d.date).toLocaleDateString(undefined, {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </Text>
                    </View>

                    <View style={styles.dailyIconCol}>
                      {renderWeatherIcon(dayWx.icon, 18, COLORS.safe)}
                      <Text style={styles.dailyCondition}>{dayWx.label}</Text>
                    </View>

                    <View style={styles.dailyRainCol}>
                      <Droplets size={10} color="#38BDF8" />
                      <Text style={styles.dailyRainText}>{d.precipProb}%</Text>
                    </View>

                    <View style={styles.dailyTempCol}>
                      <Text style={styles.dailyTempMax}>{fmtT(d.max)}°</Text>
                      <Text style={styles.dailyTempMin}>{fmtT(d.min)}°</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </>
      ) : null}
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    padding: 16,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
  },
  mainTempCard: {
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  unitSwitcher: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 2,
  },
  unitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.full,
  },
  unitBtnActive: {
    backgroundColor: COLORS.safe,
  },
  unitBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
  },
  unitBtnTextActive: {
    color: "#070A0F",
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  placeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  iconCenter: {
    marginVertical: 4,
  },
  bigTemp: {
    fontSize: 54,
    fontWeight: "900",
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  subTempText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rainBox: {
    backgroundColor: "rgba(0, 229, 255, 0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    padding: 14,
    gap: 10,
  },
  rainHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rainHeaderText: {
    flex: 1,
  },
  rainBoxTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  rainBoxSummary: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rainMicroChart: {
    borderTopWidth: 1,
    borderTopColor: COLORS.safeBorder + "60",
    paddingTop: 8,
  },
  chartTitle: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 48,
    gap: 6,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "80%",
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 8,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 4,
  },
  metricCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricCardLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  metricCardValue: {
    fontSize: 15,
    fontWeight: "900",
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  metricCardHint: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  trendCard: {
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 8,
  },
  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trendTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  trendSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  hourlyContainer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    alignItems: "flex-end",
  },
  hourlyItem: {
    alignItems: "center",
    gap: 4,
  },
  hourlyTemp: {
    fontSize: 10,
    fontWeight: "800",
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  hourlyBarTrack: {
    height: 48,
    width: 14,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: 3,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  hourlyBarFill: {
    backgroundColor: COLORS.safe,
    borderRadius: 3,
  },
  hourlyTime: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
  },
  hourlyProb: {
    fontSize: 8,
    fontWeight: "700",
    color: "#38BDF8",
  },
  dailyCard: {
    backgroundColor: "rgba(18, 26, 39, 0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  dailyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dailyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  dailySub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  dailyList: {
    gap: 8,
  },
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + "40",
  },
  dailyDateCol: {
    width: 50,
  },
  dailyDayName: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  dailyDateNum: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  dailyIconCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  dailyCondition: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  dailyRainCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    width: 44,
  },
  dailyRainText: {
    fontSize: 10,
    color: "#38BDF8",
    fontWeight: "700",
  },
  dailyTempCol: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dailyTempMax: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  dailyTempMin: {
    fontSize: 11,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
  },
});
