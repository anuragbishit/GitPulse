import logging
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from .config import CORS_ORIGINS
from .database import close_db, connect
from .indexes import ensure_indexes
from .routes.analytics import router as analytics_router
from .routes.auth import router as auth_router
from .routes.contributions import router as contributions_router
from .routes.followers import router as followers_router
from .routes.repos import router as repos_router
from .scheduler import start_scheduler, stop_scheduler

log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=_connect_db_quietly, name="connect-db", daemon=True).start()
    threading.Thread(target=_ensure_indexes_quietly, name="ensure-indexes", daemon=True).start()
    start_scheduler()
    yield
    stop_scheduler()
    close_db()


def _ensure_indexes_quietly() -> None:
    try:
        ensure_indexes()
    except Exception:
        log.exception("Background index creation failed.")


def _connect_db_quietly() -> None:
    connect()


app = FastAPI(title="GitHub Analytics API", version="1.0.0", lifespan=lifespan)

from fastapi import Request
from .routes.auth import _get_session

app.add_middleware(GZipMiddleware, minimum_size=700)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def restore_session_middleware(request: Request, call_next):
    _get_session(request)
    response = await call_next(request)
    return response

app.include_router(auth_router)
app.include_router(followers_router)
app.include_router(repos_router)
app.include_router(contributions_router)
app.include_router(analytics_router)


@app.get("/health")
def health():
    return {"status": "ok"}
