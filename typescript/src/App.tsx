import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
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
  const { level } = useWarnly();

  const renderScreen = () => {
    switch (activeTab) {
      case "HOME":
        return <HomeScreen onNavigateRadar={() => setActiveTab("RADAR")} />;
      case "RADAR":
        return <RadarScreen />;
      case "SHIELD":
        return <ShieldScreen />;
      case "WEATHER":
        return <WeatherScreen />;
      case "SETTINGS":
        return <SettingsScreen />;
      default:
        return <HomeScreen onNavigateRadar={() => setActiveTab("RADAR")} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenWrapper}>{renderScreen()}</View>
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
  screenWrapper: {
    flex: 1,
  },
});
