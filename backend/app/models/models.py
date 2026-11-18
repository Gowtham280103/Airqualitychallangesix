from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.database.database import Base


class AQIRecord(Base):
    __tablename__ = "aqi_records"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), nullable=False, index=True)
    aqi = Column(Float, nullable=False)
    pm25 = Column(Float)
    pm10 = Column(Float)
    no2 = Column(Float)
    so2 = Column(Float)
    co = Column(Float)
    o3 = Column(Float)
    source = Column(String(50), default="demo")
    recorded_at = Column(DateTime, server_default=func.now())


class CommunityObservation(Base):
    __tablename__ = "community_observations"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), nullable=False, index=True)
    location_name = Column(String(200))
    aqi_estimate = Column(Float)
    description = Column(Text)
    tags = Column(String(500))  # comma-separated
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


class SustainabilityAction(Base):
    __tablename__ = "sustainability_actions"

    id = Column(Integer, primary_key=True, index=True)
    user_session = Column(String(64), index=True)
    action_type = Column(String(50), nullable=False)
    co2_saved_kg = Column(Float, default=0.0)
    notes = Column(Text)
    logged_at = Column(DateTime, server_default=func.now())
