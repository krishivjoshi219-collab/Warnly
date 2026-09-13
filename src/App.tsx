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
// Astra engines bundled for offline demo (no UI change, no behavior change).
import "./lib/warnly/astra";

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("HOME");
  const { level, nearest, probability } = useWarnly();
  const sirenActiveRef = useRef(false);

  // Breakthrough siren + critical heads-up on DANGER breach (guarded to avoid bridge spam)
  useEffect(() => {
    if (level === "danger") {
      if (!sirenActiveRef.current) {
        sirenActiveRef.current = true;
        startSirenAudio();
        NativeEmergency.setupEmergencyNotificationChannel();
        NativeEmergency.postCriticalAlert(
          "TAKE SHELTER NOW",
          nearest
            ? `Lightning ${nearest.distanceKm} km away — ${probability}% threat. Move indoors.`
            : "Lightning inside 10 km ring. Move indoors now."
        );
      }
    } else {
      if (sirenActiveRef.current) {
        sirenActiveRef.current = false;
        stopSirenAudio();
      }
    }
  }, [level, nearest, probability]);

  // Zero-lag instant tab switching (0 ms)
  const handleTabChange = (nextTab: ActiveTab) => {
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {/* All screens mounted in parallel with fast display toggling (0 ms tab switch) */}
        <View style={[styles.screenPane, activeTab !== "HOME" && styles.hiddenPane]}>
          <HomeScreen onNavigateRadar={() => handleTabChange("RADAR")} />
        </View>
        <View style={[styles.screenPane, activeTab !== "RADAR" && styles.hiddenPane]}>
          <RadarScreen />
        </View>
        <View style={[styles.screenPane, activeTab !== "SHIELD" && styles.hiddenPane]}>
          <ShieldScreen />
        </View>
        <View style={[styles.screenPane, activeTab !== "WEATHER" && styles.hiddenPane]}>
          <WeatherScreen />
        </View>
        <View style={[styles.screenPane, activeTab !== "SETTINGS" && styles.hiddenPane]}>
          <SettingsScreen />
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
