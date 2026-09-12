import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, SafeAreaView } from 'react-native';
import { COLORS, RADII, SPACING, FONTS } from '../theme';
import { Smartphone, Monitor, Wifi, Battery, Radio } from './Icons';

interface Props {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<Props> = ({ children }) => {
  const [isFrameMode, setIsFrameMode] = useState(true);

  if (Platform.OS !== 'web') {
    return (
      <SafeAreaView style={styles.nativeContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#070A0F" />
        <View style={styles.screenContent}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {/* Top Utility Switcher */}
      <View style={styles.topControlBar}>
        <View style={styles.controlLeft}>
          <Text style={styles.logoTitle}>⚡ WARNLY</Text>
          <Text style={styles.logoSub}>REACT NATIVE MOBILE PLATFORM</Text>
        </View>

        <TouchableOpacity
          style={styles.modeToggle}
          onPress={() => setIsFrameMode(!isFrameMode)}
          activeOpacity={0.7}
        >
          {isFrameMode ? (
            <>
              <Monitor size={14} color={COLORS.safe} />
              <Text style={styles.modeToggleText}>Expand Full View</Text>
            </>
          ) : (
            <>
              <Smartphone size={14} color={COLORS.safe} />
              <Text style={styles.modeToggleText}>Mobile Device Shell</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Main View Container */}
      <View
        style={[
          styles.deviceWrapper,
          isFrameMode ? styles.phoneShell : styles.fullShell,
        ]}
      >
        {isFrameMode && (
          /* Mobile Status Bar (Authentic iOS/Android style) */
          <View style={styles.statusBar}>
            <Text style={styles.statusTime}>9:41</Text>
            <View style={styles.statusIcons}>
              <Radio size={13} color={COLORS.safe} />
              <Wifi size={13} color="#FFFFFF" />
              <Battery size={13} color="#FFFFFF" />
            </View>
          </View>
        )}

        {/* Screen Content Container */}
        <View style={styles.screenContent}>{children}</View>

        {isFrameMode && (
          /* Mobile Home Indicator Bar */
          <View style={styles.homeIndicatorWrapper}>
            <View style={styles.homeIndicatorBar} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  outerContainer: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: '#040609',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  topControlBar: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#121B2A',
  },
  controlLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.safe,
    letterSpacing: 1.5,
  },
  logoSub: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0E1726',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  modeToggleText: {
    fontSize: 11,
    color: COLORS.safe,
    fontWeight: '700',
  },
  deviceWrapper: {
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    position: 'relative',
  },
  phoneShell: {
    width: '100%',
    maxWidth: 440,
    height: '92vh' as any,
    marginVertical: 10,
    borderRadius: 42,
    borderWidth: 8,
    borderColor: '#182436',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 28,
    elevation: 12,
  },
  fullShell: {
    width: '100%',
    maxWidth: 600,
    minHeight: '94vh' as any,
  },
  statusBar: {
    height: 38,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#070A0F',
    zIndex: 100,
  },
  statusTime: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  screenContent: {
    flex: 1,
    position: 'relative',
  },
  homeIndicatorWrapper: {
    height: 20,
    backgroundColor: '#070A0F',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  homeIndicatorBar: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
});
