import pc from "picocolors";
import { loadConfig } from "../core/config.js";
import { compareResults } from "../core/compare.js";
import { readJsonFile } from "../core/fs.js";
import { formatComparisons } from "../core/format.js";
import { parseBenchmarkResult } from "../core/result.js";

export interface CompareOptions {
  json?: boolean;
}

export async function runCompare(
  baselinePath?: string,
  currentPath?: string,
  options: CompareOptions = {},
): Promise<void> {
  let resolvedBaseline: string;
  let resolvedCurrent: string;

  if (baselinePath && currentPath) {
    resolvedBaseline = baselinePath;
    resolvedCurrent = currentPath;
  } else {
    const config = await loadConfig();
    if (!config.compare) {
      console.error(
        pc.red("No compare configuration found. Provide paths or set compare in config."),
      );
      process.exit(1);
    }
    resolvedBaseline = config.compare!.baseline;
    resolvedCurrent = config.compare!.current;
  }

  const baselineRaw = await readJsonFile<unknown>(resolvedBaseline);
  const currentRaw = await readJsonFile<unknown>(resolvedCurrent);

  const baseline = parseBenchmarkResult(baselineRaw);
  const current = parseBenchmarkResult(currentRaw);

  const comparisons = compareResults(baseline, current);

  if (comparisons.length === 0) {
    console.log(pc.yellow("No matching benchmarks found to compare."));
    return;
  }

  if (options.json) {
    console.log(JSON.stringify({ comparisons }, null, 2));
    return;
  }

  console.log(formatComparisons(comparisons));
}
