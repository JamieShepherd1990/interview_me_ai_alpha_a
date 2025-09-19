import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types for API responses
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  id: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface FeedbackResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  learnings: string[];
}

export interface TTSRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

// Base URL will be set to your backend proxy
const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Chat', 'TTS', 'Feedback'],
  endpoints: (builder) => ({
    // Chat with OpenAI via backend proxy
    sendChatMessage: builder.mutation<ChatResponse, { messages: ChatMessage[] }>({
      query: (body) => ({
        url: '/chat',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),
    
    // Get feedback from AI
    getFeedback: builder.mutation<FeedbackResponse, { transcript: string; role: string; interviewType: string }>({
      query: (body) => ({
        url: '/feedback',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Feedback'],
    }),
    
    // Text-to-Speech via ElevenLabs proxy
    generateSpeech: builder.mutation<Blob, TTSRequest>({
      query: (body) => ({
        url: '/tts',
        method: 'POST',
        body,
        responseHandler: 'blob',
      }),
      invalidatesTags: ['TTS'],
    }),
    
    // Health check for backend
    healthCheck: builder.query<{ status: string; timestamp: number }, void>({
      query: () => '/health',
    }),
  }),
});

export const {
  useSendChatMessageMutation,
  useGetFeedbackMutation,
  useGenerateSpeechMutation,
  useHealthCheckQuery,
} = apiSlice;
