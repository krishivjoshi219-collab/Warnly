/**
 * Warnly Convective Hazard Platform — Domain Models & Schemas
 * Strictly calibrated to Deep Moist Convection (Lightning, Microbursts, Convective Downpours).
 * Eliminates disjointed seismic/GLOF bloat per White Paper Section 1 & Section 3.
 */

export enum AlertLevel {
  SAFE = 'SAFE',         // Outside 15 km perimeter, atmospheric conditions stable
  WATCH = 'WATCH',       // Convective Watch: High CAPE (>1500 J/kg), LI < -1 (In-Situ Initiation)
  ADVISORY = 'ADVISORY', // Storm active 10.0 km - 15.0 km, or advecting toward perimeter
  DANGER = 'DANGER',     // Critical Danger: Strike <= 10.0 km (Thunder 30-sec acoustic travel)
}

export type DemographicProfileId = 'agriculture' | 'construction' | 'athletics' | 'maritime' | 'general';

export interface DemographicProfile {
  id: DemographicProfileId;
  title: string;
  subtitle: string;
  icon: string;
  leadTimeTargetMinutes: number;
  criticalRadiusKm: number;
  advisoryRadiusKm: number;
  complianceStandard: string;
  actionProtocol: string[];
}

export interface LightningStrike {
  id: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  bearingDegrees: number;
  intensityKa: number;        // Peak current in kiloAmperes
  timestamp: number;          // Epoch milliseconds
  type: 'CG' | 'IC';          // Cloud-to-Ground vs In-Cloud
  provider: 'NOAA_GLM' | 'VALSALA_GLD360' | 'ENTLN' | 'SIMULATOR';
}

export interface AtmosphericTelemetry {
  cape: number;               // Convective Available Potential Energy (J/kg)
  liftedIndex: number;        // Lifted Index (°C)
  precipitationRateMmH: number; // Convective rain rate (mm/h)
  windGustsKmh: number;       // Microburst wind gust potential (km/h)
  surfacePressureHpa: number; // Atmospheric barometric pressure (hPa)
  cloudTopReflectivityDbz: number; // Radar reflectivity (dBZ)
  stormSpeedKmh: number;      // Storm advection velocity (km/h)
  stormBearingDegrees: number;// Advection direction vector (degrees)
  advectionLeadTimeMin: number; // Calculated lead time before 10 km breach
  isConvectiveWatchActive: boolean;
  isTacticalEvacuationActive: boolean;
  source: string;
  lastUpdated: number;
}

export interface HardenedShelter {
  id: string;
  name: string;
  type: 'CONCRETE_BUNKER' | 'SUBTERRANEAN_METRO' | 'COMMUNITY_CIVIL_SHELTER' | 'REINFORCED_SCHOOL';
  latitude: number;
  longitude: number;
  distanceKm: number;
  bearingDegrees: number;
  capacity: number;
  hasBackupPower: boolean;
  hasFirstAid: boolean;
  elevationMeters: number;
  highGroundAdvantageMeters: number;
  walkingTimeMinutes: number;
  accessNotes: string;
}

export interface MonitoredZone {
  id: string;
  name: string;
  category: 'HOME' | 'SCHOOL' | 'FARMLAND' | 'WORKSITE' | 'ATHLETIC_FIELD' | 'MARINA';
  latitude: number;
  longitude: number;
  radiusKm: number;
  alertLevel: AlertLevel;
  nearestStrikeKm: number | null;
  activeStrikesInside: number;
  contactName?: string;
  contactPhone?: string;
}

export interface NotificationPreview {
  platform: 'iOS_LIVE_ACTIVITY' | 'ANDROID_HEADS_UP';
  title: string;
  body: string;
  distanceKm: number;
  timerFormatted: string;
  timestamp: string;
}
