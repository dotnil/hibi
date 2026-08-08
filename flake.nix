{
  description = "todo-vue";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
      nodejs = pkgs.nodejs_24;
    in {
      devShells.default = pkgs.mkShell {
        packages = [
          nodejs
        ];
      };

      packages.default = pkgs.buildNpmPackage {
        pname = "todo-vue";
        version = "0.0.0";

        src = self;
        inherit nodejs;

        npmDepsHash = "sha256-ge1pNtmZhySvUmN1EXYsHfkoacMYVCVXhDlZAKxT5NU=";

        installPhase = ''
          runHook preInstall
          mkdir -p "$out"
          cp -r dist/. "$out/"
          runHook postInstall
        '';
      };
    });
}
