from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    db_user: str = "root"
    db_pass: str = ""
    db_host: str = "127.0.0.1"
    db_port: int = 3306
    db_name: str = "CoreInventory"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()


def get_database_url() -> str:
    return (
        f"mysql+pymysql://{settings.db_user}:{settings.db_pass}@{settings.db_host}:{settings.db_port}/"
        f"{settings.db_name}?charset=utf8mb4"
    )
