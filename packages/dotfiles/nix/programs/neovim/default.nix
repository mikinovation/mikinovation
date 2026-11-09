{
  pkgs,
  vueLanguageServer,
  ...
}:

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
      # nvim-orgmode compiles its tree-sitter parser on first start, and
      # nvim-treesitter builds parsers with it as well.
      (if pkgs.stdenv.hostPlatform.isDarwin then pkgs.clang else pkgs.gcc)
    ]
    ++ (with pkgs; [
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
    ];
  };

  # Deploy the config as one directory, so the init.lua that Home Manager
  # generates is shadowed.
  home.file.".config/nvim".source = ./nvim;

  home.sessionVariables = {
    EDITOR = "nvim";
    VISUAL = "nvim";
  };
}
