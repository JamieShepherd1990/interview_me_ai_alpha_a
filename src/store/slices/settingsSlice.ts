import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  dataConsent: boolean;
  microphonePermission: boolean;
  notifications: boolean;
  haptics: boolean;
  voiceSpeed: number; // 0.5 to 2.0
  voicePitch: number; // 0.5 to 2.0
}

const initialState: SettingsState = {
  theme: 'system',
  dataConsent: false,
  microphonePermission: false,
  notifications: true,
  haptics: true,
  voiceSpeed: 1.0,
  voicePitch: 1.0,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setDataConsent: (state, action: PayloadAction<boolean>) => {
      state.dataConsent = action.payload;
    },
    setMicrophonePermission: (state, action: PayloadAction<boolean>) => {
      state.microphonePermission = action.payload;
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
    },
    setHaptics: (state, action: PayloadAction<boolean>) => {
      state.haptics = action.payload;
    },
    setVoiceSpeed: (state, action: PayloadAction<number>) => {
      state.voiceSpeed = Math.max(0.5, Math.min(2.0, action.payload));
    },
    setVoicePitch: (state, action: PayloadAction<number>) => {
      state.voicePitch = Math.max(0.5, Math.min(2.0, action.payload));
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  setTheme,
  setDataConsent,
  setMicrophonePermission,
  setNotifications,
  setHaptics,
  setVoiceSpeed,
  setVoicePitch,
  updateSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;