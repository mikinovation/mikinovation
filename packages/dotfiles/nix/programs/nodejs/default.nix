{
  pkgs,
  ...
}:

{
  home.packages = with pkgs; [
    # Node.js LTS version (includes npm by default)
    nodejs_22

    pnpm

    # Package managers
    yarn

    # Development tools
    typescript
    typescript-language-server
    eslint
    prettier
  ];

  # Create .npmrc configuration
  home.file.".npmrc".text = ''
    save-exact=true
    engine-strict=true
  '';
}
