{
  description = "reprobench - Reproducible benchmark runner powered by Nix flakes";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        nodejs = pkgs.nodejs_22;
        package = pkgs.stdenv.mkDerivation (finalAttrs: {
          pname = "reprobench";
          version = "0.3.0";
          src = ./.;

          nativeBuildInputs = [
            nodejs
            pkgs.pnpm
            pkgs.pnpmConfigHook
          ];

          pnpmDeps = pkgs.fetchPnpmDeps {
            inherit (finalAttrs) pname version src;
            fetcherVersion = 3;
            hash = "sha256-eTcPicwR+V118lnmoso9oC+wxotF+WpW5dfuKydIuAQ=";
          };

          buildPhase = ''
            pnpm run build
          '';

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
      in
      {
        packages.default = package;

        checks.default = package;

        apps.default = {
          type = "app";
          program = "${package}/bin/reprobench";
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [
            nodejs
            pkgs.pnpm
            pkgs.git
          ];
          shellHook = ''
            echo "reprobench dev environment" >&2
            echo "Node.js: $(node --version)" >&2
            echo "pnpm: $(pnpm --version)" >&2
          '';
        };

        formatter = pkgs.nixfmt-rfc-style;
      }
    );
}
