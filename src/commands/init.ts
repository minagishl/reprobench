import { join } from "node:path";
import pc from "picocolors";
import { fileExists, ensureDir, writeJsonFile } from "../core/fs.js";
import { getDefaultConfig } from "../templates/config.js";

export interface InitOptions {
  force?: boolean;
  manager?: "nix" | "local";
}

export async function runInit(options: InitOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const configPath = join(cwd, "reprobench.config.json");

  if (!options.force && (await fileExists(configPath))) {
    console.error(pc.yellow(`reprobench.config.json already exists. Use --force to overwrite.`));
    process.exit(1);
  }

  let manager: "nix" | "local";
  if (options.manager) {
    manager = options.manager;
  } else {
    manager = (await fileExists(join(cwd, "flake.nix"))) ? "nix" : "local";
  }

  const config = getDefaultConfig(undefined, manager);
  await writeJsonFile(configPath, config);
  await ensureDir(join(cwd, "bench/results"));

  console.log(pc.green("✓") + " Created reprobench.config.json");
  console.log(pc.green("✓") + " Created bench/results/ directory");
  console.log("");
  console.log("Next steps:");
  console.log("  " + pc.cyan("reprobench run") + "     - Run benchmark tasks");
  console.log("  " + pc.cyan("reprobench compare") + "  - Compare with baseline");
  console.log("  " + pc.cyan("reprobench report") + "   - Generate Markdown report");
  console.log("  " + pc.cyan("reprobench guard") + "    - Check guard conditions");
}
