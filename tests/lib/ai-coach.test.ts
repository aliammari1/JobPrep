import { describe, expect, it } from "vitest";
import { COACH_SYSTEM_PROMPT, coachRequestSchema } from "@/lib/ai/coach";

describe("coachRequestSchema", () => {
  it("accepts a minimal valid request", () => {
    const result = coachRequestSchema.safeParse({
      messages: [{ role: "user", content: "Help me prep for an interview" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts an optional model id", () => {
    const result = coachRequestSchema.safeParse({
      messages: [{ role: "user", content: "hi" }],
      model: "anthropic:claude-haiku-4-5",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty message list", () => {
    const result = coachRequestSchema.safeParse({ messages: [] });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown role", () => {
    const result = coachRequestSchema.safeParse({
      messages: [{ role: "robot", content: "hi" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("COACH_SYSTEM_PROMPT", () => {
  it("describes the JobPrep coach persona", () => {
    expect(COACH_SYSTEM_PROMPT).toContain("JobPrep AI Coach");
  });
});
