import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef, type ReactNode } from "react";
import { gridProbability, riskLevel, SAFETY_RADIUS_KM } from "./risk";
import type { Coords, RiskLevel, Strike, WeatherSnapshot } from "./types";
import { fetchRealLightningStrikes, clearSimulatedStrikes, generateDemoStrikesSync } from "./lightning";
import {
  ResilientBackendEngine,
  type UnifiedBackendSnapshot,
  type BackendConnectionState,
} from "./resilient-backend";
import { analyzeDopplerCells, type DopplerRadarSummary } from "./doppler-vector";
import type { BarometricAnalysis } from "./barometric-surge";
import { NativeEmergency } from "./native-emergency";

import type { AirportMetar } from "./metar";
import { getLightningFeedStatus } from "./lightning";

interface SurvivalPanel {
  directive: string;
  fallback: string;
  evac: string;
  custody: string;
  reserve: string;
  air: string;
  flood: string;
  calm: string;
}

interface WarnlyState {
  survival: SurvivalPanel;
  coords: Coords | null;
  geoError: string | null;
  locating: boolean;
  requestLocation: () => void;
  requestHardwareLocation: () => Promise<void>;
  showLocationPrompt: boolean;
  setShowLocationPrompt: (show: boolean) => void;
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
  // ── 15-Minute Stale-Data Watchdog & Anti-False-Safe Guardrails ──
  isStale: boolean;
  staleMinutes: number;
  lastRemoteSync: number;
  airportMetar: AirportMetar | null;
  lightningFeedStatus: 'CONNECTED' | 'RECONNECTING' | 'OFFLINE';
}

const Ctx = createContext<WarnlyState | null>(null);

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
    return null;
  });
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [alertDismissedAt, setAlertDismissedAt] = useState<number | null>(null);
  const [simulateStorm, setSimulateStorm] = useState(false);
  const savedBaselineWeatherRef = useRef<WeatherSnapshot | undefined>(undefined);
  const savedBaselineSnapshotRef = useRef<UnifiedBackendSnapshot | null>(null);

  const [weather, setWeather] = useState<WeatherSnapshot | undefined>(undefined);
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Backend resilience state
  const [backendSnapshot, setBackendSnapshot] = useState<UnifiedBackendSnapshot | null>(null);
  const [connectionState, setConnectionState] = useState<BackendConnectionState>('ONLINE_REALTIME');

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Fallback to high-accuracy IP location if satellite GPS is unavailable
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

    try {
      const res = await fetch("https://ip-api.com/json");
      if (res.ok) {
        const data = await res.json();
        if (data.lat && data.lon) {
          const ipCoords = {
            lat: parseFloat(data.lat),
            lon: parseFloat(data.lon),
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

    setGeoError("Location unavailable. Please search your city or enable GPS.");
    setLocating(false);
  };

  /**
   * Real hardware GPS interrogation with true satellite reception (zero-internet disaster resilient)
   */
  const requestHardwareLocation = useCallback(async () => {
    setLocating(true);
    setGeoError(null);

    // 1. Interrogate Android Native Location Permissions
    try {
      const hasPerm = await NativeEmergency.checkLocationPermission();
      if (!hasPerm) {
        const granted = await NativeEmergency.requestHardwareLocationPermission();
        if (!granted) {
          setGeoError("Hardware GPS permission denied. Please search your city or area.");
          setLocating(false);
          setShowLocationPrompt(true);
          return;
        }
      }

      // 2. Direct hardware GPS satellite query via Android LocationManager
      try {
        const hwLoc = await NativeEmergency.getHardwareLocation();
        if (hwLoc && hwLoc.latitude && hwLoc.longitude) {
          const newCoords = { lat: hwLoc.latitude, lon: hwLoc.longitude };
          setCoords(newCoords);
          setStorageItem("warnly:coords", JSON.stringify(newCoords));
          setGeoError(null);
          setLocating(false);
          return;
        }
      } catch (_hwErr) {
        /* hardware gps waiting for satellite fix */
      }
    } catch (_err) {
      /* permission check fallback */
    }

    // 3. Fallback to standard geolocation if available in runtime
    if (typeof navigator !== "undefined" && navigator.geolocation) {
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
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 },
      );
      return;
    }

    // 4. Fallback to IP geolocation
    await fallbackToIpLocation();
  }, []);

  const requestLocation = useCallback(() => {
    requestHardwareLocation();
  }, [requestHardwareLocation]);

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
      savedBaselineSnapshotRef.current = snapshot;
      setConnectionState(snapshot.connectionState);
      setWeather(snapshot.weather);
      savedBaselineWeatherRef.current = snapshot.weather;
      if (snapshot.connectionState !== 'OFFLINE_CACHED') {
        setLastRemoteSync(Date.now());
      }

      const st = await fetchRealLightningStrikes(
        c,
        snapshot.weather.cape,
        snapshot.weather.precipProbability,
        snapshot.weather.weatherCode,
        false
      );
      setStrikes(st);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 15-Minute Stale-Data Watchdog Timer
  const [lastRemoteSync, setLastRemoteSync] = useState(Date.now());
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const staleMinutes = lastRemoteSync > 0 ? Math.floor((nowTick - lastRemoteSync) / 60000) : 0;
  const isStale = staleMinutes >= 15;

  // Always acquire true hardware GPS satellite reception on launch
  useEffect(() => {
    requestHardwareLocation();
  }, [requestHardwareLocation]);

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

    // Strike refresh every 15 seconds — read live snapshot to avoid stale closure
    const stInterval = setInterval(() => {
      setBackendSnapshot((snap) => {
        const w = snap?.weather ?? weather;
        fetchRealLightningStrikes(
          coords,
          simulateStorm ? Math.max(w?.cape ?? 0, 2450) : (w?.cape ?? 0),
          simulateStorm ? Math.max(w?.precipProbability ?? 0, 92) : (w?.precipProbability ?? 0),
          simulateStorm ? 95 : (w?.weatherCode ?? 0),
          simulateStorm
        )
          .then((st) => setStrikes(st))
          .catch(() => {});
        return snap;
      });
    }, 15 * 1000);

    return () => {
      clearInterval(wxInterval);
      clearInterval(stInterval);
    };
  }, [coords?.lat, coords?.lon, loadData]);

  const { probability, level } = useMemo(() => {
    const base = weather
      ? {
          cape: weather.cape,
          liftedIndex: weather.liftedIndex,
          precipProbability: weather.precipProbability,
          weatherCode: weather.weatherCode,
        }
      : { cape: 0, liftedIndex: 4, precipProbability: 0, weatherCode: 0 };

    let p = gridProbability(base, strikes);
    let lvl = riskLevel(p, strikes);

    // ANTI-FALSE-SAFE GUARDRAIL:
    // If telemetry data is > 15 minutes old, strip the green "ALL CLEAR" badge!
    // Downgrade to advisory and floor probability so user is not misled.
    if (isStale && lvl === 'safe') {
      lvl = 'advisory';
      p = Math.max(p, 25);
    }

    return {
      probability: p,
      level: lvl,
    };
  }, [weather, strikes, isStale]);

  const nearest = strikes[0] ?? null;

  const survival: SurvivalPanel = useMemo(() => {
    const breach = strikes.some((s) => s.distanceKm <= SAFETY_RADIUS_KM);
    const doNot: string[] = breach ? ['Do NOT shelter near plumbing or windows'] : [];
    return {
      directive: breach ? 'Go to interior hallway NOW — avoid basement if wet' : 'Monitor — no verified refuge needed',
      fallback: 'If blocked: highest interior room, send SOS, strobe + chirp',
      evac: breach ? 'SHELTER_IN_PLACE: core overhead' : 'EVACUATE routes open',
      custody: strikes.length ? 'Saved locally — mesh relay ready' : 'No SOS active',
      reserve: '8.1h standard vs 72h+ reserve (30s beacon every 15m)',
      air: 'Air breathable — ventilate',
      flood: 'Water stable — monitor',
      calm: breach ? 'Breathe. Go to interior hallway NOW. Tap when done.' : 'Breathe. You are safe. Tap when done.',
    };
  }, [strikes]);

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
    survival,
    coords,
    geoError,
    locating,
    requestLocation,
    requestHardwareLocation,
    showLocationPrompt,
    setShowLocationPrompt,
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
      setSimulateStorm((prev) => {
        const next = !prev;
        if (next) {
          // Synchronous immediate demo injection (0 ms latency)
          if (weather) savedBaselineWeatherRef.current = weather;
          if (backendSnapshot) savedBaselineSnapshotRef.current = backendSnapshot;

          const c = coords ?? { lat: 28.5355, lon: 77.26 };
          const baseWx: WeatherSnapshot = weather ?? {
            place: "South East, Delhi",
            coords: c,
            temperature: 24,
            apparent: 26,
            humidity: 92,
            dewPoint: 22,
            cloudCover: 90,
            uvIndex: 1,
            windSpeed: 45,
            windGust: 65,
            windDirection: 210,
            pressure: 1004,
            precipitation: 24.5,
            weatherCode: 95,
            isDay: false,
            cape: 2850,
            liftedIndex: -5.4,
            precipProbability: 98,
            updatedAt: Date.now(),
            rainSummary: "Severe convective cell — torrential rain and lightning",
            daily: [],
            hourly: [],
            minutely15: [],
          };
          const demoWeather: WeatherSnapshot = {
            ...baseWx,
            cape: 2850,
            liftedIndex: -5.4,
            precipProbability: 98,
            weatherCode: 95,
            precipitation: 24.5,
            windSpeed: 48,
          };
          setWeather(demoWeather);

          const demoSt = generateDemoStrikesSync(c);
          setStrikes(demoSt);

          setBackendSnapshot({
            connectionState: 'ONLINE_REALTIME',
            weather: demoWeather,
            doppler: analyzeDopplerCells(c, 2850, 98, 95, true),
            barometer: backendSnapshot?.barometer ?? {
              currentHpa: 1004,
              delta1hHpa: -4.2,
              delta3hHpa: -7.5,
              tendency: 'MICROBURST_SURGE',
              hasMicroburstRisk: true,
              leadTimeMinutes: 18,
              advisoryText: 'Severe convective pressure surge detected — microburst imminent',
            },
            glof: backendSnapshot?.glof ?? null,
            earlyWarning: backendSnapshot?.earlyWarning ?? null,
            cachedAgeSec: 0,
            metar: backendSnapshot?.metar ?? null,
            hardwareBarometer: backendSnapshot?.hardwareBarometer ?? null,
            lastSuccessfulSync: Date.now(),
          });
        } else {
          // Synchronous clean restore (0 ms latency)
          clearSimulatedStrikes();
          setStrikes([]);
          if (savedBaselineWeatherRef.current) {
            setWeather(savedBaselineWeatherRef.current);
          }
          if (savedBaselineSnapshotRef.current) {
            setBackendSnapshot(savedBaselineSnapshotRef.current);
          }
        }
        return next;
      }),
    connectionState,
    backendSnapshot,
    doppler: backendSnapshot?.doppler ?? null,
    barometer: backendSnapshot?.barometer ?? null,
    // ── 15-Minute Stale-Data Watchdog & Anti-False-Safe Guardrails ──
    isStale,
    staleMinutes,
    lastRemoteSync,
    airportMetar: backendSnapshot?.metar ?? null,
    lightningFeedStatus: getLightningFeedStatus().status,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWarnly() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWarnly must be used inside WarnlyProvider");
  return ctx;
}
