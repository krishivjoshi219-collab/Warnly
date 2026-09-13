/**
 * GROUNDTRUTH — Decentralized reality mesh (LWW CRDT with confidence + expiry).
 */
export interface Observation {
  id: string;
  kind: 'HAZARD' | 'SAFE_WATER' | 'SHELTER' | 'BLOCKED_ROAD' | 'CORRIDOR';
  lat: number;
  lon: number;
  text: string;
  confidence: number;
  createdAt: number;
  expiresAt: number;
  author: string;
  version: number;
}

export function upsert(local: Observation[], incoming: Observation, now = Date.now()): Observation[] {
  const idx = local.findIndex((o) => o.id === incoming.id);
  if (idx === -1) {
    if (incoming.expiresAt < now) return local;
    return [...local, incoming];
  }
  const cur = local[idx];
  // LWW by version, tie-break by confidence, never resurrect expired unless newer version.
  if (incoming.version > cur.version || (incoming.version === cur.version && incoming.confidence > cur.confidence)) {
    const next = [...local];
    next[idx] = incoming;
    return next;
  }
  return local;
}

export function mergeMaps(a: Observation[], b: Observation[], now = Date.now()): Observation[] {
  let out = [...a];
  for (const o of b) out = upsert(out, o, now);
  // Expire decayed items.
  return out.filter((o) => o.expiresAt >= now);
}

export function visibleInRadius(obs: Observation[], lat: number, lon: number, radiusKm: number, now = Date.now()): Observation[] {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  return obs.filter((o) => {
    if (o.expiresAt < now) return false;
    const dLat = rad(o.lat - lat);
    const dLon = rad(o.lon - lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(o.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h))) <= radiusKm;
  });
}
