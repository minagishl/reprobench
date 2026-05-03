import type {
  BenchmarkComparison,
  BenchmarkDirection,
  BenchmarkEntry,
  BenchmarkResult,
} from "./schema.js";

function inferDirection(unit: string): BenchmarkDirection {
  if (unit === "bytes" || unit === "ms" || unit === "s") {
    return "lower-is-better";
  }
  return "higher-is-better";
}

export function compareResults(
  baseline: BenchmarkResult,
  current: BenchmarkResult,
): BenchmarkComparison[] {
  const baselineMap = new Map<string, BenchmarkEntry>();
  for (const entry of baseline.benchmarks) {
    baselineMap.set(`${entry.name}::${entry.unit}`, entry);
  }

  const comparisons: BenchmarkComparison[] = [];

  for (const curr of current.benchmarks) {
    const key = `${curr.name}::${curr.unit}`;
    const base = baselineMap.get(key);
    if (!base) continue;

    const direction: BenchmarkDirection =
      curr.direction ?? base.direction ?? inferDirection(curr.unit);

    const delta = curr.value - base.value;
    const deltaPercent = base.value === 0 ? null : (delta / base.value) * 100;

    let improved: boolean;
    if (curr.value === base.value) {
      improved = false;
    } else if (direction === "lower-is-better") {
      improved = curr.value < base.value;
    } else {
      improved = curr.value > base.value;
    }

    comparisons.push({
      name: curr.name,
      group: curr.group ?? base.group,
      unit: curr.unit,
      baseline: base.value,
      current: curr.value,
      delta,
      deltaPercent,
      direction,
      improved,
    });
  }

  return comparisons;
}
