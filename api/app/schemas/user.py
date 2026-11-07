"""User account schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    """Base user properties."""

    email: str | None = Field(default=None, description="User email address")
    display_name: str | None = Field(default=None, description="User display name")


class UserCreate(UserBase):
    """Payload for creating a new user."""

    id: str = Field(description="Unique identifier for user")


class UserResponse(UserBase):
    """Serialized user representation."""

    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
