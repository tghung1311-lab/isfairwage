"""Create the IsFairWage database schema and fictional sample data."""

import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv


BACKEND_DIRECTORY = Path(__file__).resolve().parent


def main() -> None:
    load_dotenv(BACKEND_DIRECTORY / ".env")
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is not set in backend/.env.")

    setup_sql = (BACKEND_DIRECTORY / "sql" / "setup.sql").read_text(encoding="utf-8")

    with psycopg2.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(setup_sql)

    print("Database initialization completed successfully")


if __name__ == "__main__":
    main()