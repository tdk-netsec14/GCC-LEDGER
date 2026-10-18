from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_evidence_params
from app.engines.evidence import filter_evidence
from app.models.entities import City, Company, GCCRecord, ReviewTask
from app.schemas import (
    CompanySchema,
    GCCRecordSchema,
    LeadSubmissionRequest,
    LeadSubmissionResponse,
    PaginatedResponse,
)

router = APIRouter(prefix="/directory", tags=["Directory"])


class DirectoryEvidenceAdapter:
    def __init__(self, company: CompanySchema):
        self.company = company
        self.grade = company.grade
        self.relayed = company.relayed


@router.get("", response_model=PaginatedResponse[CompanySchema])
def get_directory(
    q: str | None = Query(default=None, description="Search company name, sector or note"),
    city: str | None = Query(default=None, description="Filter by city name"),
    status: str | None = Query(default=None, description="Filter by status (announced, landed, expanding, not_captive)"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    evidence: tuple[str, bool] = Depends(get_evidence_params),
    db: Session = Depends(get_db),
) -> PaginatedResponse[CompanySchema]:
    floor, direct_only = evidence

    stmt = select(Company).order_by(Company.name.asc())

    if q:
        stmt = stmt.where(
            or_(
                Company.name.ilike(f"%{q}%"),
                Company.sector.ilike(f"%{q}%"),
                Company.captive_reason.ilike(f"%{q}%"),
            )
        )

    companies = db.execute(stmt).scalars().all()

    company_schemas: list[CompanySchema] = []
    for comp in companies:
        record_schemas: list[GCCRecordSchema] = []
        for rec in comp.records:
            city_name = rec.city.name if rec.city else "Unknown City"
            if city and city.lower() not in city_name.lower():
                continue
            if status and status.lower() != rec.status.lower():
                continue
            record_schemas.append(
                GCCRecordSchema(
                    id=rec.id,
                    city_name=city_name,
                    status=rec.status,
                    note=rec.note,
                )
            )

        # If filtering by city/status and no matching records, skip company unless no filters
        if (city or status) and not record_schemas:
            continue

        # In seed, non-captives have grade A/B corporate records; leads have D
        comp_grade = "D" if comp.captive_status == "unreviewed" else ("A" if comp.captive_status == "no" else "B")
        comp_relayed = False

        company_schemas.append(
            CompanySchema(
                id=comp.id,
                name=comp.name,
                hq_country=comp.hq_country,
                sector=comp.sector,
                captive_status=comp.captive_status,
                captive_reason=comp.captive_reason,
                records=record_schemas,
                grade=comp_grade,
                relayed=comp_relayed,
            )
        )

    # Filter with Evidence Floor & Direct-only
    wrapped = [DirectoryEvidenceAdapter(c) for c in company_schemas]
    passed_wrapped, hidden_count = filter_evidence(wrapped, floor=floor, direct_only=direct_only)
    passed_companies = [w.company for w in passed_wrapped]

    # Pagination
    total = len(passed_companies)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_items = passed_companies[start_idx:end_idx]

    return PaginatedResponse[CompanySchema](
        items=page_items,
        total=total,
        page=page,
        page_size=page_size,
        hidden_count=hidden_count,
    )


@router.post("/leads", response_model=LeadSubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_lead(
    payload: LeadSubmissionRequest,
    db: Session = Depends(get_db),
) -> LeadSubmissionResponse:
    # Check if company already exists
    existing = db.execute(select(Company).where(Company.name == payload.company_name)).scalar_one_or_none()
    if not existing:
        company = Company(
            name=payload.company_name,
            captive_status="unreviewed",
            captive_reason="Public directory lead submission pending human verification.",
        )
        db.add(company)
        db.flush()
    else:
        company = existing

    # Find or associate city
    city_obj = db.execute(select(City).where(City.name.ilike(payload.city))).scalar_one_or_none()
    city_id = city_obj.id if city_obj else 1

    # Create unreviewed GCC Record
    rec = GCCRecord(
        company_id=company.id,
        city_id=city_id,
        status=payload.status,
        note=f"Submitted lead with source link: {payload.source_url or 'None'}",
    )
    db.add(rec)

    # Create Review Task for Reviewers
    task = ReviewTask(
        kind="lead",
        payload={
            "company_name": payload.company_name,
            "city": payload.city,
            "status": payload.status,
            "source_url": payload.source_url,
            "grade": "D",
        },
        state="open",
        reason="Awaiting reviewer evidence check against primary company registry / filings.",
    )
    db.add(task)
    db.commit()

    return LeadSubmissionResponse(
        id=company.id,
        company_name=company.name,
        captive_status="unreviewed",
        grade="D",
        status="queued_for_review",
        message="Lead submitted successfully. Placed in reviewer queue at Grade D (Unreviewed).",
    )
