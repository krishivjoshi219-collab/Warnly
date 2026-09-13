import type { Coords, Strike } from "./types";
import { distanceKm, bearingDeg } from "./risk";

interface InternalStrike {
  id: string;
  lat: number;
  lon: number;
  timestamp: number; // ms
  distanceKm: number;
  bearingDeg: number;
  isSimulated?: boolean;
}

let strikePool: InternalStrike[] = [];
let activeWs: WebSocket | null = null;
let currentOrigin: Coords | null = null;
let lastStrikeRxTimestamp = 0;
let totalStrikesReceived = 0;
let wsStatus: 'CONNECTED' | 'RECONNECTING' | 'OFFLINE' = 'OFFLINE';
let reconnectTimer: any = null;
let isExplicitlyStopped = false;
let serverIdx = 0;

const WS_SERVERS = [
  'wss://ws7.blitzortung.org/',
  'wss://ws8.blitzortung.org/',
  'wss://ws1.blitzortung.org/',
  'wss://ws2.blitzortung.org/',
];

/**
 * LZW Decompressor for Blitzortung binary/compressed WebSocket stream
 */
function decodeBlitzortung(x: string): string {
  try {
    const dict: Record<number, string> = {};
    const data = (x + '').split('');
    let currChar = data[0];
    let oldPhrase = currChar;
    const out = [currChar];
    let code = 256;
    let phrase: string;
    for (let i = 1; i < data.length; i++) {
      const currCode = data[i].charCodeAt(0);
      if (currCode < 256) {
        phrase = data[i];
      } else {
        phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
      }
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }
    return out.join('');
  } catch {
    return '';
  }
}

/**
 * Initializes and maintains a persistent live WebSocket connection
 * to the global Blitzortung crowdsourced lightning sensor network.
 */
export function startLiveLightningFeed(origin?: Coords) {
  isExplicitlyStopped = false;
  if (origin) {
    currentOrigin = origin;
  }

  if (activeWs && (activeWs.readyState === WebSocket.OPEN || activeWs.readyState === WebSocket.CONNECTING)) {
    return;
  }

  if (typeof WebSocket === 'undefined') {
    wsStatus = 'OFFLINE';
    return;
  }

  try {
    const targetUrl = WS_SERVERS[serverIdx % WS_SERVERS.length];
    serverIdx++;
    wsStatus = 'RECONNECTING';

    const ws = new WebSocket(targetUrl);
    activeWs = ws;

    ws.onopen = () => {
      wsStatus = 'CONNECTED';
      // Handshake payload required by Blitzortung nodes ({ a: 111 })
      try {
        ws.send(JSON.stringify({ a: 111 }));
      } catch {}
    };

    ws.onmessage = (evt) => {
      try {
        lastStrikeRxTimestamp = Date.now();
        totalStrikesReceived++;
        const decompressed = decodeBlitzortung(evt.data);
        if (!decompressed) return;
        const data = JSON.parse(decompressed);

        if (typeof data.lat === 'number' && typeof data.lon === 'number') {
          const lat = data.lat;
          const lon = data.lon;
          const timeMs = data.time ? Math.floor(data.time / 1_000_000) : Date.now();

          // If user location is known, filter for regional radius (up to 50km)
          if (currentOrigin) {
            const dist = distanceKm(currentOrigin, { lat, lon });
            if (dist <= 50) {
              const bearing = bearingDeg(currentOrigin, { lat, lon });
              const newStrike: InternalStrike = {
                id: `bo-${timeMs}-${Math.round(lat * 1000)}-${Math.round(lon * 1000)}`,
                lat,
                lon,
                timestamp: timeMs > Date.now() ? Date.now() : timeMs,
                distanceKm: Math.round(dist * 10) / 10,
                bearingDeg: Math.round(bearing),
                isSimulated: false,
              };

              // Deduplicate and push, capping pool to 150 items
              if (!strikePool.some((s) => s.id === newStrike.id)) {
                strikePool.push(newStrike);
                if (strikePool.length > 150) {
                  strikePool.shift();
                }
              }
            }
          }
        }
      } catch {}
    };

    ws.onerror = () => {
      wsStatus = 'RECONNECTING';
    };

    ws.onclose = () => {
      wsStatus = 'OFFLINE';
      activeWs = null;
      if (!isExplicitlyStopped) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          startLiveLightningFeed();
        }, 5000);
      }
    };
  } catch {
    wsStatus = 'OFFLINE';
  }
}

/**
 * Closes the live feed
 */
export function stopLiveLightningFeed() {
  isExplicitlyStopped = true;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (activeWs) {
    try {
      activeWs.close();
    } catch {}
    activeWs = null;
  }
  wsStatus = 'OFFLINE';
}

/**
 * Returns diagnostic connection state of the live Blitzortung telemetry feed.
 */
export function getLightningFeedStatus(): {
  status: 'CONNECTED' | 'RECONNECTING' | 'OFFLINE';
  lastStrikeAgeSec: number;
  totalStrikesDetected: number;
} {
  const ageSec = lastStrikeRxTimestamp > 0 ? Math.round((Date.now() - lastStrikeRxTimestamp) / 1000) : -1;
  return {
    status: wsStatus,
    lastStrikeAgeSec: ageSec,
    totalStrikesDetected: totalStrikesReceived,
  };
}

export interface DemoStrike extends Strike {
  timestamp: number;
  isSimulated?: boolean;
}

export function generateDemoStrikesSync(origin: Coords): DemoStrike[] {
  const now = Date.now();
  const demoDistances = [2.4, 4.2, 7.8, 12.5, 18.3];
  return demoDistances.map((distKm, idx) => {
    const brg = 195 + idx * 22;
    const R = 6371;
    const brgRad = (brg * Math.PI) / 180;
    const lat1 = (origin.lat * Math.PI) / 180;
    const lon1 = (origin.lon * Math.PI) / 180;
    const dByR = distKm / R;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(dByR) + Math.cos(lat1) * Math.sin(dByR) * Math.cos(brgRad)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(brgRad) * Math.sin(dByR) * Math.cos(lat1),
        Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat2)
      );

    return {
      id: `demo-strike-${idx}`,
      lat: Number(((lat2 * 180) / Math.PI).toFixed(5)),
      lon: Number(((lon2 * 180) / Math.PI).toFixed(5)),
      timestamp: now - (idx + 1) * 2 * 60 * 1000,
      distanceKm: distKm,
      bearingDeg: brg,
      isSimulated: true,
      ageMin: (idx + 1) * 2,
    };
  });
}

/**
 * Fetches real live lightning strikes around user coordinates from the live Blitzortung network.
 * If weather is completely clear and no strikes are active in radius, strictly returns [] (0 strikes).
 */
export async function fetchRealLightningStrikes(
  origin: Coords,
  cape: number = 0,
  precipProb: number = 0,
  weatherCode: number = 0,
  simulateStorm: boolean = false
): Promise<Strike[]> {
  const now = Date.now();
  currentOrigin = origin;

  // Make sure live WebSocket listener is active
  startLiveLightningFeed(origin);

  // If simulation is NOT enabled, completely purge any simulated strikes
  if (!simulateStorm) {
    strikePool = strikePool.filter((s) => !s.isSimulated);
  }

  // Thunderstorm WMO codes: 95 = Thunderstorm, 96 = Thunderstorm with hail, 99 = Severe thunderstorm
  const isSevereThunderstorm = weatherCode === 95 || weatherCode === 96 || weatherCode === 99;

  // If simulateStorm is explicitly activated by user in Settings (DEMO ONLY)
  if (simulateStorm) {
    // Only generate demo strikes if pool is empty — 5-cell supercell with imminent breach
    if (!strikePool.some((s) => s.isSimulated)) {
      strikePool.push(...generateDemoStrikesSync(origin));
    }
  }

  // Age and prune strikes older than 30 minutes
  strikePool = strikePool.filter((s) => now - s.timestamp < 30 * 60 * 1000);

  // Recalculate distance and bearing relative to origin
  strikePool.forEach((s) => {
    s.distanceKm = Math.round(distanceKm(origin, { lat: s.lat, lon: s.lon }) * 10) / 10;
    s.bearingDeg = Math.round(bearingDeg(origin, { lat: s.lat, lon: s.lon }));
  });

  // Filter strikes within 30km perimeter
  const nearbyStrikes = strikePool.filter((s) => s.distanceKm <= 35);

  // If sky is clear, no strikes found, and not simulating, return empty list
  if (nearbyStrikes.length === 0 && !isSevereThunderstorm && !simulateStorm) {
    return [];
  }

  return nearbyStrikes
    .map((s) => ({
      id: s.id,
      lat: s.lat,
      lon: s.lon,
      distanceKm: s.distanceKm,
      bearingDeg: s.bearingDeg,
      ageMin: Math.max(0, Math.floor((now - s.timestamp) / 60000)),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Reset strikes pool immediately */
export function clearSimulatedStrikes() {
  strikePool = [];
}
