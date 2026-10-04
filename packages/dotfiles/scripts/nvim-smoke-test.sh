#!/bin/sh

# Smoke test: verify Neovim starts without errors in headless mode.
# This catches issues like missing modules or broken init.lua that
# only surface in the actual Nix runtime environment.

# Verify the minimal profile's config: only the files Home Manager deploys
# for it, with minimal.lua as init.lua. It runs against empty data and state
# directories, so a plugin outside its specs cannot hide a missing one.
minimal_smoke_test() {
  neovim_dir="$1"
  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' EXIT

  config_dir="$tmp_dir/config/nvim"
  mkdir -p "$config_dir"
  ln -s "$neovim_dir/nvim/minimal.lua" "$config_dir/init.lua"
  while IFS= read -r file; do
    [ -z "$file" ] && continue
    mkdir -p "$(dirname "$config_dir/$file")"
    ln -s "$neovim_dir/nvim/$file" "$config_dir/$file"
  done < "$neovim_dir/minimal-config-files"

  echo "Installing plugins (minimal profile)..."
  XDG_CONFIG_HOME="$tmp_dir/config" \
    XDG_DATA_HOME="$tmp_dir/data" \
    XDG_STATE_HOME="$tmp_dir/state" \
    nvim --headless "+Lazy! sync" +qa 2>&1 || true

  echo "Verifying clean startup (minimal profile)..."
  if error_output=$(XDG_CONFIG_HOME="$tmp_dir/config" \
    XDG_DATA_HOME="$tmp_dir/data" \
    XDG_STATE_HOME="$tmp_dir/state" \
    nvim --headless -c 'quit' 2>&1) && [ -z "$error_output" ]; then
    echo "Minimal profile startup passed!"
  else
    echo "Neovim smoke test failed! Startup errors detected (minimal profile):"
    [ -n "$error_output" ] && echo "$error_output"
    exit 1
  fi
}

main() {
  echo "Neovim smoke test started..."

  if ! command -v nvim > /dev/null 2>&1; then
    echo "nvim not found, skipping smoke test"
    exit 0
  fi

  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  NEOVIM_DIR="$(cd "$SCRIPT_DIR/../nix/programs/neovim" && pwd)"

  # Create directories referenced by config to avoid warnings
  mkdir -p "$HOME/ghq/github.com/mikinovation/org"

  minimal_smoke_test "$NEOVIM_DIR"

  export XDG_CONFIG_HOME="$NEOVIM_DIR"

  # First pass: install plugins via lazy.nvim
  echo "Installing plugins..."
  nvim --headless "+Lazy! sync" +qa 2>&1 || true

  # Second pass: verify clean startup with no errors
  echo "Verifying clean startup..."
  if error_output=$(nvim --headless -c 'quit' 2>&1) && [ -z "$error_output" ]; then
    echo "Neovim smoke test passed!"
  else
    echo "Neovim smoke test failed! Startup errors detected:"
    [ -n "$error_output" ] && echo "$error_output"
    exit 1
  fi
}

main
