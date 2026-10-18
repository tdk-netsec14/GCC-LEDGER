import json
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_evidence_params
from app.engines.evidence import grade_satisfies_floor
from app.models.entities import Source
from app.schemas import DocumentItemSchema, SourceSchema

router = APIRouter(tags=["Sources & Documents"])


def get_project_root() -> Path:
    current = Path(__file__).resolve().parent
    for _ in range(6):
        if (current / "data" / "seed").exists():
            return current
        current = current.parent
    return Path.cwd()


@router.get("/sources", response_model=list[SourceSchema])
def get_sources(
    evidence: tuple[str, bool] = Depends(get_evidence_params),
    db: Session = Depends(get_db),
) -> list[SourceSchema]:
    floor, _direct_only = evidence
    stmt = select(Source).order_by(Source.id.asc())
    sources = db.execute(stmt).scalars().all()

    results: list[SourceSchema] = []
    for s in sources:
        if grade_satisfies_floor(s.default_grade.value, floor):
            results.append(
                SourceSchema(
                    id=s.id,
                    publisher=s.publisher,
                    publisher_type=s.publisher_type,
                    title=s.title,
                    url=s.url,
                    published_on=s.published_on,
                    last_checked_on=s.last_checked_on,
                    default_grade=s.default_grade.value,
                )
            )

    return results


@router.get("/documents", response_model=list[DocumentItemSchema])
def get_documents(
    evidence: tuple[str, bool] = Depends(get_evidence_params),
) -> list[DocumentItemSchema]:
    floor, _direct_only = evidence

    docs_file = get_project_root() / "data" / "seed" / "docs.json"

    with open(docs_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    results: list[DocumentItemSchema] = []
    for item in data:
        doc_grade = item.get("grade", "A")
        if grade_satisfies_floor(doc_grade, floor):
            results.append(
                DocumentItemSchema(
                    id=item["id"],
                    group=item["group"],
                    title=item["title"],
                    issuing_authority=item["issuing_authority"],
                    purpose=item["purpose"],
                    step=item["step"],
                    portal_url=item.get("portal_url"),
                    grade=doc_grade,
                    last_checked_on=item.get("last_checked_on"),
                )
            )

    return results
