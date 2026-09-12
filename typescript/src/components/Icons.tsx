import React from 'react';
import { Text, View, StyleSheet, TextStyle, ViewStyle } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const createIcon = (char: string, fontAdjust = 0.9, extraStyle?: TextStyle) => {
  return ({ size = 16, color = '#FFFFFF', style }: IconProps) => (
    <View
      style={[
        styles.iconContainer,
        { width: size, height: size },
        style,
      ]}
    >
      <Text
        style={[
          styles.iconGlyph,
          {
            fontSize: size * fontAdjust,
            color: color,
            lineHeight: size,
          },
          extraStyle,
        ]}
      >
        {char}
      </Text>
    </View>
  );
};

// Tactical Icon Registry for Universal React Native Rendering
export const Zap = createIcon('⚡', 0.95);
export const Volume2 = createIcon('🔊', 0.85);
export const VolumeX = createIcon('🔇', 0.85);
export const ShieldAlert = createIcon('🛡', 0.9);
export const Shield = createIcon('🛡', 0.9);
export const ShieldCheck = createIcon('✓', 0.85, { fontWeight: '900' });
export const Radio = createIcon('📡', 0.85);
export const Compass = createIcon('🧭', 0.85);
export const Gauge = createIcon('⚡', 0.85);
export const Users = createIcon('👥', 0.8);
export const FlaskConical = createIcon('🧪', 0.85);
export const MapPin = createIcon('📍', 0.85);
export const Filter = createIcon('☰', 0.85, { fontWeight: '900' });
export const CheckCircle = createIcon('●', 0.8, { fontWeight: '900' });
export const CheckCircle2 = createIcon('✓', 0.85, { fontWeight: '900' });
export const Plus = createIcon('+', 1.1, { fontWeight: '900' });
export const Minus = createIcon('−', 1.1, { fontWeight: '900' });
export const X = createIcon('✕', 0.9, { fontWeight: '900' });
export const Info = createIcon('ℹ', 0.9, { fontWeight: '900' });
export const HelpCircle = createIcon('?', 0.9, { fontWeight: '900' });
export const Navigation = createIcon('▲', 0.85);
export const ChevronDown = createIcon('▼', 0.8);
export const ChevronUp = createIcon('▲', 0.8);
export const CloudLightning = createIcon('⛈', 0.85);
export const Wind = createIcon('💨', 0.85);
export const RefreshCw = createIcon('↻', 1.0, { fontWeight: '900' });
export const AlertTriangle = createIcon('⚠', 0.9, { fontWeight: '900' });
export const AlertOctagon = createIcon('🛑', 0.85);
export const AlertCircle = createIcon('!', 0.9, { fontWeight: '900' });
export const Smartphone = createIcon('📱', 0.85);
export const Monitor = createIcon('🖥', 0.85);
export const Wifi = createIcon('📶', 0.85);
export const Battery = createIcon('🔋', 0.85);
export const Bell = createIcon('🔔', 0.85);
export const Timer = createIcon('⏱', 0.85);
export const ArrowRight = createIcon('→', 1.0, { fontWeight: '900' });
export const Minimize2 = createIcon('⤓', 0.9, { fontWeight: '900' });
export const PhoneCall = createIcon('📞', 0.85);
export const Phone = createIcon('📞', 0.85);
export const Mountain = createIcon('⛰', 0.85);
export const BatteryCharging = createIcon('⚡', 0.9);
export const HeartPulse = createIcon('♥', 0.85);
export const Flame = createIcon('🔥', 0.85);
export const Layers = createIcon('≡', 0.9, { fontWeight: '900' });
export const Sparkles = createIcon('✨', 0.85);
export const Activity = createIcon('📈', 0.85);
export const Home = createIcon('🏠', 0.85);
export const GraduationCap = createIcon('🎓', 0.85);
export const Tractor = createIcon('🚜', 0.85);
export const HardHat = createIcon('⛑', 0.85);
export const Trophy = createIcon('🏆', 0.85);
export const Anchor = createIcon('⚓', 0.85);
export const Trash2 = createIcon('🗑', 0.85);
export const Play = createIcon('▶', 0.85);
export const RotateCcw = createIcon('↺', 1.0, { fontWeight: '900' });

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconGlyph: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
