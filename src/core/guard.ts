import type { BenchmarkEntry, GuardEntry } from "./schema.js";

export interface GuardResult {
  name: string;
  value: number;
  unit: string;
  guard: GuardEntry;
  passed: boolean;
  message: string;
}

export function checkGuard(entry: BenchmarkEntry, guard: GuardEntry): GuardResult {
  let passed = true;
  const messages: string[] = [];

  if (guard.max !== undefined && entry.value > guard.max) {
    passed = false;
    messages.push(`${entry.value} ${guard.unit} > ${guard.max} ${guard.unit}`);
  }

  if (guard.min !== undefined && entry.value < guard.min) {
    passed = false;
    messages.push(`${entry.value} ${guard.unit} < ${guard.min} ${guard.unit}`);
  }

  let message: string;
  if (passed) {
    const parts: string[] = [];
    if (guard.max !== undefined) {
      parts.push(`${entry.value} ${guard.unit} <= ${guard.max} ${guard.unit}`);
    }
    if (guard.min !== undefined) {
      parts.push(`${entry.value} ${guard.unit} >= ${guard.min} ${guard.unit}`);
    }
    message = parts.join(", ");
    if (!message) message = `${entry.value} ${guard.unit} ok`;
  } else {
    message = messages.join(", ");
  }

  return {
    name: entry.name,
    value: entry.value,
    unit: entry.unit,
    guard,
    passed,
    message,
  };
}

export function checkGuards(
  benchmarks: BenchmarkEntry[],
  guards: Record<string, GuardEntry>,
): GuardResult[] {
  const results: GuardResult[] = [];
  const benchmarkMap = new Map<string, BenchmarkEntry>();
  for (const b of benchmarks) {
    benchmarkMap.set(b.name, b);
  }

  for (const [name, guard] of Object.entries(guards)) {
    const entry = benchmarkMap.get(name);
    if (!entry) {
      results.push({
        name,
        value: 0,
        unit: guard.unit,
        guard,
        passed: false,
        message: `Benchmark "${name}" not found in results`,
      });
      continue;
    }
    results.push(checkGuard(entry, guard));
  }

  return results;
}
