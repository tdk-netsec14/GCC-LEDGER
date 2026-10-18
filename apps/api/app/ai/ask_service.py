import re
import time

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.engines.evidence import grade_satisfies_floor
from app.models.entities import DocChunk, Grade, QALog, Source
from app.schemas import AskResponse, CitedChunkSchema

OUT_OF_SCOPE_KEYWORDS = [
    "recipe",
    "weather",
    "cricket",
    "movie",
    "football",
    "horoscope",
    "capital of france",
]

LEGAL_TAX_KEYWORDS = [
    "tax",
    "incorporate",
    "fdi",
    "rbi",
    "gst",
    "transfer pricing",
    "legal",
    "compliance",
    "retrenchment",
    "labour code",
]

STOP_WORDS = {
    "what", "is", "the", "of", "a", "an", "and", "or", "in", "to", "for",
    "with", "on", "at", "by", "from", "it", "this", "that", "are", "be",
    "how", "many", "does", "have", "tell", "me", "about"
}

LEGAL_NOTICE = " Notice: Figures are claims read from public sources and are not independently verified unless graded A. This is information and not legal, tax or financial advice."


def is_out_of_scope(question: str) -> bool:
    q_lower = question.lower()
    return any(kw in q_lower for kw in OUT_OF_SCOPE_KEYWORDS)


def is_legal_or_tax(question: str) -> bool:
    q_lower = question.lower()
    return any(kw in q_lower for kw in LEGAL_TAX_KEYWORDS)


def ask_ledger_pipeline(
    question: str,
    floor: str,
    direct_only: bool,
    db: Session,
) -> AskResponse:
    start_time = time.time()
    q_clean = question.strip()

    # 1. Intent Check
    if is_out_of_scope(q_clean):
        latency_ms = int((time.time() - start_time) * 1000)
        resp = AskResponse(
            answer="I can only assist with questions regarding Indian Global Capability Centres (GCCs), state policies, setup costs, rules, radar signals, and service providers. Your question appears to be outside this scope.",
            claims=[],
            citations=[],
            lowest_grade_relied_on=None,
            refused=True,
            refusal_reason="Out of domain scope",
            latency_ms=latency_ms,
        )
        _log_qa(db, q_clean, floor, direct_only, resp)
        return resp

    # 2. Retrieval over approved doc chunks
    stmt = (
        select(DocChunk, Source.title, Source.publisher)
        .join(Source, DocChunk.source_id == Source.id)
        .order_by(DocChunk.id.asc())
    )
    rows = db.execute(stmt).all()

    # Extract meaningful search tokens without stop words
    raw_tokens = re.findall(r"\w+", q_clean.lower())
    q_tokens = {token for token in raw_tokens if token not in STOP_WORDS and len(token) > 2}

    scored_chunks: list[tuple[float, DocChunk, str, str]] = []

    for chunk, s_title, s_pub in rows:
        chunk_text_lower = chunk.chunk_text.lower()
        score = sum(1.0 for token in q_tokens if token in chunk_text_lower)
        if score > 0:
            scored_chunks.append((score, chunk, s_title, s_pub))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)

    # If no keyword matched, we have no relevant evidence
    if not scored_chunks:
        latency_ms = int((time.time() - start_time) * 1000)
        resp = AskResponse(
            answer="No relevant documented evidence was found in approved sources for your question.",
            claims=[],
            citations=[],
            lowest_grade_relied_on=None,
            refused=True,
            refusal_reason="No matching evidence found",
            latency_ms=latency_ms,
        )
        _log_qa(db, q_clean, floor, direct_only, resp)
        return resp

    # 3. Filter retrieved relevant chunks by Evidence Floor & Direct-only
    passed_chunks: list[tuple[float, DocChunk, str, str]] = []
    below_floor_chunks: list[tuple[float, DocChunk, str, str]] = []

    for item in scored_chunks:
        _, chunk, _, _ = item
        passes_floor = grade_satisfies_floor(chunk.grade.value, floor)
        passes_direct = not (direct_only and chunk.relayed)

        if passes_floor and passes_direct:
            passed_chunks.append(item)
        else:
            below_floor_chunks.append(item)

    # 4. Refusal rule if best evidence is below floor
    if not passed_chunks:
        latency_ms = int((time.time() - start_time) * 1000)
        best_below = below_floor_chunks[0] if below_floor_chunks else None
        if best_below:
            best_chunk, best_title, best_pub = best_below[1], best_below[2], best_below[3]
            refusal_text = (
                f"The best evidence for this question is below your selected evidence floor (Grade {best_chunk.grade.value} "
                f"from {best_pub}: '{best_title}'). Please lower your evidence floor to view and cite this material."
            )
        else:
            refusal_text = "No evidence meeting your current floor and direct-source criteria was found for this question."

        resp = AskResponse(
            answer=refusal_text,
            claims=[],
            citations=[],
            lowest_grade_relied_on=None,
            refused=True,
            refusal_reason="Evidence below floor",
            latency_ms=latency_ms,
        )
        _log_qa(db, q_clean, floor, direct_only, resp)
        return resp

    # 5. Build Grounded Answer from passed chunks
    top_chunks = passed_chunks[:3]
    citations: list[CitedChunkSchema] = []
    grades_used: list[str] = []

    passages: list[str] = []
    for _, chk, title, pub in top_chunks:
        citations.append(
            CitedChunkSchema(
                id=chk.id,
                source_title=title,
                publisher=pub,
                grade=chk.grade.value,
                excerpt=chk.chunk_text[:160] + "..." if len(chk.chunk_text) > 160 else chk.chunk_text,
            )
        )
        grades_used.append(chk.grade.value)
        passages.append(f"[{pub} - Grade {chk.grade.value}]: {chk.chunk_text}")

    # Determine lowest grade relied on
    grade_order = {"A": 4, "B": 3, "C": 2, "D": 1}
    lowest_grade = min(grades_used, key=lambda g: grade_order.get(g, 1))

    # Synthetic grounded phrasing
    answer_body = " ".join([p.split("]: ")[1] for p in passages])
    if len(answer_body) > 400:
        answer_body = answer_body[:400] + "..."

    final_answer = f"Based on approved sources (lowest grade relied on: {lowest_grade}): {answer_body}"
    if is_legal_or_tax(q_clean):
        final_answer += LEGAL_NOTICE

    latency_ms = int((time.time() - start_time) * 1000)

    resp = AskResponse(
        answer=final_answer,
        claims=[{"chunk_id": c.id, "text": c.excerpt} for c in citations],
        citations=citations,
        lowest_grade_relied_on=lowest_grade,
        refused=False,
        refusal_reason=None,
        latency_ms=latency_ms,
    )
    _log_qa(db, q_clean, floor, direct_only, resp)
    return resp


def _log_qa(
    db: Session,
    question: str,
    floor: str,
    direct_only: bool,
    resp: AskResponse,
) -> None:
    try:
        log_entry = QALog(
            question=question,
            floor=Grade(floor),
            direct_only=direct_only,
            answer=resp.answer,
            cited_chunk_ids=[c.id for c in resp.citations],
            lowest_grade_used=Grade(resp.lowest_grade_relied_on) if resp.lowest_grade_relied_on else None,
            refused=resp.refused,
            latency_ms=resp.latency_ms,
        )
        db.add(log_entry)
        db.commit()
    except Exception:  # noqa: BLE001
        db.rollback()
