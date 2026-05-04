---
layout: home

hero:
  name: "Reprobench"
  text: "Reproducible Benchmark Runner"
  tagline: Powered by Nix flakes. Pin your environment, trust your numbers.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/minagishl/reprobench

features:
  - icon: ❄️
    title: Pinned Environments
    details: Run benchmarks inside a Nix dev shell. Every run uses the exact same toolchain — no more "it was faster on my machine."
  - icon: 📦
    title: Structured Results
    details: Benchmark output is stored as JSON. Easy to diff, archive, and feed into any downstream tool.
  - icon: 📊
    title: Comparison
    details: Compare current results against a baseline with percentage deltas and direction-aware pass/fail indicators.
  - icon: 📝
    title: Markdown Reports
    details: Generate formatted tables ready to paste into GitHub READMEs or pull request descriptions.
  - icon: 🛡️
    title: CI Guards
    details: Define min/max thresholds per benchmark. Exit with code 1 on regression — perfect for CI pipelines.
  - icon: 🚀
    title: Nix-native Distribution
    details: Install nothing. Run reprobench directly via `nix run github:minagishl/reprobench`.
---
