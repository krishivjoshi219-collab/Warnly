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
import {
  REVENUECAT_TEST_API_KEY,
  initializeRevenueCat,
  getRevenueCatCustomerInfo,
  getRevenueCatOfferings,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
  getRevenueCatAppUserId,
  subscribeToRevenueCatCustomerUpdates,
  checkHasProEntitlement,
  getActiveEntitlements,
} from "./revenuecat";
import type { PurchasesOffering, PurchasesPackage } from "react-native-purchases";

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
  // RevenueCat In-App Subscriptions
  rcInitialized: boolean;
  rcAppUserId: string | null;
  rcEntitlements: string[];
  rcOffering: PurchasesOffering | null;
  rcPackages: PurchasesPackage[];
  purchasePackage: (pkg: PurchasesPackage) => Promise<{ success: boolean; userCancelled?: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; isPro: boolean; error?: string }>;
  loadingOfferings: boolean;
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

  // RevenueCat state
  const [rcInitialized, setRcInitialized] = useState(false);
  const [rcAppUserId, setRcAppUserId] = useState<string | null>(null);
  const [rcEntitlements, setRcEntitlements] = useState<string[]>([]);
  const [rcOffering, setRcOffering] = useState<PurchasesOffering | null>(null);
  const [rcPackages, setRcPackages] = useState<PurchasesPackage[]>([]);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [rcPro, setRcPro] = useState(false);

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

  // Initialize RevenueCat SDK
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    async function setupRC() {
      try {
        const ok = await initializeRevenueCat(REVENUECAT_TEST_API_KEY);
        setRcInitialized(ok);
        const userId = await getRevenueCatAppUserId();
        setRcAppUserId(userId);

        const info = await getRevenueCatCustomerInfo();
        if (info) {
          const hasPro = checkHasProEntitlement(info);
          setRcPro(hasPro);
          setRcEntitlements(getActiveEntitlements(info));
        }

        setLoadingOfferings(true);
        const offering = await getRevenueCatOfferings();
        if (offering) {
          setRcOffering(offering);
          setRcPackages(offering.availablePackages || []);
        }
        setLoadingOfferings(false);

        unsubscribe = subscribeToRevenueCatCustomerUpdates((updatedInfo, isProActive) => {
          setRcPro(isProActive);
          setRcEntitlements(getActiveEntitlements(updatedInfo));
        });
      } catch (err) {
        console.warn("[ProProvider] RevenueCat setup error:", err);
        setLoadingOfferings(false);
      }
    }
    setupRC();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const openPaywall = useCallback((reason = "") => {
    setPaywallReason(reason);
    setPaywallOpen(true);
  }, []);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    const res = await purchaseRevenueCatPackage(pkg);
    if (res.success) {
      setRcPro(true);
      setState((s) => ({ ...s, isPro: true }));
      if (res.customerInfo) {
        setRcEntitlements(getActiveEntitlements(res.customerInfo));
      }
    }
    return res;
  }, []);

  const restorePurchases = useCallback(async () => {
    const res = await restoreRevenueCatPurchases();
    if (res.success && res.isPro) {
      setRcPro(true);
      setState((s) => ({ ...s, isPro: true }));
      if (res.customerInfo) {
        setRcEntitlements(getActiveEntitlements(res.customerInfo));
      }
    }
    return res;
  }, []);

  const isPro = state.isPro || rcPro;

  const value = useMemo<ProState>(
    () => ({
      isPro,
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
        if (!isPro && state.places.length >= 1) {
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
      // RevenueCat fields
      rcInitialized,
      rcAppUserId,
      rcEntitlements,
      rcOffering,
      rcPackages,
      purchasePackage,
      restorePurchases,
      loadingOfferings,
    }),
    [
      isPro,
      state,
      paywallOpen,
      paywallReason,
      sirenActive,
      openPaywall,
      rcInitialized,
      rcAppUserId,
      rcEntitlements,
      rcOffering,
      rcPackages,
      purchasePackage,
      restorePurchases,
      loadingOfferings,
    ],
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
