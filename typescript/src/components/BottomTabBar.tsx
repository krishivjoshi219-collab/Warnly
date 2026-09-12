import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertLevel } from '../types/convective';
import { COLORS, RADII, SPACING } from '../theme';
import { Compass, Gauge, Shield, Users, FlaskConical } from './Icons';

export type ActiveTab = 'RADAR' | 'TELEMETRY' | 'SHELTERS' | 'FAMILY' | 'LAB';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  alertLevel: AlertLevel;
  hasDanger: boolean;
}

export const BottomTabBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  alertLevel,
  hasDanger,
}) => {
  const tabs = [
    { id: 'RADAR' as ActiveTab, label: 'Radar', icon: Compass },
    { id: 'TELEMETRY' as ActiveTab, label: 'Telemetry', icon: Gauge },
    { id: 'SHELTERS' as ActiveTab, label: 'Shelters', icon: Shield },
    { id: 'FAMILY' as ActiveTab, label: 'Family Shield', icon: Users },
    { id: 'LAB' as ActiveTab, label: 'Testing Lab', icon: FlaskConical },
  ];

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          const activeColor = hasDanger
            ? COLORS.danger
            : alertLevel === AlertLevel.ADVISORY || alertLevel === AlertLevel.WATCH
            ? COLORS.warning
            : COLORS.safe;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  size={20}
                  color={isActive ? activeColor : COLORS.textMuted}
                />
                {tab.id === 'RADAR' && hasDanger && (
                  <View style={styles.dangerBadgeDot} />
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? activeColor : COLORS.textMuted },
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
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#070A0F',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: SPACING.sm,
    paddingTop: 6,
    zIndex: 100,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADII.md,
    minWidth: 64,
  },
  tabItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 3,
  },
  dangerBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
