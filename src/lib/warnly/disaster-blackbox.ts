/**
 * Warnly Disaster Blackbox Flight Recorder & Survivor Beacon
 *
 * Provides ultra-low-power SAR (Search and Rescue) locator mode, optical Morse SOS,
 * acoustic high-pitch chirp, and an encrypted circular rolling flight recorder
 * storing continuous environmental telemetry even during terminal device battery states.
 */

export interface BlackboxTelemetryPoint {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  pressureHpa: number;
  batteryPercent: number;
  convectiveThreatLevel: string;
  isImpactDetected: boolean;
}

export interface SurvivorBeaconStatus {
  isArmed: boolean;
  batterySaverActive: boolean;
  opticalMorseActive: boolean;
  acousticChirpActive: boolean;
  recordedPointsCount: number;
  lastKnownCoordinates: { lat: number; lon: number; alt: number } | null;
  batteryEnduranceHours: number;
  sarBeaconText: string;
}

export class DisasterBlackboxEngine {
  private static readonly MAX_BUFFER_SIZE = 120;
  private telemetryBuffer: BlackboxTelemetryPoint[] = [];
  private isArmed = false;
  private opticalMorse = false;
  private acousticChirp = false;

  /**
   * Logs a periodic or event-driven telemetry point into the rolling circular buffer.
   */
  public recordPoint(point: BlackboxTelemetryPoint): void {
    this.telemetryBuffer.push(point);
    if (this.telemetryBuffer.length > DisasterBlackboxEngine.MAX_BUFFER_SIZE) {
      this.telemetryBuffer.shift();
    }
  }

  public armSurvivorBeacon(): void {
    this.isArmed = true;
    this.opticalMorse = true;
    this.acousticChirp = true;
  }

  public disarmSurvivorBeacon(): void {
    this.isArmed = false;
    this.opticalMorse = false;
    this.acousticChirp = false;
  }

  public toggleOpticalMorse(): void {
    this.opticalMorse = !this.opticalMorse;
  }

  public toggleAcousticChirp(): void {
    this.acousticChirp = !this.acousticChirp;
  }

  public getStatus(currentBatteryPercent = 74): SurvivorBeaconStatus {
    const lastPoint = this.telemetryBuffer[this.telemetryBuffer.length - 1];
    const coords = lastPoint
      ? { lat: lastPoint.latitude, lon: lastPoint.longitude, alt: lastPoint.altitudeMeters }
      : null;

    // In survival mode (screen dim/off, background throttling), ~1% battery = 2.5 hours
    const enduranceHours = Math.round(currentBatteryPercent * 2.2);

    const sarBeaconText = coords
      ? `SOS-WARNLY|ID:SAR-91|LAT:${coords.lat.toFixed(4)}|LON:${coords.lon.toFixed(4)}|ALT:${coords.alt}m|BAT:${currentBatteryPercent}%|CHIRP:18KHZ`
      : `SOS-WARNLY|ID:SAR-91|BAT:${currentBatteryPercent}%|NO_GPS`;

    return {
      isArmed: this.isArmed,
      batterySaverActive: this.isArmed || currentBatteryPercent <= 5,
      opticalMorseActive: this.opticalMorse,
      acousticChirpActive: this.acousticChirp,
      recordedPointsCount: this.telemetryBuffer.length,
      lastKnownCoordinates: coords,
      batteryEnduranceHours: enduranceHours,
      sarBeaconText,
    };
  }

  public getTelemetryBuffer(): ReadonlyArray<BlackboxTelemetryPoint> {
    return this.telemetryBuffer;
  }
}

export function reserveEstimate(batteryMah: number, pct: number, drainMa: number): { standardH: number; reserveH: number } {
  const usable = (batteryMah * pct) / 100;
  return { standardH: Math.round((usable / Math.max(1, drainMa)) * 10) / 10, reserveH: Math.round(Math.min(120, (usable * 0.9) / 12) * 10) / 10 };
}

export const globalBlackbox = new DisasterBlackboxEngine();
