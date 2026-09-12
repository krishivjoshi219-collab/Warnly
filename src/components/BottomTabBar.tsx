import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Home, Radar, Shield, CloudSun, Settings } from './Icons';
import { COLORS, RADII, SHADOWS } from '../theme';

export type ActiveTab = 'HOME' | 'RADAR' | 'SHIELD' | 'WEATHER' | 'SETTINGS';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  hasDanger?: boolean;
}

interface TabConfig {
  id: ActiveTab;
  label: string;
  icon: React.FC<{ size?: number; color?: string }>;
}

const TABS: TabConfig[] = [
  { id: 'HOME', label: 'Home', icon: Home },
  { id: 'RADAR', label: 'Radar', icon: Radar },
  { id: 'SHIELD', label: 'Shield', icon: Shield },
  { id: 'WEATHER', label: 'Weather', icon: CloudSun },
  { id: 'SETTINGS', label: 'Settings', icon: Settings },
];

// ─── Individual tab button ──────────────────────────────────────────────────
const TabButton: React.FC<{
  tab: TabConfig;
  isActive: boolean;
  hasDanger?: boolean;
  onPress: () => void;
}> = ({ tab, isActive, hasDanger, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 14,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  const Icon = tab.icon;
  const activeColor = '#FFFFFF';
  const inactiveColor = '#64748B';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.tabPressable}
      >
        <View style={[styles.tabInner, isActive && styles.tabInnerActive]}>
          <View style={styles.iconWrap}>
            <Icon size={19} color={isActive ? activeColor : inactiveColor} />
            {tab.id === 'RADAR' && hasDanger && <View style={styles.dangerBadge} />}
          </View>
          <Text
            style={[
              styles.tabLabel,
              {
                color: isActive ? activeColor : inactiveColor,
                fontWeight: isActive ? '700' : '500',
              },
            ]}
          >
            {tab.label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main BottomTabBar ───────────────────────────────────────────────────────
export const BottomTabBar: React.FC<Props> = ({ activeTab, onTabChange, hasDanger }) => {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.barContainer}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            hasDanger={hasDanger}
            onPress={() => onTabChange(tab.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 200,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#090F1B',
    borderRadius: RADII['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  tabPressable: {
    flex: 1,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: RADII['2xl'],
    gap: 3,
  },
  tabInnerActive: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
  },
  dangerBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
    borderWidth: 1,
    borderColor: '#090F1B',
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
