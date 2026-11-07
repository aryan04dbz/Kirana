"""Application configuration settings."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration settings for KiranaAI backend."""

    # Project Paths
    base_dir: Path = Path(__file__).resolve().parent.parent
    data_dir: Path = base_dir.parent / ".data"

    # Database
    database_url: str = (
        f"sqlite:///{(base_dir.parent / '.data' / 'kirana.db').as_posix()}"
    )

    # Feature Flags
    kirana_enable_blinkit: bool = False

    # Server Configuration
    app_env: str = "development"
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Optional Credentials
    gemini_api_key: str | None = None
    telegram_bot_token: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
