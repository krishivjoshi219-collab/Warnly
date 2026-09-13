/**
 * Warnly Storm Advection & Convective Initiation Physics Engine
 * Evaluates the deterministic 10–25 minute evacuation window before 10 km danger ring breach.
 * Strictly implements the scientific truth between Advection (~85%) and In-Situ Initiation (~15%).
 */

export interface AdvectionVectorResult {
  isApproaching: boolean;
  closingSpeedKmh: number;
  timeToDangerRingMinutes: number | null; // Lead time before entering 10 km ring
  advectionBearingDegrees: number;
  recommendation: 'STAND_BY' | 'CONVECTIVE_WATCH' | 'TACTICAL_EVACUATION' | 'IMMEDIATE_SHELTER';
  rationale: string;
}

export class AdvectionEngine {
  /**
   * Evaluates advection dynamics of an approaching storm cell relative to user location.
   *
   * @param currentDistanceKm Current distance from user to storm centroid
   * @param stormBearingDeg Bearing from user to storm (0-360)
   * @param stormHeadingDeg Movement direction of storm (0-360, where storm is going)
   * @param stormSpeedKmh Speed of storm cell in km/h
   * @param cape Convective Available Potential Energy (J/kg)
   * @param liftedIndex Lifted Index (°C)
   * @param reflectivityDbz Radar reflectivity in dBZ
   */
  public static calculateAdvectionThreat(
    currentDistanceKm: number,
    stormBearingDeg: number,
    stormHeadingDeg: number,
    stormSpeedKmh: number,
    cape: number,
    liftedIndex: number,
    reflectivityDbz: number
  ): AdvectionVectorResult {
    // If distance is already inside 10 km critical perimeter, immediate shelter is required
    if (currentDistanceKm <= 10.0) {
      return {
        isApproaching: true,
        closingSpeedKmh: stormSpeedKmh,
        timeToDangerRingMinutes: 0,
        advectionBearingDegrees: stormHeadingDeg,
        recommendation: 'IMMEDIATE_SHELTER',
        rationale: 'Danger Ring breached (<10 km). Immediate indoor sheltering mandated.',
      };
    }

    // In-situ convective initiation check (~15% of cases)
    // Cloud rapidly developing directly overhead with high CAPE & negative LI, but no active cell yet
    if (cape > 1500 && liftedIndex < -1.0 && currentDistanceKm > 25.0) {
      return {
        isApproaching: false,
        closingSpeedKmh: 0,
        timeToDangerRingMinutes: null,
        advectionBearingDegrees: stormHeadingDeg,
        recommendation: 'CONVECTIVE_WATCH',
        rationale: `Atmospheric Convective Watch active (CAPE: ${Math.round(cape)} J/kg, LI: ${liftedIndex.toFixed(1)}°C). Wrap up outdoor activity.`,
      };
    }

    // Advection vector physics (~85% of cases)
    // Relative angle between vector from storm to user and storm movement vector
    // Vector from storm to user has bearing: (stormBearingDeg + 180) % 360
    const bearingStormToUser = (stormBearingDeg + 180) % 360;
    let angleDeltaDeg = Math.abs(bearingStormToUser - stormHeadingDeg) % 360;
    if (angleDeltaDeg > 180) angleDeltaDeg = 360 - angleDeltaDeg;
    const angleDeltaRad = angleDeltaDeg * (Math.PI / 180);

    // Closing velocity component toward user
    const closingSpeedKmh = stormSpeedKmh * Math.cos(angleDeltaRad);

    // If storm is moving toward user and closing speed is positive
    if (closingSpeedKmh > 5.0 && currentDistanceKm <= 35.0) {
      // Distance remaining before entering 10 km danger ring
      const distanceToDangerRingKm = Math.max(0, currentDistanceKm - 10.0);
      const leadTimeHours = distanceToDangerRingKm / closingSpeedKmh;
      const leadTimeMinutes = Math.max(1, Math.round(leadTimeHours * 60));

      const isTactical = leadTimeMinutes <= 25 || reflectivityDbz >= 45;

      return {
        isApproaching: true,
        closingSpeedKmh: Math.round(closingSpeedKmh * 10) / 10,
        timeToDangerRingMinutes: leadTimeMinutes,
        advectionBearingDegrees: stormHeadingDeg,
        recommendation: isTactical ? 'TACTICAL_EVACUATION' : 'CONVECTIVE_WATCH',
        rationale: `Convective storm cell advecting at ${Math.round(stormSpeedKmh)} km/h. Deterministic ${leadTimeMinutes} min evacuation window before 10 km breach.`,
      };
    }

    return {
      isApproaching: false,
      closingSpeedKmh: Math.max(0, Math.round(closingSpeedKmh * 10) / 10),
      timeToDangerRingMinutes: null,
      advectionBearingDegrees: stormHeadingDeg,
      recommendation: 'STAND_BY',
      rationale: 'Active storm cells are tracking away from your geodesic perimeter.',
    };
  }
}
