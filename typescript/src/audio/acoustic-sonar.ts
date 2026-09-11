/**
 * Blind / Zero-Visibility Acoustic Homing Sonar
 * Emits directional audio chirps directly via Web Audio API:
 *  - Aligned (±10° of shelter): Rapid 1200 Hz high-pitch chirps (5 pings/sec) + haptic pulses
 *  - Off-course: Slow 440 Hz low-pitch pings (1 ping/sec)
 * Enables eyes-free evacuation through dense smoke, blizzard whiteouts, and darkness.
 */
export class AcousticHomingBeeper {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;
  private _isActive = false;
  private _isAligned = false;

  get isActive(): boolean {
    return this._isActive;
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startHoming(): void {
    if (this._isActive) return;
    this._isActive = true;
    this.initAudio();
    this.scheduleNextPing();
  }

  stopHoming(): void {
    this._isActive = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  updateHeadingDelta(deltaDegrees: number): void {
    this._isAligned = Math.abs(deltaDegrees) <= 10.0;
  }

  private scheduleNextPing() {
    if (!this._isActive) return;

    this.playChirp(this._isAligned);

    // Aligned: 200ms interval (5 chirps/s), Off-course: 1000ms interval (1 ping/s)
    const delayMs = this._isAligned ? 200 : 1000;
    this.intervalId = setTimeout(() => {
      this.scheduleNextPing();
    }, delayMs);
  }

  private playChirp(aligned: boolean) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const freq = aligned ? 1200 : 440;
      const duration = aligned ? 0.04 : 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);

      // Subtle haptic vibration pulse if browser supports navigator.vibrate
      if (aligned && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch (e) {
      // Audio autoplay policy or background tab restriction
    }
  }
}
