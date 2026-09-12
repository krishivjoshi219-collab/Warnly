import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Home, Radar, Shield, CloudSun, Settings } from './Icons';
import { COLORS, RADII, FONTS, SHADOWS, SPACING } from '../theme';

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

// ─── Individual animated tab button ─────────────────────────────────────────
const TabButton: React.FC<{
  tab: TabConfig;
  isActive: boolean;
  hasDanger?: boolean;
  onPress: () => void;
}> = ({ tab, isActive, hasDanger, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const iconColor = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  // Danger pulse on the radar dot
  const dangerPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (tab.id === 'RADAR' && hasDanger) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(dangerPulse, { toValue: 1.6, duration: 700, useNativeDriver: true }),
          Animated.timing(dangerPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [hasDanger, tab.id]);

  // Animate active state transitions
  useEffect(() => {
    Animated.parallel([
      Animated.spring(bgOpacity, {
        toValue: isActive ? 1 : 0,
        tension: 280,
        friction: 20,
        useNativeDriver: false,
      }),
      Animated.spring(iconColor, {
        toValue: isActive ? 1 : 0,
        tension: 280,
        friction: 20,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isActive]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
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

  // Interpolated colors for smooth transition
  const activeIconColor = iconColor.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.textMuted + 'BB', COLORS.safe],
  });

  const activeBg = bgOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,229,255,0)', 'rgba(0,229,255,0.10)'],
  });

  const activeBorderColor = bgOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,229,255,0)', 'rgba(0,229,255,0.18)'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        style={styles.tabPressable}
      >
        <Animated.View
          style={[
            styles.tabInner,
            {
              backgroundColor: activeBg,
              borderColor: activeBorderColor,
            },
          ]}
        >
          {/* Icon container with danger dot */}
          <View style={styles.iconWrap}>
            <Icon size={20} color={isActive ? COLORS.safe : COLORS.textMuted + 'BB'} />
            {tab.id === 'RADAR' && hasDanger && (
              <Animated.View
                style={[
                  styles.dangerBadge,
                  { transform: [{ scale: dangerPulse }] },
                ]}
              />
            )}
          </View>

          {/* Label with opacity transition */}
          <Animated.Text
            style={[
              styles.tabLabel,
              {
                color: iconColor.interpolate({
                  inputRange: [0, 1],
                  outputRange: [COLORS.textMuted + '80', COLORS.safeText],
                }),
                fontWeight: isActive ? '700' : '500',
              },
            ]}
          >
            {tab.label}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main BottomTabBar ───────────────────────────────────────────────────────
export const BottomTabBar: React.FC<Props> = ({ activeTab, onTabChange, hasDanger }) => {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Fade from transparent to full bg at bottom */}
      <View style={styles.gradientFade} pointerEvents="none" />

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
  gradientFade: {
    height: 32,
    // A multi-stop simulated gradient using layered views
    backgroundColor: 'transparent',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 14,
    backgroundColor: 'rgba(8,16,28,0.92)',
    borderRadius: RADII['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 5,
    // Upward glow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 0,
    // Strong drop shadow below
    ...SHADOWS.xl,
  },
  tabPressable: {
    flex: 1,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: RADII['2xl'],
    borderWidth: 1,
    gap: 3,
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  dangerBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
