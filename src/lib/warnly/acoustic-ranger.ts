/**
 * Warnly Acoustic Flash-to-Bang Precision Rangefinder
 *
 * Computes exact physical distance from user to lightning strike using the
 * thermodynamic speed-of-sound formula:
 *   v_sound = 331.3 * sqrt(1 + T_celsius / 273.15) ≈ 331.3 + 0.606 * T_celsius (m/s)
 *   distance = v_sound * delta_t (seconds)
 */

export interface AcousticRangeResult {
  deltaSeconds: number;
  distanceMeters: number;
  distanceKm: number;
  distanceMiles: number;
  speedOfSoundMs: number;
  temperatureCelsius: number;
  threatLevel: 'IMMEDIATE_LETHAL' | 'HIGH_DANGER' | 'ADVISORY' | 'SAFE_MARGIN';
  safetyGuideline: string;
  timestamp: number;
}

export class AcousticRangerEngine {
  private flashTimestamp: number | null = null;

  /**
   * Computes the thermodynamic speed of sound in air at a given temperature.
   */
  public static calculateSpeedOfSound(temperatureCelsius = 20): number {
    return 331.3 + 0.606 * temperatureCelsius;
  }

  /**
   * Records the initial optical flash timestamp.
   */
  public triggerFlash(now = Date.now()): number {
    this.flashTimestamp = now;
    return this.flashTimestamp;
  }

  /**
   * Records the acoustic thunderclap arrival and calculates distance.
   */
  public triggerThunder(
    thunderTimestamp = Date.now(),
    temperatureCelsius = 20
  ): AcousticRangeResult | null {
    if (!this.flashTimestamp) {
      return null;
    }

    const deltaMs = Math.max(10, thunderTimestamp - this.flashTimestamp);
    const deltaSeconds = deltaMs / 1000;
    const vSound = AcousticRangerEngine.calculateSpeedOfSound(temperatureCelsius);
    const distanceMeters = Math.round(vSound * deltaSeconds);
    const distanceKm = Math.round((distanceMeters / 1000) * 100) / 100;
    const distanceMiles = Math.round((distanceMeters / 1609.34) * 100) / 100;

    let threatLevel: AcousticRangeResult['threatLevel'] = 'SAFE_MARGIN';
    let safetyGuideline = 'Maintain observation. Storm is beyond immediate strike perimeter.';

    if (distanceMeters < 1500) {
      threatLevel = 'IMMEDIATE_LETHAL';
      safetyGuideline =
        'CRITICAL: Strike within 1.5 km. Assume lightning crouch if caught outdoors or ingress interior bunker immediately.';
    } else if (distanceMeters < 5000) {
      threatLevel = 'HIGH_DANGER';
      safetyGuideline =
        'HIGH THREAT: You are within the direct stepped-leader ground strike zone. Cease outdoor transit immediately.';
    } else if (distanceMeters < 10000) {
      threatLevel = 'ADVISORY';
      safetyGuideline =
        'ADVISORY: Follow 30/30 rule. Lightning can strike up to 10-15 km ahead of storm precipitation core.';
    }

    const result: AcousticRangeResult = {
      deltaSeconds: Math.round(deltaSeconds * 10) / 10,
      distanceMeters,
      distanceKm,
      distanceMiles,
      speedOfSoundMs: Math.round(vSound * 10) / 10,
      temperatureCelsius,
      threatLevel,
      safetyGuideline,
      timestamp: thunderTimestamp,
    };

    this.flashTimestamp = null;
    return result;
  }

  public static rangeFromEcho(deltaSec: number, tempC = 20): number {
    const c = 331.3 + 0.606 * tempC;
    return Math.max(0, (c / 2) * deltaSec);
  }

  public reset(): void {
    this.flashTimestamp = null;
  }

  public isMeasuring(): boolean {
    return this.flashTimestamp !== null;
  }

  public getElapsedSeconds(now = Date.now()): number {
    if (!this.flashTimestamp) return 0;
    return Math.max(0, (now - this.flashTimestamp) / 1000);
  }
}
