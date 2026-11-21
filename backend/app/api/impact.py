from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from app.database.database import get_db
from app.models.models import SustainabilityAction
from app.core.security import sanitize_string
from datetime import datetime, timedelta, timezone
import logging

router = APIRouter(prefix="/impact", tags=["Impact"])
logger = logging.getLogger(__name__)


@router.get("/summary")
async def get_summary(
    user_id: str = Query(None, max_length=64),
    db: AsyncSession = Depends(get_db),
):
    """Get aggregated impact metrics from logged sustainability actions."""
    clean_user = sanitize_string(user_id, 64) if user_id else None

    stmt = select(
        func.count(SustainabilityAction.id).label("total_actions"),
        func.coalesce(func.sum(SustainabilityAction.co2_saved_kg), 0.0).label("total_co2"),
        func.coalesce(func.sum(case((SustainabilityAction.action_type == "transit", 1), else_=0)), 0).label("transit_count"),
        func.coalesce(func.sum(case((SustainabilityAction.action_type == "cycling", 1), else_=0)), 0).label("cycling_count"),
    )

    if clean_user:
        stmt = stmt.where(SustainabilityAction.user_session == clean_user)

    result = await db.execute(stmt)
    row = result.first()

    total_actions = int(row.total_actions or 0)
    co2_saved = round(float(row.total_co2 or 0.0), 2)
    transit_trips = int(row.transit_count or 0)
    cycling_trips = int(row.cycling_count or 0)

    return {
        "co2_avoided_kg": co2_saved,
        "actions_count": total_actions,
        "transit_trips": transit_trips,
        "cycling_trips": cycling_trips,
        "note": "Aggregated from logged actions. CO₂ figures are estimates.",
    }


@router.get("/weekly-trends")
async def get_weekly_trends(
    user_id: str = Query(None, max_length=64),
    db: AsyncSession = Depends(get_db),
):
    """Get weekly breakdown of actions and avoided CO2 over the last 4 weeks."""
    clean_user = sanitize_string(user_id, 64) if user_id else None
    now = datetime.now(timezone.utc)
    weeks = []

    for i in range(4):
        week_num = 4 - i
        end_time = now - timedelta(days=i * 7)
        start_time = now - timedelta(days=(i + 1) * 7)

        stmt = select(
            func.count(SustainabilityAction.id).label("count"),
            func.coalesce(func.sum(SustainabilityAction.co2_saved_kg), 0.0).label("co2"),
        ).where(
            SustainabilityAction.logged_at >= start_time,
            SustainabilityAction.logged_at < end_time,
        )
        if clean_user:
            stmt = stmt.where(SustainabilityAction.user_session == clean_user)

        res = await db.execute(stmt)
        row = res.first()
        weeks.append({
            "week": f"Week {week_num}",
            "co2": round(float(row.co2 or 0.0), 1),
            "actions": int(row.count or 0),
        })

    weeks.reverse()
    return {
        "weeks": weeks,
        "note": "4-week historical trend of logged eco-actions.",
    }
