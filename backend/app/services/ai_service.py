"""
AI Service — supports OpenAI, Gemini, Anthropic with graceful fallback.
Never exposes API keys; never fabricates AQI data as real measurements.
"""
import json
import re
import logging
from typing import Optional, List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are BreatheWise, an expert Urban Air Quality Intelligence Assistant built for the Hack2Skill PromptWars Challenge.
Your role is to help urban residents, families, and communities navigate air pollution, winter smog, and atmospheric inversion events.

Core competencies:
- Real-time AQI interpretation (US EPA and Indian NAQI standards: PM2.5, PM10, NO2, SO2, CO, O3)
- Personalised health guidance by user group (general public, children, elderly, sensitive groups, athletes)
- Low-emission route recommendations and sustainable transport alternatives
- Indoor air quality management (HEPA filtration, ventilation strategy, cooking emissions)
- Seasonal smog advisories (winter atmospheric inversion, crop burning events, industrial discharge)
- Sustainability action recommendations with estimated CO2 impact
- Emergency guidance for Hazardous (AQI >300) and Very Unhealthy conditions

You MUST:
- Provide evidence-based, practical advice grounded in WHO and EPA air quality guidelines
- Personalize recommendations based on location, AQI level, season, and user context
- Clearly label all CO2 savings as estimates based on published average emission factors
- Recommend low-emission transport, indoor air quality measures, and sustainable practices
- Give immediate emergency guidance when AQI is Hazardous (>300)
- Use clear, accessible language suitable for the general public
- Reference AQI categories correctly: Good (0-50), Moderate (51-100), Unhealthy for Sensitive Groups (101-150), Unhealthy (151-200), Very Unhealthy (201-300), Hazardous (301-500)

You MUST NOT:
- Fabricate specific AQI measurements or pollution statistics as real live data
- Make unsupported medical diagnoses or prescribe specific medications
- Claim a CO2 reduction figure without noting it is an estimate
- Provide advice that could endanger health during high-pollution events

Keep responses concise (3-6 sentences or bullet points), actionable, and location-aware."""


async def get_ai_response(
    message: str,
    location: Optional[str] = None,
    aqi: Optional[float] = None,
    history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """Get AI response with fallback chain."""
    context = _build_context(location, aqi)
    full_message = f"{context}\n\nUser question: {message}" if context else message

    provider = settings.ai_provider.lower()

    # Try configured provider first
    if provider == "openai" and settings.openai_api_key:
        try:
            return await _openai_response(full_message, history or [])
        except Exception as e:
            logger.warning(f"OpenAI failed: {e}, trying fallback")

    if provider == "gemini" and settings.google_ai_api_key:
        try:
            return await _gemini_response(full_message, history or [])
        except Exception as e:
            logger.warning(f"Gemini failed: {e}, trying fallback")

    if provider == "anthropic" and settings.anthropic_api_key:
        try:
            return await _anthropic_response(full_message, history or [])
        except Exception as e:
            logger.warning(f"Anthropic failed: {e}, using fallback")

    # Always available fallback
    return _fallback_response(message, location, aqi)


def _build_context(location: Optional[str], aqi: Optional[float]) -> str:
    parts = []
    if location:
        parts.append(f"User location: {location}")
    if aqi is not None:
        category = _aqi_category(aqi)
        parts.append(f"Current AQI: {aqi:.0f} ({category})")
    return " | ".join(parts)


def _aqi_category(aqi: float) -> str:
    if aqi <= 50: return "Good"
    if aqi <= 100: return "Moderate"
    if aqi <= 150: return "Unhealthy for Sensitive Groups"
    if aqi <= 200: return "Unhealthy"
    if aqi <= 300: return "Very Unhealthy"
    return "Hazardous"


async def _openai_response(message: str, history: List[Dict]) -> Dict:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in history[-6:]:
        if h.get("role") in ("user", "assistant") and h.get("content"):
            messages.append({"role": h["role"], "content": str(h["content"])[:500]})
    messages.append({"role": "user", "content": message})

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        max_tokens=600,
        temperature=0.7,
        timeout=10,
    )
    return {
        "message": response.choices[0].message.content,
        "provider": "openai",
        "fallback": False,
    }


async def _gemini_response(message: str, history: List[Dict]) -> Dict:
    import google.generativeai as genai
    genai.configure(api_key=settings.google_ai_api_key)
    model = genai.GenerativeModel(
        settings.gemini_model,
        system_instruction=SYSTEM_PROMPT,
    )
    response = await model.generate_content_async(message)
    return {
        "message": response.text,
        "provider": "gemini",
        "fallback": False,
    }


async def _anthropic_response(message: str, history: List[Dict]) -> Dict:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    messages = []
    for h in history[-6:]:
        if h.get("role") in ("user", "assistant") and h.get("content"):
            messages.append({"role": h["role"], "content": str(h["content"])[:500]})
    messages.append({"role": "user", "content": message})

    response = await client.messages.create(
        model=settings.anthropic_model,
        max_tokens=600,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
    return {
        "message": response.content[0].text,
        "provider": "anthropic",
        "fallback": False,
    }


def _fallback_response(message: str, location: Optional[str], aqi: Optional[float]) -> Dict:
    """Rule-based fallback when no AI API is available."""
    msg = message.lower()
    loc = location or "your area"
    aqi_val = aqi or 0
    cat = _aqi_category(aqi_val)

    if any(w in msg for w in ["safe", "outside", "go out", "outdoor"]):
        advice = {
            "Good": f"The air quality in {loc} is Good (AQI ~{aqi_val:.0f}). Outdoor activities are safe for everyone.",
            "Moderate": f"Air quality in {loc} is Moderate (AQI ~{aqi_val:.0f}). Most people can enjoy outdoor activities. Those with respiratory conditions should monitor their symptoms.",
            "Unhealthy for Sensitive Groups": f"Air quality in {loc} is Unhealthy for Sensitive Groups (AQI ~{aqi_val:.0f}). Children, elderly, and those with asthma should reduce prolonged outdoor exertion.",
            "Unhealthy": f"Air quality in {loc} is Unhealthy (AQI ~{aqi_val:.0f}). Avoid prolonged outdoor activity. Wear an N95 mask if you must go outside.",
            "Very Unhealthy": f"Air quality in {loc} is Very Unhealthy (AQI ~{aqi_val:.0f}). Stay indoors as much as possible. Use air purifiers and keep windows closed.",
            "Hazardous": f"EMERGENCY: Air quality in {loc} is Hazardous (AQI ~{aqi_val:.0f}). Remain indoors. Seal windows and doors. Seek medical attention if you experience breathing difficulty.",
        }.get(cat, f"Current AQI in {loc} is ~{aqi_val:.0f} ({cat}). Take precautions accordingly.")
        return {"message": advice, "provider": "fallback", "fallback": True}

    if any(w in msg for w in ["child", "kid", "children", "baby", "infant"]):
        return {"message": (
            f"To protect children in {loc} (current AQI: ~{aqi_val:.0f}):\n"
            "• Keep children indoors during high-pollution periods.\n"
            "• Ensure well-fitted N95 masks for older children if outdoor activity is necessary.\n"
            "• Schedule outdoor play in morning or evening when AQI is typically lower.\n"
            "• Watch for coughing, wheezing, or eye irritation.\n"
            "• Consult a pediatrician if respiratory symptoms develop."
        ), "provider": "fallback", "fallback": True}

    if any(w in msg for w in ["indoor", "inside", "home", "room", "house"]):
        return {"message": (
            "Indoor air quality tips:\n"
            "• Use HEPA air purifiers in frequently occupied rooms.\n"
            "• Ventilate only when outdoor AQI is below 50.\n"
            "• Use exhaust fans while cooking.\n"
            "• Vacuum with HEPA-filter vacuum at least twice a week.\n"
            "• Maintain 40–60% indoor humidity to reduce mold and dust mites.\n"
            "• Consider air-purifying plants (spider plant, peace lily)."
        ), "provider": "fallback", "fallback": True}

    if any(w in msg for w in ["route", "transport", "commute", "travel", "drive", "cycle", "walk"]):
        return {"message": (
            "Low-emission transport options:\n"
            "• Walking and cycling produce zero direct emissions and are ideal for trips under 3 km when AQI < 100.\n"
            "• Metro and bus produce far fewer emissions per person than private cars.\n"
            "• Carpooling reduces per-person emissions by 50–75%.\n"
            "• If driving, avoid idling and use eco-driving techniques.\n"
            "• Electric vehicles produce zero tailpipe emissions."
        ), "provider": "fallback", "fallback": True}

    if any(w in msg for w in ["smog", "emergency", "hazard", "severe", "dangerous"]):
        return {"message": (
            f"During severe smog in {loc}:\n"
            "• Stay indoors and seal gaps around doors and windows.\n"
            "• Run HEPA air purifiers on high continuously.\n"
            "• Avoid all outdoor physical exertion.\n"
            "• Wear N95 masks if outdoor movement is unavoidable.\n"
            "• Monitor air quality apps for updates.\n"
            "• Seek immediate medical attention for chest pain or breathing difficulty.\n"
            "• Follow official health authority emergency guidelines."
        ), "provider": "fallback", "fallback": True}

    return {"message": (
        f"I'm here to help with air quality information for {loc} (current AQI: ~{aqi_val:.0f} — {cat}).\n\n"
        "I can advise on:\n"
        "• Safety of outdoor activities given current conditions\n"
        "• Protecting children and vulnerable family members\n"
        "• Indoor air quality improvement techniques\n"
        "• Low-emission transport alternatives\n"
        "• Actions during severe smog episodes\n"
        "• Sustainable practices to reduce your contribution to pollution\n\n"
        "Please ask a specific question for tailored advice."
    ), "provider": "fallback", "fallback": True}


async def get_indoor_advice(
    house_type: str,
    concerns: List[str],
    location: Optional[str],
    aqi: Optional[float],
    aqi_category: Optional[str],
) -> Dict[str, Any]:
    """Generate indoor air quality advice."""
    prompt = (
        f"Generate specific indoor air quality advice for a {house_type} in {location or 'urban area'}. "
        f"Current outdoor AQI: {aqi or 'unknown'} ({aqi_category or 'unknown'}). "
        f"Key concerns: {', '.join(concerns) if concerns else 'general'}. "
        "Provide 6-8 specific, actionable tips as a JSON array of strings. "
        "Focus on practical, implementable actions. Return only valid JSON: {\"tips\": [...]}"
    )

    provider = settings.ai_provider.lower()
    try:
        if provider == "openai" and settings.openai_api_key:
            result = await _openai_response(prompt, [])
            tips = _parse_tips_json(result["message"])
            if tips:
                return {"tips": tips, "fallback": False}
        if provider == "gemini" and settings.google_ai_api_key:
            result = await _gemini_response(prompt, [])
            tips = _parse_tips_json(result["message"])
            if tips:
                return {"tips": tips, "fallback": False}
    except Exception as e:
        logger.warning(f"AI indoor advice failed: {e}")

    return {"tips": _static_indoor_tips(concerns, aqi or 0, house_type), "fallback": True}


def _parse_tips_json(text: str) -> Optional[List[str]]:
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            data = json.loads(match.group())
            tips = data.get("tips", [])
            return [str(t)[:200] for t in tips[:10] if t]
    except Exception:
        pass
    return None


def _static_indoor_tips(concerns: List[str], aqi: float, house_type: str) -> List[str]:
    tips = []
    if aqi > 100:
        tips.append(f"With AQI > 100, keep all windows and doors closed in your {house_type}.")
        tips.append("Run HEPA air purifiers continuously in occupied rooms.")
    else:
        tips.append("Cross-ventilate by opening windows on opposite sides when outdoor AQI is below 50.")

    concern_tips = {
        "ventilation": "Use trickle vents or window seals to control airflow without fully opening windows during high pollution.",
        "filtration": "Use HEPA purifiers rated for each room's square footage (check CADR rating on the box).",
        "cooking": "Always use the range hood or exhaust fan while cooking to remove cooking particles.",
        "dust": "Vacuum with a HEPA-filter vacuum at least twice a week; mop hard floors with a damp mop.",
        "humidity": "Maintain 40–60% indoor humidity using a hygrometer; use a dehumidifier in damp areas.",
    }
    for c in concerns:
        if c in concern_tips:
            tips.append(concern_tips[c])

    tips.extend([
        "Replace HVAC/AC filters every 2–3 months or as recommended by the manufacturer.",
        "Avoid synthetic fragrances, aerosol sprays, and chemical cleaners that release VOCs.",
        "Consider adding air-purifying plants such as spider plant, snake plant, or peace lily.",
    ])
    return tips[:8]
