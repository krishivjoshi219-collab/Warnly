import type { Coords } from "./types";
import { distanceKm, bearingDeg } from "./risk";

export interface GlacialLakeBasin {
  id: string;
  name: string;
  basin: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  elevationM: number;
  areaSqKm: number;
  hazardRating: "very_high" | "high" | "moderate";
  recentEvents?: string;
}

/**
 * World's most critical and actively monitored glacial lakes and GLOF-prone basins,
 * including recent high-profile events like Thame/Khumbu (August 2024) and South Lhonak (2023).
 */
export const CRITICAL_GLACIAL_LAKES: GlacialLakeBasin[] = [
  {
    id: "np-thame",
    name: "Thame Glacial Lakes (Thame Khola)",
    basin: "Dudh Koshi / Khumbu",
    country: "Nepal",
    region: "Solukhumbu, Everest Region",
    lat: 27.848,
    lon: 86.619,
    elevationM: 4750,
    areaSqKm: 0.85,
    hazardRating: "very_high",
    recentEvents: "Catastrophic breach in August 2024 inundated Thame village and downstream Dudh Koshi valley.",
  },
  {
    id: "np-tsho-rolpa",
    name: "Tsho Rolpa Glacial Lake",
    basin: "Tama Koshi",
    country: "Nepal",
    region: "Rolwaling Valley, Dolakha",
    lat: 27.854,
    lon: 86.478,
    elevationM: 4580,
    areaSqKm: 1.65,
    hazardRating: "very_high",
    recentEvents: "One of Nepal's largest moraine-dammed lakes holding >80 million mÂ³ of water.",
  },
  {
    id: "np-imja-tsho",
    name: "Imja Tsho",
    basin: "Dudh Koshi / Sagarmatha",
    country: "Nepal",
    region: "Khumbu, Solukhumbu",
    lat: 27.901,
    lon: 86.924,
    elevationM: 5010,
    areaSqKm: 1.28,
    hazardRating: "high",
    recentEvents: "Rapidly expanding moraine-dammed lake directly upstream of Dingboche and Namche.",
  },
  {
    id: "np-melamchi",
    name: "Melamchi / Yangri Glacial Basin",
    basin: "Indrawati / Sun Koshi",
    country: "Nepal",
    region: "Helambu, Sindhupalchok",
    lat: 28.065,
    lon: 85.556,
    elevationM: 4400,
    areaSqKm: 1.1,
    hazardRating: "very_high",
    recentEvents: "Devastating multi-source debris flow and glacial headwater breach in Melamchi.",
  },
  {
    id: "np-bhotekoshi",
    name: "Bhotekoshi Glacial Basins (Cirenmaco)",
    basin: "Bhote Koshi / Trishuli",
    country: "Nepal / Tibet Border",
    region: "Sindhupalchok Border",
    lat: 28.118,
    lon: 85.986,
    elevationM: 4620,
    areaSqKm: 0.9,
    hazardRating: "high",
    recentEvents: "Cross-border trans-Himalayan GLOF flood route affecting Arniko Highway.",
  },
  {
    id: "in-south-lhonak",
    name: "South Lhonak Glacial Lake",
    basin: "Teesta River Basin",
    country: "India",
    region: "Sikkim Himalayas",
    lat: 27.915,
    lon: 88.204,
    elevationM: 5200,
    areaSqKm: 1.68,
    hazardRating: "very_high",
    recentEvents: "Major GLOF breach in Oct 2023 washed away Chungthang dam and downstream settlements.",
  },
  {
    id: "in-chamoli",
    name: "Rishiganga / Nanda Devi Glacial Zone",
    basin: "Alaknanda / Ganges",
    country: "India",
    region: "Chamoli, Uttarakhand",
    lat: 30.383,
    lon: 79.734,
    elevationM: 5400,
    areaSqKm: 1.4,
    hazardRating: "very_high",
    recentEvents: "Catastrophic rock/ice avalanche and glacial flood devastated Tapovan power project.",
  },
  {
    id: "pk-shishper",
    name: "Shishper Glacier Lake",
    basin: "Hunza River Basin",
    country: "Pakistan",
    region: "Gilgit-Baltistan, Karakoram",
    lat: 36.381,
    lon: 74.577,
    elevationM: 3800,
    areaSqKm: 0.95,
    hazardRating: "high",
    recentEvents: "Surging glacier creates recurrent ice-dammed lake threatening Karakoram Highway.",
  },
  {
    id: "pe-palcacocha",
    name: "Lake Palcacocha",
    basin: "Santa River / Huaraz",
    country: "Peru",
    region: "Cordillera Blanca, Andes",
    lat: -9.398,
    lon: -77.381,
    elevationM: 4566,
    areaSqKm: 0.68,
    hazardRating: "very_high",
    recentEvents: "High risk of glacial avalanche triggering massive wave into city of Huaraz.",
  },
];

export interface GlofRiskAssessment {
  isInRiskZone: boolean;
  nearestGlacialLake: {
    lake: GlacialLakeBasin;
    distanceKm: number;
    bearingDeg: number;
    downstreamTravelTimeMin: number; // estimated time for flood crest to reach user
  } | null;
  riskLevel: "none" | "advisory" | "watch" | "warning";
  headline: string;
  leadTimeMinutes: number; // advance warning time available
  freezingLevelElevationM: number | null;
  rapidMeltDetected: boolean;
  heavyUpstreamRain: boolean;
  evacuationAction: string;
  safetyElevationMeters: number; // recommended vertical height to climb above valley floor
}

/**
 * Evaluates Glacial Lake Outburst Flood (GLOF) risk for given coordinates
 * based on geographic proximity to known glacial lake corridors, high-altitude temperatures,
 * upstream precipitation, and river surge models.
 */
export async function evaluateGlofRisk(
  coords: Coords,
  tempC = 20,
  precipNow = 0,
  dischargeSurge = 1
): Promise<GlofRiskAssessment> {
  // 1. Check proximity to all known dangerous glacial lake basins
  let nearest: {
    lake: GlacialLakeBasin;
    distanceKm: number;
    bearingDeg: number;
    downstreamTravelTimeMin: number;
  } | null = null;

  for (const lake of CRITICAL_GLACIAL_LAKES) {
    const dist = distanceKm(coords, { lat: lake.lat, lon: lake.lon });
    const brg = bearingDeg(coords, { lat: lake.lat, lon: lake.lon });

    // GLOF flood waves can travel 150+ km downstream along river corridors
    if (!nearest || dist < nearest.distanceKm) {
      // Wave propagation speed down steep mountain gorges is approx 28-40 km/h (0.5 - 0.65 km/min)
      const avgWaveSpeedKmH = 35;
      const travelTimeMin = Math.max(10, Math.round((dist / avgWaveSpeedKmH) * 60));

      nearest = {
        lake,
        distanceKm: Math.round(dist * 10) / 10,
        bearingDeg: Math.round(brg),
        downstreamTravelTimeMin: travelTimeMin,
      };
    }
  }

  // Broad High Mountain Asia boundary check (Himalayas, Karakoram, Hindu Kush, Tibetan Plateau)
  // Lat: 26Â°N - 37Â°N, Lon: 68Â°E - 104Â°E
  const isHighMountainAsia =
    coords.lat >= 25.5 && coords.lat <= 38.0 && coords.lon >= 68.0 && coords.lon <= 104.5;
  const isAndeanZone =
    coords.lat >= -22.0 && coords.lat <= 11.0 && coords.lon >= -82.0 && coords.lon <= -65.0;

  const inGlacialCorridor =
    (nearest && nearest.distanceKm <= 150) || isHighMountainAsia || isAndeanZone;

  if (!inGlacialCorridor || !nearest) {
    return {
      isInRiskZone: false,
      nearestGlacialLake: null,
      riskLevel: "none",
      headline: "Outside Glacial Flood Corridors",
      leadTimeMinutes: 0,
      freezingLevelElevationM: null,
      rapidMeltDetected: false,
      heavyUpstreamRain: false,
      evacuationAction: "No glacial lake hazards present in this geographical zone.",
      safetyElevationMeters: 0,
    };
  }

  // Determine environmental triggers:
  // High altitude freezing level estimated based on surface temperature lapse rate (~6.5Â°C / 1000m)
  const estFreezingLevel = Math.round(Math.max(2000, (tempC / 6.5) * 1000 + 1400));
  const rapidMelt = tempC >= 26;
  const heavyUpstreamRain = precipNow >= 8;
  const severeCloudburst = precipNow >= 12;
  const severeSurge = dischargeSurge >= 2.0;
  const moderateSurge = dischargeSurge >= 1.6;

  let riskLevel: "none" | "advisory" | "watch" | "warning" = "none";
  let headline = `Monitored Basin (${nearest.lake.name}) â€” Normal Water Level`;
  let leadTime = nearest.downstreamTravelTimeMin;

  if (nearest.distanceKm <= 80 && (severeCloudburst || severeSurge)) {
    if (severeCloudburst && severeSurge) {
      riskLevel = "warning";
      headline = `CRITICAL GLOF WARNING â€” Glacial Outburst Surge (${nearest.lake.name})`;
    } else {
      riskLevel = "watch";
      headline = `GLOF Early Watch â€” Elevated High-Altitude Surge in ${nearest.lake.basin}`;
    }
  } else if (nearest.distanceKm <= 120 && (severeCloudburst || moderateSurge)) {
    riskLevel = "advisory";
    headline = `Glacial Melt & High Runoff Advisory in ${nearest.lake.basin}`;
  } else {
    riskLevel = "none";
    headline = `Normal River Flow â€” No Outburst Detected (${nearest.lake.name})`;
  }

  return {
    isInRiskZone: true,
    nearestGlacialLake: nearest,
    riskLevel,
    headline,
    leadTimeMinutes: leadTime,
    freezingLevelElevationM: estFreezingLevel,
    rapidMeltDetected: rapidMelt,
    heavyUpstreamRain,
    evacuationAction:
      "IMMEDIATELY CLIMB 30 TO 50 METERS VERTICALLY UP THE VALLEY WALLS. Do not stay in riverbeds, valley floors, or near bridges. Glacial flood surges arrive with high-velocity boulders and heavy silt.",
    safetyElevationMeters: 40,
  };
}
