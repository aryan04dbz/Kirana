"""Health check schemas."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response payload."""

    status: str = Field(default="ok", description="Operational status")
    app: str = Field(default="KiranaAI", description="Application name")
    version: str = Field(default="0.1.0", description="Application version")
    database: str = Field(default="connected", description="Database connection status")
