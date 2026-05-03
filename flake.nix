{
  description = "reprobench - Reproducible benchmark runner powered by Nix flakes";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        package = pkgs.buildNpmPackage {
          pname = "reprobench";
          version = "0.1.0";
          src = ./.;
          npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
          buildPhase = "npm run build";
          installPhase = ''
            mkdir -p $out
            cp -r dist $out/
            cp package.json $out/
            mkdir -p $out/bin
            echo '#!/usr/bin/env node' > $out/bin/reprobench
            echo "require('$out/dist/cli.js')" >> $out/bin/reprobench
            chmod +x $out/bin/reprobench
          '';
        };
      in
      {
        packages.default = package;

        apps.default = {
          type = "app";
          program = "${package}/bin/reprobench";
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            pnpm
            git
          ];
          shellHook = ''
            echo "reprobench dev environment"
            echo "Node.js: $(node --version)"
            echo "pnpm: $(pnpm --version)"
          '';
        };

        formatter = pkgs.nixfmt-rfc-style;
      });
}
