#!/bin/sh
set -e

echo "Starting GCC Ledger API..."

# Create database and vector storage directories
mkdir -p /var/lib/gcc-ledger/vector_index
mkdir -p /app/data/snapshots

# Run Alembic migrations
echo "Applying database schema migrations..."
alembic upgrade head || true

# Run idempotent database seeder
echo "Seeding database with verified regulatory figures..."
python -m app.seed || true

# Start FastAPI application
echo "Starting Uvicorn web server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
