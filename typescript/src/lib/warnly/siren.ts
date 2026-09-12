/** Two-tone emergency siren synthesized with the Web Audio API. */
let ctx: AudioContext | null = null;
let osc: OscillatorNode | null = null;
let gain: GainNode | null = null;
let timer: number | null = null;

export function startSirenAudio() {
  if (typeof window === "undefined") return;
  stopSirenAudio();
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(760, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    let high = true;
    timer = window.setInterval(() => {
      if (!ctx || !osc) return;
      high = !high;
      osc.frequency.setValueAtTime(high ? 960 : 640, ctx.currentTime);
    }, 500);
  } catch {
    /* audio blocked */
  }
}

export function stopSirenAudio() {
  if (timer != null) {
    clearInterval(timer);
    timer = null;
  }
  try {
    if (gain && ctx) {
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    }
    osc?.stop((ctx?.currentTime ?? 0) + 0.12);
  } catch {
    /* ignore */
  }
  const closing = ctx;
  osc = null;
  gain = null;
  ctx = null;
  setTimeout(() => {
    try {
      closing?.close();
    } catch {
      /* ignore */
    }
  }, 250);
}
