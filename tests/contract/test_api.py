from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_health() -> None:
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_ledger_counts_api() -> None:
    # Floor D, direct off
    res = client.get("/ledger/counts?floor=D&direct_only=false")
    assert res.status_code == 200
    data = res.json()
    assert data["min_value"] == 1600.0
    assert data["max_value"] == 2117.0
    assert round(data["weighted_centre"]) == 1869
    assert data["hidden_count"] == 0

    # Floor B, direct off
    res_b = client.get("/ledger/counts?floor=B&direct_only=false")
    assert res_b.status_code == 200
    data_b = res_b.json()
    assert round(data_b["weighted_centre"]) == 1913
    assert data_b["hidden_count"] == 3

    # Floor B, direct on
    res_b_dir = client.get("/ledger/counts?floor=B&direct_only=true")
    assert res_b_dir.status_code == 200
    data_b_dir = res_b_dir.json()
    assert data_b_dir["status"] == "empty"
    assert data_b_dir["hidden_count"] == 5


def test_ledger_mix_api() -> None:
    res = client.get("/ledger/mix")
    assert res.status_code == 200
    data = res.json()
    assert "total_records" in data
    assert len(data["mix"]) == 4


def test_contradictions_api() -> None:
    res = client.get("/contradictions?floor=D")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 4


def test_directory_api() -> None:
    res = client.get("/directory?floor=D")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 10
    assert len(data["items"]) > 0


def test_lead_submission_with_sanitized_link() -> None:
    # Section 13.1 test case: "Lead with a link that does not start with http or https: Link stored empty; lead still created as grade D, unreviewed"
    payload = {
        "company_name": "Test Innovative Captive",
        "city": "Bengaluru",
        "status": "announced",
        "source_url": "ftp://malicious.example.org/lead",
    }
    res = client.post("/directory/leads", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["captive_status"] == "unreviewed"
    assert data["grade"] == "D"


def test_cities_rank_api() -> None:
    res = client.get("/cities/rank?preset=balanced")
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 9
    first = data["items"][0]
    assert first["rank"] == 1
    assert 0 <= first["total_score"] <= 100


def test_city_detail_api() -> None:
    res = client.get("/cities/1")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Bengaluru"


def test_states_api() -> None:
    res = client.get("/states")
    assert res.status_code == 200
    states = res.json()
    assert len(states) >= 12
    ka = next((s for s in states if s["name"] == "Karnataka"), None)
    assert ka is not None
    assert ka["has_gcc_policy"] is True


def test_simulator_api() -> None:
    payload = {
        "b50_usd_m": 2.0,
        "headcount": 150,
        "cost_advantage": 0.40,
        "hidden_allowance": 0.12,
        "exchange_rate": 85.0,
        "functions": ["Technology", "Engineering R&D"],
    }
    res = client.post("/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert round(data["year1_gcc_usd_m"], 2) == 6.05
    assert round(data["five_year_gcc_usd_m"], 1) == 29.9
    assert round(data["five_year_hq_usd_m"], 1) == 42.6
    assert data["break_even_month"] == 8
    assert len(data["monthly_curves"]) == 60
    assert len(data["rule_fits"]) > 0


def test_roadmap_api() -> None:
    res = client.get("/roadmap?floor=D")
    assert res.status_code == 200
    steps = res.json()
    assert len(steps) >= 10


def test_radar_api() -> None:
    # 1. Signals catalogue
    res = client.get("/radar/signals?floor=D")
    assert res.status_code == 200
    signals = res.json()
    assert len(signals) >= 14

    # 2. Score signals (different clusters golden case)
    payload = {"signal_ids": [1, 6, 8, 11]}  # 0.50, 0.45, 0.30, 0.35
    score_res = client.post("/radar/score", json=payload)
    assert score_res.status_code == 200
    data = score_res.json()
    assert round(data["probability"] * 100) >= 85
    assert data["band"] == "Near-certain"


def test_providers_api() -> None:
    # Sort by proof
    res = client.get("/providers?sort=proof")
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 6
    # Golden ordering: P25, P60, P40, P35, P120, P200
    ratios = [p["proof_ratio"] for p in data["items"]]
    assert ratios == sorted(ratios, reverse=True)


def test_sources_and_documents_api() -> None:
    res_src = client.get("/sources?floor=D")
    assert res_src.status_code == 200
    assert len(res_src.json()) >= 10

    res_doc = client.get("/documents?floor=D")
    assert res_doc.status_code == 200
    assert len(res_doc.json()) >= 8


def test_auth_and_review_workflow() -> None:
    # 1. Login
    login_res = client.post("/auth/login", json={"username": "reviewer", "password": "reviewer123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. List Tasks
    tasks_res = client.get("/review/tasks", headers=headers)
    assert tasks_res.status_code == 200
    tasks = tasks_res.json()
    assert len(tasks) > 0
    first_task = tasks[0]

    # 3. Submit Decision
    dec_res = client.post(
        f"/review/tasks/{first_task['id']}/decision",
        json={"decision": "approved", "reason": "Verified against state gazette."},
        headers=headers,
    )
    assert dec_res.status_code == 200
    assert "approved" in dec_res.json()["message"]


def test_ask_the_ledger_api() -> None:
    # 1. Out of scope question
    res_out = client.post("/ask", json={"question": "What is the recipe for chocolate cake?"})
    assert res_out.status_code == 200
    assert res_out.json()["refused"] is True

    # 2. In scope question
    res_in = client.post("/ask", json={"question": "What is the process for FIRMS reporting to RBI?", "floor": "D"})
    assert res_in.status_code == 200
    assert res_in.json()["refused"] is False
    assert len(res_in.json()["citations"]) > 0

    # 3. Below floor question
    res_floor = client.post("/ask", json={"question": "What is the platform vendor estimate of GCCs?", "floor": "A"})
    assert res_floor.status_code == 200
    # Vendor estimate is grade D, so asking with floor A should refuse and name the best evidence
    assert res_floor.json()["refused"] is True
    assert "below your" in res_floor.json()["answer"].lower()


def test_error_envelope_on_404() -> None:
    res = client.get("/cities/999999")
    assert res.status_code == 404
    data = res.json()
    assert "error" in data
    assert "code" in data["error"]
    assert "message" in data["error"]
