from collections.abc import Sequence
from typing import Protocol, TypeVar

GRADE_ORDER = {"A": 4, "B": 3, "C": 2, "D": 1}


class EvidenceItem(Protocol):
    @property
    def grade(self) -> str: ...

    @property
    def relayed(self) -> bool: ...


T = TypeVar("T", bound=EvidenceItem)


def grade_satisfies_floor(grade: str, floor: str) -> bool:
    target_rank = GRADE_ORDER.get(floor.upper(), 1)
    item_rank = GRADE_ORDER.get(grade.upper(), 0)
    return item_rank >= target_rank


def filter_evidence(
    items: Sequence[T],
    floor: str = "D",
    direct_only: bool = False,
) -> tuple[list[T], int]:
    passed: list[T] = []
    hidden_count = 0

    for item in items:
        passes_floor = grade_satisfies_floor(item.grade, floor)
        passes_direct = not (direct_only and item.relayed)

        if passes_floor and passes_direct:
            passed.append(item)
        else:
            hidden_count += 1

    return passed, hidden_count
