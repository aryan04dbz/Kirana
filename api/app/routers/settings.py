"""User settings router."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.setting import Setting
from app.schemas.setting import SettingResponse, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])

DEFAULT_USER_ID = "default_user"


@router.get("", response_model=list[SettingResponse])
def get_user_settings(
    user_id: str = Query(default=DEFAULT_USER_ID, description="Target user identifier"),
    db: Session = Depends(get_db),
) -> list[SettingResponse]:
    """Retrieve all configuration settings scoped to the specified user."""
    stmt = select(Setting).where(Setting.user_id == user_id)
    records = db.scalars(stmt).all()
    return [SettingResponse.model_validate(r) for r in records]


@router.patch("", response_model=list[SettingResponse])
def update_user_settings(
    payload: SettingsUpdate,
    user_id: str = Query(default=DEFAULT_USER_ID, description="Target user identifier"),
    db: Session = Depends(get_db),
) -> list[SettingResponse]:
    """Update or upsert settings for the scoped user."""
    for key, value in payload.settings.items():
        stmt = select(Setting).where(
            Setting.user_id == user_id,
            Setting.key == key,
        )
        record = db.scalars(stmt).first()
        if record:
            record.value = value
        else:
            new_setting = Setting(user_id=user_id, key=key, value=value)
            db.add(new_setting)

    db.commit()

    stmt = select(Setting).where(Setting.user_id == user_id)
    records = db.scalars(stmt).all()
    return [SettingResponse.model_validate(r) for r in records]
