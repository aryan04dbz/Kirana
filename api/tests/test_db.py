"""Tests for database user and settings models."""

from sqlalchemy.orm import Session

from app.models.setting import Setting
from app.models.user import User


def test_default_user_seeded(db_session: Session) -> None:
    """Verify default local user exists."""
    user = db_session.query(User).filter(User.id == "default_user").first()
    assert user is not None
    assert user.id == "default_user"
    assert user.email == "user@kirana.local"
    assert user.display_name == "Local User"


def test_default_settings_scoped_by_user(db_session: Session) -> None:
    """Verify default settings are seeded and properly scoped to user_id."""
    settings = db_session.query(Setting).filter(Setting.user_id == "default_user").all()
    keys = {s.key: s.value for s in settings}
    assert "lookahead_hours" in keys
    assert keys["lookahead_hours"] == "48"
    assert keys["min_order_value"] == "199"
    assert keys["review_buffer_days"] == "2"
    assert keys["max_extend_days"] == "7"
