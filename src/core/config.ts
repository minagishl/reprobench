import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ReprobenchConfigSchema } from "./schema.js";
import type { ReprobenchConfig } from "./schema.js";

const CONFIG_FILE = "reprobench.config.json";

export async function loadConfig(cwd: string = process.cwd()): Promise<ReprobenchConfig> {
  const configPath = join(cwd, CONFIG_FILE);

  let raw: string;
  try {
    raw = await readFile(configPath, "utf-8");
  } catch {
    throw new Error(`Config file not found: ${configPath}\nRun "reprobench init" to create one.`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse ${CONFIG_FILE}: ${String(err)}`);
  }

  const result = ReprobenchConfigSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid config in ${CONFIG_FILE}:\n${issues}`);
  }

  return result.data;
}

export function getConfigPath(cwd: string = process.cwd()): string {
  return join(cwd, CONFIG_FILE);
}
