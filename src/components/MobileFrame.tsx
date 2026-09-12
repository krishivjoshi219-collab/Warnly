import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, SafeAreaView, Animated } from 'react-native';
import { COLORS, RADII, SPACING, FONTS } from '../theme';
import { Smartphone, Monitor, Radio, Zap, Battery, Wifi } from './Icons';

interface Props {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<Props> = ({ children }) => {
  const [isFrameMode, setIsFrameMode] = useState(true);

  // On native (Android/iOS) — just render with SafeAreaView, no frame
  if (Platform.OS !== 'web') {
    return (
      <SafeAreaView style={styles.nativeContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.screenContent}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {/* ── Control Bar ── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          {/* Brand logo */}
          <View style={styles.logoMark}>
            <Zap size={14} color={COLORS.safe} />
          </View>
          <View>
            <Text style={styles.logoTitle}>WARNLY</Text>
            <Text style={styles.logoSub}>DISASTER RESILIENCE PLATFORM</Text>
          </View>
        </View>

        {/* Live status indicator */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        {/* View mode toggle */}
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setIsFrameMode(!isFrameMode)}
          activeOpacity={0.8}
        >
          {isFrameMode ? (
            <>
              <Monitor size={13} color={COLORS.safe} />
              <Text style={styles.viewToggleText}>Expand</Text>
            </>
          ) : (
            <>
              <Smartphone size={13} color={COLORS.safe} />
              <Text style={styles.viewToggleText}>Phone</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Device Shell ── */}
      <View style={styles.shellOuter}>
        <View
          style={[
            styles.deviceShell,
            isFrameMode ? styles.phoneShell : styles.fullShell,
          ]}
        >
          {/* Phone Status Bar */}
          {isFrameMode && (
            <View style={styles.statusBar}>
              <Text style={styles.statusTime}>9:41</Text>
              <View style={styles.statusIcons}>
                <Wifi size={11} color={COLORS.textSecondary} />
                <Battery size={13} color={COLORS.safe} />
              </View>
            </View>
          )}

          {/* Dynamic Island (notch) for phone mode */}
          {isFrameMode && (
            <View style={styles.dynamicIsland} />
          )}

          {/* Screen content */}
          <View style={styles.screenContent}>{children}</View>

          {/* Home indicator */}
          {isFrameMode && (
            <View style={styles.homeIndicator}>
              <View style={styles.homeBar} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Web Outer Container ──
  outerContainer: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: '#020508',
    alignItems: 'center',
    backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,229,255,0.06), transparent)' as any,
  },

  // ── Top Control Bar ──
  topBar: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.safeBg,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: {
    fontSize: 16,
  },
  logoTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.safe,
    letterSpacing: 2,
    lineHeight: 18,
  },
  logoSub: {
    fontSize: 7,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,229,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.safe,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.safe,
    letterSpacing: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  viewToggleText: {
    fontSize: 11,
    color: COLORS.safe,
    fontWeight: '700',
  },

  // ── Shell Container ──
  shellOuter: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  deviceShell: {
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    position: 'relative',
  },
  phoneShell: {
    width: 428,
    maxWidth: '100%' as any,
    height: '88vh' as any,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#1A2840',
    shadowColor: COLORS.safe,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 20,
    // Outer ring
    outlineWidth: 1,
    outlineColor: 'rgba(255,255,255,0.04)',
    outlineStyle: 'solid',
  } as any,
  fullShell: {
    width: '100%',
    maxWidth: 640,
    minHeight: '90vh' as any,
    borderRadius: RADII['2xl'],
  },

  // ── Status Bar ──
  statusBar: {
    height: 40,
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    zIndex: 200,
  },
  statusTime: {
    fontFamily: FONTS.mono,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIconGlyph: {
    fontSize: 9,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },

  // ── Dynamic Island ──
  dynamicIsland: {
    position: 'absolute',
    top: 10,
    left: '50%',
    width: 120,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    zIndex: 300,
    marginLeft: -60,
  },

  // ── Content ──
  screenContent: {
    flex: 1,
    position: 'relative',
  },

  // ── Home Indicator ──
  homeIndicator: {
    height: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  homeBar: {
    width: 130,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
