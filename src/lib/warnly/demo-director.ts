/**
 * Warnly Demo Director — 60-second hackathon winning script.
 * Orchestrates: TRIGGER_SUPERCELL -> DOPPLER ETA -> SIREN+STROBE -> ESCAPE -> ALL-CLEAR.
 * Dependency-free so it never breaks the live demo.
 */

export type DemoAction =
  | 'TRIGGER_SUPERCELL'
  | 'SHOW_DOPPLER_ETA'
  | 'SIREN_STROBE_ON'
  | 'SHOW_ESCAPE_VECTOR'
  | 'SHOW_TIMELINE'
  | 'ALL_CLEAR';

export interface DemoStep {
  id: string;
  tSec: number;
  title: string;
  subtitle: string;
  action: DemoAction;
  talkTrack: string;
}

export const HACKATHON_DEMO_SCRIPT: DemoStep[] = [
  {
    id: 'step-trigger',
    tSec: 0,
    title: 'Trigger Supercell',
    subtitle: '5 strikes · CAPE 2450 · Code 95',
    action: 'TRIGGER_SUPERCELL',
    talkTrack: 'One tap — Warnly injects a live supercell over your GPS.',
  },
  {
    id: 'step-doppler',
    tSec: 10,
    title: 'Doppler Intercept ETA 18m',
    subtitle: '58 dBZ EXTREME cell @ 14km',
    action: 'SHOW_DOPPLER_ETA',
    talkTrack: 'Doppler vectorizes the cell — 18 minutes to breach, not just rain.',
  },
  {
    id: 'step-siren',
    tSec: 20,
    title: 'Siren + Strobe SOS',
    subtitle: '960/640Hz STREAM_ALARM + Morse light',
    action: 'SIREN_STROBE_ON',
    talkTrack: 'Even on silent — breakthrough siren plus optical SOS wakes the house.',
  },
  {
    id: 'step-escape',
    tSec: 35,
    title: 'Ridge Escape +95m',
    subtitle: 'NE 042° · 8 min ascent · shelter 1.2km',
    action: 'SHOW_ESCAPE_VECTOR',
    talkTrack: 'Never run downstream — climb perpendicular to the valley to the bunker.',
  },
  {
    id: 'step-timeline',
    tSec: 45,
    title: 'T-25 Tactical Timeline',
    subtitle: 'Unplug → indoors → crouch → hold 30min',
    action: 'SHOW_TIMELINE',
    talkTrack: 'Judges see phased survival actions, not raw numbers.',
  },
  {
    id: 'step-clear',
    tSec: 60,
    title: 'All Clear',
    subtitle: '30/30 rule enforced',
    action: 'ALL_CLEAR',
    talkTrack: 'Hold shelter 30 minutes after last thunder — then all clear.',
  },
];

export class DemoDirector {
  private startAt = 0;
  private running = false;

  start(now: number = Date.now()): DemoStep {
    this.startAt = now;
    this.running = true;
    return HACKATHON_DEMO_SCRIPT[0];
  }

  stop(): void {
    this.running = false;
  }

  get isRunning(): boolean {
    return this.running;
  }

  elapsedSec(now: number = Date.now()): number {
    if (!this.running) return 0;
    return Math.max(0, Math.floor((now - this.startAt) / 1000));
  }

  currentStep(now: number = Date.now()): DemoStep {
    const elapsed = this.elapsedSec(now);
    let active = HACKATHON_DEMO_SCRIPT[0];
    for (const step of HACKATHON_DEMO_SCRIPT) {
      if (elapsed >= step.tSec) active = step;
      else break;
    }
    return active;
  }

  nextStep(now: number = Date.now()): DemoStep | null {
    const elapsed = this.elapsedSec(now);
    return HACKATHON_DEMO_SCRIPT.find((s) => s.tSec > elapsed) ?? null;
  }
}

export const globalDemoDirector = new DemoDirector();
