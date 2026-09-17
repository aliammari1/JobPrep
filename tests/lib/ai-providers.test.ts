import { describe, expect, it } from "vitest";
import {
  AI_MODELS,
  DEFAULT_MODEL_ID,
  isKnownModel,
  parseModelId,
  resolveModel,
} from "@/lib/ai/providers";

describe("parseModelId", () => {
  it("splits a valid <provider>:<model> id", () => {
    expect(parseModelId("anthropic:claude-haiku-4-5")).toEqual({
      provider: "anthropic",
      model: "claude-haiku-4-5",
    });
  });

  it("keeps colons that appear inside the model name", () => {
    expect(parseModelId("ollama:llama3.2:latest")).toEqual({
      provider: "ollama",
      model: "llama3.2:latest",
    });
  });

  it("throws when the separator is missing", () => {
    expect(() => parseModelId("gpt-4o")).toThrow();
  });

  it("throws when the model part is empty", () => {
    expect(() => parseModelId("openai:")).toThrow();
  });
});

describe("isKnownModel", () => {
  it("recognises the default model", () => {
    expect(isKnownModel(DEFAULT_MODEL_ID)).toBe(true);
  });

  it("rejects an unregistered model", () => {
    expect(isKnownModel("acme:fake-model")).toBe(false);
  });

  it("every registered model id is well-formed", () => {
    for (const m of AI_MODELS) {
      expect(() => parseModelId(m.id)).not.toThrow();
      expect(parseModelId(m.id).provider).toBe(m.provider);
    }
  });
});

describe("resolveModel", () => {
  it("resolves every registered model without throwing", () => {
    for (const m of AI_MODELS) {
      expect(() => resolveModel(m.id)).not.toThrow();
    }
  });

  it("throws for an unsupported provider", () => {
    expect(() => resolveModel("acme:fake-model")).toThrow();
  });
});
