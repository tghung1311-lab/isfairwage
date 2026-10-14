from fastapi import FastAPI

# Create the FastAPI application used by the backend server.
app = FastAPI()


@app.get("/api/health")
def health_check() -> dict[str, str]:
    """Return a simple response to confirm the API is running."""
    return {"status": "ok"}