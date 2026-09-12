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
  export const SafeAreaView: React.FC<ViewProps>;
  export const StatusBar: React.FC<any>;

  export const StyleSheet: {
    create<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(styles: T): T;
    flatten<T>(style: StyleProp<T>): T;
  };

  export const Platform: {
    OS: 'ios' | 'android' | 'web' | 'windows' | 'macos';
    select<T>(specifics: { ios?: T; android?: T; web?: T; default?: T }): T;
  };

  export const Dimensions: {
    get(dimension: 'window' | 'screen'): { width: number; height: number; scale: number; fontScale: number };
  };

  export const Animated: any;
}
