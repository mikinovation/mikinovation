#!/bin/bash
set -e

# Start PostgreSQL database for testing
echo "Starting PostgreSQL container for testing..."
docker run --name mikinovation_postgres_test -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mikinovation_test -p 5432:5432 -d postgres:15

# Wait for PostgreSQL to start
echo "Waiting for PostgreSQL to start..."
sleep 3

# Run migrations
echo "Running migrations..."
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mikinovation_test cargo sqlx migrate run

# Run tests
echo "Running tests..."
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mikinovation_test cargo test

# Clean up
echo "Cleaning up..."
docker stop mikinovation_postgres_test
docker rm mikinovation_postgres_test

echo "Tests completed!"