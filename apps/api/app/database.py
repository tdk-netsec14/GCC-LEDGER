from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()

db_url = settings.database_url
connect_args = {}

if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}
    # Resolve relative path against project root if needed
    if "sqlite:///" in db_url:
        db_file_str = db_url.replace("sqlite:///", "")
        db_path = Path(db_file_str)
        if not db_path.is_absolute():
            # Project root is three levels up from apps/api/app/database.py
            project_root = Path(__file__).resolve().parents[3]
            resolved_path = (project_root / db_path).resolve()
            resolved_path.parent.mkdir(parents=True, exist_ok=True)
            db_url = f"sqlite:///{resolved_path.as_posix()}"

engine = create_engine(db_url, connect_args=connect_args)

if "sqlite" in db_url:
    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection: object, _: object) -> None:
        cursor = dbapi_connection.cursor()  # type: ignore[union-attr]
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
