from dataclasses import dataclass

from app.engines.evidence import filter_evidence


@dataclass(frozen=True)
class RadarSignalItem:
    id: int
    cluster: str
    text: str
    weight: float
    grade: str
    lead_note: str | None = None
    relayed: bool = False


@dataclass(frozen=True)
class RadarResult:
    probability: float
    band: str
    cluster_counts: dict[str, int]
    adjusted_weights: dict[int, float]
    best_next_signal: RadarSignalItem | None
    hidden_count: int


def get_probability_band(prob: float) -> str:
    # Bands: below 25% Watch, below 55% Warming, below 80% Likely, otherwise Near-certain
    if prob < 0.25:
        return "Watch"
    if prob < 0.55:
        return "Warming"
    if prob < 0.80:
        return "Likely"
    return "Near-certain"


def compute_radar_score(
    ticked_signals: list[RadarSignalItem],
    all_available_signals: list[RadarSignalItem] | None = None,
    floor: str = "D",
    direct_only: bool = False,
    repeat_discount: float = 0.60,
) -> RadarResult:
    # Filter by floor and direct-only
    valid_ticked, hidden_count = filter_evidence(ticked_signals, floor=floor, direct_only=direct_only)

    if not valid_ticked:
        next_sig = None
        if all_available_signals:
            valid_avail, _ = filter_evidence(all_available_signals, floor=floor, direct_only=direct_only)
            if valid_avail:
                next_sig = max(valid_avail, key=lambda s: s.weight)

        return RadarResult(
            probability=0.0,
            band="Watch",
            cluster_counts={},
            adjusted_weights={},
            best_next_signal=next_sig,
            hidden_count=hidden_count,
        )

    # Group by cluster
    by_cluster: dict[str, list[RadarSignalItem]] = {}
    for sig in valid_ticked:
        by_cluster.setdefault(sig.cluster, []).append(sig)

    adjusted_weights: dict[int, float] = {}
    cluster_counts: dict[str, int] = {}
    counted_factors: list[float] = []

    for cluster_name, sig_list in by_cluster.items():
        cluster_counts[cluster_name] = len(sig_list)
        # Sort descending by weight
        sorted_sigs = sorted(sig_list, key=lambda s: s.weight, reverse=True)
        for idx, sig in enumerate(sorted_sigs):
            if idx == 0:
                adj_w = sig.weight
            else:
                adj_w = sig.weight * repeat_discount
            adjusted_weights[sig.id] = round(adj_w, 4)
            counted_factors.append(1.0 - adj_w)

    # Probability = 1 - product over all counted signals of (1 - adjusted weight)
    product_unobserved = 1.0
    for factor in counted_factors:
        product_unobserved *= factor

    prob = round(1.0 - product_unobserved, 4)
    band = get_probability_band(prob)

    # Determine best next signal to check among unticked signals
    best_next: RadarSignalItem | None = None
    if all_available_signals:
        ticked_ids = {s.id for s in valid_ticked}
        valid_avail, _ = filter_evidence(all_available_signals, floor=floor, direct_only=direct_only)
        unticked = [s for s in valid_avail if s.id not in ticked_ids]
        if unticked:
            # Prefer highest weight among unticked
            best_next = max(unticked, key=lambda s: s.weight)

    return RadarResult(
        probability=prob,
        band=band,
        cluster_counts=cluster_counts,
        adjusted_weights=adjusted_weights,
        best_next_signal=best_next,
        hidden_count=hidden_count,
    )
