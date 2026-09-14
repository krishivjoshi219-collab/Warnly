/**
 * Warnly Geodesic Spatial Physics Engine
 * Single-source wrapper over lib/warnly/risk geodesic math.
 * risk.ts owns the haversine/bearing implementation; this class
 * preserves the legacy GeodesicPhysics API for engine/services.
 */
import { distanceKm, bearingDeg } from "../lib/warnly/risk";

const EARTH_RADIUS_KM = 6371.0088;

export class GeodesicPhysics {
  /**
   * Computes Great-Circle distance between two coordinates using Haversine formula.
   * Runs in RAM in sub-microseconds with zero network roundtrip.
   */
  public static haversineDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    return distanceKm({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 });
  }

  /**
   * Computes forward azimuth (compass bearing) from point 1 to point 2 in degrees [0, 360).
   */
  public static initialBearingDegrees(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    return bearingDeg({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 });
  }

  /**
   * Converts compass bearing into an 8-point or 16-point cardinal compass string (e.g. 'NNE', 'SW').
   */
  public static bearingToCardinal(degrees: number): string {
    const cardinals = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round((degrees % 360) / 22.5) % 16;
    return cardinals[index];
  }

  /**
   * Calculates destination point given distance (km) and bearing (degrees) from origin.
   */
  public static computeDestinationPoint(
    lat: number,
    lon: number,
    distanceKm: number,
    bearingDeg: number
  ): { latitude: number; longitude: number } {
    const toRad = Math.PI / 180;
    const toDeg = 180 / Math.PI;
    const angularDist = distanceKm / EARTH_RADIUS_KM;
    const bearingRad = bearingDeg * toRad;

    const phi1 = lat * toRad;
    const lambda1 = lon * toRad;

    const phi2 = Math.asin(
      Math.sin(phi1) * Math.cos(angularDist) +
      Math.cos(phi1) * Math.sin(angularDist) * Math.cos(bearingRad)
    );

    const lambda2 =
      lambda1 +
      Math.atan2(
        Math.sin(bearingRad) * Math.sin(angularDist) * Math.cos(phi1),
        Math.cos(angularDist) - Math.sin(phi1) * Math.sin(phi2)
      );

    return {
      latitude: phi2 * toDeg,
      longitude: ((lambda2 * toDeg + 540) % 360) - 180,
    };
  }
}
