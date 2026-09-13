/**
 * PRESSURENET — Crowdsourced shockwave sensor.
 * Hampel filter + cross-correlation + planar wavefront bearing.
 */
export function hampel(values: number[], window = 5, k = 3): number[] {
  if (values.length < window) return [...values];
  const out = [...values];
  const half = Math.floor(window / 2);
  for (let i = half; i < values.length - half; i++) {
    const w = values.slice(i - half, i + half + 1).sort((a, b) => a - b);
    const median = w[half];
    const mad = w.reduce((s, v) => s + Math.abs(v - median), 0) / w.length || 1e-6;
    if (Math.abs(values[i] - median) > k * mad) out[i] = median;
  }
  return out;
}

export function detectMicroburst(traceHpa: number[], sampleHz = 1): { detected: boolean; surgeHpa: number; leadMin: number } {
  const f = hampel(traceHpa);
  const n = f.length;
  if (n < 10) return { detected: false, surgeHpa: 0, leadMin: 0 };
  const recent = f.slice(-5);
  const baseline = f.slice(0, Math.max(1, n - 5)).reduce((a, b) => a + b, 0) / Math.max(1, n - 5);
  const surge = Math.max(...recent) - baseline;
  const detected = surge > 0.8;
  return { detected, surgeHpa: surge, leadMin: detected ? 8 : 0 };
}

export function wavefrontBearing(delaysSec: { dxM: number; dyM: number; dtSec: number }[]): { speedMs: number; bearingDeg: number } {
  if (!delaysSec.length) return { speedMs: 0, bearingDeg: 0 };
  // Least-squares planar fit: dt = (nx*dx + ny*dy)/v. Simplified mean-vector estimate.
  let sx = 0;
  let sy = 0;
  for (const d of delaysSec) {
    const inv = 1 / Math.max(0.1, Math.abs(d.dtSec));
    sx += (d.dxM / Math.max(1, Math.hypot(d.dxM, d.dyM))) * inv * Math.sign(d.dtSec);
    sy += (d.dyM / Math.max(1, Math.hypot(d.dxM, d.dyM))) * inv * Math.sign(d.dtSec);
  }
  const bearing = ((Math.atan2(sx, sy) * 180) / Math.PI + 360) % 360;
  const avgDelay = delaysSec.reduce((s, d) => s + Math.abs(d.dtSec), 0) / delaysSec.length;
  const avgDist = delaysSec.reduce((s, d) => s + Math.hypot(d.dxM, d.dyM), 0) / delaysSec.length;
  return { speedMs: avgDelay > 0 ? avgDist / avgDelay : 0, bearingDeg: bearing };
}
