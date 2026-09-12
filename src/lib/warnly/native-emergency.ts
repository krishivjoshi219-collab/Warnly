import { NativeModules, Platform } from "react-native";

function getModule() {
  return NativeModules.WarnlyEmergencyModule;
}

export interface EmergencyModuleInterface {
  isAvailable: boolean;
  startAlarmSiren: () => void;
  stopAlarmSiren: () => void;
  checkDndPermission: () => Promise<boolean>;
  requestDndPermission: () => void;
  setupEmergencyNotificationChannel: () => void;
  postCriticalAlert: (title: string, message: string) => void;
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
};
