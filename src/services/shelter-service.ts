/**
 * Warnly Hardened Shelter Finder Service (FR-06)
 * Locates verified civil shelters and reinforced concrete facilities.
 * Calculates dynamic Haversine distance, compass azimuth, and walking time.
 * 100% operational offline during telecommunications blackout (NFR 5.3).
 */

import { HardenedShelter } from '../types/convective';
import { GeodesicPhysics } from '../physics/geodesics';

export class ShelterService {
  // Base verified municipal civil shelters
  private baseShelters: Array<Omit<HardenedShelter, 'distanceKm' | 'bearingDegrees' | 'walkingTimeMinutes'>> = [
    {
      id: 'SHELTER-CIVIC-01',
      name: 'Civic High-Ridge Concrete Bunker',
      type: 'CONCRETE_BUNKER',
      latitude: 37.783,
      longitude: -122.414,
      capacity: 650,
      hasBackupPower: true,
      hasFirstAid: true,
      elevationMeters: 74,
      highGroundAdvantageMeters: 52,
      accessNotes: 'Reinforced concrete Level -1. Dual diesel generator backup. Direct emergency siren link.',
    },
    {
      id: 'SHELTER-METRO-02',
      name: 'Civic Center Subterranean Metro Terminal',
      type: 'SUBTERRANEAN_METRO',
      latitude: 37.779,
      longitude: -122.413,
      capacity: 1500,
      hasBackupPower: true,
      hasFirstAid: true,
      elevationMeters: 18,
      highGroundAdvantageMeters: 0,
      accessNotes: 'Underground mezzanine concourse. Completely shielded from direct lightning strikes.',
    },
    {
      id: 'SHELTER-COMM-03',
      name: 'North Valley Municipal Sports Pavilion',
      type: 'REINFORCED_SCHOOL',
      latitude: 37.768,
      longitude: -122.431,
      capacity: 900,
      hasBackupPower: true,
      hasFirstAid: false,
      elevationMeters: 88,
      highGroundAdvantageMeters: 66,
      accessNotes: 'Grounded steel girder roof with Faraday cage certification. Use North entrance doors.',
    },
    {
      id: 'SHELTER-CIVIL-04',
      name: 'Central District Fire Station #3 Aux Shelter',
      type: 'COMMUNITY_CIVIL_SHELTER',
      latitude: 37.788,
      longitude: -122.402,
      capacity: 400,
      hasBackupPower: true,
      hasFirstAid: true,
      elevationMeters: 45,
      highGroundAdvantageMeters: 23,
      accessNotes: 'Emergency medical staff on site. Heavy industrial lightning rods installed.',
    },
    {
      id: 'SHELTER-CAMPUS-05',
      name: 'St. Jude Tech Academy Underground Gymnasium',
      type: 'REINFORCED_SCHOOL',
      latitude: 37.762,
      longitude: -122.408,
      capacity: 850,
      hasBackupPower: false,
      hasFirstAid: true,
      elevationMeters: 60,
      highGroundAdvantageMeters: 38,
      accessNotes: 'Interior basement courts. No exterior glass. Automatic magnetic door latches.',
    },
  ];

  /**
   * Evaluates all shelters relative to user's real-time coordinate.
   * Sorted by nearest distance first.
   */
  public getEvaluatedShelters(userLat: number, userLon: number): HardenedShelter[] {
    const walkingSpeedKmh = 4.8; // Standard pedestrian walking pace in km/h

    return this.baseShelters
      .map((base) => {
        const distanceKm = GeodesicPhysics.haversineDistanceKm(
          userLat,
          userLon,
          base.latitude,
          base.longitude
        );

        const bearingDegrees = GeodesicPhysics.initialBearingDegrees(
          userLat,
          userLon,
          base.latitude,
          base.longitude
        );

        // Walking time in minutes = (distance in km / 4.8 km/h) * 60 min
        const walkingTimeMinutes = Math.max(1, Math.round((distanceKm / walkingSpeedKmh) * 60));

        return {
          ...base,
          distanceKm: Math.round(distanceKm * 100) / 100,
          bearingDegrees: Math.round(bearingDegrees),
          walkingTimeMinutes,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  public findIndoorRefuge(nodes: Array<{ id: string; kind: string; accessible: boolean }>, edges: Array<{ from: string; to: string; blocked?: boolean }>, fromId: string): string[] {
    const adj = new Map<string, string[]>();
    for (const e of edges) {
      if (e.blocked) continue;
      if (!adj.has(e.from)) adj.set(e.from, []);
      adj.get(e.from)!.push(e.to);
    }
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const prev = new Map<string, string | null>([[fromId, null]]);
    const q: string[] = [fromId];
    let found: string | null = null;
    while (q.length) {
      const cur = q.shift()!;
      if (byId.get(cur)?.kind === 'REFUGE' && byId.get(cur)?.accessible) { found = cur; break; }
      for (const n of adj.get(cur) ?? []) { if (prev.has(n)) continue; prev.set(n, cur); q.push(n); }
    }
    if (!found) return [];
    const path: string[] = []; let c: string | null | undefined = found;
    while (c) { path.unshift(c); c = prev.get(c); }
    return path;
  }

  /**
   * Generates step-by-step offline tactical walking directions to chosen shelter.
   */
  public getOfflineDirections(
    shelter: HardenedShelter,
    userBearingDeg: number
  ): string[] {
    const cardinal = GeodesicPhysics.bearingToCardinal(shelter.bearingDegrees);
    const relativeTurn = Math.round((shelter.bearingDegrees - userBearingDeg + 360) % 360);
    const turnDirection =
      relativeTurn < 20 || relativeTurn > 340
        ? 'Head straight ahead'
        : relativeTurn <= 180
        ? `Bear right (${relativeTurn}°)`
        : `Bear left (${360 - relativeTurn}°);`;

    return [
      `1. Immediate evacuation: ${turnDirection} toward heading ${shelter.bearingDegrees}° (${cardinal}).`,
      `2. Distance to target: ${shelter.distanceKm} km (approx. ${shelter.walkingTimeMinutes} min brisk walk).`,
      `3. Caution: Avoid open fields, metal fencing, and solitary tall trees while en route.`,
      `4. High ground profile: Climb +${shelter.highGroundAdvantageMeters}m to reach elevation ${shelter.elevationMeters}m.`,
      `5. Upon arrival: Enter through heavy reinforced doors. Do not stand near window frames.`,
    ];
  }
}
