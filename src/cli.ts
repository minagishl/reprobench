#!/usr/bin/env node
import { Command, Option } from "commander";
import { runInit } from "./commands/init.js";
import { runBench } from "./commands/run.js";
import { runCompare } from "./commands/compare.js";
import { runReport } from "./commands/report.js";
import { runGuard } from "./commands/guard.js";
import { runDoctor } from "./commands/doctor.js";

const program = new Command();

program
  .name("reprobench")
  .description("Reproducible benchmark runner powered by Nix flakes")
  .version("0.2.0");

program
  .command("init")
  .description("Initialize reprobench.config.json")
  .option("--force", "Overwrite existing config")
  .addOption(
    new Option("--manager <manager>", "Environment manager (auto-detected if omitted)").choices([
      "nix",
      "local",
    ]),
  )
  .action(async (options: { force?: boolean; manager?: "nix" | "local" }) => {
    await runInit({ force: options.force, manager: options.manager }).catch((err: unknown) => {
      console.error(String(err));
      process.exit(1);
    });
  });

program
  .command("run")
  .description("Run benchmark tasks defined in config")
  .action(async () => {
    await runBench().catch((err: unknown) => {
      console.error(String(err));
      process.exit(1);
    });
  });

program
  .command("compare [baseline] [current]")
  .description("Compare two benchmark result files")
  .option("--json", "Output as JSON")
  .action(
    async (
      baseline: string | undefined,
      current: string | undefined,
      options: { json?: boolean },
    ) => {
      await runCompare(baseline, current, options).catch((err: unknown) => {
        console.error(String(err));
        process.exit(1);
      });
    },
  );

program
  .command("report")
  .description("Generate Markdown report from benchmark results")
  .option("--input <path>", "Input JSON file path")
  .option("--output <path>", "Output Markdown file path")
  .action(async (options: { input?: string; output?: string }) => {
    await runReport(options).catch((err: unknown) => {
      console.error(String(err));
      process.exit(1);
    });
  });

program
  .command("guard")
  .description("Check guard conditions for CI regression detection")
  .action(async () => {
    await runGuard().catch((err: unknown) => {
      console.error(String(err));
      process.exit(1);
    });
  });

program
  .command("doctor")
  .description("Check configuration and environment")
  .action(async () => {
    await runDoctor().catch((err: unknown) => {
      console.error(String(err));
      process.exit(1);
    });
  });

program.parse(process.argv);
