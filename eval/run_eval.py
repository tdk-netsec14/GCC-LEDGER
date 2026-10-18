import json
import sys
import time
from pathlib import Path

# Add apps/api to path
repo_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(repo_root / "apps" / "api"))

from app.ai.ask_service import ask_ledger_pipeline
from app.ai.verifier import verify_grounding
from app.database import SessionLocal
from app.models.entities import DocChunk


def run_evaluation() -> int:
    db = SessionLocal()
    questions_file = Path(__file__).resolve().parent / "questions.json"

    with open(questions_file, "r", encoding="utf-8") as f:
        questions = json.load(f)

    print(f"Starting GCC Ledger AI Evaluation Harness ({len(questions)} questions)...")
    print("=" * 75)

    all_chunks = db.query(DocChunk).all()
    chunk_map = {c.id: c for c in all_chunks}

    total_questions = len(questions)
    expected_refusals = 0
    actual_refusals = 0
    correct_refusals = 0

    citation_checks = 0
    citation_passed = 0

    grounding_checks = 0
    grounding_passed = 0

    total_latency_ms = 0

    for q in questions:
        q_text = q["question"]
        exp_refuse = q["expected_refusal"]
        floor = q["floor"]
        direct_only = q["direct_only"]

        if exp_refuse:
            expected_refusals += 1

        start_t = time.time()
        resp = ask_ledger_pipeline(
            question=q_text,
            floor=floor,
            direct_only=direct_only,
            db=db,
        )
        latency = int((time.time() - start_t) * 1000)
        total_latency_ms += latency

        if resp.refused:
            actual_refusals += 1
            if exp_refuse:
                correct_refusals += 1
        else:
            # Check citations
            citation_checks += 1
            cited_ids = [c.id for c in resp.citations]
            if cited_ids and all(cid in chunk_map for cid in cited_ids):
                citation_passed += 1

            # Check numeric grounding
            grounding_checks += 1
            valid, _ = verify_grounding(
                answer=resp.answer,
                cited_chunk_ids=cited_ids,
                available_chunks=[chunk_map[cid] for cid in cited_ids if cid in chunk_map],
            )
            if valid:
                grounding_passed += 1

    db.close()

    # Calculate metrics
    citation_validity_pct = (citation_passed / citation_checks * 100) if citation_checks > 0 else 100.0
    numeric_grounding_pct = (grounding_passed / grounding_checks * 100) if grounding_checks > 0 else 100.0
    correct_refusal_pct = (correct_refusals / expected_refusals * 100) if expected_refusals > 0 else 100.0
    avg_latency = total_latency_ms / total_questions if total_questions > 0 else 0

    print("\nEvaluation Results Summary:")
    print("-" * 50)
    print(f"Total Evaluated Questions : {total_questions}")
    print(f"Citation Validity Rate   : {citation_validity_pct:.1f}% (Target: 100%)")
    print(f"Numeric Grounding Rate   : {numeric_grounding_pct:.1f}% (Target: 100%)")
    print(f"Correct Refusal Rate     : {correct_refusal_pct:.1f}% (Target: >= 95%)")
    print(f"Average Latency          : {avg_latency:.1f} ms")
    print("-" * 50)

    # Acceptance threshold checks per section 13.3
    passed = True
    if citation_validity_pct < 100.0:
        print("[FAIL] Citation validity below 100%")
        passed = False
    if numeric_grounding_pct < 100.0:
        print("[FAIL] Numeric grounding below 100%")
        passed = False
    if correct_refusal_pct < 95.0:
        print("[FAIL] Correct refusal rate below 95%")
        passed = False

    if passed:
        print("[SUCCESS] All evaluation criteria met.")
        return 0
    else:
        print("[FAILURE] Evaluation criteria not met.")
        return 1


if __name__ == "__main__":
    sys.exit(run_evaluation())
