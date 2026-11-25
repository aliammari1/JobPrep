import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const { generateText, streamText, resolveModel, isKnownModel } = vi.hoisted(
  () => ({
    generateText: vi.fn(),
    streamText: vi.fn(),
    resolveModel: vi.fn(() => ({ id: "fake-model" })),
    isKnownModel: vi.fn((id: string) => id === "pollinations:gpt-oss-20b"),
  }),
);

vi.mock("ai", () => ({
  generateText,
  streamText,
  Output: { object: vi.fn(({ schema }) => ({ schema })) },
}));

vi.mock("@/lib/ai/providers", () => ({
  DEFAULT_MODEL_ID: "pollinations:gpt-oss-20b",
  resolveModel,
  isKnownModel,
}));

import {
  AI_DEFAULT_TIMEOUT_MS,
  aiTelemetry,
  generateModelText,
  generateStructured,
  resolveRequestModel,
  streamModelText,
} from "@/lib/ai/generate";

const schema = z.object({ score: z.number() });

beforeEach(() => {
  vi.clearAllMocks();
  generateText.mockResolvedValue({ text: '{"score": 91}' });
});

describe("resolveRequestModel", () => {
  it("uses the default model when none is supplied", () => {
    expect(resolveRequestModel(undefined)).toBe("pollinations:gpt-oss-20b");
  });

  it("accepts a registered model id", () => {
    expect(resolveRequestModel("pollinations:gpt-oss-20b")).toBe(
      "pollinations:gpt-oss-20b",
    );
  });

  it("rejects unknown or non-string model ids", () => {
    expect(() => resolveRequestModel("acme:fake")).toThrow(/Unknown model/);
    expect(() => resolveRequestModel(42)).toThrow(/Unknown model/);
  });
});

describe("aiTelemetry", () => {
  it("returns a functionId-only telemetry tag", () => {
    expect(aiTelemetry("coach", "ignored")).toEqual({ functionId: "coach" });
  });
});

describe("generateStructured", () => {
  it("uses the strict JSON lane for keyless Pollinations models", async () => {
    generateText.mockResolvedValueOnce({
      text: '```json\n{"score": 88}\n```',
    });

    const result = await generateStructured({
      schema,
      prompt: "score it",
      instructions: "be brief",
      functionId: "score",
    });

    expect(result).toEqual({ score: 88 });
    expect(resolveModel).toHaveBeenCalledWith("pollinations:gpt-oss-20b");
    const call = generateText.mock.calls[0][0];
    expect(call.system).toContain("be brief");
    expect(call.system).toContain("ONLY a single valid JSON object");
    expect(call.telemetry).toEqual({ functionId: "score-json" });
    expect(call.timeout).toBe(AI_DEFAULT_TIMEOUT_MS);
  });

  it("extracts a JSON object embedded in prose", async () => {
    generateText.mockResolvedValueOnce({
      text: 'Here you go: {"score": 7} done',
    });
    const result = await generateStructured({
      schema,
      prompt: "score it",
      functionId: "score",
    });
    expect(result).toEqual({ score: 7 });
  });

  it("uses structured output for known providers", async () => {
    isKnownModel.mockImplementation((id: string) => id.startsWith("openai:"));
    generateText.mockResolvedValueOnce({ output: { score: 95 } });

    const result = await generateStructured({
      schema,
      prompt: "score it",
      modelId: "openai:gpt-4o",
      functionId: "score",
      timeoutMs: 1234,
    });

    expect(result).toEqual({ score: 95 });
    expect(generateText.mock.calls[0][0].output).toEqual({ schema });
    expect(generateText.mock.calls[0][0].telemetry).toEqual({
      functionId: "score",
    });
    expect(generateText.mock.calls[0][0].timeout).toBe(1234);
    isKnownModel.mockImplementation(
      (id: string) => id === "pollinations:gpt-oss-20b",
    );
  });

  it("falls back to strict JSON when structured output is rejected", async () => {
    isKnownModel.mockImplementation((id: string) => id.startsWith("openai:"));
    generateText
      .mockRejectedValueOnce(new Error("json_schema unsupported"))
      .mockResolvedValueOnce({ text: '{"score": 42}' });

    const result = await generateStructured({
      schema,
      prompt: "score it",
      modelId: "openai:gpt-4o",
      functionId: "score",
    });

    expect(result).toEqual({ score: 42 });
    expect(generateText).toHaveBeenCalledTimes(2);
    expect(generateText.mock.calls[1][0].telemetry).toEqual({
      functionId: "score-json",
    });
    isKnownModel.mockImplementation(
      (id: string) => id === "pollinations:gpt-oss-20b",
    );
  });
});

describe("generateModelText", () => {
  it("returns text and forwards instructions, telemetry and retries", async () => {
    generateText.mockResolvedValueOnce({ text: "hello" });

    const result = await generateModelText({
      prompt: "hi",
      instructions: "be nice",
      functionId: "chat",
      maxRetries: 4,
      timeoutMs: 99,
    });

    expect(result).toBe("hello");
    expect(generateText.mock.calls[0][0]).toMatchObject({
      system: "be nice",
      prompt: "hi",
      telemetry: { functionId: "chat" },
      maxRetries: 4,
      timeout: 99,
    });
  });

  it("omits system when instructions are absent", async () => {
    generateText.mockResolvedValueOnce({ text: "ok" });
    await generateModelText({ prompt: "hi", functionId: "chat" });
    expect(generateText.mock.calls[0][0].system).toBeUndefined();
  });
});

describe("streamModelText", () => {
  it("returns the SDK stream result with telemetry attached", () => {
    const stream = { toTextStreamResponse: vi.fn() };
    streamText.mockReturnValue(stream);

    expect(
      streamModelText({
        prompt: "hi",
        instructions: "short",
        functionId: "chat",
      }),
    ).toBe(stream);
    expect(streamText.mock.calls[0][0]).toMatchObject({
      system: "short",
      prompt: "hi",
      telemetry: { functionId: "chat" },
      maxRetries: 2,
      timeout: AI_DEFAULT_TIMEOUT_MS,
    });
  });
});
