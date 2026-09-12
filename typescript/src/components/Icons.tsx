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
// All glyphs use explicit Unicode escape sequences to guarantee zero encoding corruption.
export const Zap = createIcon('\u26A1', 0.95);
export const Volume2 = createIcon('\uD83D\uDD0A', 0.85);
export const VolumeX = createIcon('\uD83D\uDD07', 0.85);
export const ShieldAlert = createIcon('\uD83D\uDEE1', 0.9);
export const Shield = createIcon('\uD83D\uDEE1', 0.9);
export const ShieldCheck = createIcon('\u2713', 0.85, { fontWeight: '900' });
export const Radio = createIcon('\uD83D\uDCE1', 0.85);
export const Compass = createIcon('\uD83E\uDDED', 0.85);
export const Gauge = createIcon('\u26A1', 0.85);
export const Users = createIcon('\uD83D\uDC65', 0.8);
export const FlaskConical = createIcon('\uD83E\uDDEA', 0.85);
export const MapPin = createIcon('\uD83D\uDCCD', 0.85);
export const Filter = createIcon('\u2630', 0.85, { fontWeight: '900' });
export const CheckCircle = createIcon('\u25CF', 0.8, { fontWeight: '900' });
export const CheckCircle2 = createIcon('\u2713', 0.85, { fontWeight: '900' });
export const Plus = createIcon('+', 1.1, { fontWeight: '900' });
export const Minus = createIcon('\u2212', 1.1, { fontWeight: '900' });
export const X = createIcon('\u2715', 0.9, { fontWeight: '900' });
export const Info = createIcon('\u2139', 0.9, { fontWeight: '900' });
export const HelpCircle = createIcon('?', 0.9, { fontWeight: '900' });
export const Navigation = createIcon('\u25B2', 0.85);
export const ChevronDown = createIcon('\u25BC', 0.8);
export const ChevronUp = createIcon('\u25B2', 0.8);
export const CloudLightning = createIcon('\u26C8', 0.85);
export const Wind = createIcon('\uD83D\uDCA8', 0.85);
export const RefreshCw = createIcon('\u21BB', 1, { fontWeight: '900' });
export const AlertTriangle = createIcon('\u26A0', 0.9, { fontWeight: '900' });
export const AlertOctagon = createIcon('\uD83D\uDED1', 0.85);
export const AlertCircle = createIcon('!', 0.9, { fontWeight: '900' });
export const Smartphone = createIcon('\uD83D\uDCF1', 0.85);
export const Monitor = createIcon('\uD83D\uDDA5', 0.85);
export const Wifi = createIcon('\uD83D\uDCF6', 0.85);
export const Battery = createIcon('\uD83D\uDD0B', 0.85);
export const Bell = createIcon('\uD83D\uDD14', 0.85);
export const Timer = createIcon('\u23F1', 0.85);
export const ArrowRight = createIcon('\u2192', 1, { fontWeight: '900' });
export const Minimize2 = createIcon('\u2715', 0.9, { fontWeight: '900' });
export const PhoneCall = createIcon('\uD83D\uDCDE', 0.85);
export const Phone = createIcon('\uD83D\uDCDE', 0.85);
export const Mountain = createIcon('\u26F0', 0.85);
export const BatteryCharging = createIcon('\u26A1', 0.9);
export const HeartPulse = createIcon('\u2665', 0.85);
export const Flame = createIcon('\uD83D\uDD25', 0.85);
export const Layers = createIcon('\u2261', 0.9, { fontWeight: '900' });
export const Sparkles = createIcon('\u2728', 0.85);
export const Activity = createIcon('\uD83D\uDCC8', 0.85);
export const Home = createIcon('\uD83C\uDFE0', 0.85);
export const GraduationCap = createIcon('\uD83C\uDF93', 0.85);
export const Tractor = createIcon('\uD83D\uDE9C', 0.85);
export const HardHat = createIcon('\u26D1', 0.85);
export const Trophy = createIcon('\uD83C\uDFC6', 0.85);
export const Anchor = createIcon('\u2693', 0.85);
export const Trash2 = createIcon('\uD83D\uDDD1', 0.85);
export const Play = createIcon('\u25B6', 0.85);
export const Pause = createIcon('\u23F8', 0.85);
export const RotateCcw = createIcon('\u21BA', 1, { fontWeight: '900' });
export const Share2 = createIcon('\u2197', 1, { fontWeight: '900' });
export const Sun = createIcon('\u2600', 0.9);
export const CloudSun = createIcon('\u26C5', 0.9);
export const Cloud = createIcon('\u2601', 0.9);
export const CloudFog = createIcon('\uD83C\uDF2B', 0.9);
export const CloudDrizzle = createIcon('\uD83C\uDF26', 0.9);
export const CloudRain = createIcon('\uD83C\uDF27', 0.9);
export const Snowflake = createIcon('\u2744', 0.9);
export const Droplets = createIcon('\uD83D\uDCA7', 0.85);
export const Thermometer = createIcon('\uD83C\uDF21', 0.85);
export const Umbrella = createIcon('\u2602', 0.9);
export const Sliders = createIcon('\u2699', 0.9);
export const BellRing = createIcon('\uD83D\uDD14', 0.9);
export const Crown = createIcon('\uD83D\uDC51', 0.85);
export const Waves = createIcon('\u3030', 1, { fontWeight: '900' });
export const BookOpen = createIcon('\uD83D\uDCD6', 0.85);
export const Search = createIcon('\uD83D\uDD0D', 0.85);
export const Download = createIcon('\u2B07', 0.9, { fontWeight: '900' });
export const ExternalLink = createIcon('\u2197', 0.9, { fontWeight: '900' });
export const ChevronRight = createIcon('\u203A', 1.2, { fontWeight: '900' });
export const ChevronLeft = createIcon('\u2039', 1.2, { fontWeight: '900' });
export const Check = createIcon('\u2713', 0.9, { fontWeight: '900' });
export const Building = createIcon('\uD83C\uDFE2', 0.85);
export const Eye = createIcon('\uD83D\uDC41', 0.85);
export const Loader2 = createIcon('\u21BB', 1, { fontWeight: '900' });
export const Settings = createIcon('\u2699', 0.85);
export const Radar = createIcon('\uD83D\uDCE1', 0.85);
export const Footprints = createIcon('\uD83D\uDC63', 0.85);
export const Clock = createIcon('\u23F1', 0.85);

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
