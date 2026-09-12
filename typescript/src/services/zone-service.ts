/**
 * Warnly Family Shield Multi-Zone Perimeter Service (FR-07)
 * Enables monitoring up to 10 distinct geographic zones simultaneously.
 * Sub-millisecond geodesic distance evaluation for remote family members and worksites.
 */

import { AlertLevel, LightningStrike, MonitoredZone } from '../types/convective';
import { GeodesicPhysics } from '../physics/geodesics';

export class ZoneService {
  private zones: MonitoredZone[] = [
    {
      id: 'ZONE-HOME-01',
      name: 'Primary Residence (Home)',
      category: 'HOME',
      latitude: 37.7749,
      longitude: -122.4194,
      radiusKm: 10.0,
      alertLevel: AlertLevel.SAFE,
      nearestStrikeKm: null,
      activeStrikesInside: 0,
      contactName: 'Family Household',
      contactPhone: '+1 (555) 019-2834',
    },
    {
      id: 'ZONE-SCH-02',
      name: 'Lincoln Middle School & Track',
      category: 'SCHOOL',
      latitude: 37.765,
      longitude: -122.441,
      radiusKm: 10.0,
      alertLevel: AlertLevel.SAFE,
      nearestStrikeKm: null,
      activeStrikesInside: 0,
      contactName: 'Coach Henderson',
      contactPhone: '+1 (555) 018-9271',
    },
    {
      id: 'ZONE-FARM-03',
      name: 'Delta Valley Farmland (North Field)',
      category: 'FARMLAND',
      latitude: 37.795,
      longitude: -122.398,
      radiusKm: 15.0,
      alertLevel: AlertLevel.SAFE,
      nearestStrikeKm: null,
      activeStrikesInside: 0,
      contactName: 'Field Crew Lead (Carlos)',
      contactPhone: '+1 (555) 017-4829',
    },
    {
      id: 'ZONE-SITE-04',
      name: 'Apex Tower Scaffolding Crane #3',
      category: 'WORKSITE',
      latitude: 37.789,
      longitude: -122.401,
      radiusKm: 16.1, // OSHA 10-mile suspension threshold (~16.1 km)
      alertLevel: AlertLevel.SAFE,
      nearestStrikeKm: null,
      activeStrikesInside: 0,
      contactName: 'Safety Sup. (Miller)',
      contactPhone: '+1 (555) 016-3910',
    },
    {
      id: 'ZONE-ATH-05',
      name: 'Pacific Youth Soccer Complex',
      category: 'ATHLETIC_FIELD',
      latitude: 37.755,
      longitude: -122.425,
      radiusKm: 10.0,
      alertLevel: AlertLevel.SAFE,
      nearestStrikeKm: null,
      activeStrikesInside: 0,
      contactName: 'Athletic Dir. Evans',
      contactPhone: '+1 (555) 015-8821',
    },
  ];

  public getZones(): MonitoredZone[] {
    return [...this.zones];
  }

  public addZone(zone: Omit<MonitoredZone, 'id' | 'alertLevel' | 'nearestStrikeKm' | 'activeStrikesInside'>): boolean {
    if (this.zones.length >= 10) {
      return false; // Max 10 zones enforced per FR-07
    }

    const newZone: MonitoredZone = {
      ...zone,
      id: `ZONE-CUSTOM-${Date.now().toString(36).toUpperCase()}`,
      alertLevel: AlertLevel.SAFE,
      nearestStrikeKm: null,
      activeStrikesInside: 0,
    };
    this.zones.push(newZone);
    return true;
  }

  public removeZone(id: string): void {
    this.zones = this.zones.filter((z) => z.id !== id);
  }

  /**
   * Re-evaluates all zones against active lightning strikes in real-time.
   */
  public evaluateZonesAgainstStrikes(strikes: LightningStrike[]): MonitoredZone[] {
    this.zones = this.zones.map((zone) => {
      let nearestKm: number | null = null;
      let strikesInside = 0;

      for (const strike of strikes) {
        const dist = GeodesicPhysics.haversineDistanceKm(
          zone.latitude,
          zone.longitude,
          strike.latitude,
          strike.longitude
        );

        if (nearestKm === null || dist < nearestKm) {
          nearestKm = dist;
        }

        if (dist <= zone.radiusKm) {
          strikesInside++;
        }
      }

      let alertLevel = AlertLevel.SAFE;
      if (nearestKm !== null) {
        if (nearestKm <= 10.0) {
          alertLevel = AlertLevel.DANGER;
        } else if (nearestKm <= zone.radiusKm || nearestKm <= 15.0) {
          alertLevel = AlertLevel.ADVISORY;
        }
      }

      return {
        ...zone,
        alertLevel,
        nearestStrikeKm: nearestKm !== null ? Math.round(nearestKm * 10) / 10 : null,
        activeStrikesInside: strikesInside,
      };
    });

    return [...this.zones];
  }
}
