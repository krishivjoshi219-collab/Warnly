/**
 * SIGNALLOCK — Cryptographic Warning Provenance & Lifecycle.
 * Offline-first: verifies CAP/NOAA envelopes without network.
 * Lifecycle: ACTIVE | UPDATED | CANCELLED | EXPIRED | STALE | UNVERIFIED
 */
export type SignalLifecycle = 'ACTIVE' | 'UPDATED' | 'CANCELLED' | 'EXPIRED' | 'STALE' | 'UNVERIFIED';

export interface SignalEnvelope {
  id: string;
  authority: string;
  event: string;
  geometryHash: string;
  issuedAt: number;
  expiresAt: number;
  receivedAt: number;
  payload: string;
  signature: string;
  hopCount: number;
}

function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function canonicalize(e: Omit<SignalEnvelope, 'signature'>): string {
  return [e.id, e.authority, e.event, e.geometryHash, e.issuedAt, e.expiresAt, e.payload].join('|');
}

export function signEnvelope(e: Omit<SignalEnvelope, 'signature'>, secret: string): string {
  return fnv1a(canonicalize(e) + '|' + secret);
}

export function verifyEnvelope(e: SignalEnvelope, secret: string): boolean {
  const { signature, ...rest } = e;
  return signEnvelope(rest as Omit<SignalEnvelope, 'signature'>, secret) === signature;
}

export function lifecycleOf(e: SignalEnvelope, secret: string, now = Date.now()): SignalLifecycle {
  if (!verifyEnvelope(e, secret)) return 'UNVERIFIED';
  if (e.payload.includes('CANCEL')) return 'CANCELLED';
  if (now > e.expiresAt + 30 * 60 * 1000) return 'EXPIRED';
  if (now > e.expiresAt) return 'STALE';
  if (e.hopCount > 5) return 'STALE';
  return now - e.issuedAt < 5 * 60 * 1000 ? 'ACTIVE' : 'UPDATED';
}

export function isActionable(e: SignalEnvelope, secret: string, now = Date.now()): boolean {
  const l = lifecycleOf(e, secret, now);
  return l === 'ACTIVE' || l === 'UPDATED';
}

/** 30-sec demo: build a signed envelope, then tamper/expire it to prove rejection. */
export function demoEnvelope(secret: string, overrides: Partial<SignalEnvelope> = {}): SignalEnvelope {
  const now = Date.now();
  const base = {
    id: 'DEMO-001',
    authority: 'NOAA-CAP',
    event: 'TORNADO_WARNING',
    geometryHash: 'geo-abc123',
    issuedAt: now,
    expiresAt: now + 30 * 60 * 1000,
    receivedAt: now,
    payload: 'TAKE_SHELTER_NOW',
    hopCount: 1,
    ...overrides,
  };
  return { ...base, signature: signEnvelope(base, secret) };
}
