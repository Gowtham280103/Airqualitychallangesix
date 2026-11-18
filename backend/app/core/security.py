import re
import html
from typing import Any


def sanitize_string(value: str, max_length: int = 500) -> str:
    """Strip HTML, limit length, strip whitespace."""
    if not isinstance(value, str):
        return ""
    # Escape HTML
    value = html.escape(value)
    # Remove zero-width chars
    value = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', value)
    return value.strip()[:max_length]


def sanitize_city(city: str) -> str:
    """Sanitize city name."""
    if not isinstance(city, str):
        return ""
    city = html.escape(city)
    city = re.sub(r'[^a-zA-Z\s\-,.\']', '', city)
    return city.strip()[:100]


def validate_aqi(value: Any) -> bool:
    """Validate AQI is a number in [0, 500]."""
    try:
        n = float(value)
        return 0 <= n <= 500
    except (TypeError, ValueError):
        return False


def validate_coordinates(lat: Any, lon: Any) -> bool:
    """Validate lat/lon ranges."""
    try:
        return -90 <= float(lat) <= 90 and -180 <= float(lon) <= 180
    except (TypeError, ValueError):
        return False
