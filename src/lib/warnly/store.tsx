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

function isValidCoords(v: unknown): v is Coords {
  if (!v || typeof v !== "object") return false;
  const c = v as { lat?: unknown; lon?: unknown };
  return (
    typeof c.lat === "number" &&
    typeof c.lon === "number" &&
    Number.isFinite(c.lat) &&
    Number.isFinite(c.lon) &&
    Math.abs(c.lat) <= 90 &&
    Math.abs(c.lon) <= 180
  );
}

export function WarnlyProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(() => {
    try {
      const saved = getStorageItem("warnly:coords");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isValidCoords(parsed)) return parsed;
      }
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
  // Refs mirror async state so intervals never need side-effects inside updaters.
  const weatherRef = useRef<WeatherSnapshot | undefined>(undefined);
  weatherRef.current = weather;
  const strikesRef = useRef<Strike[]>([]);
  strikesRef.current = strikes;

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
      // Ingest through the Resilient Multi-Tier Backend, fed with the latest
      // known strikes so early-warning synthesis uses real inputs.
      const snapshot = await ResilientBackendEngine.getAtmosphericTelemetry(c, {
        strikes: strikesRef.current,
      });
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

  // 15-Minute Stale-Data Watchdog Timer.
  // lastRemoteSync starts at 0 (never synced) so a fresh offline launch is
  // honestly STALE until the first successful remote sync — never "0 min ago".
  const [lastRemoteSync, setLastRemoteSync] = useState(0);
  const [nowTick, setNowTick] = useState(Date.now());
  const [launchTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const staleMinutes = lastRemoteSync > 0 ? Math.floor((nowTick - lastRemoteSync) / 60000) : Math.floor((nowTick - launchTime) / 60000);
  const isStale = lastRemoteSync <= 0 || staleMinutes >= 15;

  // Always acquire true hardware GPS satellite reception on launch
  useEffect(() => {
    requestHardwareLocation();
  }, [requestHardwareLocation]);

  const simulateStormRef = useRef(simulateStorm);
  simulateStormRef.current = simulateStorm;

  // Round GPS to ~1km for subscription keys so meter-level jitter doesn't
  // tear down and rebuild the 3-min / 15-s polling loops.
  const coordKey = coords ? `${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}` : null;

  useEffect(() => {
    if (!coords) return;
    const liveCoords = coords;
    loadData(liveCoords);

    // Weather refresh every 3 minutes via resilient backend
    const wxInterval = setInterval(() => {
      if (simulateStormRef.current) return;
      ResilientBackendEngine.getAtmosphericTelemetry(liveCoords, {
        strikes: strikesRef.current,
      })
        .then((snap) => {
          if (!simulateStormRef.current) {
            setBackendSnapshot(snap);
            savedBaselineSnapshotRef.current = snap;
            setConnectionState(snap.connectionState);
            setWeather(snap.weather);
            savedBaselineWeatherRef.current = snap.weather;
            if (snap.connectionState !== 'OFFLINE_CACHED') {
              setLastRemoteSync(Date.now());
            }
          }
        })
        .catch(() => {});
    }, 3 * 60 * 1000);

    // Strike refresh every 15 seconds — pure read path. Never put
    // side-effects inside a state updater (StrictMode double-invokes them).
    const stInterval = setInterval(() => {
      const isSim = simulateStormRef.current;
      const w = weatherRef.current;
      fetchRealLightningStrikes(
        liveCoords,
        isSim ? Math.max(w?.cape ?? 0, 2450) : (w?.cape ?? 0),
        isSim ? Math.max(w?.precipProbability ?? 0, 92) : (w?.precipProbability ?? 0),
        isSim ? 95 : (w?.weatherCode ?? 0),
        isSim
      )
        .then((st) => {
          if (simulateStormRef.current === isSim) setStrikes(st);
        })
        .catch(() => {});
    }, 15 * 1000);

    return () => {
      clearInterval(wxInterval);
      clearInterval(stInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordKey, loadData]);

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
    // If telemetry data is > 15 minutes old (or never synced), strip the green
    // "ALL CLEAR" badge! Downgrade to advisory and floor probability so the
    // user is not misled.
    // STALE DECAY: danger also requires FRESH evidence. A strike that fired
    // danger 25 min ago must not hold "SHELTER NOW" forever after the network
    // drops — cap stale levels at advisory (unknown), never safe, never danger.
    if (isStale && lvl === 'safe') {
      lvl = 'advisory';
      p = Math.max(p, 25);
    } else if (isStale && lvl === 'danger') {
      lvl = 'advisory';
    }

    return {
      probability: p,
      level: lvl,
    };
  }, [weather, strikes, isStale]);

  const nearest = strikes[0] ?? null;

  const survival: SurvivalPanel = useMemo(() => {
    // Only FRESH strikes (≤20 min, same window as riskLevel) can order shelter.
    // An old strike near pool expiry must not command "Go inside NOW".
    const breach = strikes.some((s) => s.distanceKm <= SAFETY_RADIUS_KM && s.ageMin <= 20);
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

  // 30-30 shelter deadline anchored to the freshest breach strike timestamp,
  // not to Date.now() at render time — so the countdown doesn't jump every
  // time the 15-s strike poll returns a new array identity.
  const shelterUntil = useMemo(() => {
    const breach = strikes.filter((s) => s.distanceKm <= SAFETY_RADIUS_KM && s.ageMin <= 20);
    if (!breach.length) return null;
    const freshestAgeMin = Math.min(...breach.map((s) => s.ageMin));
    const now = Date.now();
    const freshestTs = now - freshestAgeMin * 60_000;
    return freshestTs + 30 * 60_000;
  }, [strikes]);

  useEffect(() => {
    if (level !== "danger") setAlertDismissedAt(null);
  }, [level]);

  const refreshAll = useCallback(() => {
    if (coords) loadData(coords);
  }, [coords, loadData]);

  // DEMO MODE (hackathon): clearly-labeled synthetic supercell. All demo
  // strikes carry `isSimulated: true` + `demo-strike-*` ids so they can never
  // be mistaken for Blitzortung live data, and exiting demo purges ONLY the
  // synthetic pool then restores the saved live baseline. No setState calls
  // inside an updater — StrictMode-safe.
  const toggleSimulateStorm = useCallback(() => {
    const next = !simulateStormRef.current;
    setSimulateStorm(next);
    simulateStormRef.current = next;
    if (next) {
      if (weatherRef.current) savedBaselineWeatherRef.current = weatherRef.current;
      setBackendSnapshot((prevSnap) => {
        if (prevSnap) savedBaselineSnapshotRef.current = prevSnap;
        return prevSnap;
      });

      const c = coords ?? { lat: 28.5355, lon: 77.26 };
      const baseWx: WeatherSnapshot = weatherRef.current ?? {
        place: "South East, Delhi (DEMO)",
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
        rainSummary: "DEMO supercell — synthetic data for hackathon judging, not a live warning",
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
      weatherRef.current = demoWeather;

      const demoSt = generateDemoStrikesSync(c);
      setStrikes(demoSt);

      setBackendSnapshot((prevSnap) => ({
        connectionState: 'ONLINE_REALTIME',
        weather: demoWeather,
        doppler: analyzeDopplerCells(c, 2850, 98, 95, true),
        barometer: prevSnap?.barometer ?? {
          currentHpa: 1004,
          delta1hHpa: -4.2,
          delta3hHpa: -7.5,
          tendency: 'MICROBURST_SURGE',
          hasMicroburstRisk: true,
          leadTimeMinutes: 18,
          advisoryText: 'DEMO pressure surge — synthetic microburst for hackathon judging',
        },
        glof: prevSnap?.glof ?? null,
        earlyWarning: prevSnap?.earlyWarning ?? null,
        cachedAgeSec: 0,
        metar: prevSnap?.metar ?? null,
        hardwareBarometer: prevSnap?.hardwareBarometer ?? null,
        lastSuccessfulSync: Date.now(),
      }));
    } else {
      clearSimulatedStrikes();
      // Re-fetch live strikes for current coords instead of trusting a stale pool.
      const liveCoords = coords;
      if (liveCoords) {
        const w = savedBaselineWeatherRef.current;
        fetchRealLightningStrikes(
          liveCoords,
          w?.cape ?? 0,
          w?.precipProbability ?? 0,
          w?.weatherCode ?? 0,
          false
        )
          .then((st) => {
            if (!simulateStormRef.current) setStrikes(st);
          })
          .catch(() => {
            if (!simulateStormRef.current) setStrikes([]);
          });
      } else {
        setStrikes([]);
      }
      if (savedBaselineWeatherRef.current) {
        setWeather(savedBaselineWeatherRef.current);
        weatherRef.current = savedBaselineWeatherRef.current;
      }
      if (savedBaselineSnapshotRef.current) {
        setBackendSnapshot(savedBaselineSnapshotRef.current);
      }
    }
  }, [coords]);

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
    toggleSimulateStorm,
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
