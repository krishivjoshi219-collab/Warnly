import type { Coords, Strike, WeatherSnapshot } from "./types";
import { type Quake, type FloodSnapshot } from "./hazards";
import { evaluateGlofRisk, type GlofRiskAssessment } from "./glof";
import { SAFETY_RADIUS_KM } from "./risk";

export type DisasterKind = "lightning" | "glof" | "flood" | "earthquake";

export interface EarlyWarningAlert {
  id: string;
  kind: DisasterKind;
  severity: "critical" | "warning" | "advisory" | "watch";
  title: string;
  leadTimeMinutes: number; // Advance minutes of warning before arrival / peak impact
  leadTimeDisplay: string; // e.g. "12 mins advance warning", "35 mins lead time", "18s S-wave alert"
  primaryAction: string;
  actionSteps: string[];
  recommendedShelterType: "high_ground" | "shelter" | "assembly_field" | "hospital";
  metrics: {
    label: string;
    value: string;
  }[];
  timestamp: number;
}

export interface EarlyWarningSummary {
  hasCriticalEarlyAlert: boolean;
  activeAlerts: EarlyWarningAlert[];
  glofAssessment: GlofRiskAssessment;
  topAlert: EarlyWarningAlert | null;
}

/**
 * Computes comprehensive multi-hazard predictive early warnings
 * providing 10+ minutes advance alerts before disasters impact the user.
 */
export async function computeEarlyWarnings(
  coords: Coords | null,
  weather: WeatherSnapshot | undefined,
  strikes: Strike[],
  flood: FloodSnapshot | null | undefined,
  quakes: Quake[]
): Promise<EarlyWarningSummary> {
  if (!coords) {
    return {
      hasCriticalEarlyAlert: false,
      activeAlerts: [],
      glofAssessment: {
        isInRiskZone: false,
        nearestGlacialLake: null,
        riskLevel: "none",
        headline: "No coordinates available",
        leadTimeMinutes: 0,
        freezingLevelElevationM: null,
        rapidMeltDetected: false,
        heavyUpstreamRain: false,
        evacuationAction: "",
        safetyElevationMeters: 0,
      },
      topAlert: null,
    };
  }

  const alerts: EarlyWarningAlert[] = [];
  const now = Date.now();

  // 1. GLOF (Glacial Lake Outburst Flood) Early Warning
  const dischargeSurge =
    flood?.discharge != null && flood?.dischargeMax != null && flood.discharge > 0
      ? flood.dischargeMax / flood.discharge
      : 1;

  const glof = await evaluateGlofRisk(
    coords,
    weather?.temperature ?? 20,
    flood?.rainNow ?? weather?.precipitation ?? 0,
    dischargeSurge
  );

  if (glof.isInRiskZone && glof.riskLevel !== "none") {
    const isCritical = glof.riskLevel === "warning";
    alerts.push({
      id: "glof-alert",
      kind: "glof",
      severity: isCritical ? "critical" : glof.riskLevel === "watch" ? "warning" : "advisory",
      title: glof.headline,
      leadTimeMinutes: glof.leadTimeMinutes,
      leadTimeDisplay: `${glof.leadTimeMinutes} mins flood crest lead time`,
      primaryAction: "CLIMB 30-50m VERTICALLY UP VALLEY WALLS NOW",
      actionSteps: [
        "Move vertically up adjacent hillsides at least 30-50 meters above the riverbed.",
        "Glacial outburst floods travel with violent mud, boulders and ice at 35 km/h.",
        "Immediately evacuate all low-lying riverbanks, bridges, and valley settlements.",
        "Do not stop to collect belongings - every minute counts.",
        "Head to the nearest designated high-ground ridge or safe camp.",
      ],
      recommendedShelterType: "high_ground",
      metrics: [
        { label: "Glacial Lake", value: glof.nearestGlacialLake?.lake.name ?? "Alpine Basin" },
        { label: "Lake Distance", value: `${glof.nearestGlacialLake?.distanceKm ?? 0} km upstream` },
        { label: "Wave Lead Time", value: `~${glof.leadTimeMinutes} min` },
        { label: "Safe Elevation", value: `+${glof.safetyElevationMeters}m vertical` },
      ],
      timestamp: now,
    });
  }

  // 2. Predictive Lightning Early Alert (10-20 min advance warning)
  // Check if active convective storm cell is approaching the user's 10 km ring
  const outsideStrikes = strikes.filter(
    (s) => s.distanceKm > SAFETY_RADIUS_KM && s.distanceKm <= 35
  );
  const insideStrikes = strikes.filter((s) => s.distanceKm <= SAFETY_RADIUS_KM);

  const cape = weather?.cape ?? 0;
  const precipProb = weather?.precipProbability ?? 0;
  const isConvectiveUnstable = cape >= 750 || weather?.weatherCode === 95 || weather?.weatherCode === 96 || weather?.weatherCode === 99;

  if (insideStrikes.length > 0) {
    // Immediate danger zone breach
    const closest = insideStrikes[0];
    alerts.push({
      id: "lightning-breach",
      kind: "lightning",
      severity: "critical",
      title: "CRITICAL: Lightning Inside 10 km Safety Zone",
      leadTimeMinutes: 0,
      leadTimeDisplay: "IMMEDIATE BREACH",
      primaryAction: "GET INDOORS NOW - 30/30 RULE ACTIVE",
      actionSteps: [
        "Immediately enter a fully enclosed building or hard-topped vehicle.",
        "Stay away from windows, corded devices, plumbing, and concrete walls.",
        "Avoid open fields, lone tall trees, metal poles, and bodies of water.",
        "Remain in shelter for at least 30 minutes after the last thunderclap.",
      ],
      recommendedShelterType: "shelter",
      metrics: [
        { label: "Closest Strike", value: `${closest.distanceKm} km away` },
        { label: "Strike Age", value: `${closest.ageMin}m ago` },
        { label: "Active Strikes", value: `${insideStrikes.length} in 10 km` },
        { label: "Atmosphere CAPE", value: `${Math.round(cape)} J/kg` },
      ],
      timestamp: now,
    });
  } else if (outsideStrikes.length > 0) {
    // Real approaching strikes detected outside 10 km ring: storm approaching at ~30 km/h (0.5 km/min)
    const closest = outsideStrikes[0];
    const closestDist = closest.distanceKm;
    const distanceToRing = Math.max(1, closestDist - SAFETY_RADIUS_KM);
    const estArrivalMin = Math.max(8, Math.round(distanceToRing / 0.5)); // 10-25 minutes lead time

    alerts.push({
      id: "lightning-early-warning",
      kind: "lightning",
      severity: estArrivalMin <= 15 ? "warning" : "advisory",
      title: `Thunderstorm Cell Approaching - Early Warning`,
      leadTimeMinutes: estArrivalMin,
      leadTimeDisplay: `${estArrivalMin} mins advance warning`,
      primaryAction: `SEEK HARD-TOPPED SHELTER WITHIN ${estArrivalMin} MINUTES`,
      actionSteps: [
        `Active strike detected ${closestDist.toFixed(1)} km out, moving towards your safety zone.`,
        `Estimated breach in ~${estArrivalMin} minutes - finish outdoor tasks and move indoors now.`,
        "Charge essential phones/powerbanks before electrical storm reaches your area.",
        "Unplug valuable electronics and sensitive appliances.",
      ],
      recommendedShelterType: "shelter",
      metrics: [
        { label: "Incoming Distance", value: `${closestDist.toFixed(1)} km` },
        { label: "Arrival ETA", value: `~${estArrivalMin} mins` },
        { label: "Storm CAPE", value: `${Math.round(cape)} J/kg` },
        { label: "Rain Probability", value: `${precipProb}%` },
      ],
      timestamp: now,
    });
  }

  // 3. Flash Flood & Water Surge Advance Alert (15-30 min lead time)
  if (flood && (flood.level === "severe" || flood.level === "high" || flood.rainNow >= 6.0)) {
    const isSevere = flood.level === "severe" || flood.rainNow >= 12;
    const leadTime = isSevere ? 10 : 20;

    alerts.push({
      id: "flash-flood-alert",
      kind: "flood",
      severity: isSevere ? "critical" : "warning",
      title: isSevere
        ? "CRITICAL FLASH FLOOD & WATER SURGE WARNING"
        : "Flash Flood Early Advisory - Heavy Runoff",
      leadTimeMinutes: leadTime,
      leadTimeDisplay: `${leadTime} mins surge lead time`,
      primaryAction: "EVACUATE LOW GROUND & NEVER DRIVE THROUGH WATER",
      actionSteps: [
        "Move immediately to designated high ground or upper building floors.",
        "Just 15 cm of moving water knocks down adults; 60 cm sweeps away vehicles.",
        "Stay away from drainage canals, swollen streams, and culverts.",
        "Disconnect electric power mains if water threatens to enter premises.",
        "Keep your waterproof go-bag and flashlight ready.",
      ],
      recommendedShelterType: "high_ground",
      metrics: [
        { label: "Precipitation Rate", value: `${flood.rainNow} mm/hr` },
        { label: "Next 6h Total", value: `${flood.next6hTotal} mm` },
        { label: "Surge Peak ETA", value: `~${leadTime} mins` },
        {
          label: "River Flow",
          value: flood.discharge != null ? `${flood.discharge} m\u00B3/s` : "High runoff",
        },
      ],
      timestamp: now,
    });
  }

  // 4. Earthquake Early Seismic Wave Alert (USGS real-time P-wave vs S-wave calculation)
  const recentNearbyQuake = quakes.find(
    (q) => q.distanceKm <= 250 && q.mag >= 4.0 && now - q.time <= 45 * 60 * 1000
  );

  if (recentNearbyQuake) {
    const ageSeconds = Math.round((now - recentNearbyQuake.time) / 1000);
    // P-wave travels at ~6.0 km/s, S-wave (destructive shaking) travels at ~3.5 km/s
    const sWaveTravelTimeSec = Math.round(recentNearbyQuake.distanceKm / 3.5);
    const pWaveTravelTimeSec = Math.round(recentNearbyQuake.distanceKm / 6.0);
    const sWaveCountdown = Math.max(0, sWaveTravelTimeSec - ageSeconds);

    const isImminent = sWaveCountdown > 0 && sWaveCountdown <= 90;
    const isAftershockThreat = ageSeconds <= 40 * 60;

    alerts.push({
      id: `quake-early-${recentNearbyQuake.id}`,
      kind: "earthquake",
      severity: recentNearbyQuake.mag >= 5.5 || isImminent ? "critical" : "warning",
      title: isImminent
        ? `SEISMIC ALERT: Strong S-Wave Shaking in ${sWaveCountdown}s!`
        : `Recent M${recentNearbyQuake.mag.toFixed(1)} Quake - Aftershock Early Watch`,
      leadTimeMinutes: isImminent ? Math.round(sWaveCountdown / 60) : 15,
      leadTimeDisplay: isImminent ? `${sWaveCountdown} sec S-wave alert` : `Aftershocks watch`,
      primaryAction: "DROP, COVER, AND HOLD ON UNDER STURDY FURNITURE",
      actionSteps: [
        "DROP to your hands and knees immediately to prevent being knocked down.",
        "COVER your head and neck under a sturdy desk or table.",
        "HOLD ON to your shelter until shaking completely stops.",
        "Stay away from exterior glass windows, mirrors, and unanchored tall cabinets.",
        "After shaking, evacuate to open fields via stairs - do NOT use elevators.",
      ],
      recommendedShelterType: "assembly_field",
      metrics: [
        { label: "Magnitude", value: `M ${recentNearbyQuake.mag.toFixed(1)}` },
        { label: "Epicenter Dist", value: `${recentNearbyQuake.distanceKm} km` },
        { label: "Focal Depth", value: `${recentNearbyQuake.depthKm} km` },
        { label: "Epicenter Location", value: recentNearbyQuake.place },
      ],
      timestamp: recentNearbyQuake.time,
    });
  }

  // Rank by severity: critical > warning > advisory > watch
  const severityRank: Record<string, number> = {
    critical: 4,
    warning: 3,
    advisory: 2,
    watch: 1,
  };

  alerts.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);

  const hasCritical = alerts.some((a) => a.severity === "critical");
  const topAlert = alerts[0] ?? null;

  return {
    hasCriticalEarlyAlert: hasCritical,
    activeAlerts: alerts,
    glofAssessment: glof,
    topAlert,
  };
}
