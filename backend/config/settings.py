"""应用配置模块."""
from typing import List

from pydantic import AnyHttpUrl, EmailStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置类."""

    # API配置
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI剧本创作平台"

    # CORS配置
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str] | str:
        """验证CORS配置."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # 数据库配置
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    SQLALCHEMY_DATABASE_URI: str | None = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: str | None, values: dict) -> str:
        """构建数据库连接URI."""
        if isinstance(v, str):
            return v
        return (
            f"postgresql+asyncpg://{values.data['POSTGRES_USER']}:"
            f"{values.data['POSTGRES_PASSWORD']}@{values.data['POSTGRES_HOST']}:"
            f"{values.data['POSTGRES_PORT']}/{values.data['POSTGRES_DB']}"
        )

    # JWT配置
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Redis配置
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str

    # Milvus配置
    MILVUS_HOST: str
    MILVUS_PORT: int
    MILVUS_USER: str
    MILVUS_PASSWORD: str
    MILVUS_COLLECTION: str = "script_knowledge"
    MILVUS_DIMENSION: int = 1536
    MILVUS_INDEX_TYPE: str = "IVF_FLAT"
    MILVUS_METRIC_TYPE: str = "L2"
    MILVUS_NLIST: int = 1024
    MILVUS_NPROBE: int = 16
    MILVUS_POOL_SIZE: int = 10

    # OpenAI配置
    OPENAI_API_KEY: str
    OPENAI_API_BASE: str = "https://api.openai.com/v1"
    OPENAI_API_VERSION: str = "2024-03-01"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-large"
    OPENAI_BATCH_SIZE: int = 32
    OPENAI_MAX_RETRIES: int = 3
    OPENAI_TIMEOUT: float = 30.0
    OPENAI_MAX_CONCURRENT: int = 5
    OPENAI_ENABLE_CACHE: bool = True
    OPENAI_CACHE_TTL: int = 86400

    # 文件存储配置
    OSS_ACCESS_KEY: str
    OSS_SECRET_KEY: str
    OSS_BUCKET_NAME: str
    OSS_ENDPOINT: str

    # 应用配置
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_SECRET_KEY: str
    LOG_LEVEL: str = "INFO"

    # 邮件配置
    SMTP_TLS: bool = True
    SMTP_PORT: int | None = None
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: EmailStr | None = None
    EMAILS_FROM_NAME: str | None = None
    EMAIL_TEMPLATES_DIR: str = "src/scriptai/email-templates"

    # 监控配置
    PROMETHEUS_RETENTION_TIME: str = "15d"
    GRAFANA_ADMIN_USER: str = "admin"
    GRAFANA_ADMIN_PASSWORD: str = "admin"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings() 