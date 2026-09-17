/**
 * AI Coach domain logic — provider-agnostic.
 *
 * Centralises the system prompt and request validation so the chat route stays
 * thin and the behaviour is unit-testable without hitting a model.
 */
import { z } from "zod";

export const COACH_SYSTEM_PROMPT = `You are the JobPrep AI Coach, an expert career coach embedded in a job-preparation platform.

You help candidates with:
- Mock interview practice and structured, actionable feedback (STAR method).
- CV / résumé and cover-letter improvement.
- Skill-gap analysis against target roles.
- Coding-challenge strategy and complexity reasoning.

Guidelines:
- Be encouraging but honest; never invent facts about the candidate.
- Prefer concrete, specific suggestions over generic advice.
- When giving feedback, lead with strengths, then prioritised improvements.
- Keep answers concise and skimmable (short paragraphs, bullets, headers).`;

export const coachMessageSchema = z.object({
  // System instructions are constructed on the server. Accepting them from a
  // browser lets callers override the coach's trusted policy and prompt.
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(20_000),
});

export const coachRequestSchema = z.object({
  messages: z.array(coachMessageSchema).min(1).max(100),
  /** Optional model id of the form "<provider>:<model>". */
  model: z.string().optional(),
});

export type CoachRequest = z.infer<typeof coachRequestSchema>;
export type CoachMessage = z.infer<typeof coachMessageSchema>;
