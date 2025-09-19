import { z } from 'zod';

// Feedback schema as specified in requirements
export const feedbackSchema = z.object({
  score: z.number().min(0).max(10),
  strengths: z.array(z.string()).length(3),
  improvements: z.array(z.string()).length(3),
  learnings: z.array(z.string()).length(3)
});

export type FeedbackData = z.infer<typeof feedbackSchema>;

// Session validation schema
export const sessionSchema = z.object({
  sessionId: z.string().uuid(),
  interviewType: z.string().min(1),
  role: z.string().min(1),
  duration: z.number().min(0),
  score: z.number().min(0).max(10).optional(),
  transcript: z.array(z.object({
    id: z.string(),
    timestamp: z.number(),
    speaker: z.enum(['user', 'ai']),
    text: z.string(),
    isPartial: z.boolean().optional(),
  })),
  feedback: feedbackSchema.optional(),
});

export type SessionData = z.infer<typeof sessionSchema>;

// Voice settings schema
export const voiceSettingsSchema = z.object({
  voiceId: z.string(),
  speed: z.number().min(0.5).max(2.0),
  pitch: z.number().min(0.5).max(2.0),
});

export type VoiceSettings = z.infer<typeof voiceSettingsSchema>;

// Interview template schema
export const interviewTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['behavioral', 'technical', 'case-study', 'general']),
  difficulty: z.enum(['entry', 'mid', 'senior']),
  estimatedDuration: z.number(), // in minutes
  sampleQuestions: z.array(z.string()),
});

export type InterviewTemplate = z.infer<typeof interviewTemplateSchema>;

// Chat message schema
export const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
  timestamp: z.number().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// Viseme event schema for lip-sync
export const visemeEventSchema = z.object({
  time: z.number(), // timestamp in milliseconds
  viseme: z.string(), // viseme identifier
  phoneme: z.string().optional(),
});

export type VisemeEvent = z.infer<typeof visemeEventSchema>;
