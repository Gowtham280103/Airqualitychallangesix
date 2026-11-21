from fastapi import APIRouter, Query, HTTPException
from app.services.aqi_service import get_current_aqi
from app.core.security import sanitize_city
from datetime import datetime, timezone
import logging

router = APIRouter(prefix="/alerts", tags=["Alerts"])
logger = logging.getLogger(__name__)


def _build_alerts(aqi: float, city: str) -> list:
    now = datetime.now(timezone.utc).isoformat()
    alerts = []

    if aqi > 300:
        alerts.append({
            "id": "hazardous",
            "title": "Hazardous Air Quality — Emergency Alert",
            "message": f"AQI in {city} has reached {aqi:.0f} (Hazardous). Immediate health risk for all residents.",
            "severity": "critical",
            "recommendation": "Remain indoors. Seal windows. Wear N95 if going outside. Seek medical help for breathing difficulty.",
            "created_at": now,
        })
    elif aqi > 200:
        alerts.append({
            "id": "very-unhealthy",
            "title": "Very Unhealthy Air Quality",
            "message": f"AQI in {city} is {aqi:.0f}. Serious health effects possible for everyone.",
            "severity": "high",
            "recommendation": "Avoid outdoor activities. Use HEPA air purifiers. Wear N95 mask if going outside.",
            "created_at": now,
        })
    elif aqi > 150:
        alerts.append({
            "id": "unhealthy",
            "title": "Unhealthy Air Quality",
            "message": f"AQI in {city} is {aqi:.0f}. Everyone may experience health effects.",
            "severity": "high",
            "recommendation": "Reduce prolonged outdoor exertion. Sensitive groups should stay indoors.",
            "created_at": now,
        })
    elif aqi > 100:
        alerts.append({
            "id": "sensitive-groups",
            "title": "Alert — Unhealthy for Sensitive Groups",
            "message": f"AQI in {city} is {aqi:.0f}. Children, elderly, and those with asthma may be affected.",
            "severity": "moderate",
            "recommendation": "Sensitive individuals should limit outdoor time. Keep quick-relief medication accessible.",
            "created_at": now,
        })
    elif aqi > 50:
        alerts.append({
            "id": "moderate",
            "title": "Moderate Air Quality",
            "message": f"AQI in {city} is {aqi:.0f}. Acceptable quality but may concern very sensitive individuals.",
            "severity": "low",
            "recommendation": "No special precautions required for most people.",
            "created_at": now,
        })
    else:
        alerts.append({
            "id": "good",
            "title": "Good Air Quality",
            "message": f"AQI in {city} is {aqi:.0f}. Air quality is satisfactory and poses little or no risk.",
            "severity": "low",
            "recommendation": "Great conditions for outdoor activities!",
            "created_at": now,
        })

    # Winter smog seasonal advisory
    month = datetime.now(timezone.utc).month
    if month in (11, 12, 1, 2) and aqi > 100:
        alerts.append({
            "id": "winter-smog",
            "title": "Winter Smog Advisory",
            "message": "Cold atmospheric conditions are trapping pollutants near ground level, amplifying smog risk.",
            "severity": "moderate" if aqi <= 200 else "high",
            "recommendation": "Monitor AQI frequently. Avoid outdoor burning. Prioritize public transport.",
            "created_at": now,
        })

    return alerts


@router.get("")
async def get_alerts(city: str = Query(..., min_length=1, max_length=100)):
    clean_city = sanitize_city(city)
    if not clean_city:
        raise HTTPException(status_code=422, detail="Invalid city name")

    try:
        aqidata = await get_current_aqi(clean_city)
        aqi = aqidata.get("aqi", 0)
        alerts = _build_alerts(float(aqi), clean_city)
        return {"city": clean_city, "alerts": alerts, "aqi": aqi}
    except Exception as e:
        logger.error(f"Alerts error for {clean_city}: {e}")
        raise HTTPException(status_code=503, detail="Alert service temporarily unavailable")
