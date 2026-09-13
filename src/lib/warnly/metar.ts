/**
 * Warnly Automated Aviation Flash Nowcasting (NOAA Aviation Weather Center)
 * Ingests live METAR / SPECI airport weather observations worldwide.
 * Latency: 2-5 minutes (detects sudden microbursts, convective squalls, and thunderstorms
 * hours before global numerical forecast models update).
 */
import type { Coords } from './types';
import { distanceKm } from './risk';

export interface AirportMetar {
  icaoId: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  reportTime: string;
  metarType: 'METAR' | 'SPECI';
  tempC: number;
  dewpC: number;
  altimeterHpa: number;
  windSpeedKt: number;
  windGustKt: number | null;
  wxString: string | null;
  rawOb: string;
  isSevereConvective: boolean;
  severityLevel: 'DANGER' | 'ADVISORY' | 'NORMAL';
  hazardNotes: string[];
  summary: string;
}

let cachedMetar: { coords: Coords; metar: AirportMetar | null; timestamp: number } | null = null;

export async function fetchNearbyMetar(coords: Coords): Promise<AirportMetar | null> {
  const now = Date.now();
  // Reuse cache if within 2 minutes and coords haven't shifted > 5km
  if (
    cachedMetar &&
    now - cachedMetar.timestamp < 2 * 60 * 1000 &&
    distanceKm(coords, cachedMetar.coords) < 5
  ) {
    return cachedMetar.metar;
  }

  const minLat = (coords.lat - 1.2).toFixed(3);
  const minLon = (coords.lon - 1.2).toFixed(3);
  const maxLat = (coords.lat + 1.2).toFixed(3);
  const maxLon = (coords.lon + 1.2).toFixed(3);

  const url = `https://aviationweather.gov/api/data/metar?bbox=${minLat},${minLon},${maxLat},${maxLon}&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const stations: any[] = await res.json();
    if (!Array.isArray(stations) || stations.length === 0) {
      cachedMetar = { coords, metar: null, timestamp: now };
      return null;
    }

    // Sort by distance to user coords
    const mapped = stations
      .filter((s) => typeof s.lat === 'number' && typeof s.lon === 'number')
      .map((s) => {
        const dist = distanceKm(coords, { lat: s.lat, lon: s.lon });
        return { raw: s, dist };
      })
      .sort((a, b) => a.dist - b.dist);

    if (mapped.length === 0) return null;

    const closest = mapped[0].raw;
    const distKm = Math.round(mapped[0].dist * 10) / 10;
    const rawOb = closest.rawOb || '';
    const wxString = closest.wxString || '';
    const metarType = closest.metarType === 'SPECI' ? 'SPECI' : 'METAR';

    // Parse wind gust if present
    let windGustKt: number | null = closest.wgst || null;
    if (!windGustKt) {
      const gustMatch = rawOb.match(/G(\d+)KT/);
      if (gustMatch) {
        windGustKt = parseInt(gustMatch[1], 10);
      }
    }

    // Detect severe convective indicators
    const isThunderstorm = /TS|TSRA|\+TSRA|VCTS/.test(rawOb) || /TS/.test(wxString);
    const isSquall = /SQ/.test(rawOb) || /SQ/.test(wxString);
    const isFunnelCloud = /FC|\+FC/.test(rawOb) || /FC/.test(wxString);
    const isHail = /GR|GS/.test(rawOb) || /GR/.test(wxString);
    const hasCumulonimbus = /CB/.test(rawOb);
    const hasDistantLightning = /LTG|DSNT/.test(rawOb);

    const hazardNotes: string[] = [];
    if (isThunderstorm) hazardNotes.push('Active Thunderstorm (TS/TSRA) reported');
    if (isSquall) hazardNotes.push('Squall / sudden convective wind shift');
    if (isFunnelCloud) hazardNotes.push('Tornadic activity / Funnel cloud (FC)');
    if (isHail) hazardNotes.push('Hail precipitation (GR)');
    if (hasCumulonimbus) hazardNotes.push('Cumulonimbus (CB) convective tower overhead');
    if (hasDistantLightning) hazardNotes.push('Distant lightning confirmed');
    if (windGustKt && windGustKt >= 35) hazardNotes.push(`Damaging wind gusts: ${windGustKt} knots`);

    const isSevereConvective = isThunderstorm || isSquall || isFunnelCloud || (windGustKt !== null && windGustKt >= 40);
    const isAdvisory = hasCumulonimbus || hasDistantLightning || (windGustKt !== null && windGustKt >= 28) || isHail;

    let severityLevel: 'DANGER' | 'ADVISORY' | 'NORMAL' = 'NORMAL';
    if (isSevereConvective || metarType === 'SPECI') {
      severityLevel = isSevereConvective ? 'DANGER' : 'ADVISORY';
    } else if (isAdvisory) {
      severityLevel = 'ADVISORY';
    }

    let summary = `${closest.icaoId} (${closest.name || 'Airport'} · ${distKm}km away): ${metarType} observation recorded.`;
    if (hazardNotes.length > 0) {
      summary = `⚠️ Airport Flash Report: ${closest.icaoId} (${distKm}km away) reported ${hazardNotes.join(', ')}.`;
    }

    const metarResult: AirportMetar = {
      icaoId: closest.icaoId,
      name: closest.name || closest.icaoId,
      lat: closest.lat,
      lon: closest.lon,
      distanceKm: distKm,
      reportTime: closest.reportTime || closest.receiptTime || new Date().toISOString(),
      metarType,
      tempC: closest.temp ?? 0,
      dewpC: closest.dewp ?? 0,
      altimeterHpa: closest.altim ?? 1013,
      windSpeedKt: closest.wspd ?? 0,
      windGustKt,
      wxString: wxString || null,
      rawOb,
      isSevereConvective,
      severityLevel,
      hazardNotes,
      summary,
    };

    cachedMetar = { coords, metar: metarResult, timestamp: now };
    return metarResult;
  } catch {
    return null;
  }
}
