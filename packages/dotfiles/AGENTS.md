# AGENTS.md

This is `packages/dotfiles` inside the mikinovation/mikinovation monorepo.
Run the commands below from this directory. CI lives in the repository root
`.github/workflows/` (`dotfiles-ci.yml`, `secretlint.yml`).

## Development Workflow

### Post-Task Verification

After completing code changes, run the following verification steps in order:

```bash
nix run ./nix#lint && nix run ./nix#fmt && nix run ./nix#test
```

The same checks are available as `make check` (see `make help` for all tasks).
If you changed `.nix` files, also run `make nix-check` (Nix format check, `nix flake check`, and dry-run builds); CI runs it on every push.

Note: `nix run ./nix#lint` runs luacheck and secretlint (secretlint exits non-zero if `node_modules` is missing; run `npm ci` first).
Each command can also be run individually:

```bash
nix run ./nix#fmt   # stylua --check
nix run ./nix#test  # busted tests
nix run ./nix#lint  # luacheck + secretlint (requires `npm ci`)
```
