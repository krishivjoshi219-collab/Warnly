/**
 * ECHOTRACE — Two-stage acoustic survivor locator.
 * Stage1 BLE discovery, Stage2 acoustic time-of-flight triangulation.
 */
export function speedOfSoundMs(tempC: number): number {
  return 331.3 + 0.606 * tempC;
}

export function rangeFromToF(deltaSec: number, tempC: number): number {
  // Round-trip chirp: d ≈ c/2 * Δt
  return Math.max(0, (speedOfSoundMs(tempC) / 2) * deltaSec);
}

export interface SearchFix {
  responderLat: number;
  responderLon: number;
  rangeM: number;
}

export function boundingRadius(fixes: SearchFix[]): { lat: number; lon: number; radiusM: number } | null {
  if (!fixes.length) return null;
  const lat = fixes.reduce((s, f) => s + f.responderLat, 0) / fixes.length;
  const lon = fixes.reduce((s, f) => s + f.responderLon, 0) / fixes.length;
  const radiusM = Math.max(...fixes.map((f) => f.rangeM));
  return { lat, lon, radiusM };
}

export function chirpMatched(rx: number[], template: number[]): { delaySamples: number; peak: number } {
  if (!rx.length || !template.length || template.length > rx.length) return { delaySamples: 0, peak: 0 };
  let best = -Infinity;
  let idx = 0;
  for (let lag = 0; lag <= rx.length - template.length; lag++) {
    let acc = 0;
    for (let i = 0; i < template.length; i++) acc += rx[lag + i] * template[i];
    if (acc > best) {
      best = acc;
      idx = lag;
    }
  }
  return { delaySamples: idx, peak: best };
}
