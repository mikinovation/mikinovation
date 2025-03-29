SHELL := /bin/bash

.DEFAULT_GOAL := help

# Environment variables
API_DIR := packages/api
WEB_DIR := packages/web
DATABASE_URL ?= sqlite:./$(API_DIR)/mikinovation.db

#
# commands
#

.PHONY: help
help:
	@echo "Mikinovation Monorepo Commands:"
	@echo "  make setup             - Set up both API and Web projects"
	@echo "  make dev               - Run both API and Web in development mode"
	@echo "  make build             - Build both API and Web for production"
	@echo ""
	@echo "API Commands:"
	@echo "  make dev-api           - Start API development server with hot reload"
	@echo "  make run-api-release   - Run API in release mode"
	@echo "  make test-api          - Run API tests"
	@echo "  make test-api-watch    - Run API tests in watch mode"
	@echo "  make lint-api          - Run API linter"
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
	@echo ""
	@echo "Web Commands:"
	@echo "  make dev-web           - Start Web development server"
	@echo "  make build-web         - Build Web for production"
	@echo "  make lint-web          - Run Web linter"
	@echo "  make codegen           - Generate types from GitHub OpenAPI schema"
	@echo ""
	@echo "  make help              - Display this help message"

#
# Setup commands
#

.PHONY: setup
setup: setup-api setup-web

.PHONY: setup-api
setup-api: db-create migrate

.PHONY: setup-web
setup-web:
	@echo "Setting up Web..."
	@cd $(WEB_DIR) && pnpm install
	@echo "Generating GitHub API types from OpenAPI schema..."
	@mkdir -p $(WEB_DIR)/types
	@cd $(WEB_DIR) && pnpm codegen

#
# Development commands
#

.PHONY: dev
dev:
	@echo "Starting development servers..."
	@make -j 2 dev-api dev-web

.PHONY: dev-api
dev-api:
	@echo "Starting API development server..."
	@cd $(API_DIR) && cargo watch -x run

.PHONY: dev-web
dev-web:
	@echo "Starting Web development server..."
	@cd $(WEB_DIR) && pnpm run dev

#
# Build commands
#

.PHONY: build
build: build-api build-web

.PHONY: build-api
build-api:
	@echo "Building API for production..."
	@cd $(API_DIR) && cargo build --release

.PHONY: build-web
build-web:
	@echo "Building Web for production..."
	@cd $(WEB_DIR) && pnpm run build

#
# API specific commands
#

.PHONY: run-api-release
run-api-release:
	@echo "Running API in release mode..."
	@cd $(API_DIR) && cargo run --release

.PHONY: test-api
test-api:
	@echo "Running API tests..."
	@cd $(API_DIR) && cargo test

.PHONY: test-api-watch
test-api-watch:
	@echo "Running API tests in watch mode..."
	@cd $(API_DIR) && cargo watch -x test

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
	@cd $(WEB_DIR) && pnpm run lint

.PHONY: clean-web
clean-web:
	@echo "Cleaning Web build artifacts..."
	@rm -rf $(WEB_DIR)/.nuxt $(WEB_DIR)/.output $(WEB_DIR)/node_modules

.PHONY: clean
clean: clean-api clean-web
	@echo "Cleaned all projects."

#
# Type generation commands
#

.PHONY: codegen
codegen:
	@echo "Generating GitHub API types from OpenAPI schema..."
	@mkdir -p $(WEB_DIR)/types
	@cd $(WEB_DIR) && pnpm codegen

#
# Database commands
#

.PHONY: db-create
db-create:
	@echo "Creating database..."
	@mkdir -p $(API_DIR)
	@echo "Using database URL: $(DATABASE_URL)"
	@sqlx database create --database-url $(DATABASE_URL)

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

.PHONY: migrate-revert
migrate-revert:
	@echo "Reverting latest migration..."
	@sqlx migrate revert --database-url $(DATABASE_URL) --source $(API_DIR)/migrations

.PHONY: prepare
prepare:
	@echo "Preparing SQLx metadata..."
	@cd $(API_DIR) && cargo sqlx prepare
