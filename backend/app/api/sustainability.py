from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database.database import get_db
from app.models.models import SustainabilityAction
from app.schemas.schemas import SustainabilityActionLog
from app.core.security import sanitize_string
import logging

router = APIRouter(prefix="/sustainability", tags=["Sustainability"])
logger = logging.getLogger(__name__)


@router.get("/recommendations")
async def get_recommendations(
    city: str = Query(None, max_length=100),
    aqi: float = Query(None, ge=0, le=500),
):
    recommendations = []

    if aqi and aqi > 100:
        recommendations.append({
            "category": "transport",
            "title": "Switch to Public Transport",
            "description": "With high AQI, reducing vehicle emissions is critical. Metro and bus produce 80% fewer emissions per person than private cars.",
            "co2_saving_estimate": "2.6 kg CO₂ per trip (est.)",
            "priority": "high",
        })
    else:
        recommendations.append({
            "category": "transport",
            "title": "Cycle or Walk for Short Trips",
            "description": "Trips under 3 km are ideal for cycling or walking. Zero emissions and health benefits.",
            "co2_saving_estimate": "1.2 kg CO₂ per trip (est.)",
            "priority": "medium",
        })

    recommendations.extend([
        {
            "category": "energy",
            "title": "Switch to LED Lighting",
            "description": "LED bulbs use 75% less energy than incandescent, reducing both electricity bills and power-plant emissions.",
            "co2_saving_estimate": "0.4 kg CO₂ per day (est.)",
            "priority": "medium",
        },
        {
            "category": "consumption",
            "title": "Buy Local and Seasonal Produce",
            "description": "Local food travels shorter distances, reducing transport emissions. Seasonal produce requires less energy-intensive storage.",
            "co2_saving_estimate": "0.8 kg CO₂ per week (est.)",
            "priority": "low",
        },
        {
            "category": "waste",
            "title": "Never Burn Waste or Leaves",
            "description": "Open burning releases PM2.5, CO, and VOCs that significantly worsen local air quality.",
            "co2_saving_estimate": "2.0 kg CO₂ per event (est.)",
            "priority": "high",
        },
    ])

    return {"recommendations": recommendations, "city": city, "note": "CO₂ savings are estimates based on published averages."}


@router.post("/log-action")
async def log_action(
    body: SustainabilityActionLog,
    db: AsyncSession = Depends(get_db),
):
    action = SustainabilityAction(
        user_session=sanitize_string(body.user_session or "anonymous", 64),
        action_type=sanitize_string(body.action_type, 50),
        co2_saved_kg=round(float(body.co2_saved_kg), 3),
        notes=sanitize_string(body.notes or "", 200) or None,
    )
    db.add(action)
    await db.commit()
    await db.refresh(action)
    return {"id": action.id, "message": "Action logged successfully"}


@router.get("/impact")
async def get_impact(
    user_id: str = Query(None, max_length=64),
    db: AsyncSession = Depends(get_db),
):
    session_key = sanitize_string(user_id or "anonymous", 64)
    result = await db.execute(
        select(
            func.count(SustainabilityAction.id).label("total_actions"),
            func.sum(SustainabilityAction.co2_saved_kg).label("total_co2"),
        ).where(SustainabilityAction.user_session == session_key)
    )
    row = result.first()
    return {
        "total_actions": row.total_actions or 0,
        "total_co2_kg_estimate": round(float(row.total_co2 or 0), 2),
        "note": "CO₂ figures are estimates based on average emission factors.",
    }
