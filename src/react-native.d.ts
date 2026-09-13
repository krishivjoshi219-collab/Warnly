import React from 'react';

declare module 'react-native' {
  export type StyleProp<T> = T | Array<T | undefined | null | false> | undefined | null | false;

  export interface ViewStyle {
    [key: string]: any;
  }

  export interface TextStyle extends ViewStyle {
    [key: string]: any;
  }

  export interface ImageStyle extends ViewStyle {
    [key: string]: any;
  }

  export interface ViewProps extends React.HTMLAttributes<any> {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface TextProps extends React.HTMLAttributes<any> {
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface TouchableOpacityProps extends ViewProps {
    onPress?: (event: any) => void;
    activeOpacity?: number;
    disabled?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface ScrollViewProps extends ViewProps {
    horizontal?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface TextInputProps extends React.InputHTMLAttributes<any> {
    style?: StyleProp<TextStyle>;
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    keyboardType?: string;
    autoCorrect?: boolean;
    secureTextEntry?: boolean;
    [key: string]: any;
  }

  export interface ModalProps {
    visible?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
    transparent?: boolean;
    onRequestClose?: () => void;
    statusBarTranslucent?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const View: React.FC<ViewProps>;
  export const Text: React.FC<TextProps>;
  export const TouchableOpacity: React.FC<TouchableOpacityProps>;
  export const ScrollView: React.FC<ScrollViewProps>;
  export const TextInput: React.FC<TextInputProps>;
  export const Modal: React.FC<ModalProps>;
  export const ActivityIndicator: React.FC<any>;
  export const FlatList: React.FC<any>;
  export const Switch: React.FC<any>;
  export const Share: {
    share(content: { message: string; title?: string; url?: string }): Promise<any>;
  };
  export const Linking: {
    openURL(url: string): Promise<any>;
  };
  export interface ImageProps extends ViewProps {
    source?: any;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    [key: string]: any;
  }

  export const Image: React.FC<ImageProps>;
  export const SafeAreaView: React.FC<ViewProps>;
  export const StatusBar: React.FC<any>;

  export const StyleSheet: {
    create<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(styles: T): T;
    flatten<T>(style: StyleProp<T>): T;
    absoluteFillObject: ViewStyle;
    absoluteFill: ViewStyle;
  };

  export const Platform: {
    OS: 'ios' | 'android' | 'web' | 'windows' | 'macos';
    select<T>(specifics: { ios?: T; android?: T; web?: T; default?: T }): T;
  };

  export const Dimensions: {
    get(dimension: 'window' | 'screen'): { width: number; height: number; scale: number; fontScale: number };
  };

  // Animated API
  export namespace Animated {
    class Value {
      constructor(value: number);
      setValue(value: number): void;
      addListener(callback: (state: { value: number }) => void): string;
      removeListener(id: string): void;
      interpolate(config: InterpolationConfigType): AnimatedInterpolation;
    }
    class ValueXY {
      constructor(value?: { x: number; y: number });
      setValue(value: { x: number; y: number }): void;
    }
    interface AnimatedInterpolation {
      interpolate(config: InterpolationConfigType): AnimatedInterpolation;
    }
    interface InterpolationConfigType {
      inputRange: readonly number[];
      outputRange: readonly number[] | readonly string[];
      extrapolate?: 'extend' | 'clamp' | 'identity';
      extrapolateLeft?: 'extend' | 'clamp' | 'identity';
      extrapolateRight?: 'extend' | 'clamp' | 'identity';
    }
    type EndResult = { finished: boolean };
    type EndCallback = (result: EndResult) => void;
    interface CompositeAnimation {
      start(callback?: EndCallback): void;
      stop(): void;
    }
    interface TimingAnimationConfig {
      toValue: number | Value | AnimatedInterpolation;
      duration?: number;
      delay?: number;
      easing?: (t: number) => number;
      useNativeDriver: boolean;
    }
    interface SpringAnimationConfig {
      toValue: number | Value;
      tension?: number;
      friction?: number;
      velocity?: number;
      useNativeDriver: boolean;
    }
    interface LoopAnimationConfig {
      iterations?: number;
    }
    function timing(value: Value, config: TimingAnimationConfig): CompositeAnimation;
    function spring(value: Value, config: SpringAnimationConfig): CompositeAnimation;
    function loop(animation: CompositeAnimation, config?: LoopAnimationConfig): CompositeAnimation;
    function sequence(animations: CompositeAnimation[]): CompositeAnimation;
    function parallel(animations: CompositeAnimation[], config?: { stopTogether?: boolean }): CompositeAnimation;
    function delay(time: number): CompositeAnimation;
    function event(argMapping: any[], config?: any): any;
    const View: React.FC<any>;
    const Text: React.FC<any>;
    const Image: React.FC<any>;
    const ScrollView: React.FC<any>;
  }

  export const Easing: {
    linear: (t: number) => number;
    ease: (t: number) => number;
    quad: (t: number) => number;
    cubic: (t: number) => number;
    sin: (t: number) => number;
    exp: (t: number) => number;
    circle: (t: number) => number;
    elastic: (bounciness?: number) => (t: number) => number;
    back: (s?: number) => (t: number) => number;
    bounce: (t: number) => number;
    bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => number;
    in: (easing: (t: number) => number) => (t: number) => number;
    out: (easing: (t: number) => number) => (t: number) => number;
    inOut: (easing: (t: number) => number) => (t: number) => number;
  };

  export const NativeModules: {
    [key: string]: any;
  };
}
