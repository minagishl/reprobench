export type {
  BenchmarkUnit,
  BenchmarkDirection,
  BenchmarkEntry,
  BenchmarkResult,
  BenchmarkComparison,
  ReprobenchConfig,
  TaskConfig,
  GuardEntry,
} from "./core/schema.js";

export {
  BenchmarkEntrySchema,
  BenchmarkResultSchema,
  ReprobenchConfigSchema,
} from "./core/schema.js";

export { loadConfig, getConfigPath } from "./core/config.js";
export { compareResults } from "./core/compare.js";
export { generateResultMarkdown, generateComparisonMarkdown } from "./core/report.js";
export { checkGuard, checkGuards } from "./core/guard.js";
export { parseBenchmarkResult } from "./core/result.js";
export { formatComparisons } from "./core/format.js";
