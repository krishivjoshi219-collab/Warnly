/**
 * Local Sensor Intelligence & Hardware Edge Monitoring
 * Integrates Web APIs for:
 *  - Magnetometer / Gyroscope (DeviceOrientation) -> Compass Heading (0° - 360°)
 *  - 3-Axis Accelerometer (DeviceMotion) -> Seismic Peak Ground Acceleration (PGA in g)
 *  - Barometric Pressure Tendency (ΔP/Δt in hPa/hr)
 */
export class LocalSensorManager {
  private _compassHeading = 0.0;
  private _currentPgaG = 0.0;
  private _peakPgaG = 0.0;
  private _isSeismicAlarm = false;
  private _currentPressureHpa = 1013.25;
  private _pressureDropRateHpaPerHr = 0.0;
  private _isSquallAlarm = false;

  private pressureHistory: { timestamp: number; pressure: number }[] = [];
  private listeners: (() => void)[] = [];

  get compassHeading(): number {
    return this._compassHeading;
  }
  get currentPgaG(): number {
    return this._currentPgaG;
  }
  get peakPgaG(): number {
    return this._peakPgaG;
  }
  get isSeismicAlarm(): boolean {
    return this._isSeismicAlarm;
  }
  get currentPressureHpa(): number {
    return this._currentPressureHpa;
  }
  get pressureDropRateHpaPerHr(): number {
    return this._pressureDropRateHpaPerHr;
  }
  get isSquallAlarm(): boolean {
    return this._isSquallAlarm;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  start(): void {
    if (typeof window === 'undefined') return;

    // 1. Device Orientation (Compass)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        // In mobile browsers, alpha is azimuth heading (0°-360°)
        this._compassHeading = Math.round(e.alpha);
        this.notify();
      }
    };
    window.addEventListener('deviceorientation', handleOrientation, true);

    // 2. Device Motion (Seismic PGA)
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
        const totalAcc = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        // Remove 1g (9.81 m/s^2) static gravitational vector
        const dynamicAccMps2 = Math.abs(totalAcc - 9.81);
        const pgaInG = dynamicAccMps2 / 9.81;

        this._currentPgaG = Math.round(pgaInG * 100) / 100;
        if (this._currentPgaG > this._peakPgaG) {
          this._peakPgaG = this._currentPgaG;
        }

        // MMI IV-V tremor threshold (>0.06g)
        this._isSeismicAlarm = this._currentPgaG >= 0.06;
        this.notify();
      }
    };
    window.addEventListener('devicemotion', handleMotion, true);

    // 3. Baseline Atmospheric Pressure Simulation & Tracking
    this.recordPressure(1013.25);
  }

  recordPressure(pressureHpa: number): void {
    const now = Date.now();
    this.pressureHistory.push({ timestamp: now, pressure: pressureHpa });
    this._currentPressureHpa = pressureHpa;

    // Prune entries older than 3 hours
    const threeHoursAgo = now - 3 * 3600 * 1000;
    this.pressureHistory = this.pressureHistory.filter((p) => p.timestamp >= threeHoursAgo);

    if (this.pressureHistory.length >= 2) {
      const oldest = this.pressureHistory[0];
      const deltaHpa = oldest.pressure - pressureHpa;
      const deltaHours = (now - oldest.timestamp) / (3600 * 1000);
      if (deltaHours > 0.05) {
        this._pressureDropRateHpaPerHr = Math.round((deltaHpa / deltaHours) * 10) / 10;
        this._isSquallAlarm = this._pressureDropRateHpaPerHr >= 2.0;
      }
    }
    this.notify();
  }

  simulateSeismicShock(pgaG: number): void {
    this._currentPgaG = pgaG;
    if (pgaG > this._peakPgaG) this._peakPgaG = pgaG;
    this._isSeismicAlarm = pgaG >= 0.06;
    this.notify();
  }

  simulateSquallDrop(dropRateHpaPerHr: number): void {
    this._pressureDropRateHpaPerHr = dropRateHpaPerHr;
    this._currentPressureHpa = 1004.0;
    this._isSquallAlarm = dropRateHpaPerHr >= 2.0;
    this.notify();
  }

  reset(): void {
    this._currentPgaG = 0.0;
    this._peakPgaG = 0.0;
    this._isSeismicAlarm = false;
    this._currentPressureHpa = 1013.25;
    this._pressureDropRateHpaPerHr = 0.0;
    this._isSquallAlarm = false;
    this.notify();
  }
}
