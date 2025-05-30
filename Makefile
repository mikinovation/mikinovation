SHELL := /bin/bash

.DEFAULT_GOAL := help

# Environment variables
API_DIR := packages/api
WEB_DIR := packages/web
UI_DIR := packages/ui
DATABASE_URL ?= postgres://postgres:postgres@localhost:5432/mikinovation
NODE_VERSION := 22.14.0
PNPM_VERSION := 10.7.0
ENABLE_MOCK := NUXT_PUBLIC_API_MOCK=true

#
# commands
#

.PHONY: help
help:
	@echo "Mikinovation Commands:"
	@echo "  make setup             - Set up all projects (API, Web, UI)"
	@echo "  make dev               - Run API, Web, and UI in development mode"
	@echo "  make dev-mock          - Run dev with API mocking enabled"
	@echo "  make build             - Build all projects for production"
	@echo "  make clean             - Clean all projects"
	@echo "  make lint              - Lint all projects"
	@echo ""
	@echo "API Commands:"
	@echo "  make setup-api         - Set up API project (create DB and run migrations)"
	@echo "  make dev-api           - Start API development server with hot reload"
	@echo "  make run-api-release   - Run API in release mode"
	@echo "  make test-api          - Run API tests"
	@echo "  make test-api-watch    - Run API tests in watch mode"
	@echo "  make lint-api          - Run API linter (clippy)"
	@echo "  make fmt-api           - Format API code"
	@echo "  make build-api         - Build API release binary"
	@echo "  make clean-api         - Clean API project"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-create         - Create database from DATABASE_URL"
	@echo "  make db-drop           - Drop database"
	@echo "  make migrate-add       - Add a new migration (will prompt for name)"
	@echo "  make migrate           - Run all pending migrations"
	@echo "  make migrate-revert    - Revert the latest migration"
	@echo "  make prepare           - Generate SQLx metadata for offline development"
	@echo "  make db-seed           - Seed database with initial data"
	@echo ""
	@echo "Web Commands:"
	@echo "  make setup-web         - Set up Web project"
	@echo "  make dev-web           - Start Web development server"
	@echo "  make dev-web-mock      - Start Web development server with API mocking enabled"
	@echo "  make build-web         - Build Web for production"
	@echo "  make build-web-mock    - Build Web for production with API mocking enabled"
	@echo "  make preview-web       - Preview Web production build"
	@echo "  make preview-web-mock  - Preview Web production build with API mocking enabled"
	@echo "  make lint-web          - Run Web linter"
	@echo "  make typecheck-web     - Run type check for Web"
	@echo "  make codegen           - Generate types from GitHub OpenAPI schema"
	@echo "  make clean-web         - Clean Web project"
	@echo ""
	@echo "UI Commands:"
	@echo "  make setup-ui          - Set up UI project"
	@echo "  make dev-ui            - Start UI development with watch mode"
	@echo "  make build-ui          - Build UI for production"
	@echo "  make lint-ui           - Run UI linter"
	@echo "  make typecheck-ui      - Run type check for UI"
	@echo "  make storybook         - Run Storybook for UI components"
	@echo "  make build-storybook   - Build Storybook for UI components"
	@echo "  make clean-ui          - Clean UI project"
	@echo ""
	@echo "  make help              - Display this help message"

#
# Setup commands
#

.PHONY: setup
setup: setup-api setup-node

.PHONY: setup-api
setup-api: db-create migrate prepare
	@echo "Run 'make db-seed' if you want to populate the database with sample data"

.PHONY: setup-node
setup-node:
	@echo "Setting up Node.js..."
	@pnpm install

#
# Development commands
#

.PHONY: dev
dev:
	@echo "Starting development servers..."
	@make -j 3 dev-api dev-web dev-ui

.PHONY: dev-mock
dev-mock:
	@echo "Starting development servers with API mocking..."
	@make -j 2 dev-web-mock dev-ui

.PHONY: dev-api
dev-api:
	@echo "Starting API development server..."
	@cd $(API_DIR) && cargo watch -x run

.PHONY: dev-web
dev-web:
	@echo "Starting Web development server..."
	@pnpm web dev

.PHONY: dev-web-mock
dev-web-mock:
	@echo "Starting Web development server with API mocking..."
	@$(ENABLE_MOCK) pnpm web dev

.PHONY: dev-ui
dev-ui:
	@echo "Starting UI development with watch mode..."
	@pnpm ui dev

#
# Build commands
#

.PHONY: build
build: build-api build-web build-ui

.PHONY: build-mock
build-mock: build-api build-web-mock build-ui

.PHONY: build-api
build-api:
	@echo "Building API for production..."
	@cd $(API_DIR) && cargo build --release

.PHONY: build-web
build-web:
	@echo "Building Web for production..."
	@pnpm web build

.PHONY: build-web-mock
build-web-mock:
	@echo "Building Web for production with API mocking..."
	@$(ENABLE_MOCK) pnpm web build

.PHONY: build-ui
build-ui:
	@echo "Building UI for production..."
	@pnpm ui build

#
# Preview commands
#

.PHONY: preview-web
preview-web:
	@echo "Previewing Web production build..."
	@pnpm web preview

.PHONY: preview-web-mock
preview-web-mock:
	@echo "Previewing Web production build with API mocking..."
	@$(ENABLE_MOCK) pnpm web preview

#
# Lint commands
#

.PHONY: lint
lint: lint-api lint-web lint-ui

#
# API specific commands
#

.PHONY: run-api-release
run-api-release:
	@echo "Running API in release mode..."
	@cd $(API_DIR) && cargo run --release

.PHONY: test-api
test-api: test-db-create test-migrate
	@echo "Running API tests..."
	@cd $(API_DIR) && DATABASE_URL=postgres://postgres:postgres@localhost:5432/mikinovation_test cargo test -- --test-threads=1

.PHONY: test-api-watch
test-api-watch:
	@echo "Running API tests in watch mode..."
	@cd $(API_DIR) && DATABASE_URL=postgres://postgres:postgres@localhost:5432/mikinovation_test cargo watch -x test

.PHONY: lint-api
lint-api:
	@echo "Linting API code..."
	@cd $(API_DIR) && cargo clippy -- -D warnings

.PHONY: fmt-api
fmt-api:
	@echo "Formatting API code..."
	@cd $(API_DIR) && cargo fmt

.PHONY: clean-api
clean-api:
	@echo "Cleaning API project..."
	@cd $(API_DIR) && cargo clean

#
# Web specific commands
#

.PHONY: lint-web
lint-web:
	@echo "Running Web linting..."
	@pnpm web lint

.PHONY: typecheck-web
typecheck-web:
	@echo "Running Web type check..."
	@pnpm web typecheck

.PHONY: clean-web
clean-web:
	@echo "Cleaning Web build artifacts..."
	@rm -rf $(WEB_DIR)/.nuxt $(WEB_DIR)/.output $(WEB_DIR)/dist $(WEB_DIR)/node_modules

#
# UI specific commands
#

.PHONY: lint-ui
lint-ui:
	@echo "Running UI linting..."
	@pnpm ui lint

.PHONY: typecheck-ui
typecheck-ui:
	@echo "Running UI type check..."
	@pnpm ui typecheck

.PHONY: storybook
storybook:
	@echo "Starting Storybook for UI components..."
	@pnpm ui storybook

.PHONY: build-storybook
build-storybook:
	@echo "Building Storybook for UI components..."
	@pnpm ui build-storybook

.PHONY: clean-ui
clean-ui:
	@echo "Cleaning UI build artifacts..."
	@rm -rf $(UI_DIR)/dist $(UI_DIR)/node_modules

.PHONY: clean
clean: clean-api clean-web clean-ui
	@echo "Cleaned all projects."
#
# Type generation commands
#

.PHONY: codegen
codegen:
	@echo "Generating GitHub API types from OpenAPI schema..."
	@pnpm web codegen

#
# Database commands
#

.PHONY: db-create
db-create:
	@echo "Creating database..."
	@echo "Using database URL: $(DATABASE_URL)"
	@sqlx database create --database-url $(DATABASE_URL)

.PHONY: test-db-create
test-db-create:
	@echo "Creating test database..."
	@sqlx database create --database-url postgres://postgres:postgres@localhost:5432/mikinovation_test

.PHONY: db-drop
db-drop:
	@echo "Dropping database..."
	@sqlx database drop --database-url $(DATABASE_URL) -y

.PHONY: migrate-add
migrate-add:
	@read -p "Migration name: " name; \
	sqlx migrate add -r --source $(API_DIR)/migrations $name

.PHONY: migrate
migrate:
	@echo "Running migrations..."
	@sqlx migrate run --database-url $(DATABASE_URL) --source $(API_DIR)/migrations

.PHONY: test-migrate
test-migrate:
	@echo "Running migrations on test database..."
	@sqlx migrate run --database-url postgres://postgres:postgres@localhost:5432/mikinovation_test --source $(API_DIR)/migrations

.PHONY: migrate-revert
migrate-revert:
	@echo "Reverting latest migration..."
	@sqlx migrate revert --database-url $(DATABASE_URL) --source $(API_DIR)/migrations

.PHONY: prepare
prepare:
	@echo "Preparing SQLx metadata..."
	@cd $(API_DIR) && DATABASE_URL=$(DATABASE_URL) cargo sqlx prepare

.PHONY: db-seed
db-seed:
	@echo "Seeding database with initial data..."
	@$(API_DIR)/seeds/run_seed.sh
