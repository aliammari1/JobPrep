import { describe, expect, it } from "vitest";
import {
  AI_MODELS,
  DEFAULT_MODEL_ID,
  isKnownModel,
  parseModelId,
  resolveModel,
  resolveModelCatalog,
  resolveModelIdForTier,
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

  it("resolves manifest aliases to canonical provider:model ids", () => {
    expect(parseModelId("sonnet")).toEqual({
      provider: "anthropic",
      model: "claude-sonnet-4-5",
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

  it("recognises dynamic OpenRouter, Ollama, and Gateway slugs", () => {
    expect(isKnownModel("openrouter:meta-llama/llama-3.3-70b-instruct")).toBe(
      true,
    );
    expect(isKnownModel("ollama:qwen2.5-coder:14b")).toBe(true);
    expect(isKnownModel("gateway:my-custom-route")).toBe(true);
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

describe("resolveModel & ModelManifest", () => {
  it("resolves every registered model via createProviderRegistry without throwing", () => {
    for (const m of AI_MODELS) {
      expect(() => resolveModel(m.id)).not.toThrow();
    }
  });

  it("throws for an unsupported provider", () => {
    expect(() => resolveModel("acme:fake-model")).toThrow();
  });

  it("returns catalog entries with capabilities and configured flags", () => {
    const catalog = resolveModelCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(7);
    const pollinations = catalog.find(
      (m) => m.id === "pollinations:gpt-oss-20b",
    );
    expect(pollinations?.configured).toBe(true);
    expect(pollinations?.capabilities.structuredOutput).toBe(false);
  });

  it("resolves tier defaults cleanly", () => {
    expect(isKnownModel(resolveModelIdForTier("fast"))).toBe(true);
    expect(isKnownModel(resolveModelIdForTier("balanced"))).toBe(true);
    expect(isKnownModel(resolveModelIdForTier("reasoning"))).toBe(true);
  });
});
