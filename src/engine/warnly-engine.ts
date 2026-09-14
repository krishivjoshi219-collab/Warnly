/**
 * Warnly Unified Autonomous Convective Engine
 * Coordinates all physics, two-tier risk state machines, 30-30 sheltering timer,
 * acoustic sirens, optical strobe, hardened shelters, and multi-zone perimeters.
 */

import {
  AlertLevel,
  AtmosphericTelemetry,
  DemographicProfile,
  DemographicProfileId,
  HardenedShelter,
  LightningStrike,
  MonitoredZone,
  NotificationPreview,
  SafetyDirective,
} from '../types/convective';
import { compileSafety, evaluateEvacuation, custodyText, reserveHours, clearAirPlan, floodEscape, calmInstruction } from '../lib/warnly/survival-core';
import { GeodesicPhysics } from '../physics/geodesics';
import { AdvectionEngine, AdvectionVectorResult } from '../physics/advection';
import { AcousticBeaconSynthesizer } from '../audio/acoustic-beacon';
import { OpticalStrobeEngine } from '../hardware/optical-strobe';
import { TelemetryService } from '../services/telemetry-service';
import { ShelterService } from '../services/shelter-service';
import { ZoneService } from '../services/zone-service';

export const DEMOGRAPHIC_PROFILES: Record<DemographicProfileId, DemographicProfile> = {
  agriculture: {
    id: 'agriculture',
    title: 'Agriculture & Field Laborers',
    subtitle: 'High Open-Field Exposure • 50%+ Global Casualties',
    icon: 'Tractor',
    leadTimeTargetMinutes: 15,
    criticalRadiusKm: 10.0,
    advisoryRadiusKm: 15.0,
    complianceStandard: 'FAO Global Agricultural Field Lightning Safety Protocol',
    actionProtocol: [
      'Dismount open-cab tractors and metal machinery immediately.',
      'Never seek shelter under isolated trees, wire fencing, or irrigation rigs.',
      'Seek enclosed metal cabin vehicle or reinforced masonry barn.',
      'If caught in open expanse: assume lightning crouch with feet together.',
    ],
  },
  construction: {
    id: 'construction',
    title: 'Construction & Heavy Industry',
    subtitle: 'Elevated Scaffolding • Tower Cranes • Structural Steel',
    icon: 'HardHat',
    leadTimeTargetMinutes: 20,
    criticalRadiusKm: 16.1, // OSHA 10-mile lockout
    advisoryRadiusKm: 25.0,
    complianceStandard: 'OSHA 29 CFR 1926 Heavy Crane & Scaffolding Safety Mandate',
    actionProtocol: [
      'Lock out and lower tower crane jibs and boom lifts when strikes enter 10 miles.',
      'Evacuate exterior ironwork, perimeter scaffolding, and roof decks immediately.',
      'Disconnect ground power equipment and refrain from touching wet metal conduit.',
      'Enforce minimum 30-minute shelter lockout following the last detected strike.',
    ],
  },
  athletics: {
    id: 'athletics',
    title: 'Schools & Athletic Leagues',
    subtitle: 'Sports Stadiums • Swimming Pools • Open Playgrounds',
    icon: 'Trophy',
    leadTimeTargetMinutes: 15,
    criticalRadiusKm: 10.0,
    advisoryRadiusKm: 15.0,
    complianceStandard: 'NFHS & NCAA Official Thunderstorm Safety 30-30 Rule',
    actionProtocol: [
      'Suspend outdoor athletic matches immediately upon 10 km danger breach.',
      'Evacuate swimmers from outdoor and indoor chlorinated pools.',
      'Direct players, coaches, and spectators inside substantial buildings.',
      'The 30-30 Rule is non-negotiable: zero field return until timer reaches 00:00.',
    ],
  },
  maritime: {
    id: 'maritime',
    title: 'Mariners & Water Sports',
    subtitle: 'Open Water Conductivity • Sailboat Masts • Kayakers',
    icon: 'Anchor',
    leadTimeTargetMinutes: 25,
    criticalRadiusKm: 12.0,
    advisoryRadiusKm: 20.0,
    complianceStandard: 'US Coast Guard & IMO Severe Convective Marine Guidelines',
    actionProtocol: [
      'Navigate to nearest port or protected harbor with 20-25 min advance lead.',
      'Drop tall fishing outriggers and antenna masts if trapped on open water.',
      'Stay inside enclosed cabin; keep hands off radio antennas and metal throttles.',
      'Do not tow water-skiers or allow swimming once convective watch is declared.',
    ],
  },
  general: {
    id: 'general',
    title: 'Civilian & Family Shield',
    subtitle: 'Universal Personal Safety • Residential & Commuter Defense',
    icon: 'Shield',
    leadTimeTargetMinutes: 15,
    criticalRadiusKm: 10.0,
    advisoryRadiusKm: 15.0,
    complianceStandard: 'World Meteorological Organization (WMO) Public Safety Directive',
    actionProtocol: [
      'Move indoors to a substantial, permanent building.',
      'Avoid corded phones, plugged appliances, and plumbing fixtures.',
      'Stay off balconies, porches, and open concrete garage pads.',
      'Keep pets indoors and monitor remote family zones via Family Shield.',
    ],
  },
};

type CustodyLike = string;
export type EngineSubscriber = () => void;

export class WarnlyEngine {
  // Subsystems
  public readonly siren = new AcousticBeaconSynthesizer();
  public readonly strobe = new OpticalStrobeEngine();
  public readonly telemetryService = new TelemetryService();
  public readonly shelterService = new ShelterService();
  public readonly zoneService = new ZoneService();

  // Observable Engine State
  // NOTE: legacy simulation engine — not mounted by App (store.tsx is canonical).
  // Kept for the unrouted Simulator/Telemetry screens; defaults are neutral
  // (no fake San Francisco danger) so it can never fabricate a live warning.
  public alertLevel: AlertLevel = AlertLevel.SAFE;
  public userLatitude: number = 0;
  public userLongitude: number = 0;
  public locationName: string = 'Unset — waiting for GPS';
  public selectedProfile: DemographicProfile = DEMOGRAPHIC_PROFILES.general;

  public strikes: LightningStrike[] = [];
  public nearestStrikeKm: number | null = null;
  public nearestStrikeBearingDeg: number = 0;
  public nearestStrikeIntensityKa: number = 0;

  public telemetry: AtmosphericTelemetry;
  public advectionVector: AdvectionVectorResult;

  // FR-03: Automated 30-30 Sheltering Timer
  public timerRemainingSeconds: number = 0;
  public isTimerRunning: boolean = false;
  public timerStrikeCount: number = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // FR-04: Emergency Intrusion Modal
  public isEmergencyModalMounted: boolean = false;
  public autoSirenOnBreach: boolean = true;
  public isSoundMuted: boolean = false;

  // Shelters & Zones
  public evaluatedShelters: HardenedShelter[] = [];
  public evaluatedZones: MonitoredZone[] = [];
  public selectedShelter: HardenedShelter | null = null;

  // Active scenario simulator label
  public activeScenario: string = 'Calm Atmospheric Baseline';

  // Native survival core (always on, offline-first)
  public basementFlooded = false;
  public custody: CustodyLike = 'STORED_LOCAL';
  public airQualityIndex = 42;
  public floodDepthCm = 0;
  public floodRiseCmPerMin = 0;

  public getSafetyDirective(): SafetyDirective {
    const breach = this.nearestStrikeKm != null && this.nearestStrikeKm <= 10;
    return compileSafety({
      shelterDownstairs: breach ? true : 'unknown',
      basementFlooded: this.basementFlooded ? true : false,
      floodRising: this.floodDepthCm > 10 ? true : 'unknown',
      lightningNear: breach ? true : false,
      hasHallway: true,
      hasUpperFloor: true,
    });
  }

  public getEvacAdvice(): string {
    const r = evaluateEvacuation(
      [{ from: 'HOME', to: 'RIDGE', lengthKm: 2.1, isBridge: true }, { from: 'HOME', to: 'VALLEY', lengthKm: 3.4 }],
      'HOME', 'RIDGE', this.floodRiseCmPerMin / 100, 0.5, 28
    );
    return `${r.advice}: ${r.reason}`;
  }

  public getReserveLine(): string {
    const p = reserveHours(4000, 62, 320);
    return `${p.standard}h standard vs ${p.reserve}h reserve`;
  }

  public getAirLine(): string {
    return clearAirPlan(this.airQualityIndex, true).advice;
  }

  public getFloodLine(): string {
    return floodEscape(this.floodRiseCmPerMin, this.floodDepthCm, 12).advice;
  }

  public getCalmNext(): string {
    return calmInstruction(this.getSafetyDirective().doNow);
  }

  public getCustodyLine(): string {
    return custodyText(this.custody as never, 1);
  }

  // Subscriptions
  private subscribers: EngineSubscriber[] = [];

  constructor() {
    this.telemetry = this.telemetryService.getCachedTelemetry();
    this.advectionVector = {
      isApproaching: false,
      closingSpeedKmh: 0,
      timeToDangerRingMinutes: null,
      advectionBearingDegrees: 0,
      recommendation: 'STAND_BY',
      rationale: 'Calibrated safe baseline.',
    };

    // Initialize shelters & zones
    this.refreshLocalData();
  }

  public subscribe(cb: EngineSubscriber): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    });
  }

  public setDemographicProfile(profileId: DemographicProfileId) {
    this.selectedProfile = DEMOGRAPHIC_PROFILES[profileId] || DEMOGRAPHIC_PROFILES.general;
    this.evaluateState();
    this.notify();
  }

  public setUserLocation(lat: number, lon: number, name: string) {
    this.userLatitude = lat;
    this.userLongitude = lon;
    this.locationName = name;
    this.refreshLocalData();
    this.evaluateState();
    this.notify();
  }

  public setAutoSiren(enabled: boolean) {
    this.autoSirenOnBreach = enabled;
    this.notify();
  }

  public toggleMute() {
    this.isSoundMuted = !this.isSoundMuted;
    if (this.isSoundMuted) {
      this.siren.stopSiren();
    }
    this.notify();
  }

  public selectShelter(shelter: HardenedShelter | null) {
    this.selectedShelter = shelter;
    this.notify();
  }

  public dismissEmergencyModal() {
    // Allows minimizing the modal while keeping banner & danger state active
    this.isEmergencyModalMounted = false;
    this.notify();
  }

  public showEmergencyModal() {
    this.isEmergencyModalMounted = true;
    this.notify();
  }

  public refreshLocalData() {
    this.evaluatedShelters = this.shelterService.getEvaluatedShelters(
      this.userLatitude,
      this.userLongitude
    );
    this.evaluatedZones = this.zoneService.evaluateZonesAgainstStrikes(this.strikes);
    if (!this.selectedShelter && this.evaluatedShelters.length > 0) {
      this.selectedShelter = this.evaluatedShelters[0];
    }
  }

  /**
   * Main evaluation loop: implements FR-01, FR-02, FR-03, FR-04.
   */
  public evaluateState(): void {
    // 1. Calculate nearest strike in edge RAM
    let minDistance: number | null = null;
    let minBearing = 0;
    let peakKa = 0;

    for (const strike of this.strikes) {
      const dist = GeodesicPhysics.haversineDistanceKm(
        this.userLatitude,
        this.userLongitude,
        strike.latitude,
        strike.longitude
      );

      if (minDistance === null || dist < minDistance) {
        minDistance = dist;
        minBearing = GeodesicPhysics.initialBearingDegrees(
          this.userLatitude,
          this.userLongitude,
          strike.latitude,
          strike.longitude
        );
        peakKa = strike.intensityKa;
      }
    }

    this.nearestStrikeKm = minDistance !== null ? Math.round(minDistance * 10) / 10 : null;
    this.nearestStrikeBearingDeg = Math.round(minBearing);
    this.nearestStrikeIntensityKa = peakKa;

    // 2. Evaluate advection vector physics (FR-02)
    const currentDist = this.nearestStrikeKm ?? 45.0;
    this.advectionVector = AdvectionEngine.calculateAdvectionThreat(
      currentDist,
      this.nearestStrikeBearingDeg,
      this.telemetry.stormBearingDegrees,
      this.telemetry.stormSpeedKmh,
      this.telemetry.cape,
      this.telemetry.liftedIndex,
      this.telemetry.cloudTopReflectivityDbz
    );

    // 3. Two-Tier Risk State Machine Decision
    const criticalThreshold = this.selectedProfile.criticalRadiusKm; // default 10.0 km
    const advisoryThreshold = this.selectedProfile.advisoryRadiusKm; // default 15.0 km

    let nextAlertLevel = AlertLevel.SAFE;

    if (this.nearestStrikeKm !== null && this.nearestStrikeKm <= criticalThreshold) {
      nextAlertLevel = AlertLevel.DANGER;
    } else if (
      (this.nearestStrikeKm !== null && this.nearestStrikeKm <= advisoryThreshold) ||
      this.advectionVector.recommendation === 'TACTICAL_EVACUATION'
    ) {
      nextAlertLevel = AlertLevel.ADVISORY;
    } else if (
      this.telemetry.isConvectiveWatchActive ||
      this.advectionVector.recommendation === 'CONVECTIVE_WATCH'
    ) {
      nextAlertLevel = AlertLevel.WATCH;
    } else {
      nextAlertLevel = AlertLevel.SAFE;
    }

    // 4. Handle State Transitions
    const wasDanger = this.alertLevel === AlertLevel.DANGER;
    const isNowDanger = nextAlertLevel === AlertLevel.DANGER;

    this.alertLevel = nextAlertLevel;

    if (isNowDanger) {
      // Mount Emergency Intrusion (FR-04)
      this.isEmergencyModalMounted = true;

      // Start or Reset 30-30 Timer (FR-03)
      if (!this.isTimerRunning) {
        this.startShelterTimer();
      } else if (wasDanger && minDistance !== null && minDistance <= criticalThreshold) {
        // Subsequent strike inside 10 km resets timer back to 30:00!
        this.resetShelterTimer();
      }

      // Auto-trigger siren if enabled and not muted
      if (this.autoSirenOnBreach && !this.isSoundMuted && !this.siren.isPlaying) {
        this.siren.startSiren();
      }
    } else if (nextAlertLevel === AlertLevel.SAFE) {
      if (!this.isTimerRunning) {
        this.siren.stopSiren();
      }
    }

    // Refresh zones and shelters
    this.refreshLocalData();
  }

  /**
   * Starts the automated 30:00 sheltering countdown timer (FR-03).
   */
  public startShelterTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerRemainingSeconds = 30 * 60; // 30 minutes
    this.isTimerRunning = true;
    this.timerStrikeCount = 1;

    this.timerInterval = setInterval(() => {
      if (this.timerRemainingSeconds > 0) {
        this.timerRemainingSeconds--;
        this.notify();
      } else {
        // Timer reached 00:00 - All Clear!
        this.completeShelterTimer();
      }
    }, 1000);
  }

  /**
   * Resets the 30-30 timer back to 30:00 upon a subsequent strike within 10 km.
   */
  public resetShelterTimer(): void {
    this.timerRemainingSeconds = 30 * 60;
    this.timerStrikeCount++;
    this.siren.playTacticalChirp();
    this.notify();
  }

  /**
   * Handles timer completion when 30 minutes have elapsed without new strikes.
   */
  private completeShelterTimer(): void {
    this.isTimerRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.siren.stopSiren();
    this.siren.playTacticalChirp();
    this.evaluateState();
    this.notify();
  }

  /**
   * Fetches real live weather data from Open-Meteo.
   */
  public async loadLiveWeatherData(): Promise<void> {
    const live = await this.telemetryService.fetchLiveTelemetry(
      this.userLatitude,
      this.userLongitude
    );
    this.telemetry = live;
    this.evaluateState();
    this.notify();
  }

  /**
   * Gets formatted notification payload for iOS Live Activity / Android Heads-Up.
   */
  public getNotificationPreview(): NotificationPreview {
    const timeFormatted = `${Math.floor(this.timerRemainingSeconds / 60)
      .toString()
      .padStart(2, '0')}:${(this.timerRemainingSeconds % 60)
      .toString()
      .padStart(2, '0')}`;

    if (this.alertLevel === AlertLevel.DANGER) {
      return {
        platform: 'iOS_LIVE_ACTIVITY',
        title: 'CRITICAL LIGHTNING BREACH • TACTICAL EVACUATION',
        body: `Strike detected ${this.nearestStrikeKm ?? '0.0'} km away (${this.nearestStrikeIntensityKa} kA). 30-30 shelter timer running: ${timeFormatted}.`,
        distanceKm: this.nearestStrikeKm ?? 0,
        timerFormatted: timeFormatted,
        timestamp: 'Just now',
      };
    } else if (this.alertLevel === AlertLevel.ADVISORY) {
      return {
        platform: 'ANDROID_HEADS_UP',
        title: 'CONVECTIVE ADVECTION ALERT',
        body: `Storm cell approaching at ${this.telemetry.stormSpeedKmh} km/h. Nearest strike: ${this.nearestStrikeKm ?? '14.2'} km.`,
        distanceKm: this.nearestStrikeKm ?? 14.2,
        timerFormatted: '--:--',
        timestamp: '1m ago',
      };
    } else if (this.alertLevel === AlertLevel.WATCH) {
      return {
        platform: 'iOS_LIVE_ACTIVITY',
        title: 'ATMOSPHERIC CONVECTIVE WATCH',
        body: `High CAPE (${this.telemetry.cape} J/kg) indicates rapid in-situ storm initiation. Wrap up outdoor work.`,
        distanceKm: 0,
        timerFormatted: '--:--',
        timestamp: '5m ago',
      };
    } else {
      return {
        platform: 'iOS_LIVE_ACTIVITY',
        title: 'WARNLY CALIBRATED SAFE',
        body: 'Zero convective threats within 15 km geodesic perimeter.',
        distanceKm: 0,
        timerFormatted: '--:--',
        timestamp: 'Live',
      };
    }
  }

  // ==========================================
  // Interactive Simulation Scenarios (Testing Hub)
  // ==========================================

  public runScenarioCalm(): void {
    this.activeScenario = 'Calm Atmospheric Baseline';
    this.strikes = [];
    this.telemetry = {
      ...this.telemetry,
      cape: 240,
      liftedIndex: 3.4,
      precipitationRateMmH: 0.0,
      windGustsKmh: 12.0,
      cloudTopReflectivityDbz: 15,
      stormSpeedKmh: 0,
      isConvectiveWatchActive: false,
      isTacticalEvacuationActive: false,
    };
    this.isTimerRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.siren.stopSiren();
    this.strobe.stop();
    this.isEmergencyModalMounted = false;
    this.evaluateState();
    this.notify();
  }

  public runScenarioConvectiveWatch(): void {
    this.activeScenario = 'In-Situ Convective Watch (CAPE > 1500 J/kg)';
    this.strikes = [];
    this.telemetry = {
      ...this.telemetry,
      cape: 2450,
      liftedIndex: -4.2,
      precipitationRateMmH: 2.0,
      windGustsKmh: 35.0,
      cloudTopReflectivityDbz: 32,
      stormSpeedKmh: 15,
      stormBearingDegrees: 240,
      isConvectiveWatchActive: true,
      isTacticalEvacuationActive: false,
    };
    this.isTimerRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.siren.stopSiren();
    this.evaluateState();
    this.notify();
  }

  public runScenarioAdvectionApproaching(): void {
    this.activeScenario = 'Advecting Supercell (28 km, 42 km/h, 18 min lead-time)';
    // Create strike cluster 26-30 km away to South-West
    const centerPoint = GeodesicPhysics.computeDestinationPoint(
      this.userLatitude,
      this.userLongitude,
      28.0,
      225
    );

    this.strikes = this.telemetryService.generateCellStrikes(
      centerPoint.latitude,
      centerPoint.longitude,
      12,
      6.0,
      this.userLatitude,
      this.userLongitude
    );

    this.telemetry = {
      ...this.telemetry,
      cape: 2100,
      liftedIndex: -3.8,
      precipitationRateMmH: 24.0,
      windGustsKmh: 68.0,
      cloudTopReflectivityDbz: 48,
      stormSpeedKmh: 42,
      stormBearingDegrees: 45, // moving northeast directly toward user
      advectionLeadTimeMin: 18,
      isConvectiveWatchActive: true,
      isTacticalEvacuationActive: true,
    };

    this.isTimerRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.siren.stopSiren();
    this.evaluateState();
    this.notify();
  }

  public runScenarioDangerBreach(): void {
    this.activeScenario = 'Critical Danger Breach (Strike at 6.8 km)';
    const centerPoint = GeodesicPhysics.computeDestinationPoint(
      this.userLatitude,
      this.userLongitude,
      6.8,
      195
    );

    this.strikes = this.telemetryService.generateCellStrikes(
      centerPoint.latitude,
      centerPoint.longitude,
      8,
      3.0,
      this.userLatitude,
      this.userLongitude
    );

    this.telemetry = {
      ...this.telemetry,
      cape: 2800,
      liftedIndex: -5.1,
      precipitationRateMmH: 52.0,
      windGustsKmh: 85.0,
      cloudTopReflectivityDbz: 55,
      stormSpeedKmh: 45,
      stormBearingDegrees: 30,
      advectionLeadTimeMin: 0,
      isConvectiveWatchActive: true,
      isTacticalEvacuationActive: true,
    };

    this.evaluateState();
    this.notify();
  }

  public runScenarioSubsequentStrike(): void {
    this.activeScenario = 'Secondary Strike at 2.4 km (30-30 Timer Reset)';
    const closePoint = GeodesicPhysics.computeDestinationPoint(
      this.userLatitude,
      this.userLongitude,
      2.4,
      160
    );

    const newStrike: LightningStrike = {
      id: `STRK-${Date.now().toString(36).toUpperCase()}`,
      latitude: closePoint.latitude,
      longitude: closePoint.longitude,
      distanceKm: 2.4,
      bearingDegrees: 160,
      intensityKa: 92.4,
      timestamp: Date.now(),
      type: 'CG',
      provider: 'VALSALA_GLD360',
    };

    this.strikes = [newStrike, ...this.strikes];
    this.evaluateState();
    this.notify();
  }
}
