from decimal import Decimal
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "sqlite:///./data/gcc_ledger.db"
    vector_index_path: str = "./data/vector_index"
    openai_api_key: str | None = None
    openai_base_url: str | None = None
    openai_model: str = "gpt-4o"
    admin_jwt_secret: str = "development-only-change-me-minimum-32-bytes-secret-key"
    daily_llm_budget_usd: Decimal = Decimal("5.00")
    fetch_user_agent: str = "GCC-Ledger/0.1"
    llm_provider: str = "mock"
    cors_origins: str = "http://localhost:3000"
    request_max_bytes: int = 64_000

    grade_weights: dict[str, int] = {"A": 4, "B": 3, "C": 2, "D": 1}
    salary_growth: float = 0.098
    running_cost_share: float = 0.70
    setup_cost_share: float = 0.30
    default_headcount: int = 150
    default_cost_advantage: float = 0.40
    default_hidden_allowance: float = 0.12
    default_exchange_rate: float = 85.0
    radar_repeat_discount: float = 0.60


@lru_cache
def get_settings() -> Settings:
    return Settings()


from pathlib import Path


def get_project_root() -> Path:
    p = Path(__file__).resolve()
    for parent in [p.parent, *p.parents]:
        if (parent / "data" / "seed").exists():
            return parent
    return p.parents[1] if len(p.parents) > 1 else p.parent


settings = get_settings()
