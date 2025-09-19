import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TranscriptEntry {
  id: string;
  timestamp: number;
  speaker: 'user' | 'ai';
  text: string;
  isPartial?: boolean;
}

export interface SessionState {
  status: 'idle' | 'preparing' | 'active' | 'paused' | 'ended';
  sessionId: string | null;
  startTime: number | null;
  endTime: number | null;
  duration: number; // in seconds
  interviewType: string | null;
  role: string | null;
  transcript: TranscriptEntry[];
  currentQuestion: string | null;
  isRecording: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  timer: number; // countdown timer in seconds (15 minutes = 900)
  score: number | null;
  feedback: {
    strengths: string[];
    improvements: string[];
    learnings: string[];
  } | null;
}

const initialState: SessionState = {
  status: 'idle',
  sessionId: null,
  startTime: null,
  endTime: null,
  duration: 0,
  interviewType: null,
  role: null,
  transcript: [],
  currentQuestion: null,
  isRecording: false,
  isSpeaking: false,
  isThinking: false,
  timer: 900, // 15 minutes
  score: null,
  feedback: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<{ sessionId: string; interviewType: string; role: string }>) => {
      state.status = 'active';
      state.sessionId = action.payload.sessionId;
      state.interviewType = action.payload.interviewType;
      state.role = action.payload.role;
      state.startTime = Date.now();
      state.transcript = [];
      state.timer = 900;
      state.score = null;
      state.feedback = null;
    },
    endSession: (state) => {
      state.status = 'ended';
      state.endTime = Date.now();
      if (state.startTime) {
        state.duration = Math.floor((state.endTime - state.startTime) / 1000);
      }
      state.isRecording = false;
      state.isSpeaking = false;
      state.isThinking = false;
    },
    pauseSession: (state) => {
      state.status = 'paused';
      state.isRecording = false;
    },
    resumeSession: (state) => {
      state.status = 'active';
    },
    resetSession: (state) => {
      return initialState;
    },
    updateTimer: (state, action: PayloadAction<number>) => {
      state.timer = action.payload;
      if (state.timer <= 0) {
        state.status = 'ended';
        state.endTime = Date.now();
        if (state.startTime) {
          state.duration = Math.floor((state.endTime - state.startTime) / 1000);
        }
      }
    },
    addTranscriptEntry: (state, action: PayloadAction<Omit<TranscriptEntry, 'id'>>) => {
      const entry: TranscriptEntry = {
        ...action.payload,
        id: `${Date.now()}-${Math.random()}`,
      };
      
      // If it's a partial transcript, update the last entry if it's from the same speaker
      if (entry.isPartial && state.transcript.length > 0) {
        const lastEntry = state.transcript[state.transcript.length - 1];
        if (lastEntry.speaker === entry.speaker && lastEntry.isPartial) {
          state.transcript[state.transcript.length - 1] = entry;
          return;
        }
      }
      
      state.transcript.push(entry);
    },
    updatePartialTranscript: (state, action: PayloadAction<{ text: string; speaker: 'user' | 'ai' }>) => {
      const { text, speaker } = action.payload;
      const lastEntry = state.transcript[state.transcript.length - 1];
      
      if (lastEntry && lastEntry.speaker === speaker && lastEntry.isPartial) {
        lastEntry.text = text;
        lastEntry.timestamp = Date.now();
      } else {
        state.transcript.push({
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          speaker,
          text,
          isPartial: true,
        });
      }
    },
    finalizeTranscriptEntry: (state, action: PayloadAction<{ text: string; speaker: 'user' | 'ai' }>) => {
      const { text, speaker } = action.payload;
      const lastEntry = state.transcript[state.transcript.length - 1];
      
      if (lastEntry && lastEntry.speaker === speaker && lastEntry.isPartial) {
        lastEntry.text = text;
        lastEntry.isPartial = false;
        lastEntry.timestamp = Date.now();
      } else {
        state.transcript.push({
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          speaker,
          text,
          isPartial: false,
        });
      }
    },
    setRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    setSpeaking: (state, action: PayloadAction<boolean>) => {
      state.isSpeaking = action.payload;
      if (action.payload) {
        state.isThinking = false;
      }
    },
    setThinking: (state, action: PayloadAction<boolean>) => {
      state.isThinking = action.payload;
      if (action.payload) {
        state.isSpeaking = false;
      }
    },
    setCurrentQuestion: (state, action: PayloadAction<string>) => {
      state.currentQuestion = action.payload;
    },
    setFeedback: (state, action: PayloadAction<{ score: number; strengths: string[]; improvements: string[]; learnings: string[] }>) => {
      state.score = action.payload.score;
      state.feedback = {
        strengths: action.payload.strengths,
        improvements: action.payload.improvements,
        learnings: action.payload.learnings,
      };
    },
  },
});

export const {
  startSession,
  endSession,
  pauseSession,
  resumeSession,
  resetSession,
  updateTimer,
  addTranscriptEntry,
  updatePartialTranscript,
  finalizeTranscriptEntry,
  setRecording,
  setSpeaking,
  setThinking,
  setCurrentQuestion,
  setFeedback,
} = sessionSlice.actions;

export default sessionSlice.reducer;
