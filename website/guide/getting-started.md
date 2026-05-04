# Getting Started

## Installation

Add reprobench as a dev dependency:

```bash
pnpm add -D reprobench
```

Or install globally:

```bash
npm install -g reprobench
```

Or run without installing via Nix:

```bash
nix run github:minagishl/reprobench -- --help
```

## Quick Start

```bash
pnpm add -D reprobench
pnpm reprobench init
pnpm reprobench run
pnpm reprobench compare
pnpm reprobench report
```

## Initialize a project

Run `reprobench init` in your project root to generate `reprobench.config.json` and create the `bench/results/` directory:

```bash
reprobench init
reprobench init --force            # overwrite existing config
reprobench init --manager nix      # force Nix manager
reprobench init --manager local    # force local manager
```

If `flake.nix` is present, `reprobench init` automatically defaults to `manager: "nix"`. Otherwise it falls back to `manager: "local"`.

With a `flake.nix`, this creates:

```json
{
  "$schema": "https://reprobench.dev/schema.json",
  "project": "my-library",
  "environment": {
    "manager": "nix",
    "flake": ".",
    "shell": "default"
  },
  "tasks": {
    "bench": {
      "command": "pnpm bench",
      "output": "bench/results/latest.json"
    }
  }
}
```

Your benchmark script should write JSON to stdout in the [benchmark result format](/reference/result-format).

## Next steps

- [Result Format](/reference/result-format) — write a benchmark script that reprobench can capture
- [Commands](/guide/commands) — detailed usage for `run`, `compare`, `guard`, `report`, and `doctor`
- [Configuration](/guide/configuration) — full config reference with all fields explained
- [Nix Integration](/guide/nix) — pin your environment with `environment.manager: "nix"`
- [CI Usage](/guide/ci) — add benchmark guards to your GitHub Actions workflow
