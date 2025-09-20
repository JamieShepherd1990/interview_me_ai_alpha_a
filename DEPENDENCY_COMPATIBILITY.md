# 📋 DEPENDENCY COMPATIBILITY TABLE

## Core Framework Versions (LOCKED)
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| expo | ~51.0.28 | ✅ STABLE | Latest stable, good CocoaPods support |
| react-native | 0.74.5 | ✅ STABLE | Compatible with Expo 51 |
| @expo/config-plugins | ~8.0.8 | ✅ STABLE | Auto-managed by Expo |

## Navigation Stack (LOCKED)
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| @react-navigation/native | ^6.1.18 | ✅ STABLE | Latest stable |
| @react-navigation/bottom-tabs | ^6.6.1 | ✅ STABLE | Compatible with native 6.1.18 |
| @react-navigation/stack | ^6.4.1 | ✅ STABLE | Compatible with native 6.1.18 |
| react-native-screens | 3.31.1 | ✅ STABLE | Auto-managed by Expo |
| react-native-safe-area-context | 4.10.5 | ✅ STABLE | Auto-managed by Expo |

## State Management (LOCKED)
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| @reduxjs/toolkit | ^2.9.0 | ✅ STABLE | Latest stable |
| react-redux | ^9.1.2 | ✅ STABLE | Compatible with RTK 2.9.0 |

## Native Modules (LOCKED)
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| expo-av | ~15.0.7 | ✅ STABLE | Expo 51 compatible |
| expo-haptics | ~13.0.1 | ✅ STABLE | Expo 51 compatible |
| expo-speech | ~12.0.2 | ✅ STABLE | Expo 51 compatible |
| expo-sqlite | ~14.0.6 | ✅ STABLE | Expo 51 compatible |
| expo-crypto | ~13.0.2 | ✅ STABLE | Expo 51 compatible |
| expo-file-system | ~17.0.1 | ✅ STABLE | Expo 51 compatible |
| expo-print | ~13.0.1 | ✅ STABLE | Expo 51 compatible |
| expo-sharing | ~12.0.1 | ✅ STABLE | Expo 51 compatible |

## UI & Animation (LOCKED)
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| nativewind | ^2.0.11 | ✅ STABLE | Stable Tailwind CSS for RN |
| lottie-react-native | 6.7.0 | ✅ STABLE | Expo 51 compatible |
| react-native-svg | 15.2.0 | ✅ STABLE | Expo 51 compatible |
| victory | ^36.9.2 | ✅ STABLE | Pure JS, no native deps |
| react-native-confetti-cannon | ^1.5.2 | ✅ STABLE | Stable animation lib |

## Build Configuration (LOCKED)
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| expo-build-properties | ~0.12.5 | ✅ STABLE | Expo 51 compatible |
| expo-dev-client | ~4.0.29 | ✅ STABLE | For custom dev builds |

## iOS Build Settings (LOCKED)
| Setting | Value | Status | Notes |
|---------|-------|--------|-------|
| iOS Deployment Target | 13.4 | ✅ STABLE | Minimum for Expo 51 |
| Xcode Version | 16.0 | ✅ REQUIRED | Apple requires iOS 18 SDK for TestFlight |
| useFrameworks | static | ✅ STABLE | Required for some pods |
| newArchEnabled (Android) | false | ✅ STABLE | Disable new arch for stability |

## REMOVED/AVOIDED PACKAGES
| Package | Reason | Alternative |
|---------|--------|-------------|
| @react-native-voice/voice | Native module issues in Expo | expo-speech |
| victory-native | Native dependencies | victory (pure JS) |
| react-native-worklets | Not needed | Removed |

## COMPATIBILITY RULES
1. **NEVER** mix Expo SDK versions (all expo-* packages must match SDK version)
2. **ALWAYS** use `npx expo install --fix` after changing Expo SDK version
3. **AVOID** packages with native Android/iOS code unless absolutely necessary
4. **PREFER** pure JavaScript packages over native modules when possible
5. **LOCK** working versions - don't upgrade unless critical security issue

## CURRENT STATUS: ✅ ALL COMPATIBLE
Last Updated: 2025-09-20
Expo SDK: 51.0.28
React Native: 0.74.5
