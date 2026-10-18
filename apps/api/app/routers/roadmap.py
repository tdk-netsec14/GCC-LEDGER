import json
from pathlib import Path

from fastapi import APIRouter, Depends

from app.deps import get_evidence_params
from app.engines.evidence import grade_satisfies_floor
from app.schemas import RoadmapStepSchema

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


def get_project_root() -> Path:
    current = Path(__file__).resolve().parent
    for _ in range(6):
        if (current / "data" / "seed").exists():
            return current
        current = current.parent
    return Path.cwd()


@router.get("", response_model=list[RoadmapStepSchema])
def get_roadmap(
    evidence: tuple[str, bool] = Depends(get_evidence_params),
) -> list[RoadmapStepSchema]:
    floor, _direct_only = evidence

    roadmap_file = get_project_root() / "data" / "seed" / "roadmap.json"

    with open(roadmap_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    results: list[RoadmapStepSchema] = []
    for item in data:
        step_grade = item.get("grade", "A")
        if grade_satisfies_floor(step_grade, floor):
            results.append(
                RoadmapStepSchema(
                    step_number=item["step_number"],
                    title=item["title"],
                    timing_days=item["timing_days"],
                    description=item["description"],
                    grade=step_grade,
                    portal_url=item.get("portal_url"),
                )
            )

    return results
