/**
 * Warnly Disaster Resilience Platform — TypeScript Domain Models
 * Strict mathematical, atmospheric, geophysical, and tactical schemas.
 */

export enum AlertLevel {
  SAFE = 'SAFE',
  ADVISORY = 'ADVISORY',
  DANGER = 'DANGER',
}

export enum HazardType {
  LIGHTNING = 'LIGHTNING',
  SEISMIC = 'SEISMIC',
  GLOF = 'GLOF',
  FLASH_FLOOD = 'FLASH_FLOOD',
  TSUNAMI = 'TSUNAMI',
}

export interface LightningStrike {
  id: string;
  distanceKm: number;
  bearingDegrees: number;
  intensityKa: number;
  timestamp: number;
  latitude: number;
  longitude: number;
}

export interface AtmosphericIndices {
  cape: number;
  liftedIndex: number;
  precipitationRateMmH: number;
  stormSpeedKmh: number;
  stormBearingDegrees: number;
  calculatedRiskPercent: number;
  leadTimeMinutes: number;
}

export interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  bearingDegrees: number;
  capacity: number;
  hasBackupPower: boolean;
  hasMedicalAid: boolean;
  elevationMeters: number;
  requiredClimbMeters: number;
}

export interface MonitoredZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  activeStrikeCount: number;
  alertLevel: AlertLevel;
  status: string;
}

export interface SeismicAlert {
  magnitude: number;
  epicenterDistanceKm: number;
  depthKm: number;
  pWaveArrivalTimestamp: number;
  sWaveCountdownSeconds: number;
  statusSummary: string;
}

export interface FloodAlert {
  floodType: string;
  crestLeadTimeMinutes: number;
  verticalEvacuationMeters: number;
  dischargeSurgeRateM3s: number;
  statusSummary: string;
}

export interface TsunamiAlert {
  id: string;
  earthquakeMagnitude: number;
  epicenterDistanceKm: number;
  deepOceanSpeedKmh: number;
  estimatedArrivalMinutes: number;
  projectedRunupHeightMeters: number;
  verticalAscentRequiredMeters: number;
  coastalBasinName: string;
  evacuationDirective: string;
}

export enum MeshPacketType {
  HAZARD_RELAY = 'HAZARD_RELAY',
  SURVIVOR_SOS = 'SURVIVOR_SOS',
  SHELTER_UPDATE = 'SHELTER_UPDATE',
  KEEPALIVE_HEARTBEAT = 'KEEPALIVE_HEARTBEAT',
}

export interface MeshPacket {
  id: string;
  senderId: string;
  senderAlias: string;
  timestamp: number;
  type: MeshPacketType;
  payload: string;
  latitude: number;
  longitude: number;
  hopCount: number;
  maxHops: number;
}

export interface MeshPeer {
  nodeId: string;
  alias: string;
  rssi: number;
  lastSeenTimestamp: number;
  hopDistance: number;
}

export interface Protocol {
  demographic: string;
  category: string;
  icon: string;
  criticalRules: string[];
}

export const DEMOGRAPHIC_PROTOCOLS: Protocol[] = [
  {
    demographic: 'Construction & Cranes',
    category: 'Workplace & Industrial',
    icon: '🏗️',
    criticalRules: [
      'OSHA 10-Mile Rule: Mandatory suspension of all crane operations and steel rigging when a strike is detected within 16 km (10 miles).',
      'Lower all elevated booms, secure hooks, and ground conductive structural steel lines immediately.',
      'Workers on scaffolds must evacuate to an enclosed, grounded structure. Stay off exposed metal frameworks.',
      'Enforce the 30-30 Rule: Operations may not resume until 30 minutes after the last strike within the 10 km danger ring.',
    ],
  },
  {
    demographic: 'Agriculture & Open Fields',
    category: 'Rural & Agricultural',
    icon: '🚜',
    criticalRules: [
      'Immediately dismount open tractors, combines, and all non-enclosed farm machinery.',
      'Never seek shelter beneath isolated trees, wire fences, metal silos, or irrigation equipment.',
      'If caught in an open field with hair standing up: adopt the Lightning Crouch (squat on balls of feet, tuck head, cover ears, keep feet together, minimize contact with ground).',
      'Do not lie flat on the ground—ground current travels horizontally and can cause lethal step-potential shock.',
    ],
  },
  {
    demographic: 'Athletics & Schools',
    category: 'Education & Sports',
    icon: '🏫',
    criticalRules: [
      'Immediate field clearance: Halt all football, soccer, track, and outdoor activities upon 15 km Advisory warning.',
      'Evacuate players, staff, and spectators into substantial permanent buildings or enclosed gymnasiums.',
      'Metal bleachers, dugouts, and concession tents are hazardous conductive structures—prohibit sheltering there.',
      'Do not permit locker room showers or landline use during convective activity due to conductive plumbing.',
    ],
  },
  {
    demographic: 'Alpine & Moraine (GLOF)',
    category: 'Mountain & Valley',
    icon: '🏔️',
    criticalRules: [
      'Moraine Outburst Surges: Move immediately upward (+30m to +50m vertical elevation) along the valley ridge.',
      'Never run down the valley floor or follow riverbeds—debris flows and mud surges reach speeds > 40 km/h.',
      'Seek high rock spurs and bedrock outcroppings above unstable moraine sediment.',
      'Maintain line-of-sight visual contact and keep distress radios/beacons active on emergency frequencies.',
    ],
  },
  {
    demographic: 'Coastal & Tsunami Zones',
    category: 'Ocean & Coastline',
    icon: '🌊',
    criticalRules: [
      'Upon strong seismic ground shaking (>20s) or rapid ocean water recession: Evacuate inland and uphill immediately.',
      'Mandatory vertical climb of at least +25m to +50m above sea level to clear shoaling tsunami surge crests.',
      'Do not wait for official sirens or warnings—natural warnings (shaking, roaring sound) demand instant action.',
      'Stay away from rivers and estuaries as tsunami bore waves travel miles upstream at high velocity.',
    ],
  },
  {
    demographic: 'Mariners & Water Sports',
    category: 'Marine & Lakes',
    icon: '⛵',
    criticalRules: [
      'Immediate shoreline egress: Steer toward the nearest hardened dock or harbor when convective alerts breach 25 km.',
      'If unable to reach shore: Retreat to the below-deck enclosed cabin. Avoid touching metal rigging, radio antennas, and steering cables.',
      'Swimmers, surfers, and paddleboarders must exit water immediately—water is a primary electrical conductor.',
      'Disconnect external VHF antennas if not equipped with gas-discharge lightning arrestors.',
    ],
  },
];
