"""MongoDB connection with robust SSL handling."""

import logging
import certifi
from pymongo import MongoClient
from .config import DB_NAME, MONGODB_URI

log = logging.getLogger(__name__)

_client: MongoClient | None = None
_LOCAL_FALLBACK_URI = "mongodb://localhost:27017"


def _new_client() -> MongoClient:
    kwargs = {
        "maxPoolSize": 50,
        "minPoolSize": 0,
        "maxIdleTimeMS": 300_000,
        "serverSelectionTimeoutMS": 2000,
        "connectTimeoutMS": 2000,
        "socketTimeoutMS": 5000,
        "retryWrites": True,
        "retryReads": True,
    }

    candidates = [MONGODB_URI, _LOCAL_FALLBACK_URI] if MONGODB_URI else [_LOCAL_FALLBACK_URI]
    seen = set()

    for uri in candidates:
        if uri in seen:
            continue
        seen.add(uri)

        try:
            ca = certifi.where()
            c = MongoClient(uri, tlsCAFile=ca, **kwargs)
            c.admin.command("ping")
            return c
        except Exception as e:
            log.warning("Certifi SSL handshake failed for %s (%s); retrying with SSL certificate bypass...", uri, e)

        try:
            c = MongoClient(uri, tlsAllowInvalidCertificates=True, **kwargs)
            c.admin.command("ping")
            return c
        except Exception as e:
            log.warning("SSL bypass ping failed for %s (%s); trying next connection target...", uri, e)

    log.warning("MongoDB connection failed for %s and %s; using local fallback client for startup continuity.", MONGODB_URI, _LOCAL_FALLBACK_URI)
    return MongoClient(_LOCAL_FALLBACK_URI, **kwargs)


def get_db():
    global _client
    if _client is None:
        _client = _new_client()
    return _client[DB_NAME]


def connect() -> bool:
    try:
        get_db().command("ping")
        log.info("MongoDB connection established.")
        return True
    except Exception:
        log.exception("MongoDB not reachable at startup; will retry on first use.")
        return False


def close_db():
    global _client
    if _client:
        _client.close()
        _client = None
