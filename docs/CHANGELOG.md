# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `.github/workflows/codeql.yml` — CodeQL static analysis for JavaScript/TypeScript on push, pull request, and weekly schedule
- `tsconfig.json` — added `"types": ["node"]` for TypeScript 6.0 compatibility
- `vite` — added to devDependencies to satisfy vitest v4 peer dependency
- `reprobench init --manager <nix|local>` — explicit manager selection flag
- `reprobench init` auto-detection — if `flake.nix` exists in cwd, defaults to `manager: "nix"`; otherwise falls back to `manager: "local"`

### Changed

- `package.json` — updated all dependencies to latest versions (commander v14, zod v4, typescript v6, vitest v4, etc.)
- `src/core/schema.ts` — updated `z.record()` calls to `z.record(z.string(), ...)` for Zod v4 compatibility
- README and docs — `manager: "nix"` is now the primary example; `manager: "local"` documented as fallback

## [0.2.0] - 2026-05-04

### Added

- `examples/simple-nix/` — new example that exercises `environment.manager: "nix"`, running `bench.js` via `nix develop` and guarding against regressions; includes `baseline.json` so `reprobench compare` works out of the box; validated in CI benchmark workflow
- `environment.manager: "nix"` support — `reprobench run` now wraps task commands with `nix develop <flake>#<shell> --command` when manager is set to `"nix"`
- `flake.nix` — added `packages.default` and `apps.default` to enable `nix run github:minagishl/reprobench`
- `examples/simple/bench.js` — real benchmark script measuring `TextEncoder` throughput and output size
- `reprobench doctor` now checks for `flake.lock` existence and reports `environment.manager` value
- `README.md` — added Nix-powered benchmark execution section with `environment.manager: "nix"` config example
- `README.md` — added `nix run github:minagishl/reprobench` usage to Nix Usage section

### Changed

- `flake.nix` — replaced `buildNpmPackage` with `fetchPnpmDeps` + `pnpmConfigHook` to package natively with pnpm (no `package-lock.json` required); fixed ESM wrapper to use `exec node` bash script instead of broken `require()`; updated `pnpmDeps` hash to correct value; redirected `shellHook` output to stderr so benchmark task stdout is not polluted when using `environment.manager: "nix"`; added `checks.default` to enable `nix flake check`
- `src/commands/run.ts` — `nix develop` command now wraps `task.command` with `bash -lc ${JSON.stringify(...)}` to safely handle commands containing spaces, pipes, or shell metacharacters
- `README.md` — removed incomplete JSON snippet from `Configuration` section that was cut off mid-block; updated `nix develop` example to show actual `bash -lc` form; added note in Benchmark CI section explaining that `environment.manager: "nix"` makes Reprobench enter the Nix dev shell automatically
- `.github/workflows/benchmark.yml` — added run and guard steps for `examples/simple-nix` to validate `environment.manager: "nix"` in CI
- `tsconfig.json` — disabled `sourceMap` and `declarationMap` to remove `.js.map` and `.d.ts.map` from published package (71 → 37 files)
- `examples/simple/reprobench.config.json` — replaced `echo` dummy command with `node bench.js`; added real guards (`single-small` max 50 bytes, `encode batch` min 100,000 ops/s); fixed `compare.current` and `report.input` to point to `bench/results/latest.json` instead of the static `latest.json`
- `src/core/schema.ts` — `environment.manager` is now `enum(["local", "nix"])` with optional `flake` and `shell` fields

### Fixed

- Fixed incorrect oxfmt link in `README.md`

## [0.1.0] - 2026-05-04

### Added

- `reprobench init` command to generate `reprobench.config.json` with `--force` flag support
- `reprobench run` command to execute benchmark tasks defined in config and save results as JSON
- `reprobench compare` command to compare two benchmark result files with `--json` output option
- `reprobench report` command to generate Markdown tables from benchmark results
- `reprobench guard` command for CI regression detection with exit code support
- `reprobench doctor` command to validate configuration and environment setup
- Zod-based schema validation for config and benchmark result files
- Direction-aware comparison logic (`lower-is-better` / `higher-is-better`) inferred from unit
- Colored terminal output via picocolors
- Markdown report generation with locale-formatted numbers and comparison tables
- `flake.nix` for reproducible development environment with Node.js 22 and pnpm
- `.github/ISSUE_TEMPLATE/bug_report.yml` — Bug report form collecting description, reproduction steps, versions, and OS
- `.github/ISSUE_TEMPLATE/feature_request.yml` — Feature request form collecting motivation, proposal, and example usage
- `.github/ISSUE_TEMPLATE/config.yml` — Disables blank issues and redirects questions to Discussions
- `.github/PULL_REQUEST_TEMPLATE.md` — PR template with type of change, related issues, test plan, and checklist
- `.github/workflows/ci.yml` — CI workflow running lint, format check, typecheck, and test via Nix dev shell
- `.github/workflows/release.yml` — Release workflow publishing to npm via OIDC trusted publishing, using Nix dev shell for checks
- `.github/workflows/benchmark.yml` — Benchmark workflow running `reprobench run`, `guard`, and `report` via Nix dev shell on every PR and push
- `.gitignore` — Excludes `node_modules/`, `dist/`, `bench/results/`, and generated example files
- `package.json` `files` field — Limits npm publish to `dist/`, `LICENSE`, and `README.md` only
- `.oxlintrc.json` for oxlint configuration
- `.oxfmtrc.json` — oxfmt configuration with `semi: true` and `singleQuote: false`
- `.editorconfig` — Consistent editor settings across all file types
- `docs/CHANGELOG.md` — This changelog following the Keep a Changelog 1.1.0 format
- Example files under `examples/simple/` for quick start and testing
- 14 unit tests covering compare, report, and guard logic

### Fixed

- `benchmark.yml` — incorrect path resolution caused by combining `working-directory: examples/simple` with `node dist/cli.js`; replaced with `bash -c "cd examples/simple && node ../../dist/cli.js ..."`
- `flake.nix` — replaced removed `nodePackages.pnpm` with `pnpm` (top-level package) following nixpkgs upstream change
- `.gitignore` — added `!examples/**/reprobench.config.json` to prevent example config from being excluded, which caused CI to fail with "Config file not found"
- `release.yml` — switched publish step from `pnpm publish` to `npm publish` since pnpm does not support npm Trusted Publishing OIDC token exchange

### Changed

- `release.yml` — switched publish step to `npx --yes npm@latest publish` to avoid `npm install -g npm@latest` circular install failure

[Unreleased]: https://github.com/minagishl/reprobench/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/minagishl/reprobench/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/minagishl/reprobench/releases/tag/v0.1.0
