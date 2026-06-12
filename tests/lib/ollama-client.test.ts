import { describe, expect, it } from "vitest";
import { cleanJsonResponse } from "@/lib/ollama-client";

describe("cleanJsonResponse", () => {
  it("returns plain JSON unchanged", () => {
    expect(cleanJsonResponse('{"a":1}')).toBe('{"a":1}');
  });

  it("strips ```json fences", () => {
    const input = '```json\n{"a":1}\n```';
    expect(cleanJsonResponse(input)).toBe('{"a":1}');
  });

  it("strips bare ``` fences", () => {
    const input = '```\n{"b":2}\n```';
    expect(cleanJsonResponse(input)).toBe('{"b":2}');
  });

  it("extracts a JSON object embedded in prose", () => {
    const input = 'Here is the result: {"ok":true} hope it helps!';
    expect(cleanJsonResponse(input)).toBe('{"ok":true}');
  });

  it("extracts a JSON array embedded in prose", () => {
    const input = "The list is [1,2,3] as requested.";
    expect(cleanJsonResponse(input)).toBe("[1,2,3]");
  });

  it("trims surrounding whitespace", () => {
    expect(cleanJsonResponse('   {"x":1}   ')).toBe('{"x":1}');
  });
});
