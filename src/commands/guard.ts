import pc from "picocolors";
import { loadConfig } from "../core/config.js";
import { readJsonFile } from "../core/fs.js";
import { checkGuards } from "../core/guard.js";
import { parseBenchmarkResult } from "../core/result.js";

export async function runGuard(): Promise<void> {
  const config = await loadConfig();

  if (!config.guards?.benchmarks || Object.keys(config.guards.benchmarks).length === 0) {
    console.log(pc.yellow("No guard conditions defined."));
    return;
  }

  const inputPath: string | undefined = config.compare?.current ?? config.report?.input;
  if (!inputPath) {
    console.error(pc.red("No input path found. Set compare.current or report.input in config."));
    process.exit(1);
  }

  const raw = await readJsonFile<unknown>(inputPath as string);
  const result = parseBenchmarkResult(raw);

  const results = checkGuards(result.benchmarks, config.guards.benchmarks);

  let hasFailure = false;

  for (const r of results) {
    if (r.passed) {
      console.log(pc.green("✓") + ` ${r.name}: ${r.message}`);
    } else {
      console.log(pc.red("✗") + ` ${r.name}: ${r.message}`);
      hasFailure = true;
    }
  }

  if (hasFailure) {
    process.exit(1);
  }
}
