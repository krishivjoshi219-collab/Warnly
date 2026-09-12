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
export const Zap = createIcon('âš¡', 0.95);
export const Volume2 = createIcon('ðŸ”Š', 0.85);
export const VolumeX = createIcon('ðŸ”‡', 0.85);
export const ShieldAlert = createIcon('ðŸ›¡', 0.9);
export const Shield = createIcon('ðŸ›¡', 0.9);
export const ShieldCheck = createIcon('âœ“', 0.85, { fontWeight: '900' });
export const Radio = createIcon('ðŸ“¡', 0.85);
export const Compass = createIcon('ðŸ§­', 0.85);
export const Gauge = createIcon('âš¡', 0.85);
export const Users = createIcon('ðŸ‘¥', 0.8);
export const FlaskConical = createIcon('ðŸ§ª', 0.85);
export const MapPin = createIcon('ðŸ“', 0.85);
export const Filter = createIcon('â˜°', 0.85, { fontWeight: '900' });
export const CheckCircle = createIcon('â—', 0.8, { fontWeight: '900' });
export const CheckCircle2 = createIcon('âœ“', 0.85, { fontWeight: '900' });
export const Plus = createIcon('+', 1.1, { fontWeight: '900' });
export const Minus = createIcon('âˆ’', 1.1, { fontWeight: '900' });
export const X = createIcon('âœ•', 0.9, { fontWeight: '900' });
export const Info = createIcon('â„¹', 0.9, { fontWeight: '900' });
export const HelpCircle = createIcon('?', 0.9, { fontWeight: '900' });
export const Navigation = createIcon('â–²', 0.85);
export const ChevronDown = createIcon('â–¼', 0.8);
export const ChevronUp = createIcon('â–²', 0.8);
export const CloudLightning = createIcon('â›ˆ', 0.85);
export const Wind = createIcon('ðŸ’¨', 0.85);
export const RefreshCw = createIcon('â†»', 1.0, { fontWeight: '900' });
export const AlertTriangle = createIcon('âš ', 0.9, { fontWeight: '900' });
export const AlertOctagon = createIcon('ðŸ›‘', 0.85);
export const AlertCircle = createIcon('!', 0.9, { fontWeight: '900' });
export const Smartphone = createIcon('ðŸ“±', 0.85);
export const Monitor = createIcon('ðŸ–¥', 0.85);
export const Wifi = createIcon('ðŸ“¶', 0.85);
export const Battery = createIcon('ðŸ”‹', 0.85);
export const Bell = createIcon('ðŸ””', 0.85);
export const Timer = createIcon('â±', 0.85);
export const ArrowRight = createIcon('â†’', 1.0, { fontWeight: '900' });
export const Minimize2 = createIcon('â¤“', 0.9, { fontWeight: '900' });
export const PhoneCall = createIcon('ðŸ“ž', 0.85);
export const Phone = createIcon('ðŸ“ž', 0.85);
export const Mountain = createIcon('â›°', 0.85);
export const BatteryCharging = createIcon('âš¡', 0.9);
export const HeartPulse = createIcon('â™¥', 0.85);
export const Flame = createIcon('ðŸ”¥', 0.85);
export const Layers = createIcon('â‰¡', 0.9, { fontWeight: '900' });
export const Sparkles = createIcon('âœ¨', 0.85);
export const Activity = createIcon('ðŸ“ˆ', 0.85);
export const Home = createIcon('ðŸ ', 0.85);
export const GraduationCap = createIcon('ðŸŽ“', 0.85);
export const Tractor = createIcon('ðŸšœ', 0.85);
export const HardHat = createIcon('â›‘', 0.85);
export const Trophy = createIcon('ðŸ†', 0.85);
export const Anchor = createIcon('âš“', 0.85);
export const Trash2 = createIcon('ðŸ—‘', 0.85);
export const Play = createIcon('â–¶', 0.85);
export const Pause = createIcon('â¸', 0.85);
export const RotateCcw = createIcon('â†º', 1.0, { fontWeight: '900' });
export const Share2 = createIcon('â†—', 1.0, { fontWeight: '900' });
export const Sun = createIcon('â˜€', 0.9);
export const CloudSun = createIcon('â›…', 0.9);
export const Cloud = createIcon('â˜', 0.9);
export const CloudFog = createIcon('ðŸŒ«', 0.9);
export const CloudDrizzle = createIcon('ðŸŒ¦', 0.9);
export const CloudRain = createIcon('ðŸŒ§', 0.9);
export const Snowflake = createIcon('â„', 0.9);
export const Droplets = createIcon('ðŸ’§', 0.85);
export const Thermometer = createIcon('ðŸŒ¡', 0.85);
export const Umbrella = createIcon('â˜‚', 0.9);
export const Sliders = createIcon('âš™', 0.9);
export const BellRing = createIcon('ðŸ””', 0.9);
export const Crown = createIcon('ðŸ‘‘', 0.85);
export const Waves = createIcon('ã€°', 1.0, { fontWeight: '900' });
export const BookOpen = createIcon('ðŸ“–', 0.85);
export const Search = createIcon('ðŸ”', 0.85);
export const Download = createIcon('â¬‡', 0.9, { fontWeight: '900' });
export const ExternalLink = createIcon('â†—', 0.9, { fontWeight: '900' });
export const ChevronRight = createIcon('â€º', 1.2, { fontWeight: '900' });
export const ChevronLeft = createIcon('â€¹', 1.2, { fontWeight: '900' });
export const Check = createIcon('âœ“', 0.9, { fontWeight: '900' });
export const Building = createIcon('ðŸ¢', 0.85);
export const Eye = createIcon('ðŸ‘', 0.85);
export const Loader2 = createIcon('â†»', 1.0, { fontWeight: '900' });
export const Settings = createIcon('âš™', 0.85);
export const Radar = createIcon('ðŸ“¡', 0.85);
export const Footprints = createIcon('ðŸ‘£', 0.85);
export const Clock = createIcon('â±', 0.85);

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
