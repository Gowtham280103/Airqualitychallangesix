from fastapi import APIRouter, HTTPException
from app.schemas.schemas import RoutePlanRequest
from app.core.security import sanitize_string
import logging

router = APIRouter(prefix="/routes", tags=["Routes"])
logger = logging.getLogger(__name__)

TRANSPORT_MODES = [
    {
        "id": "walking",
        "mode": "walking",
        "emission_factor": 0,       # kg CO2 per km
        "speed_kmh": 5,
        "pollution_exposure": "low",
        "calories_per_km": 65,
    },
    {
        "id": "cycling",
        "mode": "cycling",
        "emission_factor": 0,
        "speed_kmh": 15,
        "pollution_exposure": "moderate",
        "calories_per_km": 35,
    },
    {
        "id": "transit",
        "mode": "transit",
        "emission_factor": 0.045,   # kg CO2 per km (bus/metro avg)
        "speed_kmh": 25,
        "pollution_exposure": "low",
        "calories_per_km": 5,
    },
    {
        "id": "driving",
        "mode": "driving",
        "emission_factor": 0.171,   # kg CO2 per km (average car)
        "speed_kmh": 30,
        "pollution_exposure": "high",
        "calories_per_km": 0,
    },
]

MODE_DESCRIPTIONS = {
    "walking": "Pedestrian path via green corridors",
    "cycling": "Cycling lane on main road",
    "transit": "Metro + bus connection",
    "driving": "Direct road route",
}

MODE_NOTES = {
    "walking": "Recommended when AQI < 100. Use footpaths along parks.",
    "cycling": "Dedicated cycling infrastructure available. Wear mask during high-pollution days.",
    "transit": "Most practical low-emission option for longer distances.",
    "driving": "Higher emissions. Consider carpooling to reduce per-person impact.",
}


@router.post("/plan")
async def plan_route(body: RoutePlanRequest):
    origin = sanitize_string(body.origin, 200)
    destination = sanitize_string(body.destination, 200)
    if not origin or not destination:
        raise HTTPException(status_code=422, detail="Invalid origin or destination")

    # Estimate distance: use a simple hash-based deterministic value for demo
    import hashlib
    combo = f"{origin.lower()}{destination.lower()}"
    h = int(hashlib.md5(combo.encode()).hexdigest(), 16)
    base_dist_km = 2.0 + (h % 80) / 10.0  # 2–10 km

    routes = []
    for mode in TRANSPORT_MODES:
        # Vary distance slightly by mode
        dist_multiplier = {"walking": 0.9, "cycling": 1.0, "transit": 1.3, "driving": 1.1}
        dist = round(base_dist_km * dist_multiplier.get(mode["mode"], 1.0), 1)
        duration = round((dist / mode["speed_kmh"]) * 60)
        co2_g = round(dist * mode["emission_factor"] * 1000)
        calories = round(dist * mode["calories_per_km"])

        routes.append({
            "id": mode["id"],
            "mode": mode["mode"],
            "distance": str(dist),
            "duration": str(duration),
            "co2_estimate": co2_g,
            "pollution_exposure": mode["pollution_exposure"],
            "calories": str(calories) if calories > 0 else "0",
            "description": MODE_DESCRIPTIONS[mode["mode"]],
            "notes": MODE_NOTES[mode["mode"]],
            "demo": True,
        })

    # Sort by CO2 (ascending = lowest emissions first)
    routes.sort(key=lambda r: r["co2_estimate"])

    return routes
