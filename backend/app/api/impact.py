from fastapi import APIRouter, Query
import logging

router = APIRouter(prefix="/impact", tags=["Impact"])
logger = logging.getLogger(__name__)


@router.get("/summary")
async def get_summary(user_id: str = Query(None, max_length=64)):
    return {
        "co2_avoided_kg": 0.0,
        "actions_count": 0,
        "transit_trips": 0,
        "cycling_trips": 0,
        "note": "Log actions via the sustainability endpoint to track impact.",
    }


@router.get("/weekly-trends")
async def get_weekly_trends(user_id: str = Query(None, max_length=64)):
    return {
        "weeks": [
            {"week": "Week 1", "co2": 0, "actions": 0},
            {"week": "Week 2", "co2": 0, "actions": 0},
            {"week": "Week 3", "co2": 0, "actions": 0},
            {"week": "Week 4", "co2": 0, "actions": 0},
        ],
        "note": "Start logging actions to see your trends.",
    }
