/**
 * Warnly Survival Core — native offline life-safety engines.
 * Built as part of the app from day one, zero network required.
 * Covers: warning provenance, safety compiler, indoor refuge,
 * route isolation, pressure front, family pact, rescue trail,
 * echo locate, energy reserve, truth mesh + 5 citizen lifesavers.
 */

// ── 1. Warning provenance & lifecycle ──
export type WarningLifecycle = 'ACTIVE' | 'UPDATED' | 'CANCELLED' | 'EXPIRED' | 'STALE' | 'UNVERIFIED';
export interface WarningEnvelope { id: string; authority: string; event: string; geoHash: string; issuedAt: number; expiresAt: number; payload: string; signature: string; hops: number; }
function fnv(s: string): string { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, '0'); }
export function signWarning(e: Omit<WarningEnvelope, 'signature'>, secret: string): string { return fnv([e.id, e.authority, e.event, e.geoHash, e.issuedAt, e.expiresAt, e.payload].join('|') + '|' + secret); }
export function verifyWarning(e: WarningEnvelope, secret: string): boolean { const { signature, ...r } = e; return signWarning(r as Omit<WarningEnvelope, 'signature'>, secret) === signature; }
export function warningLifecycle(e: WarningEnvelope, secret: string, now = Date.now()): WarningLifecycle { if (!verifyWarning(e, secret)) return 'UNVERIFIED'; if (e.payload.includes('CANCEL')) return 'CANCELLED'; if (now > e.expiresAt + 30 * 60 * 1000) return 'EXPIRED'; if (now > e.expiresAt) return 'STALE'; if (e.hops > 5) return 'STALE'; return now - e.issuedAt < 5 * 60 * 1000 ? 'ACTIVE' : 'UPDATED'; }
export function isWarningActionable(e: WarningEnvelope, secret: string, now = Date.now()): boolean { const l = warningLifecycle(e, secret, now); return l === 'ACTIVE' || l === 'UPDATED'; }

// ── 2. Compound-hazard safety compiler ──
export type Tri = true | false | 'unknown';
export interface SafetyInput { shelterDownstairs?: Tri; basementFlooded?: Tri; floodRising?: Tri; lightningNear?: Tri; hasHallway?: Tri; hasUpperFloor?: Tri; mobilityLimited?: Tri; }
export interface SafetyDirective { doNow: string; doNot: string[]; fallback: string; blocked: string[]; safe: boolean; }
export function compileSafety(i: SafetyInput): SafetyDirective {
  const blocked: string[] = []; const doNot: string[] = [];
  if (i.basementFlooded === true || i.floodRising === true) { blocked.push('BASEMENT_SHELTER'); doNot.push('Do NOT go to basement — water submerges lower levels'); }
  if (i.lightningNear === true) doNot.push('Do NOT shelter near plumbing, wiring, or windows');
  let doNow = 'Monitor — no verified refuge needed yet'; let safe = true;
  const needDown = i.shelterDownstairs === true; const baseBlocked = blocked.includes('BASEMENT_SHELTER');
  if (needDown && !baseBlocked) doNow = 'Go to basement NOW — verified dry';
  else if (needDown && baseBlocked) { if (i.hasHallway === true) doNow = 'Go to ground-floor interior hallway NOW — basement flooded'; else if (i.hasUpperFloor === true && i.floodRising !== true) doNow = 'Move to interior upper room — avoid basement and windows'; else { doNow = 'No verified refuge — highest interior ground away from windows'; safe = false; } }
  else if (i.floodRising === true) doNow = i.mobilityLimited === true ? 'Move vertically to highest floor NOW and signal' : 'Climb perpendicular to valley to +95m ridge NOW';
  const fallback = i.mobilityLimited === true ? 'If blocked: lock door, send SOS, strobe + chirp' : 'If blocked: secondary interior corridor uphill, re-evaluate';
  return { doNow, doNot, fallback, blocked, safe };
}

// ── 3. Indoor last-50m refuge graph ──
export interface RefugeNode { id: string; kind: 'ENTRANCE' | 'CORRIDOR' | 'FIREDOOR' | 'STAIR' | 'REFUGE' | 'LANDMARK'; label: string; accessible: boolean; hint?: string; }
export interface RefugeEdge { from: string; to: string; blocked?: boolean; }
export function parseRefugeAnchor(qr: string): { buildingId: string; entranceId: string } | null { const m = /^WARNLY:\/\/REFUGE\/([\w-]+)\/([\w-]+)/.exec(qr.trim()); return m ? { buildingId: m[1], entranceId: m[2] } : null; }
export function findRefugeRoute(nodes: RefugeNode[], edges: RefugeEdge[], fromId: string): string[] {
  const adj = new Map<string, string[]>(); for (const e of edges) { if (e.blocked) continue; if (!adj.has(e.from)) adj.set(e.from, []); adj.get(e.from)!.push(e.to); }
  const byId = new Map(nodes.map((n) => [n.id, n])); const prev = new Map<string, string | null>([[fromId, null]]); const q: string[] = [fromId]; let found: string | null = null;
  while (q.length) { const cur = q.shift()!; if (byId.get(cur)?.kind === 'REFUGE' && byId.get(cur)?.accessible) { found = cur; break; } for (const n of adj.get(cur) ?? []) { if (prev.has(n)) continue; if (byId.get(n) && !byId.get(n)!.accessible && byId.get(n)!.kind !== 'LANDMARK') continue; prev.set(n, cur); q.push(n); } }
  if (!found) return []; const path: string[] = []; let c: string | null | undefined = found; while (c) { path.unshift(c); c = prev.get(c); } return path;
}

// ── 4. Route isolation predictor ──
export interface RoadSeg { from: string; to: string; lengthKm: number; isBridge?: boolean; flooded?: boolean; }
export function evaluateEvacuation(segs: RoadSeg[], origin: string, safe: string, riseMPerMin: number, critM: number, speedKmh: number): { routes: number; advice: 'EVACUATE' | 'SHELTER_IN_PLACE' | 'SEEK_VERTICAL'; reason: string } {
  const usable = segs.filter((s) => !s.flooded); const hops = new Set(usable.filter((s) => s.from === origin).map((s) => s.to));
  const dist = new Map<string, number>([[origin, 0]]); const q: string[] = [origin];
  while (q.length) { const cur = q.shift()!; for (const e of usable.filter((x) => x.from === cur)) { const nd = (dist.get(cur) ?? 0) + e.lengthKm; if (dist.get(e.to) == null || nd < dist.get(e.to)!) { dist.set(e.to, nd); q.push(e.to); } } }
  const km = dist.get(safe) ?? null; const win = riseMPerMin > 0 ? critM / riseMPerMin : null; const travel = km != null ? (km / Math.max(1, speedKmh)) * 60 : null;
  if (km == null || hops.size === 0) return { routes: 0, advice: 'SHELTER_IN_PLACE', reason: 'All routes cut — shelter on high ground' };
  if (win != null && travel != null && travel > win * 0.8) return { routes: hops.size, advice: 'SEEK_VERTICAL', reason: `Travel ${travel.toFixed(0)}m exceeds window ${win.toFixed(0)}m — stop driving` };
  return { routes: hops.size, advice: 'EVACUATE', reason: `${hops.size} route(s) open` };
}

// ── 5. Pressure shockwave front ──
export function hampelFilter(v: number[], w = 5, k = 3): number[] { if (v.length < w) return [...v]; const o = [...v]; const h = Math.floor(w / 2); for (let i = h; i < v.length - h; i++) { const s = v.slice(i - h, i + h + 1).sort((a, b) => a - b); const med = s[h]; const mad = s.reduce((a, x) => a + Math.abs(x - med), 0) / s.length || 1e-6; if (Math.abs(v[i] - med) > k * mad) o[i] = med; } return o; }
export function detectSurge(trace: number[]): { detected: boolean; surge: number } { if (trace.length < 10) return { detected: false, surge: 0 }; const f = hampelFilter(trace); const base = f.slice(0, f.length - 5).reduce((a, b) => a + b, 0) / Math.max(1, f.length - 5); const surge = Math.max(...f.slice(-5)) - base; return { detected: surge > 0.8, surge }; }

// ── 6. Family pact sync ──
export type PactStatus = 'SELF_REPORTED_SAFE' | 'LAST_KNOWN_ZONE' | 'UNKNOWN' | 'NEEDS_HELP';
export interface PactMember { id: string; name: string; status: PactStatus; zoneId: string; version: number; updatedAt: number; }
export function mergePact(a: PactMember[], b: PactMember[]): PactMember[] { const m = new Map<string, PactMember>(); for (const x of [...a, ...b]) { const c = m.get(x.id); if (!c || x.version > c.version) m.set(x.id, x); } return [...m.values()]; }

// ── 7. Rescue trail custody ──
export type Custody = 'STORED_LOCAL' | 'RELAYED' | 'GATEWAY_OK' | 'DESK_OK' | 'DISPATCHED';
export function custodyText(s: Custody, hops = 0): string { return s === 'STORED_LOCAL' ? 'Saved locally — not yet transmitted' : s === 'RELAYED' ? `Relayed via ${hops} peer(s) — awaiting gateway` : s === 'GATEWAY_OK' ? 'Gateway acknowledged' : s === 'DESK_OK' ? 'Desk accepted — awaiting dispatcher' : 'Responder dispatched (signed)'; }

// ── 8. Echo locate ToF ──
export function soundSpeed(tempC: number): number { return 331.3 + 0.606 * tempC; }
export function rangeToF(dtSec: number, tempC: number): number { return Math.max(0, (soundSpeed(tempC) / 2) * dtSec); }

// ── 9. Energy reserve budget ──
export function reserveHours(battMah: number, pct: number, drainMa: number): { standard: number; reserve: number } { const usable = (battMah * pct) / 100; return { standard: Math.round((usable / Math.max(1, drainMa)) * 10) / 10, reserve: Math.round(Math.min(120, (usable * 0.9) / 12) * 10) / 10 }; }
export function inBeaconWindow(nowMs: number, epochMs: number, everyMin: number, secs: number): boolean { return ((nowMs - epochMs) % (everyMin * 60 * 1000)) < secs * 1000; }

// ── 10. Truth mesh observations ──
export interface FieldNote { id: string; kind: string; lat: number; lon: number; text: string; conf: number; expiresAt: number; version: number; }
export function mergeNotes(a: FieldNote[], b: FieldNote[], now = Date.now()): FieldNote[] { const m = new Map(a.map((x) => [x.id, x])); for (const o of b) { const c = m.get(o.id); if (!c || o.version > c.version || (o.version === c.version && o.conf > c.conf)) m.set(o.id, o); } return [...m.values()].filter((x) => x.expiresAt >= now); }

// ── 11. CLEAR-AIR: smoke / toxic air refuge ──
export interface AirPlan { aqi: number; advice: string; sealRoom: boolean; maskNeeded: boolean; }
export function clearAirPlan(aqi: number, hasN95: boolean): AirPlan { if (aqi < 100) return { aqi, advice: 'Air breathable — ventilate', sealRoom: false, maskNeeded: false }; if (aqi < 200) return { aqi, advice: hasN95 ? 'Wear N95 outdoors, limit exertion' : 'Stay indoors, seal windows', sealRoom: true, maskNeeded: true }; return { aqi, advice: 'SEAL ROOM NOW — wet towel under door, no exertion', sealRoom: true, maskNeeded: true }; }

// ── 12. CARE-CIRCLE: dependents & meds ──
export interface Dependent { id: string; needsPower: boolean; needsRefrig: boolean; mobilityLimited: boolean; }
export function careChecklist(deps: Dependent[], powerOut: boolean): string[] { const out: string[] = []; if (powerOut) out.push('Move insulin / meds to cool bag with ice'); for (const d of deps) { if (d.needsPower && powerOut) out.push(`Power plan for ${d.id}: battery + low-power mode`); if (d.mobilityLimited) out.push(`Carry plan for ${d.id}: hallway refuge, no stairs alone`); } if (!out.length) out.push('Dependents stable — recheck every 2h'); return out; }

// ── 13. FLOOD-LINE: water depth vs climb ──
export function floodEscape(riseCmPerMin: number, depthCm: number, climbMPerMin: number): { advice: string; minutesLeft: number | null } { if (riseCmPerMin <= 0) return { advice: 'Water stable — monitor', minutesLeft: null }; const left = Math.max(0, (60 - depthCm) / Math.max(0.1, riseCmPerMin)); if (depthCm > 30 || left < climbMPerMin * 2) return { advice: 'ABANDON vehicle / ground floor — climb NOW', minutesLeft: left }; return { advice: `Climb within ${left.toFixed(0)}m — prepare uphill route`, minutesLeft: left }; }

// ── 14. GRID-FAIL: blackout coordinator ──
export function gridFailChecklist(): string[] { return ['Water: fill bottles + bathtub now', 'Power: battery saver + 30s beacon every 15m', 'Comms: pact rally point + check-in window', 'Meds: cool bag + 72h doses together', 'Cash + IDs in waterproof pouch']; }

// ── 15. CALM-VOICE: panic-proof instruction ──
export function calmInstruction(step: string, lang = 'en'): string { const s = step.length > 90 ? step.slice(0, 90) + ' — do this first' : step; return lang === 'en' ? `Breathe. ${s}. Tap when done.` : s; }
export const SURVIVAL_CORE_VERSION = '0.6.4';
