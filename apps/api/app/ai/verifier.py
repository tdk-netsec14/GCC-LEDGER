import re

from app.models.entities import DocChunk


class VerificationError(Exception):
    pass


def extract_numbers(text: str) -> list[str]:
    """Extract numeric sequences from text (integers, decimals, percentages)."""
    pattern = r"(?<!\d)\d+(?:,\d{3})*(?:\.\d+)?%?"
    raw_nums = re.findall(pattern, text)
    return [n.strip() for n in raw_nums if n.strip()]


def verify_grounding(
    answer: str,
    cited_chunk_ids: list[int],
    available_chunks: list[DocChunk],
) -> tuple[bool, str | None]:
    """Verifies that:

    1. All cited chunk IDs exist in available_chunks.
    2. Every numeric figure mentioned in the answer appears verbatim in at least one cited chunk.
    Returns (is_valid, failure_reason).
    """
    chunk_map = {c.id: c for c in available_chunks}

    # 1. Check citation validity
    for cid in cited_chunk_ids:
        if cid not in chunk_map:
            return False, f"Cited chunk_id {cid} was not in retrieved candidate list"

    # Gather text from cited chunks
    cited_text = " ".join([chunk_map[cid].chunk_text for cid in cited_chunk_ids if cid in chunk_map])

    # 2. Check numeric grounding
    answer_numbers = extract_numbers(answer)
    for num in answer_numbers:
        # Check if the number appears verbatim in the cited text
        # Also handle comma differences: e.g. "1580" vs "1,580"
        num_clean = num.replace(",", "").replace("%", "")
        cited_clean = cited_text.replace(",", "")

        if num not in cited_text and num_clean not in cited_clean:
            return (
                False,
                f"Numeric figure '{num}' in answer does not appear in any cited chunk text",
            )

    return True, None
