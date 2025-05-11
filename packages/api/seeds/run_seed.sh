#!/bin/bash

# Database connection details from environment or defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-mikinovation}
DB_USER=${DB_USER:-postgres}
DB_PASS=${DB_PASS:-postgres}

echo "Running seed script for database $DB_NAME on $DB_HOST:$DB_PORT"

# Run the seed SQL file
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/seed.sql"

if [ $? -eq 0 ]; then
  echo "Seed data imported successfully!"
else
  echo "Error importing seed data"
  exit 1
fi