# Configuration

Reprobench is configured via `reprobench.config.json` in your project root. Run `reprobench init` to generate a starter file.

## Full example

```json
{
  "$schema": "https://reprobench.dev/schema.json",
  "project": "my-library",
  "environment": {
    "manager": "local"
  },
  "tasks": {
    "bench": {
      "command": "node bench.js",
      "output": "bench/results/latest.json"
    }
  },
  "compare": {
    "baseline": "baseline.json",
    "current": "bench/results/latest.json"
  },
  "report": {
    "input": "bench/results/latest.json",
    "output": "report.md"
  },
  "guards": {
    "benchmarks": {
      "encode batch": {
        "min": 100000,
        "unit": "ops/s"
      },
      "single-small": {
        "max": 50,
        "unit": "bytes"
      }
    }
  }
}
```

::: tip
Add `"$schema": "https://reprobench.dev/schema.json"` to get autocomplete and validation in editors that support JSON Schema (VS Code, JetBrains, etc.).
:::

## `project`

**Required.** A label for this project. Written into every result file.

```json
"project": "my-library"
```

## `environment`

Controls how benchmark tasks are executed.

```json
"environment": {
  "manager": "local"
}
```

| Field     | Type                 | Default     | Description                                              |
| --------- | -------------------- | ----------- | -------------------------------------------------------- |
| `manager` | `"local"` \| `"nix"` | `"local"`   | Execution environment                                    |
| `flake`   | string               | `"."`       | Nix flake path. Only used when `manager` is `"nix"`.     |
| `shell`   | string               | `"default"` | Nix dev shell name. Only used when `manager` is `"nix"`. |

### `manager: "local"`

Runs task commands directly in the current shell. No Nix involved. Suitable when your CI already pins the environment externally.

### `manager: "nix"`

Wraps each task command in `nix develop` before running it. This ensures the benchmark executes in the exact pinned toolchain defined by your `flake.nix`.

```json
"environment": {
  "manager": "nix",
  "flake": ".",
  "shell": "default"
}
```

Given a task with `"command": "pnpm bench"`, reprobench will execute:

```bash
nix develop .#default --command bash -lc "pnpm bench"
```

See [Nix Integration](/guide/nix) for more details.

## `tasks`

A map of named benchmark tasks. Each entry defines what to run and where to save the output.

```json
"tasks": {
  "bench": {
    "command": "node bench.js",
    "output": "bench/results/latest.json"
  }
}
```

| Field     | Type   | Required | Description                                                |
| --------- | ------ | -------- | ---------------------------------------------------------- |
| `command` | string | **Yes**  | Shell command to run. Must write benchmark JSON to stdout. |
| `output`  | string | **Yes**  | Path where the result JSON (or raw text) is saved.         |

You can define multiple tasks:

```json
"tasks": {
  "bench-node": {
    "command": "node bench.js",
    "output": "bench/results/node.json"
  },
  "bench-bun": {
    "command": "bun bench.js",
    "output": "bench/results/bun.json"
  }
}
```

All tasks are run in sequence when you call `reprobench run`.

## `compare`

Paths used by `reprobench compare` and `reprobench guard` when no explicit paths are given on the command line.

```json
"compare": {
  "baseline": "baseline.json",
  "current": "bench/results/latest.json"
}
```

| Field      | Type   | Description                                                          |
| ---------- | ------ | -------------------------------------------------------------------- |
| `baseline` | string | The reference result to compare against. Typically committed to git. |
| `current`  | string | The freshly generated result. Typically in `bench/results/`.         |

::: tip
`reprobench guard` reads `compare.current` to find the result file to check against your guard thresholds. Make sure `compare.current` points to the same file your task writes to.
:::

## `report`

Paths used by `reprobench report`.

```json
"report": {
  "input": "bench/results/latest.json",
  "output": "report.md"
}
```

| Field    | Type   | Description                              |
| -------- | ------ | ---------------------------------------- |
| `input`  | string | Result file to generate the report from. |
| `output` | string | Where to write the Markdown report.      |

## `guards`

Guards define pass/fail thresholds for individual benchmarks. `reprobench guard` checks each named benchmark from the result file and exits with code 1 if any condition is violated.

```json
"guards": {
  "benchmarks": {
    "single-small": {
      "max": 50,
      "unit": "bytes"
    },
    "encode batch": {
      "min": 100000,
      "unit": "ops/s"
    }
  }
}
```

| Field  | Type   | Description                                                          |
| ------ | ------ | -------------------------------------------------------------------- |
| `min`  | number | The value must be **at least** this. Use for throughput, count, etc. |
| `max`  | number | The value must be **at most** this. Use for size, latency, etc.      |
| `unit` | string | Must match the `unit` field in the result file exactly.              |

You can set both `min` and `max` on a single benchmark to define a valid range.

::: warning
Guard names must match the `name` field in your benchmark result exactly (case-sensitive). If the benchmark is not found in the result file, the guard will fail.
:::

## Supported units and directions

The direction of a benchmark determines what "improved" means when comparing. Direction is inferred from the unit unless you override it in the result JSON.

| Unit          | Inferred direction |
| ------------- | ------------------ |
| `bytes`       | lower-is-better    |
| `ms`          | lower-is-better    |
| `s`           | lower-is-better    |
| `ops/s`       | higher-is-better   |
| `count`       | higher-is-better   |
| _(any other)_ | higher-is-better   |

To override for a specific benchmark, add `"direction"` to the result entry:

```json
{
  "name": "startup-time",
  "value": 120,
  "unit": "ms",
  "direction": "lower-is-better"
}
```
