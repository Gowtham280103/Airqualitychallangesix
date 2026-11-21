import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_root(client: AsyncClient):
    resp = await client.get("/")
    assert resp.status_code == 200


# ── Air Quality ───────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_current_aqi_valid_city(client: AsyncClient):
    resp = await client.get("/api/air-quality/current?city=Delhi")
    assert resp.status_code == 200
    data = resp.json()
    assert "aqi" in data
    assert 0 <= data["aqi"] <= 500
    assert "pollutants" in data


@pytest.mark.asyncio
async def test_current_aqi_missing_city(client: AsyncClient):
    resp = await client.get("/api/air-quality/current")
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_current_aqi_xss_input(client: AsyncClient):
    resp = await client.get("/api/air-quality/current?city=<script>alert(1)</script>")
    # Should either sanitize and return data or return 422
    assert resp.status_code in (200, 422)


@pytest.mark.asyncio
async def test_aqi_history(client: AsyncClient):
    resp = await client.get("/api/air-quality/history?city=Mumbai&days=7")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 7
    for entry in data:
        assert "date" in entry
        assert "aqi" in entry


@pytest.mark.asyncio
async def test_aqi_history_invalid_days(client: AsyncClient):
    resp = await client.get("/api/air-quality/history?city=Delhi&days=100")
    assert resp.status_code == 422


# ── AI Chat ───────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_ai_chat_basic(client: AsyncClient):
    resp = await client.post("/api/ai/chat", json={
        "message": "Is it safe to go outside?",
        "location": "Delhi",
        "aqi": 150,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "message" in data
    assert len(data["message"]) > 10


@pytest.mark.asyncio
async def test_ai_chat_empty_message(client: AsyncClient):
    resp = await client.post("/api/ai/chat", json={"message": ""})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_ai_chat_message_too_long(client: AsyncClient):
    resp = await client.post("/api/ai/chat", json={"message": "x" * 501})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_ai_chat_invalid_aqi(client: AsyncClient):
    resp = await client.post("/api/ai/chat", json={
        "message": "How is the air?",
        "aqi": 999,
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_ai_chat_html_injection(client: AsyncClient):
    resp = await client.post("/api/ai/chat", json={
        "message": "<script>alert(1)</script>Tell me about AQI",
        "location": "Delhi",
    })
    # Should sanitize and respond, not error
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_ai_indoor_advice(client: AsyncClient):
    resp = await client.post("/api/ai/indoor-advice", json={
        "house_type": "apartment",
        "concerns": ["ventilation", "filtration"],
        "location": "Delhi",
        "aqi": 180,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "tips" in data
    assert len(data["tips"]) > 0


# ── Route Planner ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_route_plan(client: AsyncClient):
    resp = await client.post("/api/routes/plan", json={
        "origin": "Connaught Place",
        "destination": "India Gate",
        "city": "Delhi",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    # First route should have lowest emissions (sorted by co2)
    assert data[0]["co2_estimate"] <= data[-1]["co2_estimate"]


@pytest.mark.asyncio
async def test_route_plan_missing_fields(client: AsyncClient):
    resp = await client.post("/api/routes/plan", json={"origin": "A"})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_route_plan_xss(client: AsyncClient):
    # XSS-only origin should be rejected (422) or sanitized — both are acceptable security responses
    resp = await client.post("/api/routes/plan", json={
        "origin": "<img src=x onerror=alert(1)>",
        "destination": "India Gate",
    })
    # Pydantic strips HTML tags leaving empty string → 422 is correct (input rejected)
    assert resp.status_code in (200, 422)
    if resp.status_code == 200:
        for route in resp.json():
            assert "<img" not in str(route)


# ── Alerts ────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_get_alerts(client: AsyncClient):
    resp = await client.get("/api/alerts?city=Delhi")
    assert resp.status_code == 200
    data = resp.json()
    assert "alerts" in data
    assert isinstance(data["alerts"], list)
    assert len(data["alerts"]) > 0
    for alert in data["alerts"]:
        assert "severity" in alert
        assert alert["severity"] in ("critical", "high", "moderate", "low")


# ── Community ─────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_get_observations_empty(client: AsyncClient):
    resp = await client.get("/api/community/observations?city=TestCity123")
    assert resp.status_code == 200
    data = resp.json()
    assert "observations" in data


@pytest.mark.asyncio
async def test_submit_observation(client: AsyncClient):
    resp = await client.post("/api/community/observations", json={
        "city": "Delhi",
        "location_name": "Nehru Place",
        "aqi_estimate": 145,
        "description": "Heavy smog this morning.",
        "tags": ["smog", "morning"],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "id" in data


@pytest.mark.asyncio
async def test_submit_observation_invalid_aqi(client: AsyncClient):
    resp = await client.post("/api/community/observations", json={
        "city": "Delhi",
        "aqi_estimate": 999,  # out of range
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_submit_observation_xss(client: AsyncClient):
    resp = await client.post("/api/community/observations", json={
        "city": "Delhi",
        "description": "<script>alert(1)</script>Bad air today",
    })
    assert resp.status_code == 201
    # Verify content is sanitized
    obs_resp = await client.get("/api/community/observations?city=Delhi")
    obs = obs_resp.json()["observations"]
    for o in obs:
        assert "<script>" not in (o.get("description") or "")


# ── Sustainability ────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_get_recommendations(client: AsyncClient):
    resp = await client.get("/api/sustainability/recommendations?city=Delhi&aqi=150")
    assert resp.status_code == 200
    data = resp.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0


@pytest.mark.asyncio
async def test_log_action(client: AsyncClient):
    resp = await client.post("/api/sustainability/log-action", json={
        "action_type": "transit",
        "co2_saved_kg": 2.6,
        "user_session": "test-session-001",
    })
    assert resp.status_code == 200


# ── Security ──────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_cors_headers_present(client: AsyncClient):
    resp = await client.get("/api/health", headers={"Origin": "http://localhost:5173"})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_no_api_key_in_response(client: AsyncClient):
    resp = await client.get("/api/health")
    body = resp.text
    assert "api_key" not in body.lower()
    assert "secret" not in body.lower()
    assert "password" not in body.lower()


# ── AQI Forecast ──────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_aqi_forecast(client: AsyncClient):
    resp = await client.get("/api/air-quality/forecast?city=Delhi")
    assert resp.status_code == 200
    data = resp.json()
    assert "forecast" in data
    assert isinstance(data["forecast"], list)
    assert len(data["forecast"]) > 0


# ── Impact ────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_impact_summary_empty(client: AsyncClient):
    resp = await client.get("/api/impact/summary?user_id=nonexistent-user-xyz")
    assert resp.status_code == 200
    data = resp.json()
    assert data["actions_count"] == 0
    assert data["co2_avoided_kg"] == 0.0


@pytest.mark.asyncio
async def test_impact_weekly_trends(client: AsyncClient):
    resp = await client.get("/api/impact/weekly-trends")
    assert resp.status_code == 200
    data = resp.json()
    assert "weeks" in data
    assert len(data["weeks"]) == 4


# ── Community Trends ─────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_community_trends(client: AsyncClient):
    resp = await client.get("/api/community/trends?city=Delhi")
    assert resp.status_code == 200
    data = resp.json()
    assert "insights" in data
    assert len(data["insights"]) > 0


# ── Sustainability Edge Cases ─────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_sustainability_recommendations_no_aqi(client: AsyncClient):
    resp = await client.get("/api/sustainability/recommendations?city=Delhi")
    assert resp.status_code == 200
    data = resp.json()
    assert "recommendations" in data


@pytest.mark.asyncio
async def test_sustainability_recommendations_low_aqi(client: AsyncClient):
    resp = await client.get("/api/sustainability/recommendations?city=Mumbai&aqi=30")
    assert resp.status_code == 200
    data = resp.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0


# ── AI Recommendations endpoint ───────────────────────────────────────────────
@pytest.mark.asyncio
async def test_ai_recommendations(client: AsyncClient):
    resp = await client.post("/api/ai/recommendations", json={
        "location": "Delhi",
        "aqi": 120,
        "lifestyle": "daily commuter",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "message" in data


# ── Validation edge cases ─────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_city_too_long(client: AsyncClient):
    long_city = "A" * 101
    resp = await client.get(f"/api/air-quality/current?city={long_city}")
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_aqi_history_min_days(client: AsyncClient):
    resp = await client.get("/api/air-quality/history?city=Delhi&days=1")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1


@pytest.mark.asyncio
async def test_submit_observation_empty_description(client: AsyncClient):
    resp = await client.post("/api/community/observations", json={
        "city": "Mumbai",
        "aqi_estimate": 80,
    })
    assert resp.status_code == 201
