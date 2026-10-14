import os
import re
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator


BACKEND_DIRECTORY = Path(__file__).resolve().parent.parent
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


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

    missing_variables = [
        variable
        for variable, value in {
            "SUPABASE_URL": supabase_url,
            "SUPABASE_PUBLISHABLE_KEY": supabase_publishable_key,
        }.items()
        if not value
    ]
    if missing_variables:
        raise RuntimeError(
            "Missing required backend configuration: " + ", ".join(missing_variables)
        )

    app.state.supabase_url = supabase_url
    app.state.supabase_publishable_key = supabase_publishable_key
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