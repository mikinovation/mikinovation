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

  # The minimal profile deploys only the plugin-free part of the config, with
  # minimal.lua as init.lua, so Neovim starts without a network connection.
  # scripts/nvim-smoke-test.sh reads the same list.
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
    extraPackages = lib.optionals (!isMinimal) (
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
        (if stdenv.hostPlatform.isDarwin then clang else gcc)

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
