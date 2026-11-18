from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import os


class Settings(BaseSettings):
    # App
    app_env: str = "development"
    secret_key: str = "dev-secret-key-change-in-production"
    database_url: str = "sqlite:///./breathewise.db"

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # AI
    ai_provider: str = "fallback"  # openai | gemini | anthropic | fallback
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    google_ai_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-haiku-20240307"

    # External APIs
    waqi_api_key: str = ""
    openweather_api_key: str = ""

    # Rate limiting
    rate_limit_per_minute: int = 60
    ai_rate_limit_per_minute: int = 20

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
