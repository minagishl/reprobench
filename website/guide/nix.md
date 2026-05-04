# Nix Integration

Reprobench is built around Nix flakes. Nix is used in three ways:

1. **Development environment** — a pinned dev shell for working on the project itself
2. **CI execution** — running benchmarks inside a reproducible Nix shell
3. **Distribution** — installing or running reprobench without npm

## Run without installing

Run reprobench directly from the GitHub flake without npm:

```bash
nix run github:minagishl/reprobench -- --help
nix run github:minagishl/reprobench -- init
nix run github:minagishl/reprobench -- run
nix run github:minagishl/reprobench -- compare baseline.json latest.json
```

This uses the `apps.default` output from the flake. No global install, no version conflicts.

## Development shell

The flake provides a dev shell with Node.js 22, pnpm, and git:

```bash
nix develop          # enter the dev shell
pnpm install         # install dependencies
pnpm check           # lint + format check + test + build
```

You can also run one-off commands without entering the shell:

```bash
nix develop --command pnpm check
nix develop --command pnpm build
```

## Build and verify

Build the package from source:

```bash
nix build
./result/bin/reprobench --help
```

Run all flake checks (equivalent to a full CI build):

```bash
nix flake check
```

## Run benchmarks inside the Nix dev shell

This is the most important Nix feature in reprobench: setting `environment.manager` to `"nix"` makes `reprobench run` wrap each task in `nix develop` automatically.

### Why this matters

When you run a benchmark on a machine, the result depends on:

- The Node.js version
- The pnpm version
- Native compiler versions (if your code uses native addons)
- OS-level toolchain

Without pinning, two machines — or the same machine after an update — may produce different numbers.

With `environment.manager: "nix"`, every benchmark runs inside the exact dev shell defined by your `flake.nix`. The hash in `flake.lock` guarantees bit-for-bit reproducibility across machines.

### Configuration

```json
{
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

Given the config above, `reprobench run` executes:

```bash
nix develop .#default --command bash -lc "pnpm bench"
```

The `bash -lc` wrapper ensures the command is interpreted by a login shell, so shell functions and PATH entries from `shellHook` are available.

### `flake` and `shell` fields

| Field   | Default     | Description                                                                                                             |
| ------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `flake` | `"."`       | Path or URL to the flake containing the dev shell. Can be `"."`, `"../.."`, or a remote flake like `"github:org/repo"`. |
| `shell` | `"default"` | The `devShells.<system>.<name>` output to use.                                                                          |

For a project at `examples/simple-nix/` referencing the root flake:

```json
"environment": {
  "manager": "nix",
  "flake": "../..",
  "shell": "default"
}
```

### stdout must be clean

When the dev shell starts, the `shellHook` runs. Make sure your `shellHook` writes only to **stderr**, not stdout, otherwise its output will be mixed into the benchmark result JSON and cause a parse error.

```nix
shellHook = ''
  echo "dev environment ready" >&2   # ✓ stderr
  echo "Node.js: $(node --version)" >&2
'';
```

## How reprobench itself is packaged with Nix

Reprobench uses `pkgs.fetchPnpmDeps` + `pkgs.pnpmConfigHook` to build natively from `pnpm-lock.yaml` — no `package-lock.json` required:

```nix
package = pkgs.stdenv.mkDerivation (finalAttrs: {
  pname = "reprobench";
  version = "0.2.0";
  src = ./.;

  nativeBuildInputs = [ nodejs pkgs.pnpm pkgs.pnpmConfigHook ];

  pnpmDeps = pkgs.fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    fetcherVersion = 3;
    hash = "sha256-...";
  };

  buildPhase = "pnpm run build";

  installPhase = ''
    mkdir -p $out/lib/reprobench $out/bin
    cp -r dist node_modules package.json $out/lib/reprobench/
    cat > $out/bin/reprobench <<EOF
#!/usr/bin/env bash
exec ${nodejs}/bin/node $out/lib/reprobench/dist/cli.js "\$@"
EOF
    chmod +x $out/bin/reprobench
  '';
});
```

The CLI wrapper is an ESM-safe bash script (not `require()`), so it works correctly with `"type": "module"` packages.
