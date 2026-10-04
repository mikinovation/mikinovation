{
  config,
  lib,
  pkgs,
  profile,
  vueLanguageServer,
  ...
}:

let
  isMinimal = profile == "minimal";

  # The minimal profile deploys only the built-in part of the config and the
  # specs of the note and task plugins (nvim-orgmode, org-roam.nvim), with
  # minimal.lua as init.lua. scripts/nvim-smoke-test.sh reads the same list.
  minimalConfigFiles = lib.filter (file: file != "") (
    lib.splitString "\n" (builtins.readFile ./minimal-config-files)
  );
in
{
  programs.neovim = {
    enable = true;
    defaultEditor = true;
    viAlias = true;
    vimAlias = true;
    vimdiffAlias = true;
    withRuby = false;
    withPython3 = false;

    # Install additional packages that neovim plugins might need
    extraPackages = [
      # nvim-orgmode compiles its tree-sitter parser on first start (both
      # profiles); nvim-treesitter also uses it in the full profile.
      (if pkgs.stdenv.hostPlatform.isDarwin then pkgs.clang else pkgs.gcc)
    ]
    ++ lib.optionals (!isMinimal) (
      (with pkgs; [
        # Language servers
        lua-language-server
        rust-analyzer
        vtsls
        tailwindcss-language-server
        vscode-langservers-extracted # HTML, CSS, JSON, ESLint
        nil # Nix
        solargraph # Ruby

        # Tree-sitter parser build tools
        tree-sitter

        # Lua runtime and package manager (required for luarocks plugin deps)
        lua5_1
        luarocks

        # Formatters and linters
        stylua # Lua formatter
        luajitPackages.luacheck # Lua linter
        luajitPackages.busted # Lua testing framework
      ])
      ++ [
        vueLanguageServer # Vue (volar) — local build to avoid nixpkgs pnpm dep
      ]
    );
  };

  # Deploy the config as one directory in both profiles, so the init.lua that
  # Home Manager generates is shadowed the same way.
  home.file.".config/nvim".source =
    if isMinimal then
      pkgs.linkFarm "nvim-minimal-config" (
        [
          {
            name = "init.lua";
            path = ./nvim/minimal.lua;
          }
        ]
        ++ map (file: {
          name = file;
          path = ./nvim + "/${file}";
        }) minimalConfigFiles
      )
    else
      ./nvim;

  home.sessionVariables = {
    EDITOR = "nvim";
    VISUAL = "nvim";
  };
}
