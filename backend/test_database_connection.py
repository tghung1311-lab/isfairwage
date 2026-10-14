"""Verify the IsFairWage database schema, sample data, and RLS configuration."""

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

    with psycopg2.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT to_regclass('public.workplaces'), to_regclass('public.reviews')"
            )
            workplaces_table, reviews_table = cursor.fetchone()

            if workplaces_table != "workplaces" or reviews_table != "reviews":
                raise RuntimeError("Expected database tables were not found.")

            cursor.execute("SELECT count(*) FROM public.workplaces")
            workplace_count = cursor.fetchone()[0]

            cursor.execute("SELECT count(*) FROM public.reviews")
            review_count = cursor.fetchone()[0]

            cursor.execute(
                """
                SELECT relname, relrowsecurity
                FROM pg_class
                JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
                WHERE pg_namespace.nspname = 'public'
                  AND relname IN ('workplaces', 'reviews')
                """
            )
            rls_status = dict(cursor.fetchall())

            cursor.execute(
                """
                SELECT count(*)
                FROM pg_policies
                WHERE schemaname = 'public'
                  AND tablename IN ('workplaces', 'reviews')
                """
            )
            policy_count = cursor.fetchone()[0]

            if policy_count != 0:
                raise RuntimeError("Public RLS policies should not exist for these tables.")

    print("Database connection successful")
    print("Table found: public.workplaces")
    print("Table found: public.reviews")
    print(f"Sample workplaces: {workplace_count}")
    print(f"Sample reviews: {review_count}")
    print(
        "RLS enabled: "
        f"workplaces={rls_status.get('workplaces', False)}, "
        f"reviews={rls_status.get('reviews', False)}"
    )


if __name__ == "__main__":
    main()