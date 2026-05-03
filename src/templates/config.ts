import type { ReprobenchConfig } from "../core/schema.js";

export function getDefaultConfig(projectName: string = "my-library"): ReprobenchConfig {
  return {
    $schema: "https://reprobench.dev/schema.json",
    project: projectName,
    environment: {
      manager: "local",
    },
    tasks: {
      bench: {
        command: "pnpm bench",
        output: "bench/results/latest.json",
      },
    },
    compare: {
      baseline: "bench/results/baseline.json",
      current: "bench/results/latest.json",
    },
    report: {
      input: "bench/results/latest.json",
      output: "bench/results/report.md",
    },
    guards: {},
  };
}
