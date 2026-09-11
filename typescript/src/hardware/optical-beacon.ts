/**
 * FR-05: Morse Code SOS Optical Beacon
 * Generates international Morse SOS (... --- ...) optical signaling:
 *  - High-intensity screen strobe overlay
 *  - Hardware camera torch strobe via MediaTrackConstraints (on supported mobile browsers)
 */
export class OpticalBeaconManager {
  private _isStrobeActive = false;
  private _screenFlashState = false;
  private strobeIntervalId: any = null;
  private mediaStream: MediaStream | null = null;
  private track: MediaStreamTrack | null = null;
  private listeners: (() => void)[] = [];

  get isStrobeActive(): boolean {
    return this._isStrobeActive;
  }
  get screenFlashState(): boolean {
    return this._screenFlashState;
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

  async startSosStrobe(): Promise<void> {
    if (this._isStrobeActive) return;
    this._isStrobeActive = true;
    this.notify();

    // Attempt hardware torch access
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        this.track = this.mediaStream.getVideoTracks()[0];
      }
    } catch (e) {
      // Torch permission denied or unsupported; fallback to screen strobe
    }

    this.runMorseLoop();
  }

  stopSosStrobe(): void {
    this._isStrobeActive = false;
    this._screenFlashState = false;
    if (this.strobeIntervalId) {
      clearTimeout(this.strobeIntervalId);
      this.strobeIntervalId = null;
    }
    this.setTorch(false);
    if (this.track) {
      this.track.stop();
      this.track = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.notify();
  }

  private async setTorch(on: boolean): Promise<void> {
    this._screenFlashState = on;
    this.notify();
    if (this.track && (this.track as any).applyConstraints) {
      try {
        await (this.track as any).applyConstraints({
          advanced: [{ torch: on }],
        });
      } catch (e) {
        // Torch constraint not supported
      }
    }
  }

  private async runMorseLoop(): Promise<void> {
    if (!this._isStrobeActive) return;

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const pulse = async (durationMs: number) => {
      if (!this._isStrobeActive) return;
      await this.setTorch(true);
      await delay(durationMs);
      await this.setTorch(false);
      await delay(150); // Inter-element gap
    };

    while (this._isStrobeActive) {
      // 'S': . . . (150ms dot)
      await pulse(150);
      await pulse(150);
      await pulse(150);
      await delay(300); // Inter-letter gap

      // 'O': - - - (450ms dash)
      await pulse(450);
      await pulse(450);
      await pulse(450);
      await delay(300); // Inter-letter gap

      // 'S': . . . (150ms dot)
      await pulse(150);
      await pulse(150);
      await pulse(150);

      // Inter-word gap
      await delay(1200);
    }
  }
}
