"""
BreatheWise Backend — FastAPI Application
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.database.database import init_db
from app.api import air_quality, ai_routes, routes, alerts, community, sustainability, impact

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("BreatheWise backend starting up…")
    await init_db()
    logger.info("Database initialized")
    yield
    logger.info("BreatheWise backend shutting down")


app = FastAPI(
    title="BreatheWise API",
    description="Urban Air Quality Intelligence Assistant — Backend API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── Security middleware ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)


# ── Global error handlers ──────────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Invalid request data", "errors": str(exc)[:500]},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred"},
    )


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(air_quality.router, prefix="/api")
app.include_router(ai_routes.router, prefix="/api")
app.include_router(routes.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(community.router, prefix="/api")
app.include_router(sustainability.router, prefix="/api")
app.include_router(impact.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "app": "BreatheWise",
        "version": "1.0.0",
        "ai_provider": settings.ai_provider,
        "demo_mode": not bool(settings.waqi_api_key),
    }


@app.get("/")
async def root():
    return {"message": "BreatheWise API — visit /api/docs for documentation"}
