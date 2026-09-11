/**
 * FR-05: Acoustic Evacuation Siren Synthesizer
 * Generates alternating 880 Hz / 440 Hz square-wave distress sirens via Web Audio API oscillators.
 * Zero external audio files, 100% offline, pure RAM execution.
 */
export class AcousticSirenSynthesizer {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private timerId: any = null;
  private isHighPitch = false;
  private _isActive = false;

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

  startSiren(): void {
    if (this._isActive) return;
    this._isActive = true;

    try {
      this.initAudio();
      if (!this.audioCtx) return;

      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      this.oscillator.type = 'sawtooth';
      this.oscillator.frequency.setValueAtTime(880, this.audioCtx.currentTime);

      this.gainNode.gain.setValueAtTime(0.25, this.audioCtx.currentTime);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscillator.start();

      // Pitch cycle: 880 Hz <-> 440 Hz every 400ms
      this.timerId = setInterval(() => {
        if (!this.oscillator || !this.audioCtx) return;
        this.isHighPitch = !this.isHighPitch;
        const targetFreq = this.isHighPitch ? 880 : 440;
        this.oscillator.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.05);
      }, 400);
    } catch (e) {
      console.error('Error starting siren synthesizer:', e);
    }
  }

  stopSiren(): void {
    this._isActive = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch (e) {
      console.error('Error stopping siren:', e);
    }
  }
}
