import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";

declare const __DEV__: boolean | undefined;

/**
 * Warnly Astra - RevenueCat In-App Subscriptions & Paywall Integration
 * Test Public API Key provided for sandbox testing.
 */
const DEFAULT_RC_KEY = "test_iHpFsmOUyIMiZeBzDglxAvosjFr";
export const REVENUECAT_TEST_API_KEY =
  (typeof process !== "undefined" && process.env && (process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || process.env.REVENUECAT_API_KEY)) ||
  DEFAULT_RC_KEY;

/** Entitlement IDs configured in RevenueCat dashboard */
export const PRO_ENTITLEMENT_IDS = ["astra_pro", "warnly_pro", "pro", "premium", "tactical_pass"] as const;

export interface RevenueCatStatus {
  isConfigured: boolean;
  appUserId: string | null;
  isPro: boolean;
  activeEntitlements: string[];
  currentOffering: PurchasesOffering | null;
  packages: PurchasesPackage[];
  lastError: string | null;
}

let isInitialized = false;

/**
 * Checks whether a CustomerInfo payload contains an active Pro entitlement.
 */
export function checkHasProEntitlement(info: CustomerInfo | null | undefined): boolean {
  if (!info || !info.entitlements || !info.entitlements.active) {
    return false;
  }
  const activeKeys = Object.keys(info.entitlements.active);
  return PRO_ENTITLEMENT_IDS.some((id) => activeKeys.includes(id));
}

/**
 * Returns list of active entitlement identifiers for the customer.
 */
export function getActiveEntitlements(info: CustomerInfo | null | undefined): string[] {
  if (!info || !info.entitlements || !info.entitlements.active) {
    return [];
  }
  return Object.keys(info.entitlements.active);
}

/**
 * Initializes the RevenueCat Purchases SDK with the provided API key.
 * Safe against double-initialization and handles web/sandbox fallbacks.
 */
export async function initializeRevenueCat(
  apiKey: string = REVENUECAT_TEST_API_KEY,
  appUserId?: string
): Promise<boolean> {
  if (isInitialized) {
    console.log("[RevenueCat] Already initialized.");
    return true;
  }

  try {
    const isDev = typeof __DEV__ !== "undefined" ? !!__DEV__ : false;
    if (isDev) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    } else {
      Purchases.setLogLevel(LOG_LEVEL.INFO);
    }

    console.log(`[RevenueCat] Initializing SDK on platform=${Platform.OS}...`);

    Purchases.configure({
      apiKey,
      appUserID: appUserId || undefined,
    });

    isInitialized = true;
    console.log("[RevenueCat] SDK configured successfully.");
    return true;
  } catch (err: any) {
    console.warn("[RevenueCat] Initialization warning (running in sandbox/offline):", err?.message || err);
    // Even if native configuration warns in environments without Play Services, mark configured
    isInitialized = true;
    return false;
  }
}

/**
 * Retrieves latest customer information and entitlement state.
 */
export async function getRevenueCatCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isInitialized) {
    await initializeRevenueCat();
  }
  try {
    return await Purchases.getCustomerInfo();
  } catch (err: any) {
    console.warn("[RevenueCat] Error getting customer info:", err?.message || err);
    return null;
  }
}

/**
 * Retrieves the current configured offering from RevenueCat.
 */
export async function getRevenueCatOfferings(): Promise<PurchasesOffering | null> {
  if (!isInitialized) {
    await initializeRevenueCat();
  }
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      return offerings.current;
    }
    // Fallback to first available offering if current is not explicitly marked default
    const allOfferings = Object.values(offerings.all);
    return allOfferings.length > 0 ? allOfferings[0] : null;
  } catch (err: any) {
    console.warn("[RevenueCat] Error fetching offerings:", err?.message || err);
    return null;
  }
}

/**
 * Purchases a selected package via Google Play Billing / App Store.
 */
export async function purchaseRevenueCatPackage(
  packageToPurchase: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; userCancelled?: boolean; error?: string }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    const hasPro = checkHasProEntitlement(customerInfo);
    return {
      success: hasPro,
      customerInfo,
    };
  } catch (err: any) {
    if (err.userCancelled) {
      console.log("[RevenueCat] Purchase cancelled by user.");
      return { success: false, userCancelled: true };
    }
    console.error("[RevenueCat] Purchase error:", err?.message || err);
    return {
      success: false,
      error: err?.message || "Purchase could not be completed.",
    };
  }
}

/**
 * Restores previous purchases for the current account.
 */
export async function restoreRevenueCatPurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  isPro: boolean;
  error?: string;
}> {
  if (!isInitialized) {
    await initializeRevenueCat();
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = checkHasProEntitlement(customerInfo);
    return {
      success: true,
      customerInfo,
      isPro,
    };
  } catch (err: any) {
    console.warn("[RevenueCat] Error restoring purchases:", err?.message || err);
    return {
      success: false,
      isPro: false,
      error: err?.message || "Failed to restore purchases.",
    };
  }
}

/**
 * Retrieves current anonymous or authenticated RevenueCat App User ID.
 */
export async function getRevenueCatAppUserId(): Promise<string | null> {
  if (!isInitialized) {
    await initializeRevenueCat();
  }
  try {
    return await Purchases.getAppUserID();
  } catch {
    return null;
  }
}

/**
 * Subscribes to real-time customer info changes (e.g. renewal, cancellation, remote grant).
 */
export function subscribeToRevenueCatCustomerUpdates(
  onUpdate: (info: CustomerInfo, isPro: boolean) => void
): () => void {
  try {
    const listener = (info: CustomerInfo) => {
      const isPro = checkHasProEntitlement(info);
      onUpdate(info, isPro);
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      try {
        Purchases.removeCustomerInfoUpdateListener(listener);
      } catch {
        /* ignore */
      }
    };
  } catch (err) {
    console.warn("[RevenueCat] Listener registration skipped:", err);
    return () => {};
  }
}
