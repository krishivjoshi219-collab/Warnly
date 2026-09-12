import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Coords } from "./types";
import { startSirenAudio, stopSirenAudio } from "./siren";

export interface MonitoredPlace {
  id: string;
  label: string;
  name: string;
  lat: number;
  lon: number;
}

export interface Offering {
  id: "monthly" | "yearly" | "lifetime";
  title: string;
  price: string;
  period: string;
  badge?: string;
  note?: string;
}

export const OFFERINGS: Offering[] = [
  { id: "monthly", title: "Monthly", price: "$2.99", period: "per month", note: "Cancel anytime" },
  {
    id: "yearly",
    title: "Yearly",
    price: "$19.99",
    period: "per year",
    badge: "Save 45%",
    note: "3-day free trial included",
  },
  { id: "lifetime", title: "Lifetime", price: "$49.99", period: "one-time", note: "Pay once, forever" },
];

export type Units = "metric" | "imperial";

export interface ApiKeys {
  openWeather?: string;
  tomorrowIo?: string;
  openMeteoCommercial?: string;
  mapbox?: string;
}

interface ProState {
  isPro: boolean;
  toggleProDemo: () => void;
  paywallOpen: boolean;
  openPaywall: (reason?: string) => void;
  closePaywall: () => void;
  paywallReason: string;
  units: Units;
  setUnits: (u: Units) => void;
  alertRadiusKm: number;
  setAlertRadiusKm: (km: number) => void;
  places: MonitoredPlace[];
  addPlace: (p: Omit<MonitoredPlace, "id">) => boolean;
  removePlace: (id: string) => void;
  sirenActive: boolean;
  startSiren: () => void;
  stopSiren: () => void;
  apiKeys: ApiKeys;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
}

const Ctx = createContext<ProState | null>(null);

const KEY = "warnly:prefs";

interface Persisted {
  isPro: boolean;
  units: Units;
  alertRadiusKm: number;
  places: MonitoredPlace[];
  apiKeys: ApiKeys;
}

const DEFAULTS: Persisted = {
  isPro: false,
  units: "metric",
  alertRadiusKm: 15,
  places: [],
  apiKeys: {},
};

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

export function ProProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState("");
  const [sirenActive, setSirenActive] = useState(false);

  useEffect(() => {
    try {
      const raw = getStorageItem(KEY);
      if (raw) setState({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      setStorageItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const openPaywall = useCallback((reason = "") => {
    setPaywallReason(reason);
    setPaywallOpen(true);
  }, []);

  const value = useMemo<ProState>(
    () => ({
      isPro: state.isPro,
      toggleProDemo: () => setState((s) => ({ ...s, isPro: !s.isPro })),
      paywallOpen,
      openPaywall,
      closePaywall: () => setPaywallOpen(false),
      paywallReason,
      units: state.units,
      setUnits: (u) => setState((s) => ({ ...s, units: u })),
      alertRadiusKm: state.alertRadiusKm,
      setAlertRadiusKm: (km) => setState((s) => ({ ...s, alertRadiusKm: km })),
      places: state.places,
      addPlace: (p) => {
        if (!state.isPro && state.places.length >= 1) {
          openPaywall("Family Shield tracks unlimited places with Warnly Pro.");
          return false;
        }
        setState((s) => ({
          ...s,
          places: [...s.places, { ...p, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }],
        }));
        return true;
      },
      removePlace: (id) => setState((s) => ({ ...s, places: s.places.filter((p) => p.id !== id) })),
      sirenActive,
      startSiren: () => {
        setSirenActive(true);
        startSirenAudio();
      },
      stopSiren: () => {
        setSirenActive(false);
        stopSirenAudio();
      },
      apiKeys: state.apiKeys ?? {},
      setApiKey: (provider, key) =>
        setState((s) => ({
          ...s,
          apiKeys: { ...s.apiKeys, [provider]: key.trim() },
        })),
    }),
    [state, paywallOpen, paywallReason, sirenActive, openPaywall],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePro() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePro must be used inside ProProvider");
  return ctx;
}

/** Distance / rain formatting respecting the user's unit preference. */
export function formatDistance(km: number, units: Units): string {
  return units === "imperial" ? `${(km * 0.621371).toFixed(1)} mi` : `${km.toFixed(1)} km`;
}

export function formatRain(mm: number, units: Units): string {
  return units === "imperial" ? `${(mm / 25.4).toFixed(2)} in/hr` : `${mm.toFixed(1)} mm/hr`;
}

export type { Coords };
