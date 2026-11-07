"""Database models registry."""

from app.models.base import Base
from app.models.setting import Setting
from app.models.user import User

__all__ = ["Base", "User", "Setting"]
