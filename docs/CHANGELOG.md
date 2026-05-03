# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- `release.yml` — switched publish step from `pnpm publish` to `npm publish` since pnpm does not support npm Trusted Publishing OIDC token exchange; added `npm install -g npm@latest` to ensure the latest npm is used

[Unreleased]: https://github.com/minagishl/reprobench/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/minagishl/reprobench/releases/tag/v0.1.0
