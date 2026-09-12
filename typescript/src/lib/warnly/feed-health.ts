export interface FeedStatus {
  id: string;
  name: string;
  url: string;
  description: string;
  status: "online" | "offline" | "checking";
  latencyMs: number | null;
  lastChecked: number | null;
  httpCode: number | null;
  error?: string;
}

export const MONITORED_FEEDS: Omit<FeedStatus, "status" | "latencyMs" | "lastChecked" | "httpCode">[] = [
  {
    id: "usgs-seismic",
    name: "USGS Earthquakes Feed",
    url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
    description: "Global real-time seismograph sensor network (M2.5+ events)",
  },
  {
    id: "open-meteo-weather",
    name: "Open-Meteo Weather API",
    url: "https://api.open-meteo.com/v1/forecast?latitude=27.7&longitude=85.3&current=temperature_2m",
    description: "Atmospheric convective stability (CAPE, LI) & nowcasting",
  },
  {
    id: "open-meteo-flood",
    name: "Open-Meteo GloFAS River Flood",
    url: "https://flood-api.open-meteo.com/v1/flood?latitude=27.7&longitude=85.3&daily=river_discharge",
    description: "Global river discharge models and surge alerts",
  },
  {
    id: "rainviewer-radar",
    name: "RainViewer Doppler Radar",
    url: "https://api.rainviewer.com/public/weather-maps.json",
    description: "Live radar mosaic frames from national Doppler installations",
  },
  {
    id: "osm-emergency",
    name: "OpenStreetMap Emergency Geocoder",
    url: "https://nominatim.openstreetmap.org/search?format=json&q=hospital&limit=1",
    description: "Live emergency shelters, assembly fields & trauma centers",
  },
  {
    id: "geojs-location",
    name: "GeoJS IP Geolocation Feed",
    url: "https://get.geojs.io/v1/ip/geo.json",
    description: "Automatic network fallback geolocation for accurate weather",
  },
];

/**
 * Sends real HTTP requests to verify connectivity and measure latency to each live disaster feed.
 * Completely truthful â€” if a server is down or slow, it reports offline and exact error.
 */
export async function checkFeedHealth(feed: typeof MONITORED_FEEDS[number]): Promise<FeedStatus> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(feed.url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "WarnlyFeedChecker/1.0" },
    });

    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - start);

    return {
      ...feed,
      status: res.ok ? "online" : "offline",
      latencyMs: latency,
      lastChecked: Date.now(),
      httpCode: res.status,
      error: res.ok ? undefined : `HTTP ${res.status}: ${res.statusText}`,
    };
  } catch (err: any) {
    const latency = Math.round(performance.now() - start);
    return {
      ...feed,
      status: "offline",
      latencyMs: latency,
      lastChecked: Date.now(),
      httpCode: null,
      error: err.name === "AbortError" ? "Request timed out (>6s)" : (err.message || "Connection refused"),
    };
  }
}

export async function checkAllFeedHealth(): Promise<FeedStatus[]> {
  const promises = MONITORED_FEEDS.map((feed) => checkFeedHealth(feed));
  return Promise.all(promises);
}
