/**
 * Warnly Optical SOS Strobe Engine (FR-05)
 * Morse code (... --- ...) optical beacon using both screen brightness pulses
 * and hardware camera LED torch (via MediaStream ImageCapture track if available).
 */

export type StrobeListener = (isLit: boolean) => void;

export class OpticalStrobeEngine {
  private isStrobeRunning: boolean = false;
  private listeners: StrobeListener[] = [];
  private mediaStreamTrack: any = null;
  private intervalId: any = null;

  // Standard Morse SOS timing in milliseconds
  // Dot = 150ms, Dash = 450ms, intra-char gap = 150ms, inter-word gap = 900ms
  // Pattern sequence: [duration, isOn]
  private readonly SOS_SEQUENCE: Array<{ duration: number; lit: boolean }> = [
    // S: . . .
    { duration: 150, lit: true },
    { duration: 120, lit: false },
    { duration: 150, lit: true },
    { duration: 120, lit: false },
    { duration: 150, lit: true },
    { duration: 350, lit: false },
    // O: - - -
    { duration: 450, lit: true },
    { duration: 120, lit: false },
    { duration: 450, lit: true },
    { duration: 120, lit: false },
    { duration: 450, lit: true },
    { duration: 350, lit: false },
    // S: . . .
    { duration: 150, lit: true },
    { duration: 120, lit: false },
    { duration: 150, lit: true },
    { duration: 120, lit: false },
    { duration: 150, lit: true },
    { duration: 800, lit: false }, // Repeat delay
  ];

  public get isRunning(): boolean {
    return this.isStrobeRunning;
  }

  public subscribe(listener: StrobeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(isLit: boolean) {
    this.listeners.forEach((l) => l(isLit));
    this.setTorch(isLit);
  }

  /**
   * Starts the Morse SOS sequence loop.
   */
  public async start(): Promise<void> {
    if (this.isStrobeRunning) return;
    this.isStrobeRunning = true;

    // Attempt to acquire camera flashlight torch if running in mobile browser
    try {
      if (typeof navigator !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        const track = stream.getVideoTracks()[0];
        const capabilities = (track as any).getCapabilities?.();
        if (capabilities?.torch) {
          this.mediaStreamTrack = track;
        }
      }
    } catch {}

    this.runLoop(0);
  }

  private runLoop(stepIndex: number) {
    if (!this.isStrobeRunning) {
      this.notify(false);
      return;
    }

    const currentStep = this.SOS_SEQUENCE[stepIndex];
    this.notify(currentStep.lit);

    this.intervalId = setTimeout(() => {
      const nextIndex = (stepIndex + 1) % this.SOS_SEQUENCE.length;
      this.runLoop(nextIndex);
    }, currentStep.duration);
  }

  private async setTorch(on: boolean) {
    if (this.mediaStreamTrack) {
      try {
        await this.mediaStreamTrack.applyConstraints({
          advanced: [{ torch: on }],
        });
      } catch {}
    }
  }

  /**
   * Stops the strobe immediately and releases hardware torch.
   */
  public stop(): void {
    this.isStrobeRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.notify(false);

    if (this.mediaStreamTrack) {
      try {
        this.mediaStreamTrack.stop();
      } catch {}
      this.mediaStreamTrack = null;
    }
  }
}
