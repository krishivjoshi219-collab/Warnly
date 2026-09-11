import { TsunamiAlert } from '../models/types';

/**
 * Tsunami & Coastal Storm Surge Inundation Physics Engine
 * Implements shallow-water gravity wave kinematics:
 *   v = sqrt(g * d)
 * Evaluates coastal distance, wave ETA countdown, and mandatory vertical ascent clearance.
 */
export class TsunamiInundationEngine {
  private static readonly GRAVITY = 9.81; // m/s^2
  private static readonly AVERAGE_OCEAN_DEPTH_METERS = 4000.0; // Average oceanic basin depth

  /**
   * Compute deep ocean phase speed in km/h
   * v = sqrt(9.81 * 4000) ~ 198 m/s = 713 km/h
   */
  static calculateWaveSpeedKmh(depthMeters: number = this.AVERAGE_OCEAN_DEPTH_METERS): number {
    const speedMps = Math.sqrt(this.GRAVITY * depthMeters);
    return speedMps * 3.6;
  }

  /**
   * Compute Tsunami arrival ETA in minutes from epicenter distance
   */
  static calculateArrivalMinutes(distanceKm: number, averageSpeedKmh: number = 720.0): number {
    const hours = distanceKm / averageSpeedKmh;
    // Add 6 minutes deceleration buffer for continental shelf shoaling
    const totalMinutes = Math.floor(hours * 60.0) + 6;
    return Math.max(4, totalMinutes);
  }

  /**
   * Estimate coastal wave runup height (meters) based on earthquake magnitude
   */
  static estimateRunupHeightMeters(magnitude: number): number {
    if (magnitude >= 8.5) return 24;
    if (magnitude >= 7.8) return 14;
    if (magnitude >= 7.2) return 8;
    if (magnitude >= 6.8) return 4;
    return 2;
  }

  /**
   * Mandatory vertical clearance required to escape inundation crest safely (+20% safety margin)
   */
  static calculateMandatoryVerticalClearance(runupHeightMeters: number): number {
    return runupHeightMeters + 8; // +8m safety margin above maximum runup crest
  }

  /**
   * Evaluate a submarine seismic event for tsunami generation potential
   */
  static evaluateSubmarineEvent(
    magnitude: number,
    epicenterDistanceKm: number,
    coastalName: string = 'Coastal Inundation Sector'
  ): TsunamiAlert {
    const speedKmh = this.calculateWaveSpeedKmh();
    const etaMinutes = this.calculateArrivalMinutes(epicenterDistanceKm, speedKmh);
    const runupMeters = this.estimateRunupHeightMeters(magnitude);
    const safeClearanceMeters = this.calculateMandatoryVerticalClearance(runupMeters);

    return {
      id: `TSU-${Date.now()}`,
      earthquakeMagnitude: magnitude,
      epicenterDistanceKm: epicenterDistanceKm,
      deepOceanSpeedKmh: Math.round(speedKmh),
      estimatedArrivalMinutes: etaMinutes,
      projectedRunupHeightMeters: runupMeters,
      verticalAscentRequiredMeters: safeClearanceMeters,
      coastalBasinName: coastalName,
      evacuationDirective: `CRITICAL TSUNAMI ALERT: Destructive surge wave incoming in ${etaMinutes} minutes. Mandatory vertical evacuation: Climb +${safeClearanceMeters}m above sea level immediately! Avoid river channels and low-lying coastal paths.`,
    };
  }
}
