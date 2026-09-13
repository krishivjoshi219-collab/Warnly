/**
 * CUTLINE — Graph-cut evacuation reliability.
 * Time-dependent: flood rise vs travel speed decides Evacuate vs Shelter-In-Place.
 */
export interface RoadEdge {
  from: string;
  to: string;
  capacity: number;
  lengthKm: number;
  isBridge?: boolean;
  isLowWater?: boolean;
  flooded?: boolean;
}

export interface CutlineResult {
  remainingRoutes: number;
  bottleneck: string | null;
  travelWindowMin: number | null;
  advice: 'EVACUATE' | 'SHELTER_IN_PLACE' | 'SEEK_VERTICAL_SHELTER';
  rationale: string;
}

export function evaluateCutline(
  edges: RoadEdge[],
  origin: string,
  safe: string,
  floodRiseMPerMin: number,
  criticalDepthM: number,
  travelSpeedKmh: number
): CutlineResult {
  const usable = edges.filter((e) => !e.flooded);
  // Count disjoint-ish routes via distinct first hops (cheap min-cut approximation).
  const firstHops = new Set(usable.filter((e) => e.from === origin).map((e) => e.to));
  const remainingRoutes = origin === safe ? 1 : Math.max(0, firstHops.size);

  const bridges = usable.filter((e) => e.isBridge || e.isLowWater);
  const bottleneck = bridges.length && remainingRoutes <= 1 ? (bridges[0].from + '->' + bridges[0].to) : null;

  const windowMin = floodRiseMPerMin > 0 ? criticalDepthM / floodRiseMPerMin : null;

  // Shortest usable path length (BFS hop-weighted by lengthKm).
  let shortestKm: number | null = null;
  const dist = new Map<string, number>([[origin, 0]]);
  const q: string[] = [origin];
  while (q.length) {
    const cur = q.shift()!;
    for (const e of usable.filter((x) => x.from === cur)) {
      const nd = (dist.get(cur) ?? 0) + e.lengthKm;
      if (dist.get(e.to) == null || nd < dist.get(e.to)!) {
        dist.set(e.to, nd);
        q.push(e.to);
      }
    }
  }
  shortestKm = dist.get(safe) ?? null;
  const travelMin = shortestKm != null ? (shortestKm / Math.max(1, travelSpeedKmh)) * 60 : null;

  if (shortestKm == null || remainingRoutes === 0) {
    return { remainingRoutes: 0, bottleneck, travelWindowMin: windowMin, advice: 'SHELTER_IN_PLACE', rationale: 'All routes cut — shelter in place on high ground' };
  }
  if (windowMin != null && travelMin != null && travelMin > windowMin * 0.8) {
    return { remainingRoutes, bottleneck, travelWindowMin: windowMin, advice: 'SEEK_VERTICAL_SHELTER', rationale: `Travel ${travelMin.toFixed(0)}m exceeds flood window ${windowMin.toFixed(0)}m — stop driving` };
  }
  return { remainingRoutes, bottleneck, travelWindowMin: windowMin, advice: 'EVACUATE', rationale: `${remainingRoutes} route(s) open, ${travelMin?.toFixed(0)}m travel within window` };
}
