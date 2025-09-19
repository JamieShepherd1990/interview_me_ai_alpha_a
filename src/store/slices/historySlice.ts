import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InterviewSession {
  id: string;
  title: string;
  role: string;
  startTime: number;
  duration: number;
  transcript: string;
  score: number;
  strengths: string[];
  improvements: string[];
  learnings: string[];
  createdAt: number;
}

export interface HistoryState {
  sessions: InterviewSession[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HistoryState = {
  sessions: [],
  isLoading: false,
  error: null,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addSession: (state, action: PayloadAction<InterviewSession>) => {
      state.sessions.unshift(action.payload);
    },
    updateSession: (state, action: PayloadAction<{ id: string; updates: Partial<InterviewSession> }>) => {
      const session = state.sessions.find(s => s.id === action.payload.id);
      if (session) {
        Object.assign(session, action.payload.updates);
      }
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
    },
    setSessions: (state, action: PayloadAction<InterviewSession[]>) => {
      state.sessions = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addSession,
  updateSession,
  deleteSession,
  setSessions,
  setLoading,
  setError,
} = historySlice.actions;

export default historySlice.reducer;