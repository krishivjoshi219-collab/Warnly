/**
 * Warnly Barometric Downburst & Microburst Detection Engine
 * Analyzes barometric tendency (dP/dt) to detect approaching convective gust fronts,
 * dry microbursts, and rapid pressure drops prior to radar returns.
 */

export interface PressureReading {
  pressureHpa: number;
  timestamp: number;
}

export interface BarometricAnalysis {
  currentHpa: number;
  delta1hHpa: number;
  delta3hHpa: number;
  tendency: 'STEADY' | 'RISING' | 'FALLING_RAPID' | 'MICROBURST_SURGE';
  hasMicroburstRisk: boolean;
  leadTimeMinutes: number;
  advisoryText: string;
}

export class BarometerAnalyzer {
  private static history: PressureReading[] = [];
  private static readonly MAX_HISTORY = 500;

  static reset(): void {
    this.history = [];
  }

  static record(pressureHpa: number, timestamp: number = Date.now()): void {
    this.history.push({ pressureHpa, timestamp });
    if (this.history.length > this.MAX_HISTORY) {
      this.history = this.history.slice(-this.MAX_HISTORY);
    }
    // Keep max 24 hours of readings
    const cutoff = timestamp - 24 * 60 * 60 * 1000;
    this.history = this.history.filter((r) => r.timestamp >= cutoff);
  }

  static analyze(currentPressure: number, windSpeedKmh: number = 0): BarometricAnalysis {
    const now = Date.now();
    this.record(currentPressure, now);

    // Find reading closest to 1 hour ago
    const oneHourAgo = now - 60 * 60 * 1000;
    const threeHoursAgo = now - 3 * 60 * 60 * 1000;

    let p1h = currentPressure;
    let p3h = currentPressure;

    let minDiff1h = Infinity;
    let minDiff3h = Infinity;

    for (const r of this.history) {
      const diff1 = Math.abs(r.timestamp - oneHourAgo);
      if (diff1 < minDiff1h) {
        minDiff1h = diff1;
        p1h = r.pressureHpa;
      }
      const diff3 = Math.abs(r.timestamp - threeHoursAgo);
      if (diff3 < minDiff3h) {
        minDiff3h = diff3;
        p3h = r.pressureHpa;
      }
    }

    const delta1h = Math.round((currentPressure - p1h) * 10) / 10;
    const delta3h = Math.round((currentPressure - p3h) * 10) / 10;

    // Severe weather criteria:
    // delta3h < -3.0 hPa in 3 hours indicates a significant approaching low/storm system.
    // delta1h < -1.8 hPa indicates an imminent microburst or convective squall line.
    const isRapidDrop = delta3h <= -2.5 || delta1h <= -1.5;
    const isMicroburst = delta1h <= -2.2 || (delta1h <= -1.5 && windSpeedKmh > 40);

    let tendency: BarometricAnalysis['tendency'] = 'STEADY';
    let advisoryText = 'Atmospheric barometric tendency is nominal.';
    let leadTimeMinutes = 0;

    if (isMicroburst) {
      tendency = 'MICROBURST_SURGE';
      leadTimeMinutes = 25;
      advisoryText = 'Severe pressure plunge: Imminent convective downdraft / high-speed gust front.';
    } else if (isRapidDrop) {
      tendency = 'FALLING_RAPID';
      leadTimeMinutes = 45;
      advisoryText = 'Rapid barometric drop: Convective storm front approaching within 45 minutes.';
    } else if (delta1h >= 1.5) {
      tendency = 'RISING';
      advisoryText = 'Pressure rising: Post-frontal stabilization underway.';
    }

    return {
      currentHpa: currentPressure,
      delta1hHpa: delta1h,
      delta3hHpa: delta3h,
      tendency,
      hasMicroburstRisk: isMicroburst || isRapidDrop,
      leadTimeMinutes,
      advisoryText,
    };
  }
}
