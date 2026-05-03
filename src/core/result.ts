import { BenchmarkResultSchema } from "./schema.js";
import type { BenchmarkResult } from "./schema.js";

export function parseBenchmarkResult(data: unknown): BenchmarkResult {
  const result = BenchmarkResultSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid benchmark result format:\n${issues}`);
  }
  return result.data;
}
