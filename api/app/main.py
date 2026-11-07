"""KiranaAI FastAPI Application entrypoint."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.routers.health import router as health_router
from app.routers.settings import router as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifecycle hooks."""
    # Pre-startup tasks (e.g. log status, verify directories)
    yield
    # Post-shutdown tasks


app = FastAPI(
    title="KiranaAI API",
    description="Grocery run-out prediction and automated cart filling engine",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """Format HTTP exceptions per Spec A12: { error: { code, message, details } }."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail,
                "details": None,
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Format validation exceptions per Spec A12 standard."""
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request parameters",
                "details": exc.errors(),
            }
        },
    )


# Root level health check
app.include_router(health_router)

# Versioned API v1 router endpoints
app.include_router(health_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
def root() -> dict[str, Any]:
    """Root endpoint welcoming clients."""
    return {
        "app": "KiranaAI",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
    }
