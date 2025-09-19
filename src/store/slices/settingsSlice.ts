import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  isDarkMode: boolean;
  hasDataConsent: boolean;
  hasMicrophonePermission: boolean;
  hasNotificationPermission: boolean;
  voiceSettings: {
    voiceId: string;
    speed: number; // 0.5 to 2.0
    pitch: number; // 0.5 to 2.0
  };
  hapticFeedback: boolean;
  autoSaveTranscripts: boolean;
  maxSessionDuration: number; // in minutes
  language: string;
  onboardingCompleted: boolean;
  lastSyncTimestamp: number | null;
}

const initialState: SettingsState = {
  isDarkMode: false,
  hasDataConsent: false,
  hasMicrophonePermission: false,
  hasNotificationPermission: false,
  voiceSettings: {
    voiceId: 'default', // Will be set to ElevenLabs voice ID
    speed: 1.0,
    pitch: 1.0,
  },
  hapticFeedback: true,
  autoSaveTranscripts: true,
  maxSessionDuration: 15, // 15 minutes default
  language: 'en-US',
  onboardingCompleted: false,
  lastSyncTimestamp: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setDataConsent: (state, action: PayloadAction<boolean>) => {
      state.hasDataConsent = action.payload;
    },
    setMicrophonePermission: (state, action: PayloadAction<boolean>) => {
      state.hasMicrophonePermission = action.payload;
    },
    setNotificationPermission: (state, action: PayloadAction<boolean>) => {
      state.hasNotificationPermission = action.payload;
    },
    updateVoiceSettings: (state, action: PayloadAction<Partial<SettingsState['voiceSettings']>>) => {
      state.voiceSettings = { ...state.voiceSettings, ...action.payload };
    },
    setHapticFeedback: (state, action: PayloadAction<boolean>) => {
      state.hapticFeedback = action.payload;
    },
    setAutoSaveTranscripts: (state, action: PayloadAction<boolean>) => {
      state.autoSaveTranscripts = action.payload;
    },
    setMaxSessionDuration: (state, action: PayloadAction<number>) => {
      state.maxSessionDuration = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },
    setLastSyncTimestamp: (state, action: PayloadAction<number>) => {
      state.lastSyncTimestamp = action.payload;
    },
    resetSettings: (state) => {
      return { ...initialState, onboardingCompleted: state.onboardingCompleted };
    },
  },
});

export const {
  setDarkMode,
  setDataConsent,
  setMicrophonePermission,
  setNotificationPermission,
  updateVoiceSettings,
  setHapticFeedback,
  setAutoSaveTranscripts,
  setMaxSessionDuration,
  setLanguage,
  setOnboardingCompleted,
  setLastSyncTimestamp,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
