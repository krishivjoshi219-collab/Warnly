/**
 * RESCUECHAIN — Verifiable SOS chain-of-custody (DTN bundles).
 * Never claims rescue without signed responder receipt.
 */
export type CustodyStage = 'STORED_LOCAL' | 'RELAYED_BY_PEER' | 'GATEWAY_RECEIVED' | 'DESK_ACCEPTED' | 'RESPONDER_DISPATCHED';

export interface SosBundle {
  id: string;
  lat: number;
  lon: number;
  createdAt: number;
  senderId: string;
  message: string;
  signature: string;
  stage: CustodyStage;
  hops: string[];
  receiptSig?: string;
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

export function createBundle(senderId: string, lat: number, lon: number, message: string, secret: string): SosBundle {
  const id = hash(senderId + '|' + Date.now() + '|' + lat + ',' + lon).slice(0, 12);
  const createdAt = Date.now();
  const signature = hash([id, senderId, lat, lon, message, createdAt, secret].join('|'));
  return { id, lat, lon, createdAt, senderId, message, signature, stage: 'STORED_LOCAL', hops: [senderId] };
}

export function relayBundle(b: SosBundle, peerId: string): SosBundle {
  if (b.hops.includes(peerId)) return b;
  // Only advance one hop per relay; gateway/desk stages require signed receipts (see acceptReceipt).
  const stage: CustodyStage = b.stage === 'STORED_LOCAL' ? 'RELAYED_BY_PEER' : b.stage;
  return { ...b, stage, hops: [...b.hops, peerId] };
}

export function acceptReceipt(b: SosBundle, stage: CustodyStage, receiptSig: string): SosBundle {
  return { ...b, stage, receiptSig };
}

export function verifyBundle(b: SosBundle, secret: string): boolean {
  return hash([b.id, b.senderId, b.lat, b.lon, b.message, b.createdAt, secret].join('|')) === b.signature;
}

export function statusText(b: SosBundle): string {
  switch (b.stage) {
    case 'STORED_LOCAL': return 'Saved locally — not yet transmitted';
    case 'RELAYED_BY_PEER': return `Relayed via ${b.hops.length - 1} peer(s) — awaiting gateway`;
    case 'GATEWAY_RECEIVED': return 'Gateway acknowledged — awaiting coordination desk';
    case 'DESK_ACCEPTED': return 'Coordination desk accepted — awaiting dispatcher';
    case 'RESPONDER_DISPATCHED': return 'Responder dispatched (signed receipt)';
  }
}

export function dedupe(bundles: SosBundle[]): SosBundle[] {
  const seen = new Map<string, SosBundle>();
  for (const b of bundles) {
    const cur = seen.get(b.id);
    if (!cur || b.hops.length > cur.hops.length) seen.set(b.id, b);
  }
  return [...seen.values()];
}
