import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { gridProbability, riskLevel, SAFETY_RADIUS_KM } from "./risk";
import type { Coords, RiskLevel, Strike, WeatherSnapshot } from "./types";
import { fetchRealLightningStrikes, clearSimulatedStrikes } from "./lightning";
import {
  ResilientBackendEngine,
  type UnifiedBackendSnapshot,
  type BackendConnectionState,
} from "./resilient-backend";
import type { DopplerRadarSummary } from "./doppler-vector";
import type { BarometricAnalysis } from "./barometric-surge";

interface WarnlyState {
  coords: Coords | null;
  geoError: string | null;
  locating: boolean;
  requestLocation: () => void;
  setCustomCoords: (coords: Coords) => void;
  weather: WeatherSnapshot | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  probability: number;
  level: RiskLevel;
  strikes: Strike[];
  nearest: Strike | null;
  alertDismissedAt: number | null;
  dismissAlert: () => void;
  shelterUntil: number | null;
  simulateStorm: boolean;
  toggleSimulateStorm: () => void;
  // ── Incredible Strong Backend State ──
  connectionState: BackendConnectionState;
  backendSnapshot: UnifiedBackendSnapshot | null;
  doppler: DopplerRadarSummary | null;
  barometer: BarometricAnalysis | null;
}

const Ctx = createContext<WarnlyState | null>(null);

const FALLBACK: Coords = { lat: 27.7172, lon: 85.324 }; // Kathmandu Valley default

// Safe memory storage fallback for native React Native
const memoryStore: Record<string, string> = {};
const getStorageItem = (k: string): string | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return memoryStore[k] ?? null;
    }
  }
  return memoryStore[k] ?? null;
};

const setStorageItem = (k: string, v: string) => {
  memoryStore[k] = v;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  }
};

export function WarnlyProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(() => {
    try {
      const saved = getStorageItem("warnly:coords");
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return FALLBACK;
  });
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [alertDismissedAt, setAlertDismissedAt] = useState<number | null>(null);
  const [simulateStorm, setSimulateStorm] = useState(false);

  const [weather, setWeather] = useState<WeatherSnapshot | undefined>(undefined);
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Backend resilience state
  const [backendSnapshot, setBackendSnapshot] = useState<UnifiedBackendSnapshot | null>(null);
  const [connectionState, setConnectionState] = useState<BackendConnectionState>('ONLINE_REALTIME');

  // Fallback to IP-based location if browser GPS fails or is denied
  const fallbackToIpLocation = async () => {
    try {
      const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const ipCoords = {
            lat: parseFloat(data.latitude),
            lon: parseFloat(data.longitude),
          };
          setCoords(ipCoords);
          setStorageItem("warnly:coords", JSON.stringify(ipCoords));
          setGeoError(null);
          setLocating(false);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setCoords((prev) => prev ?? FALLBACK);
    setGeoError("Using default location. Search your city above to get exact local weather.");
    setLocating(false);
  };

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      fallbackToIpLocation();
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(newCoords);
        setStorageItem("warnly:coords", JSON.stringify(newCoords));
        setGeoError(null);
        setLocating(false);
      },
      () => {
        fallbackToIpLocation();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  const setCustomCoords = useCallback((newCoords: Coords) => {
    setCoords(newCoords);
    setStorageItem("warnly:coords", JSON.stringify(newCoords));
    setGeoError(null);
    setLocating(false);
  }, []);

  const loadData = useCallback(async (c: Coords) => {
    setIsLoading(true);
    try {
      // Ingest through the Resilient Multi-Tier Backend
      const snapshot = await ResilientBackendEngine.getAtmosphericTelemetry(c);
      setBackendSnapshot(snapshot);
      setConnectionState(snapshot.connectionState);
      setWeather(snapshot.weather);

      const st = await fetchRealLightningStrikes(
        c,
        snapshot.weather.cape,
        snapshot.weather.precipProbability,
        snapshot.weather.weatherCode,
        simulateStorm
      );
      setStrikes(st);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [simulateStorm]);

  useEffect(() => {
    if (!coords) {
      requestLocation();
    }
  }, [coords, requestLocation]);

  useEffect(() => {
    if (!coords) return;
    loadData(coords);

    // Weather refresh every 3 minutes via resilient backend
    const wxInterval = setInterval(() => {
      ResilientBackendEngine.getAtmosphericTelemetry(coords)
        .then((snap) => {
          setBackendSnapshot(snap);
          setConnectionState(snap.connectionState);
          setWeather(snap.weather);
        })
        .catch(() => {});
    }, 3 * 60 * 1000);

    // Strike refresh every 15 seconds
    const stInterval = setInterval(() => {
      fetchRealLightningStrikes(
        coords,
        weather?.cape ?? 0,
        weather?.precipProbability ?? 0,
        weather?.weatherCode ?? 0,
        simulateStorm
      )
        .then((st) => setStrikes(st))
        .catch(() => {});
    }, 15 * 1000);

    return () => {
      clearInterval(wxInterval);
      clearInterval(stInterval);
    };
  }, [coords?.lat, coords?.lon, simulateStorm, loadData, weather?.cape, weather?.precipProbability, weather?.weatherCode]);

  const { probability, level } = useMemo(() => {
    const base = weather
      ? {
          cape: weather.cape,
          liftedIndex: weather.liftedIndex,
          precipProbability: weather.precipProbability,
          weatherCode: weather.weatherCode,
        }
      : { cape: 0, liftedIndex: 4, precipProbability: 0, weatherCode: 0 };

    const p = gridProbability(base, strikes);
    return {
      probability: p,
      level: riskLevel(p, strikes),
    };
  }, [weather, strikes]);

  const nearest = strikes[0] ?? null;

  const shelterUntil = useMemo(() => {
    const breach = strikes.filter((s) => s.distanceKm <= SAFETY_RADIUS_KM);
    if (!breach.length) return null;
    const freshest = Math.min(...breach.map((s) => s.ageMin));
    return Date.now() + (30 - freshest) * 60_000;
  }, [strikes]);

  useEffect(() => {
    if (level !== "danger") setAlertDismissedAt(null);
  }, [level]);

  const refreshAll = useCallback(() => {
    if (coords) loadData(coords);
  }, [coords, loadData]);

  const value: WarnlyState = {
    coords,
    geoError,
    locating,
    requestLocation,
    setCustomCoords,
    weather,
    isLoading,
    error,
    refresh: refreshAll,
    probability,
    level,
    strikes,
    nearest,
    alertDismissedAt,
    dismissAlert: () => setAlertDismissedAt(Date.now()),
    shelterUntil,
    simulateStorm,
    toggleSimulateStorm: () =>
      setSimulateStorm((s) => {
        const next = !s;
        if (!next) clearSimulatedStrikes();
        return next;
      }),
    connectionState,
    backendSnapshot,
    doppler: backendSnapshot?.doppler ?? null,
    barometer: backendSnapshot?.barometer ?? null,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWarnly() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWarnly must be used inside WarnlyProvider");
  return ctx;
}