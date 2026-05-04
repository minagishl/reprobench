# Commands

## `reprobench init`

Initialize `reprobench.config.json` in the current directory and create the `bench/results/` output directory.

```bash
reprobench init
reprobench init --force   # overwrite an existing config
```

**Options:**

| Option    | Description                                             |
| --------- | ------------------------------------------------------- |
| `--force` | Overwrite `reprobench.config.json` if it already exists |

**Output:**

```
✓ Created reprobench.config.json
✓ Created bench/results/
```

The generated config is a minimal starting point. Edit it to point `tasks.bench.command` at your actual benchmark script.

## `reprobench run`

Execute all benchmark tasks defined in the config. Each task's stdout is captured and saved as JSON (or raw text if the output is not valid JSON).

```bash
reprobench run
```

**What it does:**

1. Reads `reprobench.config.json`
2. For each task, runs the command:
   - If `environment.manager` is `"local"`: runs the command directly via the shell
   - If `environment.manager` is `"nix"`: wraps the command as `nix develop <flake>#<shell> --command bash -lc "<command>"`
3. Captures stdout and tries to parse it as JSON
4. Saves the result to `task.output`
5. Exits with code 1 if any task fails

**Example output:**

```
→ Running task: bench
  Command: node bench.js
✓ Task "bench" succeeded → bench/results/latest.json
```

**If a task fails:**

```
→ Running task: bench
  Command: node bench.js
✗ Task "bench" failed (exit 1)
[stderr output here]
```

::: warning
Only write JSON to stdout in your benchmark script. Anything else (logs, progress bars) must go to stderr, otherwise the result file will fail to parse.
:::

## `reprobench compare [baseline] [current]`

Compare two benchmark result files and print percentage deltas for each benchmark.

```bash
reprobench compare                                    # uses compare.baseline / compare.current from config
reprobench compare baseline.json latest.json          # explicit paths
reprobench compare --json                             # output as JSON
```

**Options:**

| Option       | Description                                             |
| ------------ | ------------------------------------------------------- |
| `--json`     | Output the comparison as JSON instead of formatted text |
| `[baseline]` | Path to the baseline result file (overrides config)     |
| `[current]`  | Path to the current result file (overrides config)      |

**Text output:**

Results are grouped by the `group` field and sorted. Improved benchmarks show `✓`, regressions show `✗`.

```
size
✓ single-small: 166 -> 139 bytes (-16.27%)

speed
✓ encode batch: 7700 -> 16000 ops/s (+107.79%)
```

Direction is inferred from the unit:

- `bytes`, `ms`, `s` — lower is better (so a decrease is `✓`)
- `ops/s`, `count` — higher is better (so an increase is `✓`)

**JSON output (`--json`):**

```json
{
  "comparisons": [
    {
      "name": "single-small",
      "group": "size",
      "unit": "bytes",
      "baseline": 166,
      "current": 139,
      "delta": -27,
      "deltaPercent": -16.27,
      "direction": "lower-is-better",
      "improved": true
    },
    {
      "name": "encode batch",
      "group": "speed",
      "unit": "ops/s",
      "baseline": 7700,
      "current": 16000,
      "delta": 8300,
      "deltaPercent": 107.79,
      "direction": "higher-is-better",
      "improved": true
    }
  ]
}
```

::: tip
Use `--json` in CI to feed comparison data into other tools or to post results as a PR comment.
:::

## `reprobench report`

Generate a Markdown table from a benchmark result file. Useful for pasting into GitHub PRs or READMEs.

```bash
reprobench report
reprobench report --input bench/results/latest.json --output report.md
```

**Options:**

| Option            | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| `--input <path>`  | Input result JSON file (overrides `report.input` from config) |
| `--output <path>` | Output Markdown file (overrides `report.output` from config)  |

**Example output (`report.md`):**

```markdown
## Benchmark Results

| group | benchmark    |  value | unit  |
| ----- | ------------ | -----: | ----- |
| size  | single-small |    139 | bytes |
| speed | encode batch | 16,000 | ops/s |
```

Numbers are locale-formatted (e.g. `16,000` instead of `16000`). Results are sorted by group, then by name within each group.

## `reprobench guard`

Check guard conditions defined in the config. Exits with code 0 if all guards pass, code 1 if any fail. Designed for use in CI to catch regressions.

```bash
reprobench guard
```

Guards are evaluated against `compare.current` (or `report.input` if `compare.current` is not set).

**Example output:**

```
✓ single-small: 11 bytes <= 50 bytes
✓ encode batch: 1292275 ops/s >= 100000 ops/s
```

**On failure:**

```
✓ single-small: 11 bytes <= 50 bytes
✗ encode batch: 8000 ops/s < 100000 ops/s
```

Exits with code 1, failing the CI step.

**Guard configuration:**

```json
"guards": {
  "benchmarks": {
    "single-small": { "max": 50,     "unit": "bytes" },
    "encode batch":  { "min": 100000, "unit": "ops/s" }
  }
}
```

- `max` — the benchmark value must be ≤ this number (use for `lower-is-better` metrics like size or latency)
- `min` — the benchmark value must be ≥ this number (use for `higher-is-better` metrics like throughput)

::: warning
Guard benchmark names must match the `name` field in your result JSON exactly (case-sensitive).
:::

## `reprobench doctor`

Validate the project's configuration and environment. Checks for common issues before running benchmarks.

```bash
reprobench doctor
```

**What it checks:**

- `reprobench.config.json` exists and passes schema validation
- Task commands are non-empty and output directories are writable
- `compare.baseline` and `compare.current` file paths are configured
- `report.input` and `report.output` paths are configured
- `flake.nix` and `flake.lock` exist (when `environment.manager` is `"nix"`)
- `package.json` has `lint`, `fmt`, and `check` scripts

**Example output:**

```
✓ Config file found: reprobench.config.json
✓ Config schema is valid
✓ Task "bench": command is set
✓ Task "bench": output directory exists (bench/results)
✓ compare.baseline is set
✓ compare.current is set
✓ report.input is set
✓ report.output is set
✓ flake.nix found
✓ flake.lock found
✓ environment.manager: nix
```

Exits with code 1 if any checks fail.
