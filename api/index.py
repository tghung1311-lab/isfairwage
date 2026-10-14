import importlib.util
from pathlib import Path


BACKEND_APP_PATH = Path(__file__).resolve().parent.parent / "backend" / "api" / "index.py"
spec = importlib.util.spec_from_file_location("isfairwage_backend_api", BACKEND_APP_PATH)
if spec is None or spec.loader is None:
    raise ImportError(f"Unable to load FastAPI application from {BACKEND_APP_PATH}")

backend_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backend_module)

app = backend_module.app