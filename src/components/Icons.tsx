import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const createFeather = (name: keyof typeof Feather.glyphMap) => {
  return ({ size = 16, color = '#FFFFFF', style }: IconProps) => (
    <View style={[styles.iconContainer, { width: size, height: size }, style]}>
      <Feather name={name} size={size} color={color} />
    </View>
  );
};

const createIonicons = (name: keyof typeof Ionicons.glyphMap) => {
  return ({ size = 16, color = '#FFFFFF', style }: IconProps) => (
    <View style={[styles.iconContainer, { width: size, height: size }, style]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
};

const createMCI = (name: keyof typeof MaterialCommunityIcons.glyphMap) => {
  return ({ size = 16, color = '#FFFFFF', style }: IconProps) => (
    <View style={[styles.iconContainer, { width: size, height: size }, style]}>
      <MaterialCommunityIcons name={name} size={size} color={color} />
    </View>
  );
};

// ── Precision Vector Icons ──
export const Home = createFeather('home');
export const Radar = createIonicons('radio-outline');
export const Shield = createFeather('shield');
export const ShieldCheck = createFeather('check-circle');
export const ShieldAlert = createFeather('alert-triangle');
export const CloudSun = createIonicons('partly-sunny-outline');
export const Settings = createFeather('settings');
export const Search = createFeather('search');
export const RefreshCw = createFeather('refresh-cw');
export const MapPin = createFeather('map-pin');
export const Navigation = createFeather('navigation');
export const Share2 = createFeather('share-2');
export const BookOpen = createFeather('book-open');
export const AlertTriangle = createFeather('alert-triangle');
export const AlertOctagon = createFeather('alert-octagon');
export const AlertCircle = createFeather('alert-circle');
export const CheckCircle = createFeather('check-circle');
export const CheckCircle2 = createFeather('check-circle');
export const Plus = createFeather('plus');
export const Minus = createFeather('minus');
export const X = createFeather('x');
export const Info = createFeather('info');
export const HelpCircle = createFeather('help-circle');
export const ChevronDown = createFeather('chevron-down');
export const ChevronUp = createFeather('chevron-up');
export const ChevronRight = createFeather('chevron-right');
export const ChevronLeft = createFeather('chevron-left');
export const Check = createFeather('check');
export const Zap = createFeather('zap');
export const Wind = createFeather('wind');
export const Droplets = createFeather('droplet');
export const Thermometer = createFeather('thermometer');
export const Clock = createFeather('clock');
export const Timer = createFeather('clock');
export const Volume2 = createFeather('volume-2');
export const VolumeX = createFeather('volume-x');
export const Radio = createFeather('radio');
export const Compass = createFeather('compass');
export const Users = createFeather('users');
export const Battery = createFeather('battery');
export const BatteryCharging = createFeather('battery-charging');
export const Bell = createFeather('bell');
export const BellRing = createFeather('bell');
export const Phone = createFeather('phone');
export const PhoneCall = createFeather('phone-call');
export const Smartphone = createFeather('smartphone');
export const Monitor = createFeather('monitor');
export const Wifi = createFeather('wifi');
export const Sliders = createFeather('sliders');
export const Eye = createFeather('eye');
export const Download = createFeather('download');
export const ExternalLink = createFeather('external-link');
export const ArrowRight = createFeather('arrow-right');
export const Layers = createFeather('layers');
export const Play = createFeather('play');
export const Pause = createFeather('pause');
export const RotateCcw = createFeather('rotate-ccw');
export const Trash2 = createFeather('trash-2');
export const Activity = createFeather('activity');
export const Gauge = createFeather('zap');
export const Filter = createFeather('filter');
export const Cloud = createFeather('cloud');
export const CloudRain = createFeather('cloud-rain');
export const CloudDrizzle = createFeather('cloud-drizzle');
export const CloudSnow = createFeather('cloud-snow');
export const CloudLightning = createIonicons('thunderstorm-outline');
export const CloudFog = createMCI('weather-fog');
export const Snowflake = createMCI('snowflake');
export const Umbrella = createFeather('umbrella');
export const Sun = createFeather('sun');
export const Waves = createMCI('waves');
export const Mountain = createMCI('terrain');
export const Flame = createMCI('fire');
export const HeartPulse = createFeather('heart');
export const Sparkles = createIonicons('sparkles-outline');
export const Crown = createMCI('crown');
export const Footprints = createMCI('shoe-print');
export const Building = createMCI('office-building');
export const GraduationCap = createIonicons('school-outline');
export const Tractor = createMCI('tractor');
export const HardHat = createMCI('hard-hat');
export const Trophy = createFeather('award');
export const Anchor = createFeather('anchor');
export const FlaskConical = createMCI('flask');
export const Minimize2 = createFeather('minimize-2');
export const Loader2 = createFeather('loader');
export const Target = createFeather('crosshair');
export const ArrowUpRight = createFeather('arrow-up-right');
export const CornerUpRight = createFeather('corner-up-right');
export const LifeBuoy = createFeather('life-buoy');

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
