# dotfiles

Dotfiles managed declaratively using Nix and Home Manager.

This package lives at `packages/dotfiles` in the
[mikinovation/mikinovation](https://github.com/mikinovation/mikinovation)
repository. It was previously the standalone `mikinovation/dotfiles` repository.
Commands below are run from this directory unless stated otherwise.

## prerequisite

### Nix

Install Nix package manager (required):

```bash
# Install Nix with flakes support
sh <(curl -L https://nixos.org/nix/install) --daemon

# Enable flakes (if not already enabled)
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

### nix-darwin (macOS only)

On macOS the system layer is managed by [nix-darwin](https://github.com/nix-darwin/nix-darwin).
No manual install is needed: `./setup.sh` bootstraps it via `nix run nix-darwin`.
Homebrew is not required, but `/opt/homebrew/bin` is added to `PATH` if it exists.

The Determinate Nix installer owns `/etc/nix`.
If you use it, add `nix.enable = false;` to `nix/darwin/configuration.nix`.

### Terminal

Install Wezterm

https://wezfurlong.org/wezterm/

On macOS, Home Manager installs WezTerm and it reads `~/.wezterm.lua` directly.
No extra step is required.

On WSL, WezTerm runs on the Windows host, so copy the config over:

```bash
cp ~/ghq/github.com/mikinovation/mikinovation/packages/dotfiles/nix/programs/wezterm/.wezterm.lua /mnt/c/Users/[UserName]/
```

### Google Chrome (macOS only)

The `chrome-devtools` MCP server uses `pkgs.chromium` on Linux, which is not
available on macOS. Install Google Chrome to `/Applications` so the server can
find it.

## install

### Automatic Installation (Recommended)

Run the setup script. It detects the environment and deploys the configuration:

```bash
ghq get git@github.com:mikinovation/mikinovation.git
cd ~/ghq/github.com/mikinovation/mikinovation/packages/dotfiles
./setup.sh
```

- NixOS (WSL): applies Home Manager as a module via `sudo nixos-rebuild switch`
- macOS: applies Home Manager as a module via `sudo darwin-rebuild switch`
- Other Linux: applies via standalone Home Manager

The flake does not hardcode the OS user name. It reads the user to configure
from the environment at evaluation time, so the same outputs work for any user:

1. `DOTFILES_USER`, if set (explicit override)
2. `SUDO_USER`, the user who ran `sudo nixos-rebuild` / `sudo darwin-rebuild`
3. `USER`, the current user (standalone Home Manager)

`root` is skipped. If none of them is available, for example in pure evaluation
such as `nix flake check` and CI, it falls back to `nixos`, the NixOS-WSL default
user. Reading the environment needs `--impure`, which `setup.sh` passes. Pass it
yourself when you run the switch commands by hand.

### Manual Installation

If you prefer to deploy manually using Home Manager:

```bash
# Clone the repository
ghq get git@github.com:mikinovation/mikinovation.git

# Setup nix.conf first
mkdir -p ~/.config/nix
ln -s ~/ghq/github.com/mikinovation/mikinovation/packages/dotfiles/nix/nix.conf ~/.config/nix/nix.conf

# Deploy using Home Manager (standalone)
nix run home-manager/master -- switch --impure --flake ~/ghq/github.com/mikinovation/mikinovation/packages/dotfiles/nix#linux

# Or for NixOS
sudo nixos-rebuild switch --impure --flake ~/ghq/github.com/mikinovation/mikinovation/packages/dotfiles/nix#nixos

# Or for macOS
sudo darwin-rebuild switch --impure --flake ~/ghq/github.com/mikinovation/mikinovation/packages/dotfiles/nix#mac
```

### Migrating from the old mikinovation/dotfiles checkout

Machines set up from the old standalone repository keep working until you
switch, because they still point at `~/ghq/github.com/mikinovation/dotfiles`.
To switch:

1. `ghq get git@github.com:mikinovation/mikinovation.git`
2. `cd ~/ghq/github.com/mikinovation/mikinovation/packages/dotfiles`
3. Run `./setup.sh`. This re-points the
   `~/.config/nix` symlinks, `DOTFILES_DIR`, and the Claude Code hook and
   statusline paths at the new location.
4. Open a new shell and check `echo $DOTFILES_DIR` shows the new path.
5. Remove the old `~/ghq/github.com/mikinovation/dotfiles` checkout.

### Update Configuration

After changing configuration files, re-run the switch command for your platform.
The standalone deploy installs the `home-manager` command itself. After the first
deploy, use it instead of `nix run home-manager/master --`:

```bash
home-manager switch --impure --flake ~/ghq/github.com/mikinovation/mikinovation/packages/dotfiles/nix#linux
```

Re-running the setup script works as well:

```bash
cd ~/ghq/github.com/mikinovation/mikinovation/packages/dotfiles
./setup.sh
```

### Setting up from a WSL release image

The [Build dotfiles WSL release image](../../.github/workflows/dotfiles-wsl-release.yml) workflow
builds a minimal NixOS-WSL image. It runs weekly, and on demand via
`workflow_dispatch`. The image is published as a GitHub Release asset. It embeds
a copy of this package (not the rest of the monorepo, and not as a git checkout). A broken WSL install can therefore be restored without
network access to GitHub:

```powershell
# On Windows: download nixos.wsl from the latest release, then
wsl --import nixos <install-dir> nixos.wsl
wsl -d nixos
```

```bash
# Inside the imported distro
cd ~/ghq/github.com/mikinovation/mikinovation/packages/dotfiles
./setup.sh
```

`setup.sh` runs `nixos-rebuild switch` against the embedded package. That
rebuilds the Home Manager environment.

### Claude Code skills

General-purpose skills such as `create-prd` live in
[`packages/claude-skills`](../claude-skills). Home Manager deploys them to
`~/.claude/skills` together with the dotfiles-specific skills in
`nix/programs/claude-code/skills`.

## lint, format, test

`nix run ./nix#lint` runs both luacheck and secretlint. secretlint needs
`node_modules`. The command exits with an error when it is missing, so run
`pnpm install` first:

```bash
pnpm install
make lint   # luacheck + secretlint (nix run ./nix#lint)
make fmt    # stylua --check        (nix run ./nix#fmt)
make test   # busted tests          (nix run ./nix#test)
make check  # all of the above
```

Run `make` (or `make help`) to list every task, including setup
(`make setup`), Nix checks (`make nix-check`), formatters
(`make fmt-fix`, `make nix-fmt-fix`) and the Neovim smoke test
(`make nvim-smoke-test`).

To use the dev shell:

```bash
nix develop ./nix
```
