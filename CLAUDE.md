# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands

- Build all: `make build`
- Lint all: `make lint`
- Run API tests: `make test-api`
- Run API single test: `cd packages/api && cargo test test_name`
- Web lint: `make lint-web` or `pnpm web lint`
- Web typecheck: `make typecheck-web` or `pnpm web typecheck`
- UI lint: `make lint-ui` or `pnpm ui lint`
- UI typecheck: `make typecheck-ui` or `pnpm ui typecheck`
- Dev server: `make dev` (starts API, Web, UI)
- Dev with mocks: `make dev-mock` (Web with API mocking)

## Code Style Guidelines

- **TypeScript/Vue**: Use strict typing, follow ESLint rules
- **Rust API**: Use thiserror for error handling, anyhow for propagation
- **Naming**: camelCase for JS/TS, snake_case for Rust
- **Imports**: Group by external, then internal, then relative
- **Error Handling**: Use Result/Option in Rust, try/catch or optional chaining in TS
- **File Structure**: Follow package-based organization (API, Web, UI)
- **Node Version**: 24.1.0 with pnpm 10.11.0 package manager