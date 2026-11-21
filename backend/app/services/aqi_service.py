"""
AQI Service — fetches from WAQI API with demo data fallback and caching.
Never fabricates data as real measurements without labeling it as demo.
"""
import httpx
import math
import random
import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

WAQI_BASE = "https://api.waqi.info"
_CACHE_TTL_SECONDS = 180  # 3 minutes cache for efficiency

_current_aqi_cache: Dict[str, tuple[float, Dict[str, Any]]] = {}
_history_aqi_cache: Dict[str, tuple[float, List[Dict[str, Any]]]] = {}


async def get_current_aqi(city: str) -> Dict[str, Any]:
    """Fetch current AQI data for a city with short-term in-memory caching."""
    cache_key = city.lower().strip()
    now = time.time()
    if cache_key in _current_aqi_cache:
        cached_time, cached_val = _current_aqi_cache[cache_key]
        if now - cached_time < _CACHE_TTL_SECONDS:
            return cached_val

    if settings.waqi_api_key:
        try:
            data = await _fetch_waqi_current(city)
            _current_aqi_cache[cache_key] = (now, data)
            return data
        except Exception as e:
            logger.warning(f"WAQI API failed for {city}: {e}")

    demo_data = _generate_demo_aqi(city)
    _current_aqi_cache[cache_key] = (now, demo_data)
    return demo_data


async def _fetch_waqi_current(city: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(
            f"{WAQI_BASE}/feed/{city}/",
            params={"token": settings.waqi_api_key},
        )
        resp.raise_for_status()
        data = resp.json()

    if data.get("status") != "ok":
        raise ValueError(f"WAQI returned status: {data.get('status')}")

    d = data["data"]
    iaqi = d.get("iaqi", {})

    return {
        "aqi": float(d.get("aqi", 0)),
        "city": d.get("city", {}).get("name", city),
        "source": "WAQI",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "pollutants": {
            "pm25": iaqi.get("pm25", {}).get("v"),
            "pm10": iaqi.get("pm10", {}).get("v"),
            "no2": iaqi.get("no2", {}).get("v"),
            "so2": iaqi.get("so2", {}).get("v"),
            "co": iaqi.get("co", {}).get("v"),
            "o3": iaqi.get("o3", {}).get("v"),
        },
        "weather": {
            "temp": iaqi.get("t", {}).get("v"),
            "humidity": iaqi.get("h", {}).get("v"),
            "wind_speed": iaqi.get("w", {}).get("v"),
            "visibility": None,
        },
        "demo": False,
    }


def _generate_demo_aqi(city: str) -> Dict[str, Any]:
    """
    Generate plausible demo data seeded by city name.
    Clearly labeled as demo data — not real measurements.
    """
    seed = sum(ord(c) for c in city.lower())
    utc_now = datetime.now(timezone.utc)
    rng = random.Random(seed + utc_now.hour)

    # City-characteristic base AQI
    city_low = city.lower()
    if any(w in city_low for w in ["delhi", "beijing", "lahore", "dhaka", "karachi"]):
        base_aqi = rng.uniform(120, 220)
    elif any(w in city_low for w in ["mumbai", "kolkata", "cairo", "jakarta"]):
        base_aqi = rng.uniform(80, 150)
    elif any(w in city_low for w in ["london", "paris", "berlin", "tokyo"]):
        base_aqi = rng.uniform(30, 80)
    elif any(w in city_low for w in ["sydney", "auckland", "oslo", "stockholm"]):
        base_aqi = rng.uniform(10, 40)
    else:
        base_aqi = rng.uniform(50, 130)

    aqi = round(base_aqi, 1)
    pm25 = round(aqi * 0.25, 1)
    pm10 = round(aqi * 0.45, 1)
    no2 = round(rng.uniform(15, min(80, aqi * 0.4)), 1)
    so2 = round(rng.uniform(2, min(40, aqi * 0.15)), 1)
    co = round(rng.uniform(0.5, min(5, aqi * 0.02)), 2)
    o3 = round(rng.uniform(20, 65), 1)

    return {
        "aqi": aqi,
        "city": city,
        "source": "Demo Data",
        "updated_at": utc_now.isoformat(),
        "pollutants": {
            "pm25": pm25, "pm10": pm10, "no2": no2,
            "so2": so2, "co": co, "o3": o3,
        },
        "weather": {
            "temp": round(rng.uniform(5, 30), 1),
            "humidity": round(rng.uniform(40, 85), 0),
            "wind_speed": round(rng.uniform(2, 20), 1),
            "visibility": round(rng.uniform(2, 15), 1),
        },
        "demo": True,
    }


async def get_aqi_history(city: str, days: int = 7) -> List[Dict[str, Any]]:
    """Return AQI history for charting with caching."""
    cache_key = f"{city.lower().strip()}_{days}"
    now = time.time()
    if cache_key in _history_aqi_cache:
        cached_time, cached_val = _history_aqi_cache[cache_key]
        if now - cached_time < _CACHE_TTL_SECONDS:
            return cached_val

    seed = sum(ord(c) for c in city.lower())
    rng = random.Random(seed)
    today = datetime.now(timezone.utc).date()

    history = []
    # Base AQI roughly correlated with current demo
    base = sum(ord(c) for c in city.lower()) % 150 + 50

    for i in range(days):
        date = today - timedelta(days=days - 1 - i)
        aqi = max(10, base + rng.uniform(-40, 40) + math.sin(i * 0.8) * 20)
        history.append({
            "date": date.isoformat(),
            "aqi": round(aqi, 1),
            "demo": True,
        })

    _history_aqi_cache[cache_key] = (now, history)
    return history
