import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Zap,
  Volume2,
  X,
  Target,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
} from '../Icons';
import { AcousticRangerEngine, AcousticRangeResult } from '../../lib/warnly/acoustic-ranger';
import { COLORS, RADII, FONTS, SPACING } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  ambientTemperatureCelsius?: number;
}

export const FlashToBangModal: React.FC<Props> = ({
  visible,
  onClose,
  ambientTemperatureCelsius = 22,
}) => {
  const [engine] = useState(() => new AcousticRangerEngine());
  const [isRanging, setIsRanging] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState<AcousticRangeResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRanging) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSeconds((Date.now() - startTime) / 1000);
      }, 50);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRanging]);

  const handleFlash = () => {
    try {
      (globalThis as any).navigator?.vibrate?.(40);
    } catch {
      // ignore
    }
    engine.triggerFlash();
    setIsRanging(true);
    setElapsedSeconds(0);
    setResult(null);
  };

  const handleThunder = () => {
    try {
      (globalThis as any).navigator?.vibrate?.([0, 50, 50, 50]);
    } catch {
      // ignore
    }
    setIsRanging(false);
    const res = engine.triggerThunder(Date.now(), ambientTemperatureCelsius);
    setResult(res);
  };

  const handleReset = () => {
    engine.reset();
    setIsRanging(false);
    setElapsedSeconds(0);
    setResult(null);
  };

  const getThreatColor = (level: AcousticRangeResult['threatLevel']) => {
    switch (level) {
      case 'IMMEDIATE_LETHAL':
        return COLORS.danger;
      case 'HIGH_DANGER':
        return COLORS.warning;
      case 'ADVISORY':
        return COLORS.accentSky;
      default:
        return COLORS.safe;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Target size={16} color={COLORS.safe} />
              <Text style={styles.title}>ACOUSTIC FLASH-TO-BANG RANGER</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Thermodynamic sound-wave triangulation. Computes exact physical distance based on speed of sound (
            {Math.round(AcousticRangerEngine.calculateSpeedOfSound(ambientTemperatureCelsius))} m/s at {ambientTemperatureCelsius}°C).
          </Text>

          {/* Trigger Center Console */}
          <View style={styles.consoleBox}>
            {!isRanging && !result && (
              <TouchableOpacity
                style={styles.flashButton}
                onPress={handleFlash}
                activeOpacity={0.8}
              >
                <Zap size={28} color="#070A0F" />
                <Text style={styles.flashBtnText}>1. TAP WHEN FLASH SEEN</Text>
                <Text style={styles.flashBtnSub}>Starts precision acoustic timer</Text>
              </TouchableOpacity>
            )}

            {isRanging && (
              <TouchableOpacity
                style={styles.thunderButton}
                onPress={handleThunder}
                activeOpacity={0.8}
              >
                <Volume2 size={32} color="#FFFFFF" />
                <Text style={styles.thunderTimer}>{elapsedSeconds.toFixed(2)}s</Text>
                <Text style={styles.thunderBtnText}>2. TAP WHEN THUNDER HEARD</Text>
                <Text style={styles.thunderBtnSub}>
                  Est. distance ~{Math.round(elapsedSeconds * 343)}m
                </Text>
              </TouchableOpacity>
            )}

            {result && (
              <View style={styles.resultBox}>
                <View style={styles.distanceRow}>
                  <Text style={[styles.distanceNum, { color: getThreatColor(result.threatLevel) }]}>
                    {result.distanceMeters < 1000
                      ? `${result.distanceMeters} m`
                      : `${result.distanceKm} km`}
                  </Text>
                  <Text style={styles.distanceMiles}>({result.distanceMiles} mi)</Text>
                </View>

                {/* Threat Pill */}
                <View
                  style={[
                    styles.threatPill,
                    {
                      borderColor: getThreatColor(result.threatLevel),
                      backgroundColor: `${getThreatColor(result.threatLevel)}15`,
                    },
                  ]}
                >
                  <ShieldAlert size={12} color={getThreatColor(result.threatLevel)} />
                  <Text
                    style={[styles.threatPillText, { color: getThreatColor(result.threatLevel) }]}
                  >
                    {result.threatLevel.replace('_', ' ')}
                  </Text>
                </View>

                {/* Telemetry Breakdown */}
                <View style={styles.telemetryGrid}>
                  <View style={styles.telemetryCol}>
                    <Text style={styles.telemetryLabel}>SHOCKWAVE TIME</Text>
                    <Text style={styles.telemetryVal}>{result.deltaSeconds}s</Text>
                  </View>
                  <View style={styles.telemetryDivider} />
                  <View style={styles.telemetryCol}>
                    <Text style={styles.telemetryLabel}>SPEED OF SOUND</Text>
                    <Text style={styles.telemetryVal}>{result.speedOfSoundMs} m/s</Text>
                  </View>
                  <View style={styles.telemetryDivider} />
                  <View style={styles.telemetryCol}>
                    <Text style={styles.telemetryLabel}>TEMPERATURE</Text>
                    <Text style={styles.telemetryVal}>{result.temperatureCelsius}°C</Text>
                  </View>
                </View>

                {/* Safety Directives */}
                <View style={styles.directiveBox}>
                  <Text style={styles.directiveText}>{result.safetyGuideline}</Text>
                </View>

                <TouchableOpacity
                  style={styles.measureAgainBtn}
                  onPress={handleReset}
                  activeOpacity={0.8}
                >
                  <RotateCcw size={14} color={COLORS.safe} />
                  <Text style={styles.measureAgainText}>Range Next Strike</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADII['2xl'],
    borderTopRightRadius: RADII['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  consoleBox: {
    marginVertical: 6,
  },
  flashButton: {
    backgroundColor: COLORS.safe,
    paddingVertical: 28,
    borderRadius: RADII.xl,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  flashBtnText: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    color: '#070A0F',
    letterSpacing: 0.5,
  },
  flashBtnSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#064E3B',
  },
  thunderButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 24,
    borderRadius: RADII.xl,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#F87171',
  },
  thunderTimer: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  thunderBtnText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  thunderBtnSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONTS.mono,
  },
  resultBox: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  distanceNum: {
    fontSize: 42,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    letterSpacing: -1,
  },
  distanceMiles: {
    fontSize: 14,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
  },
  threatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.full,
    borderWidth: 1,
  },
  threatPillText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.mono,
  },
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  telemetryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  telemetryLabel: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
  },
  telemetryVal: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  directiveBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
    padding: 10,
    borderRadius: RADII.sm,
    width: '100%',
  },
  directiveText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    lineHeight: 15,
  },
  measureAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  measureAgainText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.safe,
  },
});
