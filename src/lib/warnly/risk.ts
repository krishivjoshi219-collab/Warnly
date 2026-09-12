import type { Coords, RiskLevel, Strike, WeatherSnapshot } from "./types";

export const SAFETY_RADIUS_KM = 10;
export const OUTER_RADIUS_KM = 15;

const R = 6371;
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle (haversine) distance in km - geodesic model. */
export function distanceKm(a: Coords, b: Coords): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearingDeg(a: Coords, b: Coords): number {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Calibrated Truth-Verified Lightning Risk Assessment
 * 
 * If the weather is clear, sunny, or ordinary cloud cover with no strikes,
 * the probability is strictly 0% (SAFE).
 * No false alarms or fabricated danger when the sky is clear.
 */
export function gridProbability(
  weather: Pick<WeatherSnapshot, "cape" | "liftedIndex" | "precipProbability" | "weatherCode">,
  strikes: Strike[] = []
): number {
  const code = weather.weatherCode ?? 0;
  const isSevereThunder = code === 95 || code === 96 || code === 99;
  const isConvectiveStorm = code >= 80 && code <= 82;

  // If sky is clear/partly cloudy/light rain and ZERO strikes detected, probability is 0%
  if (strikes.length === 0 && !isSevereThunder && !isConvectiveStorm) {
    return 0;
  }

  const recentStrikes = strikes.filter((s) => s.ageMin <= 20);
  const innerBreaches = recentStrikes.filter((s) => s.distanceKm <= SAFETY_RADIUS_KM).length;
  const outerBreaches = recentStrikes.filter((s) => s.distanceKm <= OUTER_RADIUS_KM).length;
  const totalStrikes = strikes.length;

  let strikeThreat = 0;
  if (innerBreaches > 0) {
    strikeThreat = 65 + Math.min(30, innerBreaches * 10);
  } else if (outerBreaches > 0) {
    strikeThreat = 30 + Math.min(20, outerBreaches * 5);
  } else if (totalStrikes > 0) {
    strikeThreat = Math.min(20, totalStrikes * 3);
  }

  const codeThreat = isSevereThunder ? 35 : isConvectiveStorm ? 15 : 0;

  // Instability threat only added if actual thunderstorm triggers are present
  const hasTrigger = isSevereThunder || totalStrikes > 0;
  const fCape = clamp01((weather.cape ?? 0) / 3000);
  const fLi = clamp01((-(weather.liftedIndex ?? 0) + 1) / 8);
  const instabilityThreat = hasTrigger ? Math.round(15 * fCape + 10 * fLi) : 0;

  return Math.min(100, Math.max(0, strikeThreat + codeThreat + instabilityThreat));
}

export function riskLevel(probability: number, strikes: Strike[] = []): RiskLevel {
  const breach = strikes.some((s) => s.distanceKm <= SAFETY_RADIUS_KM && s.ageMin <= 20);
  if (breach || probability >= 65) return "danger";
  if (probability >= 25 || strikes.length > 0) return "advisory";
  return "safe";
}

export const levelMeta: Record<
  RiskLevel,
  { label: string; sub: string; color: string; ring: string; badge: string }
> = {
  safe: {
    label: "YOUR ZONE IS SAFE",
    sub: "0 strikes detected \u00B7 normal weather conditions",
    color: "var(--color-safe)",
    ring: "shadow-[0_0_60px_-18px_var(--color-safe)]",
    badge: "bg-safe/15 text-safe border-safe/30",
  },
  advisory: {
    label: "LIGHTNING ADVISORY",
    sub: "Thunderstorm activity detected within 25 km",
    color: "var(--color-advisory)",
    ring: "shadow-[0_0_60px_-18px_var(--color-advisory)]",
    badge: "bg-advisory/15 text-advisory border-advisory/30",
  },
  danger: {
    label: "TAKE SHELTER NOW",
    sub: "Active strike breach inside your 10 km safety ring",
    color: "var(--color-danger)",
    ring: "shadow-[0_0_70px_-14px_var(--color-danger)]",
    badge: "bg-danger/15 text-danger border-danger/30 animate-pulse",
  },
};

export const strikeAgeColor = (ageMin: number): string => {
  if (ageMin <= 5) return "#ef4444";
  if (ageMin <= 15) return "#f59e0b";
  return "#eab308";
};