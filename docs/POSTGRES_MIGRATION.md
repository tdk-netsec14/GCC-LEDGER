# PostgreSQL Migration & Production Deployment Guide

This document describes the steps required to transition GCC Ledger from the development SQLite database to a highly available production PostgreSQL instance with pgvector support.

---

## 1. Prerequisites

- PostgreSQL 15+ (with `pgvector` extension if native vector indexing is desired)
- `asyncpg` or `psycopg2-binary` installed in the Python environment
- Docker and Docker Compose (for containerized deployments)

---

## 2. Environment Configuration

Update your `.env` or production environment variables:

```bash
# PostgreSQL Connection URL
DATABASE_URL=postgresql+psycopg2://gcc_user:SecurePassword123@localhost:5432/gcc_ledger

# Vector Index Configuration
VECTOR_INDEX_PATH=/var/lib/gcc_ledger/vector_index
```

---

## 3. Applying Schema Migrations

Run Alembic migrations to apply the initial schema to the new PostgreSQL database:

```bash
cd apps/api
export PYTHONPATH="."
alembic upgrade head
```

All 19 tables (`source`, `source_snapshot`, `claim`, `company`, `gcc_record`, `state`, `city`, `incentive`, `rule`, `contradiction`, `signal_def`, `signal_observation`, `provider`, `engagement`, `review_task`, `doc_chunk`, `qa_log`, `audit_log`, `reviewer_user`) will be provisioned with identical schema constraints and indexes.

---

## 4. Transferring Seed and Historical Data

To transfer existing SQLite data to PostgreSQL:

1. **Option A: Idempotent Seeder**
   ```bash
   python -m app.seed
   ```
   The seeder will read all versioned data files from `data/seed/` and insert records cleanly into PostgreSQL.

2. **Option B: pgloader**
   ```bash
   pgloader sqlite:///data/gcc_ledger.db postgresql://gcc_user:SecurePassword123@localhost:5432/gcc_ledger
   ```

---

## 5. Automated Backups

Run the unified backup utility via scheduled cron:

```bash
# Run backup script (supports both SQLite and PostgreSQL via pg_dump)
python scripts/backup.py
```

Backups are saved to `data/backups/` with ISO timestamps.

---

## 6. Docker Compose Production Deployment

To run the complete production stack (PostgreSQL + FastAPI + Next.js):

```bash
docker compose up -d --build
```
