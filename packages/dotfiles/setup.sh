#!/bin/bash
set -euo pipefail

DOTFILES_DIR="$(cd "$(dirname "$0")" && pwd)"
NIX_CONFIG_DIR="$HOME/.config/nix"

PROFILE=""
FLAKE_SUFFIX=""

usage() {
  cat >&2 <<'EOF'
DOTFILES_PROFILE is required. Set it to "full" or "minimal".

  DOTFILES_PROFILE=full ./setup.sh      # every module (default environment)
  DOTFILES_PROFILE=minimal ./setup.sh   # zsh, sheldon, git, claude-code, nodejs, neovim with orgmode only
EOF
}

resolve_profile() {
  PROFILE="${DOTFILES_PROFILE:-}"

  case "$PROFILE" in
    full)
      FLAKE_SUFFIX=""
      ;;
    minimal)
      FLAKE_SUFFIX="-minimal"
      ;;
    "")
      usage
      exit 1
      ;;
    *)
      echo "Error: unknown DOTFILES_PROFILE '$PROFILE'." >&2
      usage
      exit 1
      ;;
  esac
}

# Setup nix.conf (system-level configuration)
setup_nix_config() {
  if [ ! -d "$NIX_CONFIG_DIR" ]; then
    mkdir -p "$NIX_CONFIG_DIR"
  fi

  ln -snfv "$DOTFILES_DIR/nix/nix.conf" "$NIX_CONFIG_DIR/nix.conf"
  ln -snfv "$DOTFILES_DIR/nix/flake.nix" "$NIX_CONFIG_DIR/flake.nix"
  ln -snfv "$DOTFILES_DIR/nix/flake.lock" "$NIX_CONFIG_DIR/flake.lock"
}

# The flake reads the OS user name from the environment (SUDO_USER under sudo,
# USER otherwise) instead of hardcoding it, so every rebuild passes --impure.

# Deploy NixOS system configuration
deploy_nixos() {
  local hostname
  hostname="$(hostname)"
  echo "Deploying NixOS system configuration..."
  sudo nixos-rebuild switch -L --impure --flake "$DOTFILES_DIR/nix#${hostname}${FLAKE_SUFFIX}"
}

# Deploy nix-darwin system configuration (macOS)
deploy_darwin() {
  echo "Deploying nix-darwin system configuration..."
  if command -v darwin-rebuild >/dev/null 2>&1; then
    sudo darwin-rebuild switch -L --impure --flake "$DOTFILES_DIR/nix#mac${FLAKE_SUFFIX}"
  else
    sudo nix run nix-darwin -- switch -L --impure --flake "$DOTFILES_DIR/nix#mac${FLAKE_SUFFIX}"
  fi
}

# Deploy configurations using Home Manager (standalone, for non-NixOS)
deploy_home_manager() {
  echo "Deploying configurations with Home Manager..."
  DOTFILES_USER="$(id -un)" nix run home-manager/master -- switch -L --impure --flake "$DOTFILES_DIR/nix#linux${FLAKE_SUFFIX}"
}

main() {
  resolve_profile

  echo "Start setup dotfiles... (profile: $PROFILE)"

  if ! command -v npm >/dev/null 2>&1; then
    echo "Warning: npm is not installed or not in PATH"
  fi

  # Setup Nix configuration first
  setup_nix_config
  echo "Nix config setup done."

  # Deploy configuration
  if [ "$(uname -s)" = "Darwin" ]; then
    # macOS: use darwin-rebuild (includes Home Manager as a module).
    # hostname can resolve to "<name>.local" on macOS, so the flake attribute
    # is fixed to "mac" instead of being derived from the hostname.
    deploy_darwin
    echo "nix-darwin deployment done."
  elif [ -f /etc/NIXOS ]; then
    # NixOS system (including NixOS-WSL, which has no hardware-configuration.nix):
    # use nixos-rebuild (includes Home Manager as a module)
    deploy_nixos
    echo "NixOS deployment done."
  else
    # Non-NixOS: use standalone Home Manager
    deploy_home_manager
    echo "Home Manager deployment done."
  fi

  echo "Setup dotfiles done."
  echo ""
  echo "Please restart your shell or run 'source ~/.zshrc' to apply changes."
}

main
