from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
import re


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    location: Optional[str] = Field(None, max_length=100)
    aqi: Optional[float] = Field(None, ge=0, le=500)
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list)

    @field_validator("message")
    @classmethod
    def sanitize_message(cls, v):
        # Strip HTML tags
        v = re.sub(r'<[^>]+>', '', v)
        return v.strip()

    @field_validator("location")
    @classmethod
    def sanitize_location(cls, v):
        if v is None:
            return v
        v = re.sub(r'[^a-zA-Z\s\-,.\']', '', v)
        return v.strip()[:100]


class RecommendationRequest(BaseModel):
    location: str = Field(..., max_length=100)
    aqi: Optional[float] = Field(None, ge=0, le=500)
    lifestyle: Optional[str] = Field(None, max_length=200)
    household_type: Optional[str] = Field(None, max_length=50)


class IndoorAdviceRequest(BaseModel):
    house_type: str = Field(default="apartment", max_length=50)
    concerns: List[str] = Field(default_factory=list)
    location: Optional[str] = Field(None, max_length=100)
    aqi: Optional[float] = Field(None, ge=0, le=500)
    aqi_category: Optional[str] = Field(None, max_length=50)


class RoutePlanRequest(BaseModel):
    origin: str = Field(..., min_length=1, max_length=200)
    destination: str = Field(..., min_length=1, max_length=200)
    city: Optional[str] = Field(None, max_length=100)

    @field_validator("origin", "destination")
    @classmethod
    def sanitize_location(cls, v):
        v = re.sub(r'<[^>]+>', '', v)
        return v.strip()


class ObservationCreate(BaseModel):
    city: str = Field(..., max_length=100)
    location_name: Optional[str] = Field(None, max_length=200)
    aqi_estimate: Optional[float] = Field(None, ge=0, le=500)
    description: Optional[str] = Field(None, max_length=300)
    tags: Optional[List[str]] = Field(default_factory=list)

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v):
        if v is None:
            return v
        v = re.sub(r'<[^>]+>', '', v)
        return v.strip()


class SustainabilityActionLog(BaseModel):
    action_type: str = Field(..., max_length=50)
    co2_saved_kg: float = Field(..., ge=0, le=1000)
    user_session: Optional[str] = Field(None, max_length=64)
    notes: Optional[str] = Field(None, max_length=200)
