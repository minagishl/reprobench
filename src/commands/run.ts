import { execa } from "execa";
import pc from "picocolors";
import { loadConfig } from "../core/config.js";
import { writeJsonFile, writeTextFile } from "../core/fs.js";

export async function runBench(): Promise<void> {
  const config = await loadConfig();

  if (!config.tasks || Object.keys(config.tasks).length === 0) {
    console.error(pc.yellow("No tasks defined in reprobench.config.json"));
    process.exit(1);
  }

  let hasFailure = false;

  for (const [name, task] of Object.entries(config.tasks ?? {})) {
    console.log(pc.cyan(`→`) + ` Running task: ${name}`);
    console.log(`  Command: ${task.command}`);

    try {
      const result = await execa(task.command, {
        shell: true,
        reject: false,
      });

      if (result.exitCode !== 0) {
        console.error(pc.red(`✗`) + ` Task "${name}" failed (exit ${result.exitCode})`);
        if (result.stderr) {
          console.error(result.stderr);
        }
        hasFailure = true;
        continue;
      }

      const stdout = result.stdout.trim();

      try {
        const parsed = JSON.parse(stdout) as unknown;
        await writeJsonFile(task.output, parsed);
        console.log(pc.green("✓") + ` Task "${name}" succeeded → ${task.output}`);
      } catch {
        await writeTextFile(task.output, stdout + "\n");
        console.log(pc.green("✓") + ` Task "${name}" succeeded (raw output) → ${task.output}`);
      }
    } catch (err) {
      console.error(pc.red(`✗`) + ` Task "${name}" error: ${String(err)}`);
      hasFailure = true;
    }
  }

  if (hasFailure) {
    process.exit(1);
  }
}
