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
  // Must include responder spread: centroid + max(range) alone under-covers.
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  let radiusM = 0;
  for (const f of fixes) {
    const dLat = toRad(f.responderLat - lat);
    const dLon = toRad(f.responderLon - lon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) * Math.cos(toRad(f.responderLat)) * Math.sin(dLon / 2) ** 2;
    const spreadM = 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
    radiusM = Math.max(radiusM, spreadM + Math.max(0, f.rangeM));
  }
  return { lat, lon, radiusM };
}

export function chirpMatched(rx: number[], template: number[]): { delaySamples: number; peak: number } {
  if (!rx.length || !template.length || template.length > rx.length) return { delaySamples: 0, peak: 0 };
  let templateEnergy = 0;
  for (let i = 0; i < template.length; i++) templateEnergy += template[i] * template[i];
  if (templateEnergy === 0) return { delaySamples: 0, peak: 0 };
  let best = -Infinity;
  let idx = 0;
  for (let lag = 0; lag <= rx.length - template.length; lag++) {
    let acc = 0;
    let windowEnergy = 0;
    for (let i = 0; i < template.length; i++) {
      acc += rx[lag + i] * template[i];
      windowEnergy += rx[lag + i] * rx[lag + i];
    }
    // Normalized cross-correlation in [-1,1] so threshold is gain-independent.
    const norm = windowEnergy === 0 ? 0 : acc / Math.sqrt(templateEnergy * windowEnergy);
    if (norm > best) {
      best = norm;
      idx = lag;
    }
  }
  return { delaySamples: idx, peak: best };
}
