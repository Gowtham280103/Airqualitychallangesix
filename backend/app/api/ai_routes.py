from fastapi import APIRouter, HTTPException, Request
from app.schemas.schemas import ChatRequest, IndoorAdviceRequest, RecommendationRequest
from app.services.ai_service import get_ai_response, get_indoor_advice
from app.core.config import settings
import logging

router = APIRouter(prefix="/ai", tags=["AI"])
logger = logging.getLogger(__name__)

# Simple in-memory rate limit (per process)
from collections import defaultdict
from time import time
_request_times: dict = defaultdict(list)


def _check_rate_limit(key: str, limit: int, window: int = 60) -> bool:
    now = time()
    times = [t for t in _request_times[key] if now - t < window]
    _request_times[key] = times
    if len(times) >= limit:
        return False
    _request_times[key].append(now)
    return True


@router.post("/chat")
async def chat(request: Request, body: ChatRequest):
    client_ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(f"ai_chat_{client_ip}", settings.ai_rate_limit_per_minute):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait before sending another message.")

    try:
        result = await get_ai_response(
            message=body.message,
            location=body.location,
            aqi=body.aqi,
            history=body.history,
        )
        return result
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        return {
            "message": "I'm currently unable to process your request. Please try again shortly.",
            "provider": "error",
            "fallback": True,
        }


@router.post("/recommendations")
async def recommendations(request: Request, body: RecommendationRequest):
    client_ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(f"ai_rec_{client_ip}", settings.ai_rate_limit_per_minute):
        raise HTTPException(status_code=429, detail="Too many requests.")

    try:
        message = (
            f"Provide personalized sustainability and air quality recommendations for someone in {body.location}. "
            f"Current AQI: {body.aqi or 'unknown'}. "
            f"Lifestyle context: {body.lifestyle or 'general urban resident'}. "
            "Focus on practical actions to reduce exposure and emissions."
        )
        result = await get_ai_response(message=message, location=body.location, aqi=body.aqi)
        return result
    except Exception as e:
        logger.error(f"Recommendations error: {e}")
        raise HTTPException(status_code=503, detail="Recommendation service temporarily unavailable")


@router.post("/indoor-advice")
async def indoor_advice(request: Request, body: IndoorAdviceRequest):
    client_ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(f"ai_indoor_{client_ip}", settings.ai_rate_limit_per_minute):
        raise HTTPException(status_code=429, detail="Too many requests.")

    try:
        result = await get_indoor_advice(
            house_type=body.house_type,
            concerns=body.concerns,
            location=body.location,
            aqi=body.aqi,
            aqi_category=body.aqi_category,
        )
        return result
    except Exception as e:
        logger.error(f"Indoor advice error: {e}")
        raise HTTPException(status_code=503, detail="Indoor advice service temporarily unavailable")
