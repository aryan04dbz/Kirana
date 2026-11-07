"""Setting schemas."""

from pydantic import BaseModel, ConfigDict, Field


class SettingBase(BaseModel):
    """Base key-value setting properties."""

    key: str = Field(description="Configuration parameter key")
    value: str = Field(description="Configuration parameter value")


class SettingResponse(SettingBase):
    """Serialized setting response."""

    user_id: str

    model_config = ConfigDict(from_attributes=True)


class SettingsUpdate(BaseModel):
    """Batch or single setting update payload."""

    settings: dict[str, str] = Field(
        description="Key-value mapping of settings to update"
    )
