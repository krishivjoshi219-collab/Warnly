/**
 * LIFERESERVE — Algorithmic survivor energy budget.
 * Schedules rendezvous beacons to stretch 8h -> 72h+.
 */
export interface PowerProfile {
  batteryMah: number;
  batteryPercent: number;
  avgDrainMa: number;
  beaconBurstMa: number;
  beaconSecsPerCycle: number;
  cycleMin: number;
}

export interface ReservePlan {
  standardHours: number;
  reserveHours: number;
  rendezvousEveryMin: number;
  beaconSecs: number;
  reserveBufferPct: number;
  timeline: string;
}

export function planReserve(p: PowerProfile): ReservePlan {
  const usableMah = (p.batteryMah * p.batteryPercent) / 100;
  const standardHours = usableMah / Math.max(1, p.avgDrainMa);
  // Duty-cycled: mostly deep sleep + short BLE bursts.
  const cycleH = p.cycleMin / 60;
  const avgReserveMa = 8 + (p.beaconBurstMa * (p.beaconSecsPerCycle / 3600)) / Math.max(0.01, cycleH);
  const reserveHours = usableMah * 0.9 / Math.max(5, avgReserveMa);
  return {
    standardHours: Math.round(standardHours * 10) / 10,
    reserveHours: Math.round(Math.min(120, reserveHours) * 10) / 10,
    rendezvousEveryMin: p.cycleMin,
    beaconSecs: p.beaconSecsPerCycle,
    reserveBufferPct: 10,
    timeline: `${standardHours.toFixed(1)}h standard vs ${Math.min(120, reserveHours).toFixed(1)}h reserve (30s beacon every ${p.cycleMin}m)`,
  };
}

export function shouldBeacon(nowMs: number, epochMs: number, everyMin: number, windowSec: number): boolean {
  const cycleMs = everyMin * 60 * 1000;
  const into = (nowMs - epochMs) % cycleMs;
  return into < windowSec * 1000;
}
