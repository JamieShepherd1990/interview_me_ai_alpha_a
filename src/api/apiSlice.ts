import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface ChatRequest {
  message: string;
  transcript: string;
  role: string;
}

export interface ChatResponse {
  response: string;
  isComplete: boolean;
}

export interface TTSRequest {
  text: string;
  voiceId?: string;
}

export interface TTSResponse {
  audioUrl: string;
  visemes: Array<{
    timestamp: number;
    phoneme: string;
  }>;
}

export interface FeedbackRequest {
  transcript: string;
  role: string;
}

export interface FeedbackResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  learnings: string[];
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Session'],
  endpoints: (builder) => ({
    sendChat: builder.mutation<ChatResponse, ChatRequest>({
      query: (body) => ({
        url: '/chat',
        method: 'POST',
        body,
      }),
    }),
    generateTTS: builder.mutation<TTSResponse, TTSRequest>({
      query: (body) => ({
        url: '/tts',
        method: 'POST',
        body,
      }),
    }),
    generateFeedback: builder.mutation<FeedbackResponse, FeedbackRequest>({
      query: (body) => ({
        url: '/feedback',
        method: 'POST',
        body,
      }),
    }),
    healthCheck: builder.query<{ status: string }, void>({
      query: () => '/health',
    }),
  }),
});

export const {
  useSendChatMutation,
  useGenerateTTSMutation,
  useGenerateFeedbackMutation,
  useHealthCheckQuery,
} = apiSlice;