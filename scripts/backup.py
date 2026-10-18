import os
import shutil
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path


def backup_database() -> None:
    root = Path(__file__).resolve().parents[1]
    backup_dir = root / "data" / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")

    db_url = os.getenv("DATABASE_URL", "sqlite:///./data/gcc_ledger.db")

    if db_url.startswith("sqlite"):
        db_path = root / "data" / "gcc_ledger.db"
        if db_path.exists():
            target = backup_dir / f"gcc_ledger_{timestamp}.db"
            shutil.copy2(db_path, target)
            print(f"SQLite database successfully backed up to: {target}")
        else:
            print(f"Database file not found at: {db_path}", file=sys.stderr)
    elif db_url.startswith("postgresql"):
        target_sql = backup_dir / f"postgres_backup_{timestamp}.sql"
        print(f"Exporting PostgreSQL dump to: {target_sql}")
        cmd = ["pg_dump", db_url, "-f", str(target_sql)]
        try:
            subprocess.run(cmd, check=True)
            print("PostgreSQL dump completed successfully.")
        except Exception as e:  # noqa: BLE001
            print(f"Failed to run pg_dump: {e}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    backup_database()
