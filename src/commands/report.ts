import pc from "picocolors";
import { loadConfig } from "../core/config.js";
import { readJsonFile, writeTextFile } from "../core/fs.js";
import { generateResultMarkdown } from "../core/report.js";
import { parseBenchmarkResult } from "../core/result.js";

export interface ReportOptions {
  input?: string;
  output?: string;
}

export async function runReport(options: ReportOptions = {}): Promise<void> {
  let inputPath: string;
  let outputPath: string;

  if (options.input && options.output) {
    inputPath = options.input;
    outputPath = options.output;
  } else {
    const config = await loadConfig();
    if (!config.report) {
      console.error(
        pc.red(
          "No report configuration found. Provide --input and --output or set report in config.",
        ),
      );
      process.exit(1);
    }
    inputPath = options.input ?? config.report!.input;
    outputPath = options.output ?? config.report!.output;
  }

  const raw = await readJsonFile<unknown>(inputPath);
  const result = parseBenchmarkResult(raw);

  const markdown = generateResultMarkdown(result);
  await writeTextFile(outputPath, markdown);

  console.log(pc.green("✓") + ` Report written to ${outputPath}`);
}
