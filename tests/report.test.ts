import { describe, it, expect } from "vitest";
import { generateResultMarkdown, generateComparisonMarkdown } from "../src/core/report.js";
import type { BenchmarkResult, BenchmarkComparison } from "../src/core/schema.js";

describe("generateResultMarkdown", () => {
  it("generates a markdown table from BenchmarkResult", () => {
    const result: BenchmarkResult = {
      benchmarks: [{ name: "test-bench", group: "size", value: 1234, unit: "bytes" }],
    };
    const md = generateResultMarkdown(result);
    expect(md).toContain("## Benchmark Results");
    expect(md).toContain("| group | benchmark | value | unit |");
    expect(md).toContain("test-bench");
  });

  it("includes thousands separator in value", () => {
    const result: BenchmarkResult = {
      benchmarks: [{ name: "big-bench", group: "speed", value: 1000000, unit: "ops/s" }],
    };
    const md = generateResultMarkdown(result);
    expect(md).toContain("1,000,000");
  });
});

describe("generateComparisonMarkdown", () => {
  it("generates a markdown comparison table", () => {
    const comparisons: BenchmarkComparison[] = [
      {
        name: "test-bench",
        group: "size",
        unit: "bytes",
        baseline: 7450,
        current: 5316,
        delta: -2134,
        deltaPercent: -28.64,
        direction: "lower-is-better",
        improved: true,
      },
    ];
    const md = generateComparisonMarkdown(comparisons);
    expect(md).toContain("## Benchmark Comparison");
    expect(md).toContain("| group | benchmark | baseline | current | change |");
    expect(md).toContain("test-bench");
    expect(md).toContain("7,450");
    expect(md).toContain("5,316");
  });

  it("includes thousands separator in values", () => {
    const comparisons: BenchmarkComparison[] = [
      {
        name: "bench",
        unit: "ops/s",
        baseline: 10000,
        current: 20000,
        delta: 10000,
        deltaPercent: 100,
        direction: "higher-is-better",
        improved: true,
      },
    ];
    const md = generateComparisonMarkdown(comparisons);
    expect(md).toContain("10,000");
    expect(md).toContain("20,000");
  });
});
