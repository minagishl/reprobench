import { z } from "zod";

export type BenchmarkUnit = "bytes" | "ops/s" | "ms" | "s" | "count" | string;
export type BenchmarkDirection = "lower-is-better" | "higher-is-better";

export interface BenchmarkEntry {
  name: string;
  group?: string;
  value: number;
  unit: BenchmarkUnit;
  direction?: BenchmarkDirection;
  metadata?: Record<string, unknown>;
}

export interface BenchmarkResult {
  project?: string;
  timestamp?: string;
  environment?: Record<string, unknown>;
  benchmarks: BenchmarkEntry[];
}

export interface BenchmarkComparison {
  name: string;
  group?: string;
  unit: BenchmarkUnit;
  baseline: number;
  current: number;
  delta: number;
  deltaPercent: number | null;
  direction: BenchmarkDirection;
  improved: boolean;
}

export const BenchmarkEntrySchema = z.object({
  name: z.string(),
  group: z.string().optional(),
  value: z.number(),
  unit: z.string(),
  direction: z.enum(["lower-is-better", "higher-is-better"]).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const BenchmarkResultSchema = z.object({
  project: z.string().optional(),
  timestamp: z.string().optional(),
  environment: z.record(z.unknown()).optional(),
  benchmarks: z.array(BenchmarkEntrySchema),
});

const TaskConfigSchema = z.object({
  command: z.string(),
  output: z.string(),
});

const EnvironmentConfigSchema = z.object({
  manager: z.string().default("local"),
});

const CompareConfigSchema = z.object({
  baseline: z.string(),
  current: z.string(),
});

const ReportConfigSchema = z.object({
  input: z.string(),
  output: z.string(),
});

const GuardEntrySchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string(),
});

const GuardsConfigSchema = z.object({
  benchmarks: z.record(GuardEntrySchema).optional(),
});

export const ReprobenchConfigSchema = z.object({
  $schema: z.string().optional(),
  project: z.string(),
  environment: EnvironmentConfigSchema.optional(),
  tasks: z.record(TaskConfigSchema).optional(),
  compare: CompareConfigSchema.optional(),
  report: ReportConfigSchema.optional(),
  guards: GuardsConfigSchema.optional(),
});

export type ReprobenchConfig = z.infer<typeof ReprobenchConfigSchema>;
export type TaskConfig = z.infer<typeof TaskConfigSchema>;
export type GuardEntry = z.infer<typeof GuardEntrySchema>;
