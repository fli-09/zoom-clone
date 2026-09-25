import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models  # Ensures models are loaded for table creation
from app.routers import meetings
from app.schemas import HealthCheckResponse

# Configure server-side logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("zoom_clone_api")

# Confirm tables are created on app startup if they don't exist.
# Note: app.seed is NOT called automatically here so redeploys do not wipe or overwrite user data.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Zoom Clone API",
    description="FastAPI Backend for Zoom Clone with WebRTC & SQLAlchemy models",
    version="1.0.0"
)

# Parse CORS_ORIGINS from environment variable (comma-separated list).
# Env-driven configuration avoids hardcoding production Vercel/Netlify frontend domains
# into source code, allowing flexible cross-origin requests per deployment environment.
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler to capture unhandled server errors, log them server-side,
    and return a clean JSON 500 response without leaking internal stack traces.
    """
    logger.error(
        f"Unhandled server error on {request.method} {request.url.path}: {exc}",
        exc_info=True
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal Server Error",
            "message": "An unexpected error occurred on the server. Please check server logs for details."
        }
    )


@app.get("/", tags=["root"])
def read_root():
    """
    Root endpoint for server health and welcome message.
    """
    return {
        "message": "Zoom Clone API Server is operational",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health", response_model=HealthCheckResponse, tags=["health"])
def health_check():
    return HealthCheckResponse(
        status="ok",
        message="Backend is operational"
    )


@app.post("/api/seed", tags=["admin"])
def trigger_database_seed():
    """
    Manually trigger database seeding.
    Creates default user and initial meetings/participants if they do not exist.
    Idempotent: safe to run multiple times without duplicating data.
    """
    from app.seed import seed_database
    try:
        seed_database()
        return {
            "status": "ok",
            "message": "Database seeded successfully!"
        }
    except Exception as e:
        logger.error(f"Manual seed failed: {e}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Failed to seed database", "error": str(e)}
        )


app.include_router(meetings.router)

