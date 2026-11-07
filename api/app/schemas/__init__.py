"""API data schemas registry."""

from app.schemas.health import HealthResponse
from app.schemas.setting import SettingBase, SettingResponse, SettingsUpdate
from app.schemas.user import UserBase, UserCreate, UserResponse

__all__ = [
    "HealthResponse",
    "SettingBase",
    "SettingResponse",
    "SettingsUpdate",
    "UserBase",
    "UserCreate",
    "UserResponse",
]
