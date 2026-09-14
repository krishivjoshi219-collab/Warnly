import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { startSirenAudio, stopSirenAudio } from "./lib/warnly/siren";
import { NativeEmergency } from "./lib/warnly/native-emergency";
import { WarnlyProvider, useWarnly } from "./lib/warnly/store";
import { ProProvider } from "./lib/warnly/pro";
import { MobileFrame } from "./components/MobileFrame";
import { BottomTabBar, ActiveTab } from "./components/BottomTabBar";
import { EmergencyOverlay } from "./components/warnly/EmergencyOverlay";
import { HomeScreen } from "./screens/HomeScreen";
import { RadarScreen } from "./screens/RadarScreen";
import { ShieldScreen } from "./screens/ShieldScreen";
import { WeatherScreen } from "./screens/WeatherScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { COLORS } from "./theme";

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("HOME");
  const { level, nearest, probability, alertDismissedAt } = useWarnly();
  const sirenActiveRef = useRef(false);
  const dangerNotifiedRef = useRef(false);
  const nearestRef = useRef(nearest);
  nearestRef.current = nearest;
  const probabilityRef = useRef(probability);
  probabilityRef.current = probability;

  // SIR-OWNER-APP: App owns the lightning-danger siren. Respects the user's
  // "Dismiss Alert" choice; the EmergencyOverlay owns only non-danger
  // early-warning criticals (GLOF/quake/flood), so the two never double-wail.
  useEffect(() => {
    const shouldWail = level === "danger" && !alertDismissedAt;
    if (shouldWail && !sirenActiveRef.current) {
      sirenActiveRef.current = true;
      startSirenAudio();
    } else if (!shouldWail && sirenActiveRef.current) {
      sirenActiveRef.current = false;
      stopSirenAudio();
    }
    return () => {
      if (sirenActiveRef.current) {
        sirenActiveRef.current = false;
        stopSirenAudio();
      }
    };
  }, [level, alertDismissedAt]);

  // Critical heads-up: posted ONCE per danger entry (not on every 15 s poll),
  // and never after the user dismissed the alert.
  useEffect(() => {
    if (level === "danger" && !alertDismissedAt && !dangerNotifiedRef.current) {
      dangerNotifiedRef.current = true;
      NativeEmergency.setupEmergencyNotificationChannel();
      const n = nearestRef.current;
      const p = probabilityRef.current;
      NativeEmergency.postCriticalAlert(
        "TAKE SHELTER NOW",
        n
          ? `Lightning ${n.distanceKm} km away — ${p}% threat. Move indoors.`
          : "Lightning inside 10 km ring. Move indoors now."
      );
    } else if (level !== "danger") {
      dangerNotifiedRef.current = false;
    }
  }, [level, alertDismissedAt]);

  // Zero-lag instant tab switching (0 ms)
  const handleTabChange = (nextTab: ActiveTab) => {
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {/* Only the active tab is mounted — same visuals, but background tabs
            can't keep timers/subs/animations running (battery + memory). */}
        <View style={styles.screenPane}>
          {activeTab === "HOME" && <HomeScreen onNavigateRadar={() => handleTabChange("RADAR")} />}
          {activeTab === "RADAR" && <RadarScreen />}
          {activeTab === "SHIELD" && <ShieldScreen />}
          {activeTab === "WEATHER" && <WeatherScreen />}
          {activeTab === "SETTINGS" && <SettingsScreen />}
        </View>
      </View>

      <BottomTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasDanger={level === "danger"}
      />
      <EmergencyOverlay />
    </View>
  );
};

export const App: React.FC = () => {
  return (
    <ProProvider>
      <WarnlyProvider>
        <MobileFrame>
          <MainApp />
        </MobileFrame>
      </WarnlyProvider>
    </ProProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: "relative",
  },
  screenContainer: {
    flex: 1,
  },
  screenPane: {
    flex: 1,
  },
  hiddenPane: {
    display: "none",
  },
});
