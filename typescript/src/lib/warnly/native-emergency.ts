import { NativeModules, Platform } from "react-native";

const { WarnlyEmergencyModule } = NativeModules;

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
  isAvailable: Platform.OS === "android" && !!WarnlyEmergencyModule,

  startAlarmSiren: () => {
    if (Platform.OS === "android" && WarnlyEmergencyModule?.startAlarmSiren) {
      try {
        WarnlyEmergencyModule.startAlarmSiren();
      } catch {
        /* fallback */
      }
    }
  },

  stopAlarmSiren: () => {
    if (Platform.OS === "android" && WarnlyEmergencyModule?.stopAlarmSiren) {
      try {
        WarnlyEmergencyModule.stopAlarmSiren();
      } catch {
        /* fallback */
      }
    }
  },

  checkDndPermission: async (): Promise<boolean> => {
    if (Platform.OS === "android" && WarnlyEmergencyModule?.checkDndPermission) {
      try {
        return await WarnlyEmergencyModule.checkDndPermission();
      } catch {
        return false;
      }
    }
    return true;
  },

  requestDndPermission: () => {
    if (Platform.OS === "android" && WarnlyEmergencyModule?.requestDndPermission) {
      try {
        WarnlyEmergencyModule.requestDndPermission();
      } catch {
        /* fallback */
      }
    }
  },

  setupEmergencyNotificationChannel: () => {
    if (Platform.OS === "android" && WarnlyEmergencyModule?.setupEmergencyNotificationChannel) {
      try {
        WarnlyEmergencyModule.setupEmergencyNotificationChannel();
      } catch {
        /* fallback */
      }
    }
  },

  postCriticalAlert: (title: string, message: string) => {
    if (Platform.OS === "android" && WarnlyEmergencyModule?.postCriticalAlert) {
      try {
        WarnlyEmergencyModule.postCriticalAlert(title, message);
      } catch {
        /* fallback */
      }
    }
  },
};
