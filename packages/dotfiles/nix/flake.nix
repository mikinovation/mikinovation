# https://github.com/renovatebot/renovate/issues/29721
# Trick renovate into working: "github:NixOS/nixpkgs/nixpkgs-unstable"
{
  description = "Home Manager configuration";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
    nixos-wsl = {
      url = "github:nix-community/NixOS-WSL";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nix-darwin = {
      url = "github:nix-darwin/nix-darwin";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    mcp-servers-nix = {
      url = "github:natsukium/mcp-servers-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    agent-skills-nix = {
      url = "github:Kyure-A/agent-skills-nix";
    };
    anthropic-skills = {
      url = "github:anthropics/skills";
      flake = false;
    };
    vercel-skills = {
      url = "github:vercel-labs/skills";
      flake = false;
    };
    antfu-skills = {
      url = "github:antfu/skills";
      flake = false;
    };
    vuejs-ai-skills = {
      url = "github:vuejs-ai/skills";
      flake = false;
    };
    mattpocock-skills = {
      url = "github:mattpocock/skills";
      flake = false;
    };
    claude-code-plugins = {
      url = "github:anthropics/claude-code";
      flake = false;
    };
    herdr = {
      url = "github:ogulcancelik/herdr";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      nixos-wsl,
      nix-darwin,
      home-manager,
      mcp-servers-nix,
      agent-skills-nix,
      ...
    }:
    let
      linuxSystem = "x86_64-linux";
      darwinSystem = "aarch64-darwin";
      systems = [
        linuxSystem
        darwinSystem
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;

      # OS user to configure. It is read from the environment instead of being
      # written here, so the same outputs work for any user name. Reading the
      # environment requires `--impure` (setup.sh passes it):
      #   - DOTFILES_USER: explicit override
      #   - SUDO_USER: the invoking user under `sudo nixos-rebuild` / `sudo darwin-rebuild`
      #   - USER: the current user for standalone Home Manager
      # Pure evaluation (nix flake check, CI) sees none of them and falls back to
      # "nixos", the NixOS-WSL default user. "root" is skipped so a root shell
      # never configures root as the regular user.
      username =
        let
          candidates = builtins.filter (name: name != "" && name != "root") (
            map builtins.getEnv [
              "DOTFILES_USER"
              "SUDO_USER"
              "USER"
            ]
          );
        in
        if candidates == [ ] then "nixos" else builtins.head candidates;

      pkgsFor =
        system:
        import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

      mkExtraArgs =
        system:
        let
          pkgs = pkgsFor system;
        in
        {
          # Checkout location of this package. Modules that reference files in the
          # working tree at runtime (shell plugins, Claude Code hooks) derive their
          # paths from this so the location is defined in one place.
          dotfilesDir = "$HOME/ghq/github.com/mikinovation/mikinovation/packages/dotfiles";
          apm = pkgs.callPackage ./pkgs/apm.nix { };
          claudeCode = pkgs.callPackage ./pkgs/claude-code.nix { };
          vueLanguageServer = pkgs.callPackage ./pkgs/vue-language-server.nix { };
          vueTypescriptPlugin = pkgs.callPackage ./pkgs/vue-typescript-plugin.nix { };
          difit = pkgs.callPackage ./pkgs/difit.nix { };
          chromeDevtoolsMcp = pkgs.callPackage ./pkgs/chrome-devtools-mcp.nix { };
          headroom = pkgs.callPackage ./pkgs/headroom.nix { };
          tanteki = pkgs.callPackage ./pkgs/tanteki.nix { };
          yomiyasu = pkgs.callPackage ./pkgs/yomiyasu.nix { };
          checkTestIds = pkgs.callPackage ./pkgs/check-test-ids.nix { };
          herdr = inputs.herdr.packages.${system}.default;
        };

      homeManagerModules = [
        agent-skills-nix.homeManagerModules.default
        mcp-servers-nix.homeManagerModules.default
      ];

      lintApp =
        pkgs:
        pkgs.writeShellApplication {
          name = "lint";
          runtimeInputs = [
            pkgs.lua51Packages.luacheck
            pkgs.git
          ];
          text = ''
            echo "=== Running luacheck ==="
            luacheck .

            echo ""
            echo "=== Running secretlint ==="
            if [ -x "./node_modules/.bin/secretlint" ]; then
              git ls-files -z | xargs -0 ./node_modules/.bin/secretlint
            else
              echo "Warning: secretlint not found. Run 'npm ci' first."
              exit 1
            fi
          '';
        };
      fmtApp =
        pkgs:
        pkgs.writeShellApplication {
          name = "fmt";
          runtimeInputs = [ pkgs.stylua ];
          text = ''
            echo "=== Running stylua check ==="
            stylua --check .
          '';
        };
      testApp =
        pkgs:
        pkgs.writeShellApplication {
          name = "test";
          runtimeInputs = [ pkgs.lua51Packages.busted ];
          text = ''
            echo "=== Running busted tests ==="
            busted .
          '';
        };

      mkHomeConfig =
        {
          system,
          profile,
        }:
        home-manager.lib.homeManagerConfiguration {
          pkgs = pkgsFor system;
          modules = [ ./home.nix ] ++ homeManagerModules;
          extraSpecialArgs = (mkExtraArgs system) // {
            inherit inputs username profile;
          };
        };

      mkNixosConfig =
        hostname: profile:
        nixpkgs.lib.nixosSystem {
          system = linuxSystem;
          specialArgs = {
            inherit inputs username profile;
          };
          modules = [
            nixos-wsl.nixosModules.wsl
            ./nixos/configuration.nix
            home-manager.nixosModules.home-manager
            {
              networking.hostName = hostname;
              home-manager.useGlobalPkgs = true;
              home-manager.useUserPackages = true;
              home-manager.users.${username} = import ./home.nix;
              home-manager.extraSpecialArgs = (mkExtraArgs linuxSystem) // {
                inherit inputs username profile;
              };
              home-manager.sharedModules = homeManagerModules;
            }
          ];
        };

      mkDarwinConfig =
        hostname: profile:
        nix-darwin.lib.darwinSystem {
          system = darwinSystem;
          specialArgs = {
            inherit inputs username profile;
          };
          modules = [
            ./darwin/configuration.nix
            home-manager.darwinModules.home-manager
            {
              networking.hostName = hostname;
              networking.computerName = hostname;
              home-manager.useGlobalPkgs = true;
              home-manager.useUserPackages = true;
              home-manager.users.${username} = import ./home.nix;
              home-manager.extraSpecialArgs = (mkExtraArgs darwinSystem) // {
                inherit inputs username profile;
              };
              home-manager.sharedModules = homeManagerModules;
            }
          ];
        };
    in
    {
      # NixOS system configuration (WSL)
      nixosConfigurations = {
        nixos = mkNixosConfig "nixos" "full";
        nixos-minimal = mkNixosConfig "nixos" "minimal";

        wsl-bootstrap = nixpkgs.lib.nixosSystem {
          system = linuxSystem;
          modules = [
            nixos-wsl.nixosModules.wsl
            ./nixos/wsl-bootstrap.nix
          ];
        };
      };

      # nix-darwin system configuration (macOS)
      darwinConfigurations = {
        mac = mkDarwinConfig "mac" "full";
        mac-minimal = mkDarwinConfig "mac" "minimal";
      };

      # Home Manager configuration (standalone, non-NixOS Linux)
      homeConfigurations = {
        linux = mkHomeConfig {
          system = linuxSystem;
          profile = "full";
        };
        linux-minimal = mkHomeConfig {
          system = linuxSystem;
          profile = "minimal";
        };
      };

      # Nix formatter
      formatter = forAllSystems (system: (pkgsFor system).nixfmt-rfc-style);

      # Nix flake checks
      checks = {
        ${linuxSystem} = {
          home-manager-build = self.homeConfigurations.linux.activationPackage;
          nixos-build = self.nixosConfigurations.nixos.config.system.build.toplevel;
        };
        ${darwinSystem} = {
          darwin-build = self.darwinConfigurations.mac.system;
        };
      };

      # Dev shell with all local check tools
      devShells = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;
        in
        {
          default = pkgs.mkShell {
            buildInputs = [
              pkgs.lua51Packages.luacheck
              pkgs.lua51Packages.busted
              pkgs.stylua
              pkgs.nodejs_22
            ];
          };
        }
      );

      # Apps: nix run .#lint / .#fmt / .#test
      apps = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;
        in
        {
          lint = {
            type = "app";
            program = "${lintApp pkgs}/bin/lint";
          };
          fmt = {
            type = "app";
            program = "${fmtApp pkgs}/bin/fmt";
          };
          test = {
            type = "app";
            program = "${testApp pkgs}/bin/test";
          };
        }
      );
    };
}
