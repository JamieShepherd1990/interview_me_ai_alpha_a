import { z } from 'zod';

export const feedbackSchema = z.object({
  score: z.number().min(0).max(10),
  strengths: z.array(z.string()).length(3),
  improvements: z.array(z.string()).length(3),
  learnings: z.array(z.string()).length(3),
});

export const visemeEventSchema = z.object({
  timestamp: z.number(),
  phoneme: z.string(),
  intensity: z.number().min(0).max(1).optional(),
});

export const sessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  role: z.string(),
  startTime: z.number(),
  duration: z.number(),
  transcript: z.string(),
  score: z.number().min(0).max(10),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  learnings: z.array(z.string()),
  createdAt: z.number(),
});

export type FeedbackData = z.infer<typeof feedbackSchema>;
export type VisemeEvent = z.infer<typeof visemeEventSchema>;
export type SessionData = z.infer<typeof sessionSchema>;