import json
from datetime import date, datetime
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import get_project_root
from app.database import Base, SessionLocal, engine
from app.models.entities import (
    City,
    Claim,
    Company,
    Contradiction,
    DocChunk,
    Engagement,
    GCCRecord,
    Grade,
    Incentive,
    Provider,
    ReviewerUser,
    Rule,
    SignalDefinition,
    Source,
    SourceSnapshot,
    State,
)


def parse_date(date_str: str | None) -> date | None:
    if not date_str:
        return None
    return datetime.strptime(date_str, "%Y-%m-%d").date()


def load_json(file_path: Path) -> Any:
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_database(db: Session, seed_dir: Path, snapshot_dir: Path) -> dict[str, int]:
    counts: dict[str, int] = {}

    # 1. Reviewer Accounts
    existing_reviewer = db.execute(
        select(ReviewerUser).where(ReviewerUser.username == "reviewer")
    ).scalar_one_or_none()
    if not existing_reviewer:
        reviewer = ReviewerUser(
            username="reviewer",
            password_hash=hash_password("reviewer123"),
            role="reviewer",
            is_active=True,
        )
        db.add(reviewer)
        db.flush()
        counts["reviewer_users"] = 1
    else:
        counts["reviewer_users"] = 0

    # 2. Sources
    sources_data = load_json(seed_dir / "sources.json")
    counts["sources"] = 0
    for item in sources_data:
        existing = db.execute(select(Source).where(Source.url == item["url"])).scalar_one_or_none()
        if not existing:
            source = Source(
                id=item["id"],
                publisher=item["publisher"],
                publisher_type=item["publisher_type"],
                title=item["title"],
                url=item["url"],
                published_on=parse_date(item.get("published_on")),
                last_checked_on=parse_date(item.get("last_checked_on")),
                default_grade=Grade(item["default_grade"]),
            )
            db.add(source)
            counts["sources"] += 1
    db.flush()

    # 3. Snapshots
    snapshots_data = load_json(seed_dir / "snapshots.json")
    counts["snapshots"] = 0
    for item in snapshots_data:
        existing = db.execute(
            select(SourceSnapshot).where(SourceSnapshot.content_hash == item["content_hash"])
        ).scalar_one_or_none()
        if not existing:
            snapshot = SourceSnapshot(
                id=item["id"],
                source_id=item["source_id"],
                fetched_at=datetime.fromisoformat(item["fetched_at"]),
                content_hash=item["content_hash"],
                stored_text_path=item["stored_text_path"],
            )
            db.add(snapshot)
            counts["snapshots"] += 1
    db.flush()

    # 4. Doc Chunks for Retrieval
    counts["doc_chunks"] = 0
    for snap in db.execute(select(SourceSnapshot)).scalars().all():
        text_file = Path(snap.stored_text_path)
        if not text_file.is_absolute():
            text_file = get_project_root() / text_file
        if text_file.exists():
            content = text_file.read_text(encoding="utf-8")
            passages = [p.strip() for p in content.split("\n\n") if p.strip()]
            for idx, passage in enumerate(passages):
                existing_chunk = db.execute(
                    select(DocChunk).where(
                        DocChunk.snapshot_id == snap.id,
                        DocChunk.chunk_text == passage,
                    )
                ).scalar_one_or_none()
                if not existing_chunk:
                    src = db.get(Source, snap.source_id)
                    grade = src.default_grade if src else Grade.B
                    chunk = DocChunk(
                        source_id=snap.source_id,
                        snapshot_id=snap.id,
                        chunk_text=passage,
                        grade=grade,
                        relayed=False,
                        embedding_id=f"chunk-{snap.id}-{idx}",
                    )
                    db.add(chunk)
                    counts["doc_chunks"] += 1
    db.flush()

    # 5. Counts (Claims)
    counts_data = load_json(seed_dir / "counts.json")
    counts["claims"] = 0
    for item in counts_data:
        existing = db.execute(
            select(Claim).where(
                Claim.metric == item["metric"],
                Claim.value_number == item["value_number"],
                Claim.grade == Grade(item["grade"]),
                Claim.relayed == item.get("relayed", False),
            )
        ).scalar_one_or_none()
        if not existing:
            claim = Claim(
                id=item["id"],
                subject=item["subject"],
                metric=item["metric"],
                value_number=item.get("value_number"),
                value_text=item.get("value_text"),
                unit=item.get("unit"),
                unit_of_count=item.get("unit_of_count"),
                as_of_date=parse_date(item.get("as_of_date")),
                grade=Grade(item["grade"]),
                relayed=item.get("relayed", False),
                source_id=item.get("source_id"),
                snapshot_id=item.get("snapshot_id"),
                status=item.get("status", "approved"),
            )
            db.add(claim)
            counts["claims"] += 1
    db.flush()

    # 6. States
    states_data = load_json(seed_dir / "states.json")
    counts["states"] = 0
    for item in states_data:
        existing = db.execute(select(State).where(State.code == item["code"])).scalar_one_or_none()
        if not existing:
            state = State(
                id=item["id"],
                name=item["name"],
                code=item["code"],
                has_gcc_policy=item.get("has_gcc_policy"),
                policy_status=item.get("policy_status", "none documented"),
            )
            db.add(state)
            counts["states"] += 1
    db.flush()

    # 7. Cities
    cities_data = load_json(seed_dir / "cities.json")
    counts["cities"] = 0
    for item in cities_data:
        existing = db.execute(select(City).where(City.name == item["name"])).scalar_one_or_none()
        if not existing:
            city = City(
                id=item["id"],
                name=item["name"],
                state_id=item["state_id"],
                year1_cost_low_usd_m=item.get("year1_cost_low_usd_m"),
                year1_cost_high_usd_m=item.get("year1_cost_high_usd_m"),
                senior_salary_low_lakh=item.get("senior_salary_low_lakh"),
                senior_salary_high_lakh=item.get("senior_salary_high_lakh"),
                gcc_count=item.get("gcc_count"),
            )
            db.add(city)
            counts["cities"] += 1
    db.flush()

    # 8. Incentives
    incentives_data = load_json(seed_dir / "incentives.json")
    counts["incentives"] = 0
    for item in incentives_data:
        existing = db.execute(
            select(Incentive).where(
                Incentive.state_id == item["state_id"],
                Incentive.policy_name == item["policy_name"],
            )
        ).scalar_one_or_none()
        if not existing:
            incentive = Incentive(
                id=item["id"],
                state_id=item["state_id"],
                policy_name=item["policy_name"],
                valid_from=parse_date(item.get("valid_from")),
                valid_to=parse_date(item.get("valid_to")),
                policy_fraction=item.get("policy_fraction", 0.0),
                capital_fraction=item.get("capital_fraction", 0.0),
                employment_fraction=item.get("employment_fraction", 0.0),
                other_fraction=item.get("other_fraction", 0.0),
                eligibility_text=item.get("eligibility_text"),
                min_headcount=item.get("min_headcount"),
                location_scope=item.get("location_scope"),
            )
            db.add(incentive)
            counts["incentives"] += 1
    db.flush()

    # 9. Companies
    companies_data = load_json(seed_dir / "companies.json")
    counts["companies"] = 0
    for item in companies_data:
        existing = db.execute(select(Company).where(Company.name == item["name"])).scalar_one_or_none()
        if not existing:
            company = Company(
                id=item["id"],
                name=item["name"],
                hq_country=item.get("hq_country"),
                sector=item.get("sector"),
                captive_status=item.get("captive_status", "unreviewed"),
                captive_reason=item.get("captive_reason"),
            )
            db.add(company)
            counts["companies"] += 1
    db.flush()

    # 10. GCC Records
    records_data = load_json(seed_dir / "gcc_records.json")
    counts["gcc_records"] = 0
    for item in records_data:
        existing = db.execute(
            select(GCCRecord).where(
                GCCRecord.company_id == item["company_id"],
                GCCRecord.city_id == item["city_id"],
            )
        ).scalar_one_or_none()
        if not existing:
            record = GCCRecord(
                id=item["id"],
                company_id=item["company_id"],
                city_id=item["city_id"],
                status=item["status"],
                note=item.get("note"),
            )
            db.add(record)
            counts["gcc_records"] += 1
    db.flush()

    # 11. Contradictions
    contradictions_data = load_json(seed_dir / "contradictions.json")
    counts["contradictions"] = 0
    for item in contradictions_data:
        existing = db.execute(
            select(Contradiction).where(Contradiction.title == item["title"])
        ).scalar_one_or_none()
        if not existing:
            contradiction = Contradiction(
                id=item["id"],
                title=item["title"],
                reading=item["reading"],
                to_settle=item["to_settle"],
                last_checked_on=parse_date(item.get("last_checked_on")),
            )
            db.add(contradiction)
            counts["contradictions"] += 1
    db.flush()

    # 12. Signals
    signals_data = load_json(seed_dir / "signals.json")
    counts["signals"] = 0
    for item in signals_data:
        existing = db.execute(
            select(SignalDefinition).where(SignalDefinition.text == item["text"])
        ).scalar_one_or_none()
        if not existing:
            sig = SignalDefinition(
                id=item["id"],
                cluster=item["cluster"],
                text=item["text"],
                weight=item["weight"],
                grade=Grade(item["grade"]),
                lead_note=item.get("lead_note"),
            )
            db.add(sig)
            counts["signals"] += 1
    db.flush()

    # 13. Providers & Engagements
    providers_data = load_json(seed_dir / "providers.json")
    counts["providers"] = 0
    counts["engagements"] = 0
    for item in providers_data:
        prov = db.execute(select(Provider).where(Provider.name == item["name"])).scalar_one_or_none()
        if not prov:
            prov = Provider(
                id=item["id"],
                name=item["name"],
                category=item["category"],
                fee_tier=item.get("fee_tier"),
                profile_url=item.get("profile_url"),
            )
            db.add(prov)
            db.flush()
            counts["providers"] += 1

            claimed = item.get("claimed_count", 0)
            verified = item.get("verified_count", 0)
            for i in range(claimed):
                is_ver = (i < verified)
                eng = Engagement(
                    provider_id=prov.id,
                    client_name=f"Fictional Client {i+1}",
                    scope=f"Delivery scope {i+1} for {prov.category}",
                    year=2024,
                    footprint_url="https://firms.rbi.org.in" if is_ver else None,
                    footprint_checked=is_ver,
                    client_confirmed=is_ver,
                )
                db.add(eng)
                counts["engagements"] += 1
    db.flush()

    # 14. Rules
    rules_data = load_json(seed_dir / "rules.json")
    counts["rules"] = 0
    for item in rules_data:
        existing = db.execute(select(Rule).where(Rule.code == item["code"])).scalar_one_or_none()
        if not existing:
            rule = Rule(
                id=item["id"],
                code=item["code"],
                title=item["title"],
                text=item["text"],
                grade=Grade(item["grade"]),
                official_source_id=item.get("official_source_id"),
                applies_if=item.get("applies_if", {}),
                status_logic=item.get("status_logic", {}),
                last_reviewed_on=parse_date(item.get("last_reviewed_on")),
            )
            db.add(rule)
            counts["rules"] += 1
    db.flush()

    db.commit()
    return counts


def run_seed() -> None:
    Base.metadata.create_all(bind=engine)
    root_dir = get_project_root()
    seed_dir = root_dir / "data" / "seed"
    snapshot_dir = root_dir / "data" / "snapshots"
    db = SessionLocal()
    try:
        results = seed_database(db, seed_dir, snapshot_dir)
        print("Database seeded successfully:")
        for k, v in results.items():
            print(f"  {k}: {v} added")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
