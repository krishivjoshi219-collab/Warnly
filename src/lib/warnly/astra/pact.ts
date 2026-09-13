/**
 * PACT — Zero-Connectivity Family Sync Protocol.
 * Deterministic versioned state machine over BLE mesh.
 */
export type PactStatus = 'SELF_REPORTED_SAFE' | 'LAST_KNOWN_ZONE' | 'UNKNOWN' | 'NEEDS_HELP';

export interface PactMember {
  id: string;
  name: string;
  status: PactStatus;
  zoneId: string;
  updatedAt: number;
  version: number;
  caretakerFor?: string[];
}

export interface PactPlan {
  rallyPoint: string;
  checkinWindowMin: number;
  members: PactMember[];
  planVersion: number;
}

export function createPlan(rallyPoint: string, checkinWindowMin: number, members: Omit<PactMember, 'version' | 'updatedAt'>[]): PactPlan {
  return {
    rallyPoint,
    checkinWindowMin,
    planVersion: 1,
    members: members.map((m) => ({ ...m, version: 1, updatedAt: Date.now() })),
  };
}

export function reportStatus(plan: PactPlan, memberId: string, status: PactStatus, zoneId: string): PactPlan {
  return {
    ...plan,
    members: plan.members.map((m) =>
      m.id === memberId ? { ...m, status, zoneId, version: m.version + 1, updatedAt: Date.now() } : m
    ),
  };
}

export function mergePlans(a: PactPlan, b: PactPlan): PactPlan {
  // LWW per member by version, never allow unacknowledged downgrade of NEEDS_HELP.
  const byId = new Map<string, PactMember>();
  for (const m of [...a.members, ...b.members]) {
    const cur = byId.get(m.id);
    if (!cur || m.version > cur.version) byId.set(m.id, m);
    else if (m.version === cur.version && cur.status === 'UNKNOWN') byId.set(m.id, m);
  }
  // Preserve NEEDS_HELP until explicitly cleared by same member with newer version.
  return { rallyPoint: b.planVersion >= a.planVersion ? b.rallyPoint : a.rallyPoint, checkinWindowMin: a.checkinWindowMin, planVersion: Math.max(a.planVersion, b.planVersion), members: [...byId.values()] };
}

export function overdueMembers(plan: PactPlan, now = Date.now()): PactMember[] {
  return plan.members.filter((m) => now - m.updatedAt > plan.checkinWindowMin * 60 * 1000 && m.status !== 'SELF_REPORTED_SAFE');
}
