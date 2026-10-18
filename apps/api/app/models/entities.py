import enum
from datetime import date, datetime
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    event,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy.sql import func

from app.database import Base


class Grade(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"


class PublisherType(str, enum.Enum):
    GOVERNMENT = "government"
    REGULATOR = "regulator"
    INDUSTRY_BODY = "industry body"
    PROFESSIONAL_FIRM = "professional firm"
    PRESS = "press"
    VENDOR = "vendor"


class Timestamped(Base):
    __abstract__ = True
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Source(Timestamped):
    __tablename__ = "source"
    publisher: Mapped[str] = mapped_column(String(255))
    publisher_type: Mapped[str] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(String(500))
    url: Mapped[str] = mapped_column(String(2000), unique=True)
    published_on: Mapped[date | None] = mapped_column(Date)
    last_checked_on: Mapped[date | None] = mapped_column(Date)
    default_grade: Mapped[Grade] = mapped_column(Enum(Grade))

    snapshots: Mapped[list["SourceSnapshot"]] = relationship(back_populates="source", cascade="all, delete-orphan")
    claims: Mapped[list["Claim"]] = relationship(back_populates="source")


class SourceSnapshot(Timestamped):
    __tablename__ = "source_snapshot"
    source_id: Mapped[int] = mapped_column(ForeignKey("source.id"), index=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    content_hash: Mapped[str] = mapped_column(String(64), unique=True)
    stored_text_path: Mapped[str] = mapped_column(String(1000))

    source: Mapped["Source"] = relationship(back_populates="snapshots")
    chunks: Mapped[list["DocChunk"]] = relationship(back_populates="snapshot", cascade="all, delete-orphan")


class Claim(Timestamped):
    __tablename__ = "claim"
    __table_args__ = (
        CheckConstraint("status IN ('draft', 'approved', 'rejected')", name="valid_claim_status"),
    )
    subject: Mapped[str] = mapped_column(String(255), index=True)
    metric: Mapped[str] = mapped_column(String(255), index=True)
    value_number: Mapped[float | None] = mapped_column(Float)
    value_text: Mapped[str | None] = mapped_column(Text)
    unit: Mapped[str | None] = mapped_column(String(100))
    unit_of_count: Mapped[str | None] = mapped_column(String(100))
    as_of_date: Mapped[date | None] = mapped_column(Date)
    grade: Mapped[Grade] = mapped_column(Enum(Grade), index=True)
    relayed: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("source.id"), index=True)
    snapshot_id: Mapped[int | None] = mapped_column(ForeignKey("source_snapshot.id"))
    status: Mapped[str] = mapped_column(String(16), default="draft", index=True)

    source: Mapped["Source | None"] = relationship(back_populates="claims")
    snapshot: Mapped["SourceSnapshot | None"] = relationship()

    @validates("status")
    def validate_status_value(self, key: str, value: str) -> str:
        if value not in ("draft", "approved", "rejected"):
            raise ValueError(f"Invalid claim status: {value}")
        return value


@event.listens_for(Claim, "before_insert")
@event.listens_for(Claim, "before_update")
def validate_claim_approval(mapper: Any, connection: Any, target: Claim) -> None:
    if target.status == "approved" and (not target.source_id or not target.snapshot_id):
        raise ValueError("A claim cannot be approved without a source and a snapshot.")



class Company(Timestamped):
    __tablename__ = "company"
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hq_country: Mapped[str | None] = mapped_column(String(100))
    parent_company_id: Mapped[int | None] = mapped_column(ForeignKey("company.id"))
    sector: Mapped[str | None] = mapped_column(String(100))
    captive_status: Mapped[str] = mapped_column(String(16), default="unreviewed")
    captive_reason: Mapped[str | None] = mapped_column(Text)

    records: Mapped[list["GCCRecord"]] = relationship(back_populates="company", cascade="all, delete-orphan")


class State(Timestamped):
    __tablename__ = "state"
    name: Mapped[str] = mapped_column(String(100), unique=True)
    code: Mapped[str] = mapped_column(String(8), unique=True)
    has_gcc_policy: Mapped[bool | None] = mapped_column(Boolean)
    policy_status: Mapped[str] = mapped_column(String(32), default="none documented")
    policy_claim_id: Mapped[int | None] = mapped_column(ForeignKey("claim.id"))

    cities: Mapped[list["City"]] = relationship(back_populates="state")
    incentives: Mapped[list["Incentive"]] = relationship(back_populates="state")


class City(Timestamped):
    __tablename__ = "city"
    name: Mapped[str] = mapped_column(String(100), unique=True)
    state_id: Mapped[int] = mapped_column(ForeignKey("state.id"), index=True)
    year1_cost_low_usd_m: Mapped[float | None] = mapped_column(Float)
    year1_cost_high_usd_m: Mapped[float | None] = mapped_column(Float)
    senior_salary_low_lakh: Mapped[float | None] = mapped_column(Float)
    senior_salary_high_lakh: Mapped[float | None] = mapped_column(Float)
    gcc_count: Mapped[int | None] = mapped_column(Integer)
    cost_claim_id: Mapped[int | None] = mapped_column(ForeignKey("claim.id"))
    ecosystem_claim_id: Mapped[int | None] = mapped_column(ForeignKey("claim.id"))

    state: Mapped["State"] = relationship(back_populates="cities")
    records: Mapped[list["GCCRecord"]] = relationship(back_populates="city")


class GCCRecord(Timestamped):
    __tablename__ = "gcc_record"
    company_id: Mapped[int] = mapped_column(ForeignKey("company.id"), index=True)
    city_id: Mapped[int] = mapped_column(ForeignKey("city.id"), index=True)
    status: Mapped[str] = mapped_column(String(32))
    note: Mapped[str | None] = mapped_column(Text)
    claim_id: Mapped[int | None] = mapped_column(ForeignKey("claim.id"))

    company: Mapped["Company"] = relationship(back_populates="records")
    city: Mapped["City"] = relationship(back_populates="records")
    claim: Mapped["Claim | None"] = relationship()


class Incentive(Timestamped):
    __tablename__ = "incentive"
    state_id: Mapped[int] = mapped_column(ForeignKey("state.id"), index=True)
    policy_name: Mapped[str] = mapped_column(String(500))
    valid_from: Mapped[date | None] = mapped_column(Date)
    valid_to: Mapped[date | None] = mapped_column(Date)
    policy_fraction: Mapped[float] = mapped_column(Float, default=0.0)
    capital_fraction: Mapped[float] = mapped_column(Float, default=0.0)
    employment_fraction: Mapped[float] = mapped_column(Float, default=0.0)
    other_fraction: Mapped[float] = mapped_column(Float, default=0.0)
    eligibility_text: Mapped[str | None] = mapped_column(Text)
    min_headcount: Mapped[int | None] = mapped_column(Integer)
    location_scope: Mapped[str | None] = mapped_column(Text)
    claim_id: Mapped[int | None] = mapped_column(ForeignKey("claim.id"))

    state: Mapped["State"] = relationship(back_populates="incentives")
    claim: Mapped["Claim | None"] = relationship()


class Rule(Timestamped):
    __tablename__ = "rule"
    code: Mapped[str] = mapped_column(String(100), unique=True)
    title: Mapped[str] = mapped_column(String(500))
    text: Mapped[str] = mapped_column(Text)
    status_logic: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    grade: Mapped[Grade] = mapped_column(Enum(Grade))
    official_source_id: Mapped[int | None] = mapped_column(ForeignKey("source.id"))
    applies_if: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    last_reviewed_on: Mapped[date | None] = mapped_column(Date)

    official_source: Mapped["Source | None"] = relationship()


class Contradiction(Timestamped):
    __tablename__ = "contradiction"
    title: Mapped[str] = mapped_column(String(500))
    reading: Mapped[str] = mapped_column(Text)
    to_settle: Mapped[str] = mapped_column(Text)
    last_checked_on: Mapped[date | None] = mapped_column(Date)

    claims: Mapped[list["Claim"]] = relationship(
        secondary="contradiction_claim",
        backref="contradictions"
    )


class ContradictionClaim(Base):
    __tablename__ = "contradiction_claim"
    contradiction_id: Mapped[int] = mapped_column(ForeignKey("contradiction.id"), primary_key=True)
    claim_id: Mapped[int] = mapped_column(ForeignKey("claim.id"), primary_key=True)


class SignalDefinition(Timestamped):
    __tablename__ = "signal_def"
    cluster: Mapped[str] = mapped_column(String(100), index=True)
    text: Mapped[str] = mapped_column(Text)
    weight: Mapped[float] = mapped_column(Float)
    grade: Mapped[Grade] = mapped_column(Enum(Grade))
    lead_note: Mapped[str | None] = mapped_column(Text)


class SignalObservation(Timestamped):
    __tablename__ = "signal_observation"
    company_id: Mapped[int] = mapped_column(ForeignKey("company.id"))
    signal_id: Mapped[int] = mapped_column(ForeignKey("signal_def.id"))
    observed_on: Mapped[date] = mapped_column(Date)
    evidence_url: Mapped[str] = mapped_column(String(2000))
    snapshot_id: Mapped[int | None] = mapped_column(ForeignKey("source_snapshot.id"))

    company: Mapped["Company"] = relationship()
    signal: Mapped["SignalDefinition"] = relationship()


class Provider(Timestamped):
    __tablename__ = "provider"
    name: Mapped[str] = mapped_column(String(255), unique=True)
    category: Mapped[str] = mapped_column(String(100))
    fee_tier: Mapped[str | None] = mapped_column(String(100))
    profile_url: Mapped[str | None] = mapped_column(String(2000))

    engagements: Mapped[list["Engagement"]] = relationship(back_populates="provider", cascade="all, delete-orphan")


class Engagement(Timestamped):
    __tablename__ = "engagement"
    provider_id: Mapped[int] = mapped_column(ForeignKey("provider.id"), index=True)
    client_name: Mapped[str] = mapped_column(String(255))
    city_id: Mapped[int | None] = mapped_column(ForeignKey("city.id"))
    scope: Mapped[str] = mapped_column(Text)
    year: Mapped[int | None] = mapped_column(Integer)
    footprint_url: Mapped[str | None] = mapped_column(String(2000))
    footprint_checked: Mapped[bool] = mapped_column(Boolean, default=False)
    client_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)

    provider: Mapped["Provider"] = relationship(back_populates="engagements")
    city: Mapped["City | None"] = relationship()

    @property
    def is_verified(self) -> bool:
        return bool(self.footprint_checked and self.client_confirmed)


class ReviewTask(Timestamped):
    __tablename__ = "review_task"
    kind: Mapped[str] = mapped_column(String(32), index=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    assigned_to: Mapped[str | None] = mapped_column(String(255))
    state: Mapped[str] = mapped_column(String(32), default="open", index=True)
    decision: Mapped[str | None] = mapped_column(String(32))
    reason: Mapped[str | None] = mapped_column(Text)


class DocChunk(Timestamped):
    __tablename__ = "doc_chunk"
    source_id: Mapped[int] = mapped_column(ForeignKey("source.id"), index=True)
    snapshot_id: Mapped[int] = mapped_column(ForeignKey("source_snapshot.id"))
    chunk_text: Mapped[str] = mapped_column(Text)
    grade: Mapped[Grade] = mapped_column(Enum(Grade), index=True)
    relayed: Mapped[bool] = mapped_column(Boolean, default=False)
    embedding_id: Mapped[str | None] = mapped_column(String(255))

    source: Mapped["Source"] = relationship()
    snapshot: Mapped["SourceSnapshot"] = relationship(back_populates="chunks")


class QALog(Timestamped):
    __tablename__ = "qa_log"
    question: Mapped[str] = mapped_column(Text)
    floor: Mapped[Grade] = mapped_column(Enum(Grade))
    direct_only: Mapped[bool] = mapped_column(Boolean)
    answer: Mapped[str] = mapped_column(Text)
    cited_chunk_ids: Mapped[list[int]] = mapped_column(JSON)
    lowest_grade_used: Mapped[Grade | None] = mapped_column(Enum(Grade))
    refused: Mapped[bool] = mapped_column(Boolean)
    latency_ms: Mapped[int] = mapped_column(Integer)


class AuditLog(Timestamped):
    __tablename__ = "audit_log"
    actor: Mapped[str] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(String(100))
    table_name: Mapped[str] = mapped_column(String(100))
    row_id: Mapped[str] = mapped_column(String(100))
    before: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    after: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ReviewerUser(Timestamped):
    __tablename__ = "reviewer_user"
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="reviewer")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
