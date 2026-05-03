# Reprobench

Reprobench is a reproducible benchmark runner powered by Nix flakes.

It helps you run, compare, guard, and publish benchmark results from pinned development environments.

## Why Reprobench?

Benchmark results are only meaningful when run in a consistent environment. Reprobench ties together:

- **Pinned environments** via Nix flakes — no more "it was faster on my machine"
- **Structured results** — benchmarks are stored as JSON for easy diffing and archiving
- **Comparison** — compare current results against a baseline with percentage deltas
- **Markdown reports** — generate tables ready to paste into GitHub READMEs or PRs
- **CI guards** — detect performance or size regressions automatically
- **Extensible** — designed to support multiple runtimes, languages, and environments

## Installation

```bash
pnpm add -D reprobench
```

Or install globally:

```bash
npm install -g reprobench
```

## Quick Start

```bash
pnpm add -D reprobench
pnpm reprobench init
pnpm reprobench run
pnpm reprobench compare
pnpm reprobench report
```

## Commands

### `reprobench init`

Initialize a `reprobench.config.json` in the current directory.

```bash
reprobench init
reprobench init --force   # overwrite existing config
```

Also creates the `bench/results/` directory.

### `reprobench run`

Run all benchmark tasks defined in the config.

```bash
reprobench run
```

Each task's stdout is saved as JSON (or raw text) to the configured output path.

### `reprobench compare [baseline] [current]`

Compare two benchmark result files.

```bash
reprobench compare          # uses config paths
reprobench compare bench/results/baseline.json bench/results/latest.json
reprobench compare --json   # JSON output
```

Example output:

```
size
✓ single-small: 166 -> 139 bytes (-16.27%)

speed
✓ encode batch: 7700 -> 16000 ops/s (+107.79%)
```

### `reprobench report`

Generate a Markdown report from benchmark results.

```bash
reprobench report
reprobench report --input bench/results/latest.json --output bench/results/report.md
```

Example output:

```markdown
## Benchmark Results

| group | benchmark    |  value | unit  |
| ----- | ------------ | -----: | ----- |
| size  | single-small |    139 | bytes |
| speed | encode batch | 16,000 | ops/s |
```

### `reprobench guard`

Check guard conditions. Exits with code 1 if any guard fails.

```bash
reprobench guard
```

Example output:

```
✓ single-small: 139 bytes <= 200 bytes
✗ encode batch: 12000 ops/s < 14000 ops/s
```

### `reprobench doctor`

Check the project configuration and environment.

```bash
reprobench doctor
```

Verifies config existence, schema validity, file paths, `package.json` scripts, and more.

## Configuration

`reprobench.config.json`:

```json
{
  "$schema": "https://reprobench.dev/schema.json",
  "project": "my-library",
  "environment": {
    "manager": "local"
  },
  "tasks": {
    "bench": {
      "command": "pnpm bench",
      "output": "bench/results/latest.json"
    }
  },
  "compare": {
    "baseline": "bench/results/baseline.json",
    "current": "bench/results/latest.json"
  },
  "report": {
    "input": "bench/results/latest.json",
    "output": "bench/results/report.md"
  },
  "guards": {
    "benchmarks": {
      "encode batch": {
        "min": 14000,
        "unit": "ops/s"
      },
      "single-small": {
        "max": 200,
        "unit": "bytes"
      }
    }
  }
}
```

## Benchmark Result Format

Benchmark tasks should output JSON to stdout in this format:

```json
{
  "project": "my-library",
  "timestamp": "2024-01-01T00:00:00Z",
  "benchmarks": [
    {
      "name": "encode single-small",
      "group": "speed",
      "value": 16038,
      "unit": "ops/s"
    },
    {
      "name": "batch-homogeneous-256",
      "group": "size",
      "value": 5316,
      "unit": "bytes"
    }
  ]
}
```

### Supported units and directions

| Unit    | Direction        |
| ------- | ---------------- |
| bytes   | lower-is-better  |
| ms      | lower-is-better  |
| s       | lower-is-better  |
| ops/s   | higher-is-better |
| count   | higher-is-better |
| (other) | higher-is-better |

You can override the direction per entry using the `direction` field:

```json
{
  "name": "my-bench",
  "value": 42,
  "unit": "custom",
  "direction": "lower-is-better"
}
```

## CI Usage

### Check CI

```yaml
name: Check

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: DeterminateSystems/nix-installer-action@main
      - run: nix develop --command pnpm install --frozen-lockfile
      - run: nix develop --command pnpm check
```

### Benchmark CI

```yaml
name: Benchmark

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: DeterminateSystems/nix-installer-action@main
      - run: nix develop --command pnpm install --frozen-lockfile
      - run: nix develop --command pnpm reprobench run
      - run: nix develop --command pnpm reprobench guard
```

## Nix Usage

This project provides a Nix flake for reproducible development:

```bash
nix develop
pnpm install
pnpm check
```

The dev shell includes Node.js 22, pnpm, and git.

## Formatter / Linter

This project uses Oxc tools for formatting and linting.

- Formatter: [Oxfmt](https://github.com/nickel-lang/oxfmt)
- Linter: [Oxlint](https://oxc.rs/docs/guide/usage/linter)

```bash
pnpm fmt
pnpm fmt:check
pnpm lint
pnpm lint:fix
```

No Biome, ESLint, or Prettier configuration files are present in this project.

## Example Output

### Compare

```
size
✓ single-small: 166 -> 139 bytes (-16.27%)

speed
✓ encode batch: 7700 -> 16000 ops/s (+107.79%)
```

### Report (Markdown)

```markdown
## Benchmark Results

| group | benchmark    |  value | unit  |
| ----- | ------------ | -----: | ----- |
| size  | single-small |    139 | bytes |
| speed | encode batch | 16,000 | ops/s |
```

### Compare JSON

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
    }
  ]
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
