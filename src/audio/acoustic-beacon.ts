/**
 * Warnly Software-Synthesized Acoustic Siren (FR-05)
 * Synthesizes an 880Hz / 440Hz bi-tonal emergency evacuation siren
 * entirely in software RAM using AudioContext OscillatorNodes.
 * Zero external audio asset downloads or network latency.
 */

export class AcousticBeaconSynthesizer {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isSirenActive: boolean = false;
  private toggleTimer: any = null;
  private currentFreq: number = 960;

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public get isPlaying(): boolean {
    return this.isSirenActive;
  }

  /**
   * Starts the 880Hz / 440Hz bi-tonal emergency tactical siren.
   */
  public startSiren(): void {
    if (this.isSirenActive) return;

    try {
      this.initAudio();
      if (!this.audioCtx) return;

      this.isSirenActive = true;
      this.currentFreq = 960;

      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      this.oscillator.type = 'sawtooth';
      this.oscillator.frequency.setValueAtTime(
        this.currentFreq,
        this.audioCtx.currentTime
      );

      // Volume envelope with ramp
      this.gainNode.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(
        0.35,
        this.audioCtx.currentTime + 0.1
      );

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      this.oscillator.start();

      // Bi-tonal alternation: 960 Hz / 640 Hz to match native STREAM_ALARM siren
      this.toggleTimer = setInterval(() => {
        if (!this.isSirenActive || !this.oscillator || !this.audioCtx) return;
        this.currentFreq = this.currentFreq === 960 ? 640 : 960;
        this.oscillator.frequency.setTargetAtTime(
          this.currentFreq,
          this.audioCtx.currentTime,
          0.04
        );
      }, 450);
    } catch (e) {
      console.warn('Acoustic Siren initialization error:', e);
    }
  }

  /**
   * Stops the siren immediately.
   */
  public stopSiren(): void {
    if (!this.isSirenActive) return;

    this.isSirenActive = false;
    if (this.toggleTimer) {
      clearInterval(this.toggleTimer);
      this.toggleTimer = null;
    }

    try {
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.setTargetAtTime(0.001, this.audioCtx.currentTime, 0.05);
      }
      setTimeout(() => {
        if (this.oscillator) {
          try {
            this.oscillator.stop();
            this.oscillator.disconnect();
          } catch {}
          this.oscillator = null;
        }
      }, 100);
    } catch (e) {
      console.warn('Acoustic Siren stop error:', e);
    }
  }

  /**
   * Generates a single acoustic tactical confirmation chirp (1200 Hz).
   */
  public playTacticalChirp(): void {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.1);
    } catch {}
  }
}
