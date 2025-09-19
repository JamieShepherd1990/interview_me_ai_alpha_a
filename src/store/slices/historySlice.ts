import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TranscriptEntry } from './sessionSlice';

export interface HistorySession {
  id: string;
  timestamp: number;
  interviewType: string;
  role: string;
  duration: number; // in seconds
  score: number;
  transcript: TranscriptEntry[];
  feedback: {
    strengths: string[];
    improvements: string[];
    learnings: string[];
  };
  isSaved: boolean;
}

interface HistoryState {
  sessions: HistorySession[];
  isLoading: boolean;
  searchQuery: string;
  sortBy: 'date' | 'score' | 'duration';
  sortOrder: 'asc' | 'desc';
}

const initialState: HistoryState = {
  sessions: [],
  isLoading: false,
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSessions: (state, action: PayloadAction<HistorySession[]>) => {
      state.sessions = action.payload;
    },
    addSession: (state, action: PayloadAction<HistorySession>) => {
      state.sessions.unshift(action.payload); // Add to beginning for newest first
    },
    updateSession: (state, action: PayloadAction<{ id: string; updates: Partial<HistorySession> }>) => {
      const index = state.sessions.findIndex(session => session.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = { ...state.sessions[index], ...action.payload.updates };
      }
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(session => session.id !== action.payload);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'date' | 'score' | 'duration'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    clearHistory: (state) => {
      state.sessions = [];
    },
  },
});

export const {
  setLoading,
  setSessions,
  addSession,
  updateSession,
  deleteSession,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  clearHistory,
} = historySlice.actions;

export default historySlice.reducer;
