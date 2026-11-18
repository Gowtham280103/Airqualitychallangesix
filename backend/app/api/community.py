from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.database import get_db
from app.models.models import CommunityObservation
from app.schemas.schemas import ObservationCreate
from app.core.security import sanitize_city, sanitize_string, validate_aqi
from datetime import datetime
import json
import logging

router = APIRouter(prefix="/community", tags=["Community"])
logger = logging.getLogger(__name__)


@router.get("/observations")
async def get_observations(
    city: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    clean_city = sanitize_city(city)
    if not clean_city:
        raise HTTPException(status_code=422, detail="Invalid city name")

    result = await db.execute(
        select(CommunityObservation)
        .where(CommunityObservation.city == clean_city)
        .order_by(desc(CommunityObservation.created_at))
        .limit(limit)
    )
    rows = result.scalars().all()
    observations = []
    for r in rows:
        observations.append({
            "id": r.id,
            "location_name": r.location_name,
            "aqi_estimate": r.aqi_estimate,
            "description": r.description,
            "tags": r.tags.split(",") if r.tags else [],
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return {"observations": observations, "city": clean_city}


@router.post("/observations", status_code=201)
async def submit_observation(
    body: ObservationCreate,
    db: AsyncSession = Depends(get_db),
):
    clean_city = sanitize_city(body.city)
    if not clean_city:
        raise HTTPException(status_code=422, detail="Invalid city name")

    if body.aqi_estimate is not None and not validate_aqi(body.aqi_estimate):
        raise HTTPException(status_code=422, detail="AQI estimate must be between 0 and 500")

    tags_str = ",".join(
        sanitize_string(t, 30) for t in (body.tags or [])
        if sanitize_string(t, 30)
    )[:500]

    obs = CommunityObservation(
        city=clean_city,
        location_name=sanitize_string(body.location_name or "", 200) or None,
        aqi_estimate=body.aqi_estimate,
        description=sanitize_string(body.description or "", 300) or None,
        tags=tags_str,
        created_at=datetime.utcnow(),
    )
    db.add(obs)
    await db.commit()
    await db.refresh(obs)
    return {"id": obs.id, "message": "Observation submitted successfully"}


@router.get("/trends")
async def get_trends(city: str = Query(..., min_length=1, max_length=100)):
    clean_city = sanitize_city(city)
    if not clean_city:
        raise HTTPException(status_code=422, detail="Invalid city name")
    # Return educational trend data
    return {
        "city": clean_city,
        "insights": [
            "Winter months (Nov–Feb) typically see 2–3x higher AQI due to atmospheric inversion.",
            "Morning rush hours (7–9 AM) and evening (5–8 PM) are peak pollution periods.",
            "Wind speeds above 15 km/h significantly improve air dispersion.",
            "Rainfall events temporarily reduce PM2.5 by 40–60%.",
        ],
        "note": "These are general patterns, not specific measurements for this city.",
    }
