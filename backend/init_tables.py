"""
One-time script to initialize the SQLite database tables.
Run from the backend/ directory: python init_tables.py
"""
import asyncio
import sys
import os

# Ensure the app package is importable from this directory
sys.path.insert(0, os.path.dirname(__file__))

from app.database.database import engine, Base
from app.models.models import AQIRecord, CommunityObservation, SustainabilityAction  # noqa: F401


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully.")
    print("Tables: aqi_records, community_observations, sustainability_actions")


if __name__ == "__main__":
    asyncio.run(main())
