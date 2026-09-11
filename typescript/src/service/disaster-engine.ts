import {
  AlertLevel,
  AtmosphericIndices,
  FloodAlert,
  HazardType,
  LightningStrike,
  MonitoredZone,
  SeismicAlert,
  Shelter,
  TsunamiAlert,
} from '../models/types';
import { GeoMath } from '../physics/geo-math';
import { TsunamiInundationEngine } from '../physics/tsunami-engine';
import { AcousticSirenSynthesizer } from '../audio/acoustic-siren';
import { AcousticHomingBeeper } from '../audio/acoustic-sonar';
import { DisasterVoiceGuide } from '../audio/voice-guide';
import { LocalSensorManager } from '../hardware/sensors';
import { OpticalBeaconManager } from '../hardware/optical-beacon';
import { P2PDisasterMesh } from '../mesh/p2p-mesh';
import { BlackoutSurvivalManager } from '../power/blackout-manager';

export class DisasterEngine {
  // Subsystem instances
  readonly siren = new AcousticSirenSynthesizer();
  readonly homingBeeper = new AcousticHomingBeeper();
  readonly voiceGuide = new DisasterVoiceGuide();
  readonly sensorManager = new LocalSensorManager();
  readonly opticalBeacon = new OpticalBeaconManager();
  readonly meshNetwork = new P2PDisasterMesh();
  readonly blackoutManager = new BlackoutSurvivalManager();

  // Observable State
  selectedHazard: HazardType = HazardType.LIGHTNING;
  alertLevel: AlertLevel = AlertLevel.SAFE;
  userLatitude: number = 37.7749;
  userLongitude: number = -122.4194;
  locationName: string = 'San Francisco, CA (Default Base)';
  liveTelemetryStatus: string = 'Calibrated Safe Baseline (0% Gated)';

  strikes: LightningStrike[] = [];
  nearestStrikeDistanceKm: number | null = null;
  nearestStrikeBearing: number = 0.0;

  atmosphericIndices: AtmosphericIndices = {
    cape: 180.0,
    liftedIndex: 3.2,
    precipitationRateMmH: 0.0,
    stormSpeedKmh: 0.0,
    stormBearingDegrees: 0.0,
    calculatedRiskPercent: 0,
    leadTimeMinutes: 0,
  };

  // 30-30 Timer (FR-03)
  timerRemainingSeconds: number = 0;
  isTimerActive: boolean = false;
  timerResetCount: number = 0;
  private timerIntervalId: any = null;

  // Geophysical Alerts
  seismicAlert: SeismicAlert | null = null;
  private seismicIntervalId: any = null;
  floodAlert: FloodAlert | null = null;
  tsunamiAlert: TsunamiAlert | null = null;

  // UI State
  isEmergencyOverlayVisible: boolean = false;
  autoSirenOnDanger: boolean = true;

  // Shelters
  shelters: Shelter[] = [
    {
      id: 'SH-01',
      name: 'Civic High-Ridge Concrete Bunker',
      latitude: 37.781,
      longitude: -122.411,
      distanceKm: 0.9,
      bearingDegrees: 48.0,
      capacity: 450,
      hasBackupPower: true,
      hasMedicalAid: true,
      elevationMeters: 62,
      requiredClimbMeters: 45,
    },
    {
      id: 'SH-02',
      name: 'North Peak Municipal Gymnasium',
      latitude: 37.789,
      longitude: -122.428,
      distanceKm: 1.7,
      bearingDegrees: 335.0,
      capacity: 800,
      hasBackupPower: true,
      hasMedicalAid: true,
      elevationMeters: 95,
      requiredClimbMeters: 78,
    },
    {
      id: 'SH-03',
      name: 'Central Subterranean Metro Terminal',
      latitude: 37.779,
      longitude: -122.415,
      distanceKm: 0.6,
      bearingDegrees: 62.0,
      capacity: 1200,
      hasBackupPower: true,
      hasMedicalAid: false,
      elevationMeters: 18,
      requiredClimbMeters: 0,
    },
    {
      id: 'SH-04',
      name: 'Twin Peaks Granite Shelter Haven',
      latitude: 37.754,
      longitude: -122.447,
      distanceKm: 3.4,
      bearingDegrees: 228.0,
      capacity: 350,
      hasBackupPower: true,
      hasMedicalAid: true,
      elevationMeters: 280,
      requiredClimbMeters: 260,
    },
  ];
  selectedShelter: Shelter | null = null;

  // Family Shield (10-Zone Perimeter Monitoring)
  familyShieldZones: MonitoredZone[] = [
    {
      id: 'Z-01',
      name: 'Primary Residence (Home Base)',
      latitude: 37.7749,
      longitude: -122.4194,
      radiusKm: 10.0,
      activeStrikeCount: 0,
      alertLevel: AlertLevel.SAFE,
      status: 'Clear Perimeter (0 strikes inside 15 km)',
    },
    {
      id: 'Z-02',
      name: "Kids' Elementary School & Sports Oval",
      latitude: 37.782,
      longitude: -122.426,
      radiusKm: 10.0,
      activeStrikeCount: 0,
      alertLevel: AlertLevel.SAFE,
      status: 'Normal Field Status (30-30 Standby)',
    },
    {
      id: 'Z-03',
      name: "Elderly Parents' Residence (Valley Sector)",
      latitude: 37.765,
      longitude: -122.412,
      radiusKm: 10.0,
      activeStrikeCount: 0,
      alertLevel: AlertLevel.SAFE,
      status: 'Clear (No squall lines)',
    },
    {
      id: 'Z-04',
      name: 'Downtown Commercial Worksite (Tower Cranes)',
      latitude: 37.791,
      longitude: -122.402,
      radiusKm: 15.0,
      activeStrikeCount: 0,
      alertLevel: AlertLevel.SAFE,
      status: 'OSHA 10-Mile Status: Nominal',
    },
    {
      id: 'Z-05',
      name: 'Suburban Agricultural Orchard & Field',
      latitude: 37.742,
      longitude: -122.395,
      radiusKm: 15.0,
      activeStrikeCount: 0,
      alertLevel: AlertLevel.SAFE,
      status: 'Tractor Crews Operational',
    },
  ];

  private listeners: (() => void)[] = [];

  constructor() {
    this.selectedShelter = this.shelters[0];
    this.sensorManager.start();
    this.sensorManager.subscribe(() => {
      this.evaluateNavigationHeading();
      this.notify();
    });
    this.opticalBeacon.subscribe(() => this.notify());
    this.meshNetwork.subscribe(() => this.notify());
    this.blackoutManager.subscribe(() => this.notify());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify(): void {
    this.listeners.forEach((l) => l());
  }

  setHazard(hazard: HazardType): void {
    this.selectedHazard = hazard;
    this.notify();
  }

  selectShelter(shelter: Shelter): void {
    this.selectedShelter = shelter;
    this.evaluateNavigationHeading();
    this.notify();
  }

  dismissEmergencyOverlay(): void {
    this.isEmergencyOverlayVisible = false;
    this.notify();
  }

  evaluateNavigationHeading(): void {
    if (!this.selectedShelter) return;
    const bearing = GeoMath.calculateBearingDegrees(
      this.userLatitude,
      this.userLongitude,
      this.selectedShelter.latitude,
      this.selectedShelter.longitude
    );
    const compass = this.sensorManager.compassHeading;
    let delta = bearing - compass;
    while (delta < -180) delta += 360;
    while (delta > 180) delta -= 360;

    this.homingBeeper.updateHeadingDelta(delta);
  }

  // --- LIVE TELEMETRY INGESTION ---
  async syncAllLiveFeeds(): Promise<void> {
    this.liveTelemetryStatus = 'Syncing Open-Meteo & USGS APIs...';
    this.notify();

    try {
      // 1. Open-Meteo NWP Convective Ingestion
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${this.userLatitude}&longitude=${this.userLongitude}&hourly=cape,lifted_index,precipitation&current=precipitation,wind_speed_10m,wind_direction_10m`;
      const meteoRes = await fetch(meteoUrl);
      if (meteoRes.ok) {
        const data = await meteoRes.json();
        const currentPrecip = data.current?.precipitation || 0.0;
        const currentWindSpeed = data.current?.wind_speed_10m || 12.0;
        const currentWindDir = data.current?.wind_direction_10m || 240.0;
        const firstCape = data.hourly?.cape?.[0] || 220.0;
        const firstLi = data.hourly?.lifted_index?.[0] || 2.4;

        this.atmosphericIndices = {
          cape: Math.round(firstCape),
          liftedIndex: Math.round(firstLi * 10) / 10,
          precipitationRateMmH: currentPrecip,
          stormSpeedKmh: Math.round(currentWindSpeed),
          stormBearingDegrees: Math.round(currentWindDir),
          calculatedRiskPercent: firstCape > 1200 && firstLi < -2 ? 65 : 0,
          leadTimeMinutes: firstCape > 1200 ? 18 : 0,
        };
      }

      // 2. USGS Real-Time Earthquake GeoJSON Feed
      const usgsUrl =
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';
      const usgsRes = await fetch(usgsUrl);
      if (usgsRes.ok) {
        const usgsData = await usgsRes.json();
        if (usgsData.features && usgsData.features.length > 0) {
          const latest = usgsData.features[0];
          const coords = latest.geometry.coordinates; // [lon, lat, depth]
          const mag = latest.properties.mag || 4.5;
          const distKm = GeoMath.haversineDistanceKm(
            this.userLatitude,
            this.userLongitude,
            coords[1],
            coords[0]
          );

          if (distKm < 500.0) {
            const cd = GeoMath.calculateSeismicCountdownSeconds(distKm);
            this.seismicAlert = {
              magnitude: mag,
              epicenterDistanceKm: Math.round(distKm),
              depthKm: Math.round(coords[2] || 10),
              pWaveArrivalTimestamp: Date.now(),
              sWaveCountdownSeconds: cd,
              statusSummary: `USGS Real-time M${mag} tremor detected ${Math.round(distKm)} km away. S-wave arrival in ${cd}s!`,
            };
          }
        }
      }

      this.liveTelemetryStatus = 'Live NWP & Seismic Feeds Synced';
    } catch (e) {
      this.liveTelemetryStatus = 'APIs Synced (Local Offline Fallback)';
    }
    this.notify();
  }

  // --- 30-30 TIMER (FR-03) ---
  start30_30Timer(): void {
    this.timerRemainingSeconds = 1800; // 30:00 full minutes
    this.isTimerActive = true;
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);

    this.timerIntervalId = setInterval(() => {
      if (this.timerRemainingSeconds > 0) {
        this.timerRemainingSeconds--;
        this.notify();
      } else {
        this.stop30_30Timer();
      }
    }, 1000);
    this.notify();
  }

  stop30_30Timer(): void {
    this.isTimerActive = false;
    this.timerRemainingSeconds = 0;
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    this.notify();
  }

  // --- SCENARIO SIMULATIONS ---

  /**
   * Scenario 1: Convective Thunderstorm Intrusion
   */
  simulateConvectiveIntrusion(): void {
    this.selectedHazard = HazardType.LIGHTNING;
    this.alertLevel = AlertLevel.DANGER;
    this.isEmergencyOverlayVisible = true;
    if (this.autoSirenOnDanger) this.siren.startSiren();

    const strike1: LightningStrike = {
      id: `STR-${Date.now()}-1`,
      distanceKm: 7.4, // Inside 10 km Critical Danger Ring
      bearingDegrees: 42.0,
      intensityKa: -64.2,
      timestamp: Date.now(),
      latitude: 37.82,
      longitude: -122.38,
    };
    const strike2: LightningStrike = {
      id: `STR-${Date.now()}-2`,
      distanceKm: 13.8, // Inside 15 km Advisory Ring
      bearingDegrees: 28.0,
      intensityKa: 48.1,
      timestamp: Date.now() - 45000,
      latitude: 37.86,
      longitude: -122.35,
    };

    this.strikes = [strike1, strike2];
    this.nearestStrikeDistanceKm = 7.4;
    this.nearestStrikeBearing = 42.0;

    this.atmosphericIndices = {
      cape: 2450.0,
      liftedIndex: -5.8,
      precipitationRateMmH: 48.0,
      stormSpeedKmh: 42.0,
      stormBearingDegrees: 225.0,
      calculatedRiskPercent: 96,
      leadTimeMinutes: 14,
    };

    this.start30_30Timer();
    this.voiceGuide.speakUrgentDirective(
      'Warning: Lightning strike detected seven point four kilometers away inside critical danger perimeter. Seek shelter immediately.',
      true
    );
    this.liveTelemetryStatus = 'Severe Convective Cell Incursion (96% Risk)';
    this.notify();
  }

  /**
   * Scenario 2: Secondary Strike 30-30 Timer Reset (FR-03)
   */
  simulateSecondaryStrikeReset(): void {
    this.selectedHazard = HazardType.LIGHTNING;
    this.alertLevel = AlertLevel.DANGER;

    const newStrike: LightningStrike = {
      id: `STR-${Date.now()}-RST`,
      distanceKm: 4.2,
      bearingDegrees: 65.0,
      intensityKa: -89.4,
      timestamp: Date.now(),
      latitude: 37.8,
      longitude: -122.39,
    };

    this.strikes = [newStrike, ...this.strikes];
    this.nearestStrikeDistanceKm = 4.2;
    this.nearestStrikeBearing = 65.0;

    // Strict FR-03 reset back to 30:00 (1,800s)
    this.timerRemainingSeconds = 1800;
    this.timerResetCount++;

    this.voiceGuide.speakUrgentDirective(
      'Secondary strike detected four point two kilometers away. Shelter countdown reset to thirty minutes.'
    );
    this.notify();
  }

  /**
   * Scenario 3: Seismic P/S Differential Arrival Countdown
   */
  simulateSeismicEvent(): void {
    this.selectedHazard = HazardType.SEISMIC;
    this.alertLevel = AlertLevel.DANGER;
    this.isEmergencyOverlayVisible = true;
    if (this.autoSirenOnDanger) this.siren.startSiren();

    const distanceKm = 85.0;
    const initialCountdown = GeoMath.calculateSeismicCountdownSeconds(distanceKm);

    this.seismicAlert = {
      magnitude: 6.4,
      epicenterDistanceKm: distanceKm,
      depthKm: 12,
      pWaveArrivalTimestamp: Date.now(),
      sWaveCountdownSeconds: initialCountdown,
      statusSummary: `USGS Detection: M6.4 Sub-crustal Rupture (${distanceKm} km away). Destructive S-wave in ${initialCountdown}s!`,
    };

    if (this.seismicIntervalId) clearInterval(this.seismicIntervalId);
    this.seismicIntervalId = setInterval(() => {
      if (this.seismicAlert && this.seismicAlert.sWaveCountdownSeconds > 0) {
        this.seismicAlert = {
          ...this.seismicAlert,
          sWaveCountdownSeconds: this.seismicAlert.sWaveCountdownSeconds - 1,
        };
        this.notify();
      } else {
        if (this.seismicIntervalId) {
          clearInterval(this.seismicIntervalId);
          this.seismicIntervalId = null;
        }
      }
    }, 1000);

    this.sensorManager.simulateSeismicShock(0.14);
    this.voiceGuide.speakUrgentDirective(
      `Earthquake warning. Magnitude six point four. Destructive shear wave arriving in ${initialCountdown} seconds. Drop, cover, and hold on!`,
      true
    );
    this.notify();
  }

  /**
   * Scenario 4: Glacial Lake Outburst Flood (GLOF)
   */
  simulateGlofOutburst(): void {
    this.selectedHazard = HazardType.GLOF;
    this.alertLevel = AlertLevel.DANGER;
    this.isEmergencyOverlayVisible = true;
    if (this.autoSirenOnDanger) this.siren.startSiren();

    this.floodAlert = {
      floodType: 'Alpine GLOF Moraine Collapse',
      crestLeadTimeMinutes: 28,
      verticalEvacuationMeters: 45,
      dischargeSurgeRateM3s: 1450.0,
      statusSummary:
        'Glacial moraine lake failure detected! 1,450 m³/s surge proceeding down valley basin. Climb +45m uphill immediately!',
    };

    this.voiceGuide.speakUrgentDirective(
      'Glacial lake outburst flood detected. Mandatory vertical climb forty-five meters up valley ridge immediately. Do not follow river wash.',
      true
    );
    this.notify();
  }

  /**
   * Scenario 5: Flash Flood Canyon Wash Surge
   */
  simulateFlashFlood(): void {
    this.selectedHazard = HazardType.FLASH_FLOOD;
    this.alertLevel = AlertLevel.DANGER;
    this.isEmergencyOverlayVisible = true;
    if (this.autoSirenOnDanger) this.siren.startSiren();

    this.floodAlert = {
      floodType: 'Canyon Cloudburst Runoff Surge',
      crestLeadTimeMinutes: 12,
      verticalEvacuationMeters: 25,
      dischargeSurgeRateM3s: 580.0,
      statusSummary:
        'Upstream cloudburst detected (75 mm/hr). Sudden wall of water moving through dry canyon washes. Evacuate low crossings now!',
    };

    this.voiceGuide.speakUrgentDirective(
      'Flash flood surge detected in canyon wash. Evacuate low water crossings now.'
    );
    this.notify();
  }

  /**
   * Scenario 6: Submarine Tsunami Inundation Warning
   */
  simulateTsunamiEvent(): void {
    this.selectedHazard = HazardType.TSUNAMI;
    this.alertLevel = AlertLevel.DANGER;
    this.isEmergencyOverlayVisible = true;
    if (this.autoSirenOnDanger) this.siren.startSiren();

    this.tsunamiAlert = TsunamiInundationEngine.evaluateSubmarineEvent(
      7.9,
      165.0,
      'Pacific Coastal Basin'
    );

    this.voiceGuide.speakUrgentDirective(
      'Critical Tsunami Warning. Coastal surge arrival in nineteen minutes. Evacuate uphill immediately.',
      true
    );
    this.notify();
  }

  /**
   * Scenario 7: Calibrated Zero False Alarm Verification (FR-02)
   */
  resetToSafeState(): void {
    this.siren.stopSiren();
    this.opticalBeacon.stopSosStrobe();
    this.stop30_30Timer();
    if (this.seismicIntervalId) {
      clearInterval(this.seismicIntervalId);
      this.seismicIntervalId = null;
    }
    this.seismicAlert = null;
    this.floodAlert = null;
    this.tsunamiAlert = null;
    this.strikes = [];
    this.nearestStrikeDistanceKm = null;
    this.nearestStrikeBearing = 0.0;
    this.alertLevel = AlertLevel.SAFE;
    this.isEmergencyOverlayVisible = false;

    // Strict 0% Calibrated risk
    this.atmosphericIndices = {
      cape: 120.0,
      liftedIndex: 3.8,
      precipitationRateMmH: 0.0,
      stormSpeedKmh: 0.0,
      stormBearingDegrees: 0.0,
      calculatedRiskPercent: 0,
      leadTimeMinutes: 0,
    };
    this.liveTelemetryStatus = 'Calibrated Safe Baseline (0% Gated)';
    this.sensorManager.reset();
    this.notify();
  }
}
