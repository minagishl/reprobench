import { describe, it, expect } from "vitest";
import { checkGuard } from "../src/core/guard.js";
import type { BenchmarkEntry, GuardEntry } from "../src/core/schema.js";

function entry(name: string, value: number, unit: string): BenchmarkEntry {
  return { name, value, unit };
}

describe("checkGuard", () => {
  it("max satisfied: pass", () => {
    const guard: GuardEntry = { max: 1000, unit: "bytes" };
    const result = checkGuard(entry("bench", 800, "bytes"), guard);
    expect(result.passed).toBe(true);
  });

  it("max exceeded: fail", () => {
    const guard: GuardEntry = { max: 1000, unit: "bytes" };
    const result = checkGuard(entry("bench", 1200, "bytes"), guard);
    expect(result.passed).toBe(false);
  });

  it("min satisfied: pass", () => {
    const guard: GuardEntry = { min: 5000, unit: "ops/s" };
    const result = checkGuard(entry("bench", 6000, "ops/s"), guard);
    expect(result.passed).toBe(true);
  });

  it("min not met: fail", () => {
    const guard: GuardEntry = { min: 5000, unit: "ops/s" };
    const result = checkGuard(entry("bench", 4000, "ops/s"), guard);
    expect(result.passed).toBe(false);
  });
});
