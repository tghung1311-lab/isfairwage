import os
import re
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
from uuid import UUID

import httpx
import psycopg2
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator


BACKEND_DIRECTORY = Path(__file__).resolve().parent.parent
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

# $33.05 is $26.44 national minimum wage plus 25% casual loading.
MINIMUM_WAGE = 33.05


def calculate_badge(average_hourly_pay: float | None) -> str:
    if average_hourly_pay is None or average_hourly_pay <= 0:
        return "not-enough-data"

    ratio = average_hourly_pay / MINIMUM_WAGE
    if ratio >= 1.10:
        return "green"
    if ratio >= 0.90:
        return "amber"
    return "red"


class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Full name is required.")
        return value.strip()

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip().lower()
        if not EMAIL_PATTERN.fullmatch(email):
            raise ValueError("Please enter a valid email address.")
        return email

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip().lower()
        if not EMAIL_PATTERN.fullmatch(email):
            raise ValueError("Please enter a valid email address.")
        return email

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not value:
            raise ValueError("Password is required.")
        return value


class UserResponse(BaseModel):
    id: str
    email: str | None = None
    full_name: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str
    user: UserResponse


def clean_user(user: dict[str, Any]) -> UserResponse:
    metadata = user.get("user_metadata") or {}
    return UserResponse(
        id=str(user["id"]),
        email=user.get("email"),
        full_name=metadata.get("full_name"),
    )


def clean_auth_response(payload: dict[str, Any]) -> AuthResponse:
    user = payload.get("user")
    required_fields = ("access_token", "refresh_token", "expires_in", "token_type")
    if not isinstance(user, dict) or any(field not in payload for field in required_fields):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication service returned an incomplete response. Please try again.",
        )

    return AuthResponse(
        access_token=payload["access_token"],
        refresh_token=payload["refresh_token"],
        expires_in=payload["expires_in"],
        token_type=payload["token_type"],
        user=clean_user(user),
    )


def run_database_query(
    request: Request,
    query: str,
    parameters: tuple[Any, ...] = (),
) -> list[tuple[Any, ...]]:
    try:
        with psycopg2.connect(request.app.state.database_url) as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, parameters)
                return cursor.fetchall()
    except psycopg2.Error as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load workplace data right now. Please try again.",
        ) from error


def workplace_summary_from_row(row: tuple[Any, ...]) -> dict[str, Any]:
    average = float(row[5]) if row[5] is not None else None
    return {
        "id": str(row[0]),
        "name": row[1],
        "suburb": row[2],
        "industry": row[3],
        "review_count": row[4],
        "average_hourly_pay": average,
        "badge": calculate_badge(average),
    }


def auth_headers(request: Request) -> dict[str, str]:
    return {
        "apikey": request.app.state.supabase_publishable_key,
        "Content-Type": "application/json",
    }


async def supabase_request(
    request: Request,
    method: str,
    path: str,
    *,
    json: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
) -> httpx.Response:
    request_headers = auth_headers(request)
    if headers:
        request_headers.update(headers)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            return await client.request(
                method,
                f"{request.app.state.supabase_url}/auth/v1{path}",
                json=json,
                headers=request_headers,
            )
    except httpx.RequestError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is temporarily unavailable. Please try again.",
        ) from error


async def get_current_user(
    request: Request,
    authorization: str | None = Header(default=None),
) -> UserResponse:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A valid sign-in token is required.",
        )

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A valid sign-in token is required.",
        )

    response = await supabase_request(
        request,
        "GET",
        "/user",
        headers={"Authorization": f"Bearer {token}"},
    )

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or has expired. Please sign in again.",
        )

    try:
        user = response.json()
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication service returned an invalid response. Please try again.",
        ) from error

    if not isinstance(user, dict) or "id" not in user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or has expired. Please sign in again.",
        )

    return clean_user(user)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv(BACKEND_DIRECTORY / ".env")
    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    supabase_publishable_key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
    database_url = os.getenv("DATABASE_URL", "")

    missing_variables = [
        variable
        for variable, value in {
            "SUPABASE_URL": supabase_url,
            "SUPABASE_PUBLISHABLE_KEY": supabase_publishable_key,
            "DATABASE_URL": database_url,
        }.items()
        if not value
    ]
    if missing_variables:
        raise RuntimeError(
            "Missing required backend configuration: " + ", ".join(missing_variables)
        )

    app.state.supabase_url = supabase_url
    app.state.supabase_publishable_key = supabase_publishable_key
    app.state.database_url = database_url
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"^https://([a-z0-9-]+\.)*vercel\.app$",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    """Return a simple response to confirm the API is running."""
    return {"status": "ok"}


@app.post("/api/auth/signup", response_model=AuthResponse)
async def signup(payload: SignupRequest, request: Request) -> AuthResponse:
    response = await supabase_request(
        request,
        "POST",
        "/signup",
        json={
            "email": payload.email,
            "password": payload.password,
            "data": {"full_name": payload.full_name},
        },
    )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to create an account with those details. Please try another email or sign in.",
        )

    try:
        return clean_auth_response(response.json())
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication service returned an invalid response. Please try again.",
        ) from error


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest, request: Request) -> AuthResponse:
    response = await supabase_request(
        request,
        "POST",
        "/token?grant_type=password",
        json={"email": payload.email, "password": payload.password},
    )

    if response.status_code in {
        status.HTTP_400_BAD_REQUEST,
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    }:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
        )
    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication service is temporarily unavailable. Please try again.",
        )

    try:
        return clean_auth_response(response.json())
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication service returned an invalid response. Please try again.",
        ) from error


@app.get("/api/auth/me", response_model=UserResponse)
async def me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return current_user


@app.get("/api/workplaces")
def get_workplaces(
    request: Request,
    search: str | None = None,
    industry: str | None = None,
    suburb: str | None = None,
) -> list[dict[str, Any]]:
    cleaned_search = search.strip() if search and search.strip() else None
    cleaned_industry = industry.strip() if industry and industry.strip() else None
    cleaned_suburb = suburb.strip() if suburb and suburb.strip() else None
    query = """
        SELECT w.id, w.name, w.suburb, w.industry,
               COUNT(r.id) AS review_count,
               ROUND(AVG(r.hourly_pay), 2) AS average_hourly_pay
        FROM public.workplaces AS w
        LEFT JOIN public.reviews AS r ON r.workplace_id = w.id
        WHERE (%s IS NULL OR w.name ILIKE '%%' || %s || '%%' OR w.suburb ILIKE '%%' || %s || '%%')
          AND (%s IS NULL OR w.industry ILIKE %s)
          AND (%s IS NULL OR w.suburb ILIKE %s)
        GROUP BY w.id, w.name, w.suburb, w.industry
        ORDER BY w.name
    """
    rows = run_database_query(
        request,
        query,
        (
            cleaned_search,
            cleaned_search,
            cleaned_search,
            cleaned_industry,
            cleaned_industry,
            cleaned_suburb,
            cleaned_suburb,
        ),
    )
    return [workplace_summary_from_row(row) for row in rows]


@app.get("/api/workplaces/{workplace_id}")
def get_workplace(workplace_id: UUID, request: Request) -> dict[str, Any]:
    workplace_query = """
        SELECT w.id, w.name, w.suburb, w.industry,
               COUNT(r.id) AS review_count,
               ROUND(AVG(r.hourly_pay), 2) AS average_hourly_pay
        FROM public.workplaces AS w
        LEFT JOIN public.reviews AS r ON r.workplace_id = w.id
        WHERE w.id = %s
        GROUP BY w.id, w.name, w.suburb, w.industry
    """
    workplace_rows = run_database_query(request, workplace_query, (str(workplace_id),))
    if not workplace_rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workplace not found.")

    review_query = """
        SELECT r.id, r.hourly_pay, r.hours_worked, r.payslip_provided,
               r.is_anonymous, r.created_at,
               CASE
                   WHEN r.is_anonymous THEN 'Anonymous'
                   WHEN NULLIF(TRIM(auth_user.raw_user_meta_data ->> 'full_name'), '') IS NOT NULL
                       THEN auth_user.raw_user_meta_data ->> 'full_name'
                   ELSE 'Community member'
               END AS reviewer_label
        FROM public.reviews AS r
        LEFT JOIN auth.users AS auth_user ON auth_user.id = r.user_id
        WHERE r.workplace_id = %s
        ORDER BY r.created_at DESC
    """
    review_rows = run_database_query(request, review_query, (str(workplace_id),))
    workplace = workplace_summary_from_row(workplace_rows[0])
    workplace["minimum_wage"] = MINIMUM_WAGE
    workplace["reviews"] = [
        {
            "id": str(row[0]),
            "hourly_pay": float(row[1]),
            "hours_worked": float(row[2]),
            "payslip_provided": row[3],
            "is_anonymous": row[4],
            "created_at": row[5].isoformat(),
            "reviewer_label": row[6],
        }
        for row in review_rows
    ]
    return workplace