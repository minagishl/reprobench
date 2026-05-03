import type { BenchmarkComparison, BenchmarkResult } from "./schema.js";

function fmt(value: number): string {
  return value.toLocaleString("en-US");
}

function fmtPercent(value: number | null): string {
  if (value === null) return "N/A";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function generateResultMarkdown(result: BenchmarkResult): string {
  const lines: string[] = [];
  lines.push("## Benchmark Results");
  lines.push("");
  lines.push("| group | benchmark | value | unit |");
  lines.push("| --- | --- | ---: | --- |");

  for (const entry of result.benchmarks) {
    const group = entry.group ?? "";
    lines.push(`| ${group} | ${entry.name} | ${fmt(entry.value)} | ${entry.unit} |`);
  }

  lines.push("");
  return lines.join("\n");
}

export function generateComparisonMarkdown(comparisons: BenchmarkComparison[]): string {
  const lines: string[] = [];
  lines.push("## Benchmark Comparison");
  lines.push("");
  lines.push("| group | benchmark | baseline | current | change |");
  lines.push("| --- | --- | ---: | ---: | ---: |");

  for (const c of comparisons) {
    const group = c.group ?? "";
    lines.push(
      `| ${group} | ${c.name} | ${fmt(c.baseline)} ${c.unit} | ${fmt(c.current)} ${c.unit} | ${fmtPercent(c.deltaPercent)} |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}
