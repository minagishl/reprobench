import { describe, it, expect } from "vitest";
import { compareResults } from "../src/core/compare.js";
import type { BenchmarkResult } from "../src/core/schema.js";

function makeResult(name: string, value: number, unit: string): BenchmarkResult {
  return { benchmarks: [{ name, value, unit }] };
}

describe("compareResults", () => {
  it("bytes smaller: improved true", () => {
    const baseline = makeResult("foo", 1000, "bytes");
    const current = makeResult("foo", 800, "bytes");
    const [c] = compareResults(baseline, current);
    expect(c.improved).toBe(true);
    expect(c.direction).toBe("lower-is-better");
  });

  it("bytes larger: improved false", () => {
    const baseline = makeResult("foo", 800, "bytes");
    const current = makeResult("foo", 1000, "bytes");
    const [c] = compareResults(baseline, current);
    expect(c.improved).toBe(false);
  });

  it("ops/s larger: improved true", () => {
    const baseline = makeResult("foo", 1000, "ops/s");
    const current = makeResult("foo", 2000, "ops/s");
    const [c] = compareResults(baseline, current);
    expect(c.improved).toBe(true);
    expect(c.direction).toBe("higher-is-better");
  });

  it("ops/s smaller: improved false", () => {
    const baseline = makeResult("foo", 2000, "ops/s");
    const current = makeResult("foo", 1000, "ops/s");
    const [c] = compareResults(baseline, current);
    expect(c.improved).toBe(false);
  });

  it("baseline 0: does not crash", () => {
    const baseline = makeResult("foo", 0, "bytes");
    const current = makeResult("foo", 100, "bytes");
    expect(() => compareResults(baseline, current)).not.toThrow();
  });

  it("baseline 0: deltaPercent is null", () => {
    const baseline = makeResult("foo", 0, "bytes");
    const current = makeResult("foo", 100, "bytes");
    const [c] = compareResults(baseline, current);
    expect(c.deltaPercent).toBeNull();
  });
});
