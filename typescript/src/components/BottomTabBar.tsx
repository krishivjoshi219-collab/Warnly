import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Home, Radar, Shield, CloudSun, Settings } from "./Icons";
import { COLORS, RADII } from "../theme";

export type ActiveTab = "HOME" | "RADAR" | "SHIELD" | "WEATHER" | "SETTINGS";

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  hasDanger?: boolean;
}

export const BottomTabBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  hasDanger,
}) => {
  const tabs = [
    { id: "HOME" as ActiveTab, label: "Home", icon: Home },
    { id: "RADAR" as ActiveTab, label: "Radar", icon: Radar },
    { id: "SHIELD" as ActiveTab, label: "Shield", icon: Shield },
    { id: "WEATHER" as ActiveTab, label: "Weather", icon: CloudSun },
    { id: "SETTINGS" as ActiveTab, label: "Settings", icon: Settings },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon
                  size={19}
                  color={isActive ? COLORS.safe : COLORS.textMuted}
                />
                {tab.id === "RADAR" && hasDanger && (
                  <View style={styles.dangerDot} />
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 100,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(11, 18, 30, 0.96)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 6,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 20,
    gap: 3,
  },
  tabBtnActive: {
    backgroundColor: "rgba(0, 229, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.25)",
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerDot: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.safe,
    fontWeight: "800",
  },
});
