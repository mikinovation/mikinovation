# Axum API Development Makefile

# Set bash as default SHELL
SHELL := /bin/bash

# Start development server
.PHONY: dev
dev:
	@echo "Starting development server..."
	@cargo watch -x run

# Run in release mode
.PHONY: run-release
run-release:
	@echo "Running in release mode..."
	@cargo run --release

# Run tests
.PHONY: test
test:
	@echo "Running tests..."
	@cargo test

# Run tests in watch mode
.PHONY: test-watch
test-watch:
	@echo "Running tests in watch mode..."
	@cargo watch -x test

# Format code
.PHONY: fmt
fmt:
	@echo "Formatting code..."
	@cargo fmt

# Run linter
.PHONY: lint
lint:
	@echo "Linting code..."
	@cargo clippy -- -D warnings

# Build release binary
.PHONY: build
build:
	@echo "Building release binary..."
	@cargo build --release

# Clean project
.PHONY: clean
clean:
	@echo "Cleaning project..."
	@cargo clean

.PHONY: db-create
db-create:
	@echo "Creating database..."
	@sqlx database create

.PHONY: db-drop
db-drop:
	@echo "Dropping database..."
	@sqlx database drop -y

.PHONY: migrate-add
migrate-add:
	@read -p "Migration name: " name; \
	sqlx migrate add -r $$name

.PHONY: migrate
migrate:
	@echo "Running migrations..."
	@sqlx migrate run

.PHONY: migrate-revert
migrate-revert:
	@echo "Reverting latest migration..."
	@sqlx migrate revert

.PHONY: prepare
prepare:
	@echo "Preparing SQLx metadata..."
	@cargo sqlx prepare

# Display target descriptions
.PHONY: help
help:
	@echo "Axum API Development Makefile Commands:"
	@echo "  make dev          - Start development server (with hot reload)"
	@echo "  make run-release  - Run application in release mode"
	@echo "  make test         - Run tests"
	@echo "  make test-watch   - Run tests in watch mode"
	@echo "  make fmt          - Format code"
	@echo "  make lint         - Run linter"
	@echo "  make build        - Build release binary"
	@echo "  make clean        - Clean project"
	@echo ""
	@echo "SQLx Database Commands:"
	@echo "  make db-create    - Create database from DATABASE_URL"
	@echo "  make db-drop      - Drop database"
	@echo "  make migrate-add  - Add a new migration (will prompt for name)"
	@echo "  make migrate      - Run all pending migrations"
	@echo "  make migrate-revert - Revert the latest migration"
	@echo "  make prepare      - Generate SQLx metadata for offline development"
	@echo ""
	@echo "  make help         - Display this help message"

# Default target
.DEFAULT_GOAL := help
