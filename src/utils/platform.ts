import { Platform } from 'react-native';

// Platform detection utilities
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isNative = isIOS || isAndroid;

// Check if we're running in Expo Go (which doesn't support all native modules)
export const isExpoGo = () => {
  try {
    // @ts-ignore
    return typeof expo !== 'undefined' && expo.modules?.ExponentConstants?.appOwnership === 'expo';
  } catch {
    return false;
  }
};

// Check if we have native module support
export const hasNativeModuleSupport = () => {
  return !isWeb && !isExpoGo();
};

export default {
  isWeb,
  isIOS,
  isAndroid,
  isNative,
  isExpoGo,
  hasNativeModuleSupport,
};
