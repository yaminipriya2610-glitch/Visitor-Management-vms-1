from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str = "change-this-development-secret-key"
    # Set DATABASE_URL in backend/.env. Example:
    # postgresql+psycopg://visitor_app:your_password@localhost:5432/visitor_management
    DATABASE_URL: str = "postgresql+psycopg://visitor_app:change_me@localhost:5432/visitor_management"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
