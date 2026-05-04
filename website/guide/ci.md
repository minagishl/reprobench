# CI Usage

## Check CI

Run lint, format check, typecheck, and tests on every push and pull request:

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

## Benchmark CI

Run benchmarks, guard against regressions, and generate a report:

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
      - run: nix develop --command pnpm reprobench report
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: benchmark-report
          path: bench/results/report.md
```

If `environment.manager` is set to `"nix"`, Reprobench itself will enter the configured Nix dev shell before running each benchmark task — no need to wrap the `run` step manually.

## Using `environment.manager: "nix"` in CI

When your config uses the nix manager, the workflow can be simplified:

```yaml
- run: nix develop --command pnpm reprobench run
- run: nix develop --command pnpm reprobench guard
```

Reprobench will call `nix develop <flake>#<shell> --command bash -lc "<command>"` internally for each task. The outer `nix develop` just provides the build tools needed to run reprobench itself.
