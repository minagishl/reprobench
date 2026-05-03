import { readFile } from "node:fs/promises";
import { join } from "node:path";
import pc from "picocolors";
import { ReprobenchConfigSchema } from "../core/schema.js";
import { fileExists } from "../core/fs.js";

function ok(msg: string): void {
  console.log(pc.green("✓") + " " + msg);
}

function warn(msg: string): void {
  console.log(pc.yellow("⚠") + " " + msg);
}

function fail(msg: string): void {
  console.log(pc.red("✗") + " " + msg);
}

export async function runDoctor(): Promise<void> {
  const cwd = process.cwd();
  let hasError = false;

  // Check reprobench.config.json exists
  const configPath = join(cwd, "reprobench.config.json");
  if (!(await fileExists(configPath))) {
    fail("reprobench.config.json not found");
    hasError = true;
    console.log("\nDoctor found issues. Run: reprobench init");
    process.exit(1);
  }
  ok("reprobench.config.json exists");

  // Parse and validate config
  let config: ReturnType<typeof ReprobenchConfigSchema.parse> | null = null;
  try {
    const raw = await readFile(configPath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    const result = ReprobenchConfigSchema.safeParse(parsed);
    if (result.success) {
      config = result.data;
      ok("Config schema is valid");
    } else {
      fail("Config schema is invalid");
      hasError = true;
    }
  } catch {
    fail("Failed to parse reprobench.config.json");
    hasError = true;
  }

  if (config) {
    // Check tasks
    if (config.tasks && Object.keys(config.tasks).length > 0) {
      ok("tasks are defined");

      // Check output directories
      for (const [name, task] of Object.entries(config.tasks)) {
        const dir = join(cwd, task.output).replace(/\/[^/]+$/, "");
        if (await fileExists(dir)) {
          ok(`Output directory exists: ${task.output}`);
        } else {
          warn(`Output directory missing for task "${name}": ${task.output}`);
        }
      }
    } else {
      warn("No tasks defined");
    }

    // Check compare paths
    if (config.compare) {
      if (await fileExists(join(cwd, config.compare.baseline))) {
        ok(`Baseline file exists: ${config.compare.baseline}`);
      } else {
        warn(`Baseline file not found: ${config.compare.baseline}`);
      }

      if (await fileExists(join(cwd, config.compare.current))) {
        ok(`Current file exists: ${config.compare.current}`);
      } else {
        warn(`Current file not found: ${config.compare.current}`);
      }
    } else {
      warn("No compare configuration defined");
    }

    // Check report path
    if (config.report) {
      if (await fileExists(join(cwd, config.report.input))) {
        ok(`Report input file exists: ${config.report.input}`);
      } else {
        warn(`Report input file not found: ${config.report.input}`);
      }
    } else {
      warn("No report configuration defined");
    }
  }

  // Check Nix files
  if (await fileExists(join(cwd, "flake.nix"))) {
    ok("flake.nix exists");
  } else {
    warn("flake.nix not found");
  }

  if (await fileExists(join(cwd, "flake.lock"))) {
    ok("flake.lock exists");
  } else {
    warn("flake.lock not found — run: nix develop");
  }

  // Check environment.manager
  if (config) {
    const manager = config.environment?.manager ?? "local";
    ok(`environment.manager: ${manager}`);
    if (manager === "nix") {
      const flake = config.environment?.flake ?? ".";
      const shell = config.environment?.shell ?? "default";
      ok(`Nix flake: ${flake}#${shell}`);
    }
  }

  // Check package.json and devDependencies
  const pkgPath = join(cwd, "package.json");
  if (await fileExists(pkgPath)) {
    ok("package.json exists");

    try {
      const raw = await readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(raw) as {
        devDependencies?: Record<string, string>;
        scripts?: Record<string, string>;
      };

      if (pkg.devDependencies?.["oxlint"]) {
        ok("oxlint is in devDependencies");
      } else {
        fail("oxlint is NOT in devDependencies");
        hasError = true;
      }

      if (pkg.devDependencies?.["oxfmt"]) {
        ok("oxfmt is in devDependencies");
      } else {
        fail("oxfmt is NOT in devDependencies");
        hasError = true;
      }

      const requiredScripts = ["lint", "lint:fix", "fmt", "fmt:check", "check"];
      for (const script of requiredScripts) {
        if (pkg.scripts?.[script]) {
          ok(`Script "${script}" is defined`);
        } else {
          fail(`Script "${script}" is missing`);
          hasError = true;
        }
      }
    } catch {
      fail("Failed to parse package.json");
      hasError = true;
    }
  } else {
    fail("package.json not found");
    hasError = true;
  }

  console.log("");
  if (hasError) {
    console.log(pc.red("Doctor found issues."));
    process.exit(1);
  } else {
    console.log(pc.green("All checks passed!"));
  }
}
