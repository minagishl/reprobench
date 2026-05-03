import pc from "picocolors";
import type { BenchmarkComparison } from "./schema.js";

function formatDeltaPercent(deltaPercent: number | null): string {
  if (deltaPercent === null) return "";
  const sign = deltaPercent >= 0 ? "+" : "";
  return ` (${sign}${deltaPercent.toFixed(2)}%)`;
}

export function formatComparisons(comparisons: BenchmarkComparison[]): string {
  const groups = new Map<string, BenchmarkComparison[]>();

  for (const c of comparisons) {
    const group = c.group ?? "(ungrouped)";
    const existing = groups.get(group);
    if (existing) {
      existing.push(c);
    } else {
      groups.set(group, [c]);
    }
  }

  const lines: string[] = [];

  for (const [group, items] of groups) {
    lines.push(pc.bold(group));
    for (const c of items) {
      const mark = c.improved ? pc.green("✓") : pc.red("✗");
      const pct = formatDeltaPercent(c.deltaPercent);
      lines.push(`${mark} ${c.name}: ${c.baseline} -> ${c.current} ${c.unit}${pct}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
