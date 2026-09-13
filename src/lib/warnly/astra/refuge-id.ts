/**
 * REFUGE-ID — Last 50m indoor shelter guide.
 * Offline topological graph: entrances -> corridors -> firedoors -> refuge.
 */
export interface RefugeNode {
  id: string;
  kind: 'ENTRANCE' | 'CORRIDOR' | 'FIREDOOR' | 'STAIR' | 'REFUGE' | 'LANDMARK';
  label: string;
  accessible: boolean;
  photoHint?: string;
}

export interface RefugeEdge {
  from: string;
  to: string;
  blocked?: boolean;
  distanceM?: number;
}

export interface RefugeGraph {
  nodes: RefugeNode[];
  edges: RefugeEdge[];
}

export function parseAnchor(qr: string): { buildingId: string; entranceId: string } | null {
  // Format: WARNLY://REFUGE/<building>/<entrance>
  const m = /^WARNLY:\/\/REFUGE\/([\w-]+)\/([\w-]+)/.exec(qr.trim());
  if (!m) return null;
  return { buildingId: m[1], entranceId: m[2] };
}

export function findRoute(graph: RefugeGraph, fromId: string, requireAccessible = true): string[] {
  const adj = new Map<string, string[]>();
  for (const e of graph.edges) {
    if (e.blocked) continue;
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const prev = new Map<string, string | null>([[fromId, null]]);
  const queue: string[] = [fromId];
  let refugeFound: string | null = null;
  while (queue.length) {
    const cur = queue.shift()!;
    const node = nodeById.get(cur);
    if (node?.kind === 'REFUGE' && (!requireAccessible || node.accessible)) {
      refugeFound = cur;
      break;
    }
    for (const nxt of adj.get(cur) ?? []) {
      if (prev.has(nxt)) continue;
      const nn = nodeById.get(nxt);
      if (requireAccessible && nn && !nn.accessible && nn.kind !== 'LANDMARK') continue;
      prev.set(nxt, cur);
      queue.push(nxt);
    }
  }
  if (!refugeFound) return [];
  const path: string[] = [];
  let c: string | null | undefined = refugeFound;
  while (c) {
    path.unshift(c);
    c = prev.get(c);
  }
  return path;
}

export function describeRoute(graph: RefugeGraph, path: string[]): string[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  return path.map((id) => {
    const n = byId.get(id);
    if (!n) return id;
    return n.photoHint ? `${n.label} (${n.photoHint})` : n.label;
  });
}
