import { configureStore } from '@reduxjs/toolkit';
import sessionSlice from './slices/sessionSlice';
import historySlice from './slices/historySlice';
import settingsSlice from './slices/settingsSlice';
import { apiSlice } from '../api/apiSlice';

export const store = configureStore({
  reducer: {
    session: sessionSlice,
    history: historySlice,
    settings: settingsSlice,
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;