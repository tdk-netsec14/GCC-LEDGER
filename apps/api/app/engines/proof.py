from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class ProviderInput:
    id: int
    name: str
    category: str
    fee_tier: str | None
    profile_url: str | None
    claimed_engagements: int
    verified_engagements: int


@dataclass(frozen=True)
class RankedProvider:
    id: int
    name: str
    category: str
    fee_tier: str | None
    profile_url: str | None
    claimed_engagements: int
    verified_engagements: int
    proof_ratio: float
    rank: int


def calculate_proof_ratio(verified: int, claimed: int) -> float:
    # Proof ratio = (verified engagements + 1) ÷ (claimed engagements + 2)
    return round((verified + 1) / (claimed + 2), 3)


def rank_providers(
    providers: list[ProviderInput],
    sort_by: Literal["proof", "tier"] = "proof",
) -> list[RankedProvider]:
    evaluated: list[tuple[ProviderInput, float]] = []
    for p in providers:
        ratio = calculate_proof_ratio(p.verified_engagements, p.claimed_engagements)
        evaluated.append((p, ratio))

    if sort_by == "proof":
        # Sort descending by proof ratio
        evaluated.sort(key=lambda x: (x[1], x[0].verified_engagements), reverse=True)
    else:
        # Sort by fee_tier descending or alphabetical
        evaluated.sort(key=lambda x: (x[0].fee_tier or "", x[1]), reverse=True)

    results: list[RankedProvider] = []
    for rank_idx, (p, ratio) in enumerate(evaluated, start=1):
        results.append(
            RankedProvider(
                id=p.id,
                name=p.name,
                category=p.category,
                fee_tier=p.fee_tier,
                profile_url=p.profile_url,
                claimed_engagements=p.claimed_engagements,
                verified_engagements=p.verified_engagements,
                proof_ratio=ratio,
                rank=rank_idx,
            )
        )

    return results
