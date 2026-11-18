from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.services.aqi_service import get_current_aqi, get_aqi_history
from app.core.security import sanitize_city
import logging

router = APIRouter(prefix="/air-quality", tags=["Air Quality"])
logger = logging.getLogger(__name__)


@router.get("/current")
async def current_aqi(
    city: str = Query(..., min_length=1, max_length=100),
    db: AsyncSession = Depends(get_db),
):
    clean_city = sanitize_city(city)
    if not clean_city:
        raise HTTPException(status_code=422, detail="Invalid city name")
    try:
        data = await get_current_aqi(clean_city)
        return data
    except Exception as e:
        logger.error(f"AQI fetch error for {clean_city}: {e}")
        raise HTTPException(status_code=503, detail="Air quality data temporarily unavailable")


@router.get("/history")
async def aqi_history(
    city: str = Query(..., min_length=1, max_length=100),
    days: int = Query(7, ge=1, le=30),
):
    clean_city = sanitize_city(city)
    if not clean_city:
        raise HTTPException(status_code=422, detail="Invalid city name")
    try:
        data = await get_aqi_history(clean_city, days)
        return data
    except Exception as e:
        logger.error(f"History fetch error for {clean_city}: {e}")
        raise HTTPException(status_code=503, detail="History data temporarily unavailable")


@router.get("/forecast")
async def aqi_forecast(city: str = Query(..., min_length=1, max_length=100)):
    clean_city = sanitize_city(city)
    if not clean_city:
        raise HTTPException(status_code=422, detail="Invalid city name")
    # Forecast uses same demo generation with future dates
    from app.services.aqi_service import get_aqi_history
    data = await get_aqi_history(clean_city, days=3)
    return {"forecast": data, "note": "Forecast is illustrative — not a real prediction"}
