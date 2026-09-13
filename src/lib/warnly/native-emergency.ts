import { NativeModules, Platform } from "react-native";

// Safe access for React Native runtime
const PermissionsAndroid = (require("react-native") as any)?.PermissionsAndroid;

function getModule() {
  return NativeModules.WarnlyEmergencyModule;
}

export interface HardwareLocationResult {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp?: number;
  provider?: string;
}

export interface EmergencyModuleInterface {
  isAvailable: boolean;
  startAlarmSiren: () => void;
  stopAlarmSiren: () => void;
  checkDndPermission: () => Promise<boolean>;
  requestDndPermission: () => void;
  setupEmergencyNotificationChannel: () => void;
  postCriticalAlert: (title: string, message: string) => void;
  // True Hardware GPS Location integration (zero internet disaster resilient)
  checkLocationPermission: () => Promise<boolean>;
  requestHardwareLocationPermission: () => Promise<boolean>;
  getHardwareLocation: () => Promise<HardwareLocationResult>;
  openLocationSettings: () => void;
}

export const NativeEmergency: EmergencyModuleInterface = {
  get isAvailable() {
    return Platform.OS === "android" && !!getModule();
  },

  startAlarmSiren: () => {
    const mod = getModule();
    console.log("[NativeEmergency] startAlarmSiren called, mod available:", !!mod);
    if (Platform.OS === "android" && mod?.startAlarmSiren) {
      try {
        mod.startAlarmSiren();
      } catch (err) {
        console.error("[NativeEmergency] startAlarmSiren error:", err);
      }
    }
  },

  stopAlarmSiren: () => {
    const mod = getModule();
    console.log("[NativeEmergency] stopAlarmSiren called, mod available:", !!mod);
    if (Platform.OS === "android" && mod?.stopAlarmSiren) {
      try {
        mod.stopAlarmSiren();
      } catch (err) {
        console.error("[NativeEmergency] stopAlarmSiren error:", err);
      }
    }
  },

  checkDndPermission: async (): Promise<boolean> => {
    const mod = getModule();
    if (Platform.OS === "android" && mod?.checkDndPermission) {
      try {
        return await mod.checkDndPermission();
      } catch {
        return false;
      }
    }
    return true;
  },

  requestDndPermission: () => {
    const mod = getModule();
    if (Platform.OS === "android" && mod?.requestDndPermission) {
      try {
        mod.requestDndPermission();
      } catch {
        /* fallback */
      }
    }
  },

  setupEmergencyNotificationChannel: () => {
    const mod = getModule();
    if (Platform.OS === "android" && mod?.setupEmergencyNotificationChannel) {
      try {
        mod.setupEmergencyNotificationChannel();
      } catch {
        /* fallback */
      }
    }
  },

  postCriticalAlert: (title: string, message: string) => {
    const mod = getModule();
    if (Platform.OS === "android" && mod?.postCriticalAlert) {
      try {
        mod.postCriticalAlert(title, message);
      } catch {
        /* fallback */
      }
    }
  },

  checkLocationPermission: async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      try {
        const mod = getModule();
        if (mod?.checkLocationPermission) {
          return await mod.checkLocationPermission();
        }
        return await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      } catch {
        return false;
      }
    }
    return true;
  },

  requestHardwareLocationPermission: async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      try {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Warnly Hardware GPS Access",
            message:
              "Warnly requires hardware satellite GPS to calculate lightning strike distance, safe shelter bearings, and convective flash flood risks offline during severe emergencies.",
            buttonNeutral: "Ask Later",
            buttonNegative: "Cancel",
            buttonPositive: "Allow Hardware GPS",
          }
        );
        return res === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn("[NativeEmergency] request location error:", err);
        return false;
      }
    }
    return true;
  },

  getHardwareLocation: async (): Promise<HardwareLocationResult> => {
    const mod = getModule();
    if (Platform.OS === "android" && mod?.getHardwareLocation) {
      return await mod.getHardwareLocation();
    }
    throw new Error("Hardware location service not yet bound in running runtime");
  },

  openLocationSettings: () => {
    const mod = getModule();
    if (Platform.OS === "android" && mod?.openLocationSettings) {
      try {
        mod.openLocationSettings();
      } catch {
        /* fallback */
      }
    }
  },
};

