from datetime import UTC, datetime

import pytest
from app.ingest.jobs import (
    run_diff_alert,
    run_fetch_sources,
    run_index_chunks,
    run_link_check,
    run_recompute,
)
from app.models.entities import Base, Grade, SignalDefinition, Source, SourceSnapshot
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()

    # Seed minimal source
    source = Source(
        id=1,
        publisher="RBI",
        publisher_type="regulator",
        title="FDI Reporting Norms",
        url="https://firms.rbi.org.in",
        default_grade=Grade.A,
    )
    session.add(source)

    # Seed signal definition
    signal = SignalDefinition(
        id=1,
        cluster="Corporate",
        text="Entity completes incorporation filing",
        weight=0.25,
        grade=Grade.A,
    )
    session.add(signal)
    session.commit()

    yield session
    session.close()


def test_fetch_sources(test_db):
    res = run_fetch_sources(test_db)
    assert res["checked"] >= 1
    assert res["new_snapshots"] >= 1

    # Verify snapshot was stored with SHA-256 hash
    snaps = test_db.query(SourceSnapshot).all()
    assert len(snaps) >= 1
    assert len(snaps[0].content_hash) == 64


def test_diff_alert_detection(test_db):
    # Create two snapshots with different hashes for the same source
    snap1 = SourceSnapshot(
        source_id=1,
        stored_text_path="data/snapshots/source_1.txt",
        content_hash="aaaa" * 16,
        fetched_at=datetime.now(UTC),
    )
    snap2 = SourceSnapshot(
        source_id=1,
        stored_text_path="data/snapshots/source_1.txt",
        content_hash="bbbb" * 16,
        fetched_at=datetime.now(UTC),
    )
    test_db.add_all([snap1, snap2])
    test_db.commit()

    res = run_diff_alert(test_db)
    assert res["diffs_detected"] >= 1


def test_index_chunks(test_db):
    snap = SourceSnapshot(
        source_id=1,
        stored_text_path="data/snapshots/source_1.txt",
        content_hash="1111" * 16,
        fetched_at=datetime.now(UTC),
    )
    test_db.add(snap)
    test_db.commit()

    res = run_index_chunks(test_db)
    assert res["chunks_created"] >= 1


def test_link_check(test_db):
    res = run_link_check(test_db)
    assert res["links_checked"] >= 1
    assert "firms.rbi.org.in" in res["pre_confirmed"]


def test_recompute(test_db):
    res = run_recompute(test_db)
    assert res["recomputed"] is True
    assert "reconcile" in res["engines"]
