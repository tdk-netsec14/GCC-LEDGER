import logging
from typing import Any

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.database import SessionLocal
from app.ingest.jobs import (
    run_diff_alert,
    run_fetch_sources,
    run_link_check,
    run_recompute,
    run_signal_scan,
)

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def _wrap_job(job_func: Any) -> None:
    db = SessionLocal()
    try:
        res = job_func(db)
        logger.info("Pipeline job %s completed: %s", job_func.__name__, res)
    except Exception as exc:  # noqa: BLE001
        logger.error("Pipeline job %s failed: %s", job_func.__name__, exc)
    finally:
        db.close()


def start_scheduler() -> None:
    """Configures and starts the background pipeline scheduler."""
    if scheduler.running:
        return

    # Add scheduled periodic tasks
    scheduler.add_job(
        lambda: _wrap_job(run_fetch_sources),
        trigger=IntervalTrigger(hours=6),
        id="fetch_sources",
        replace_existing=True,
    )
    scheduler.add_job(
        lambda: _wrap_job(run_diff_alert),
        trigger=IntervalTrigger(hours=6),
        id="diff_alert",
        replace_existing=True,
    )
    scheduler.add_job(
        lambda: _wrap_job(run_link_check),
        trigger=IntervalTrigger(hours=24),
        id="link_check",
        replace_existing=True,
    )
    scheduler.add_job(
        lambda: _wrap_job(run_signal_scan),
        trigger=IntervalTrigger(hours=4),
        id="signal_scan",
        replace_existing=True,
    )
    scheduler.add_job(
        lambda: _wrap_job(run_recompute),
        trigger=IntervalTrigger(hours=12),
        id="recompute",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Pipeline scheduler initialized with %d recurring jobs.", len(scheduler.get_jobs()))


def shutdown_scheduler() -> None:
    """Gracefully shuts down the background scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Pipeline scheduler shut down.")
