"""API route controllers."""

from app.routers.health import router as health_router
from app.routers.settings import router as settings_router

__all__ = ["health_router", "settings_router"]
