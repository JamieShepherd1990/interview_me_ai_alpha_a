import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VisemeEvent {
  phoneme: string;
  timestamp: number;
  duration: number;
}

export interface SessionState {
  status: 'idle' | 'preparing' | 'active' | 'paused' | 'completed';
  startTime: number | null;
  duration: number;
  transcript: string;
  currentQuestion: string;
  isListening: boolean;
  isSpeaking: boolean;
  visemeStream: VisemeEvent[];
  feedback: {
    score: number;
    strengths: string[];
    improvements: string[];
    learnings: string[];
  } | null;
}

const initialState: SessionState = {
  status: 'idle',
  startTime: null,
  duration: 0,
  transcript: '',
  currentQuestion: '',
  isListening: false,
  isSpeaking: false,
  visemeStream: [],
  feedback: null
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<{ question: string }>) => {
      state.status = 'active';
      state.startTime = Date.now();
      state.duration = 0;
      state.transcript = '';
      state.currentQuestion = action.payload.question;
      state.isListening = true;
      state.isSpeaking = false;
      state.feedback = null;
    },
    pauseSession: (state) => {
      state.status = 'paused';
      state.isListening = false;
    },
    resumeSession: (state) => {
      state.status = 'active';
      state.isListening = true;
    },
    endSession: (state) => {
      state.status = 'completed';
      state.isListening = false;
      state.isSpeaking = false;
    },
    updateTranscript: (state, action: PayloadAction<string>) => {
      state.transcript = action.payload;
    },
    appendTranscript: (state, action: PayloadAction<string>) => {
      state.transcript += action.payload;
    },
    setListening: (state, action: PayloadAction<boolean>) => {
      state.isListening = action.payload;
    },
    setSpeaking: (state, action: PayloadAction<boolean>) => {
      state.isSpeaking = action.payload;
    },
    updateDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setFeedback: (state, action: PayloadAction<SessionState['feedback']>) => {
      state.feedback = action.payload;
    },
    updateVisemeStream: (state, action: PayloadAction<VisemeEvent[]>) => {
      state.visemeStream = action.payload;
    },
    resetSession: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  startSession,
  pauseSession,
  resumeSession,
  endSession,
  updateTranscript,
  appendTranscript,
  setListening,
  setSpeaking,
  updateDuration,
  setFeedback,
  updateVisemeStream,
  resetSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;