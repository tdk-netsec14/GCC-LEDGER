from app.ai.llm_provider import MockLLMProvider
from app.ai.verifier import extract_numbers, verify_grounding
from app.models.entities import DocChunk, Grade


def test_extract_numbers():
    text = "India has 1,580 GCCs with a 9.8% annual wage increase and $2.4M setup cost."
    nums = extract_numbers(text)
    assert "1,580" in nums or "1580" in [n.replace(",", "") for n in nums]
    assert "9.8%" in nums
    assert "2.4" in nums


def test_verify_grounding_success():
    chunk = DocChunk(
        id=1,
        source_id=1,
        snapshot_id=1,
        chunk_text="Bengaluru hosts 1,580 active GCC facilities across IT and engineering.",
        grade=Grade.B,
        relayed=False,
    )
    answer = "According to reports, Bengaluru hosts 1,580 active GCC facilities."
    valid, err = verify_grounding(answer, [1], [chunk])
    assert valid is True
    assert err is None


def test_verify_grounding_numeric_failure():
    chunk = DocChunk(
        id=1,
        source_id=1,
        snapshot_id=1,
        chunk_text="Bengaluru hosts 1,580 active GCC facilities across IT and engineering.",
        grade=Grade.B,
        relayed=False,
    )
    # 2,000 does NOT appear in the chunk text
    hallucinated_answer = "Bengaluru hosts 2,000 active GCC facilities."
    valid, err = verify_grounding(hallucinated_answer, [1], [chunk])
    assert valid is False
    assert "Numeric figure" in (err or "")


def test_verify_grounding_invalid_chunk_id():
    chunk = DocChunk(
        id=1,
        source_id=1,
        snapshot_id=1,
        chunk_text="Sample text",
        grade=Grade.A,
        relayed=False,
    )
    valid, err = verify_grounding("Sample text", [99], [chunk])
    assert valid is False
    assert "not in retrieved candidate list" in (err or "")


def test_mock_llm_provider_generation():
    provider = MockLLMProvider()
    user_prompt = (
        "--- BEGIN CONTEXT ---\n"
        "Karnataka IT Policy offers up to 25% capital subsidy.\n"
        "--- END CONTEXT ---\n"
        "--- BEGIN QUESTION ---\n"
        "What subsidy does Karnataka offer?\n"
        "--- END QUESTION ---"
    )
    ans = provider.generate("You are a helpful assistant.", user_prompt)
    assert "25%" in ans
    assert "Karnataka" in ans
