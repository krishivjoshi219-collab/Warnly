/**
 * GeoMath & Geophysical Kinematics Engine
 * Implements high-precision spherical geodesy and seismic/storm differential calculations.
 */

const EARTH_RADIUS_KM = 6371.0;

export class GeoMath {
  /**
   * Great-Circle Haversine distance between two coordinates in kilometers.
   */
  static haversineDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  /**
   * Initial azimuth bearing from coordinate 1 to coordinate 2 in degrees (0° - 360°).
   */
  static calculateBearingDegrees(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const phi1 = this.toRadians(lat1);
    const phi2 = this.toRadians(lat2);
    const deltaLambda = this.toRadians(lon2 - lon1);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x =
      Math.cos(phi1) * Math.sin(phi2) -
      Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    const theta = Math.atan2(y, x);
    return (this.toDegrees(theta) + 360.0) % 360.0;
  }

  /**
   * Project a destination coordinate from start coordinate, bearing, and distance.
   */
  static projectCoordinate(
    lat: number,
    lon: number,
    distanceKm: number,
    bearingDegrees: number
  ): { latitude: number; longitude: number } {
    const delta = distanceKm / EARTH_RADIUS_KM;
    const theta = this.toRadians(bearingDegrees);
    const phi1 = this.toRadians(lat);
    const lambda1 = this.toRadians(lon);

    const phi2 = Math.asin(
      Math.sin(phi1) * Math.cos(delta) +
        Math.cos(phi1) * Math.sin(delta) * Math.cos(theta)
    );

    const lambda2 =
      lambda1 +
      Math.atan2(
        Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
        Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2)
      );

    return {
      latitude: this.toDegrees(phi2),
      longitude: this.toDegrees(lambda2),
    };
  }

  /**
   * Seismic P/S Differential Arrival Lead-Time
   * Primary (P) wave speed ~ 6.0 km/s, Secondary shear (S) wave speed ~ 3.5 km/s.
   * Δt = d * (1/vs - 1/vp) ~ d * (0.2857 - 0.1667) = d * 0.119 s/km
   */
  static calculateSeismicCountdownSeconds(distanceKm: number): number {
    const pWaveSpeedKms = 6.0;
    const sWaveSpeedKms = 3.5;
    const differentialSeconds =
      distanceKm * (1.0 / sWaveSpeedKms - 1.0 / pWaveSpeedKms);
    return Math.max(2, Math.round(differentialSeconds));
  }

  /**
   * Storm Motion Vector: Closest Point of Approach (CPA)
   * Solves: t_CPA = -(r · v) / |v|^2
   */
  static calculateClosestPointOfApproach(
    distanceKm: number,
    bearingDeg: number,
    stormSpeedKmh: number,
    stormBearingDeg: number
  ): { cpaMinutes: number; cpaDistanceKm: number } {
    if (stormSpeedKmh <= 0.5) {
      return { cpaMinutes: 0, cpaDistanceKm: distanceKm };
    }

    const r_rad = this.toRadians(bearingDeg);
    const rx = distanceKm * Math.sin(r_rad);
    const ry = distanceKm * Math.cos(r_rad);

    const v_rad = this.toRadians(stormBearingDeg);
    const vx = stormSpeedKmh * Math.sin(v_rad);
    const vy = stormSpeedKmh * Math.cos(v_rad);

    const vMagSq = vx * vx + vy * vy;
    const rDotV = rx * vx + ry * vy;

    const tHours = -rDotV / vMagSq;

    if (tHours <= 0) {
      // Storm moving away
      return { cpaMinutes: 0, cpaDistanceKm: distanceKm };
    }

    const cpaX = rx + vx * tHours;
    const cpaY = ry + vy * tHours;
    const cpaDist = Math.sqrt(cpaX * cpaX + cpaY * cpaY);

    return {
      cpaMinutes: Math.round(tHours * 60.0),
      cpaDistanceKm: Math.round(cpaDist * 10) / 10,
    };
  }

  private static toRadians(deg: number): number {
    return (deg * Math.PI) / 180.0;
  }

  private static toDegrees(rad: number): number {
    return (rad * 180.0) / Math.PI;
  }
}
