import React, { useState, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
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
  const screenFade = useRef(new Animated.Value(1)).current;

  const handleTabChange = (nextTab: ActiveTab) => {
    if (nextTab === activeTab) return;
    Animated.timing(screenFade, {
      toValue: 0.15,
      duration: 70,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(nextTab);
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "HOME":
        return <HomeScreen onNavigateRadar={() => handleTabChange("RADAR")} />;
      case "RADAR":
        return <RadarScreen />;
      case "SHIELD":
        return <ShieldScreen />;
      case "WEATHER":
        return <WeatherScreen />;
      case "SETTINGS":
        return <SettingsScreen />;
      default:
        return <HomeScreen onNavigateRadar={() => handleTabChange("RADAR")} />;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.screenWrapper, { opacity: screenFade }]}>
        {renderScreen()}
      </Animated.View>
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
  screenWrapper: {
    flex: 1,
  },
});
