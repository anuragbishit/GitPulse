from fastapi import APIRouter, Query, HTTPException
from ..services import follower_service, following_service
from ..services import repo_service, contributions_service
from ..services import profile_service, sync_state
from ..services.github_service import search_users

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/users/search")
def search_other_profiles(q: str = Query(..., min_length=1), per_page: int = Query(10, ge=1, le=20)):
    """Search public GitHub users without affecting the authenticated account sync."""
    try:
        return {"items": search_users(q, per_page=per_page)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile")
def get_profile(refresh: bool = Query(False)):
    """Served from MongoDB, not from GitHub — see profile_service.

    The Topbar renders on every page, so this endpoint is on the critical path of
    every single page load; it must not wait on a third-party API. `?refresh=1`
    forces a live fetch for the rare case where the profile has just changed.
    """
    try:
        return profile_service.get_profile(force=refresh)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sync-status")
def sync_status():
    """Last time a sync completed. Polled by open tabs — keep it trivial."""
    return sync_state.status()


@router.get("/sync-runs")
def sync_runs(limit: int = Query(10, ge=1, le=50)):
    return sync_state.recent_runs(limit)


@router.post("/sync")
def trigger_sync():
    run_id, started_at = sync_state.start_run()
    try:
        # We are already authenticated against GitHub here, so refresh the cached
        # profile in the same pass rather than making page loads pay for it.
        profile_service.get_profile(force=True)
        followers_result = follower_service.sync_followers()
        following_count  = following_service.sync_following()
        repo_result      = repo_service.sync_repos()
        contrib_result   = contributions_service.sync_contributions()
        # Stamped last, so it only moves when every step above actually finished.
        # Returned to the caller as `synced_at` so the browser can recognise this
        # sync when it next polls /api/sync-status and skip a redundant refresh.
        synced_at = sync_state.mark_synced()
        result = {
            **followers_result,
            "run_id": run_id,
            "synced_at":           synced_at,
            "total_following":     following_count,
            "total_repos":         repo_result["total_repos"],
            "total_contributions": contrib_result["total_contributions"],
        }
        sync_state.finish_run(run_id, started_at, "success", result)
        return result
    except Exception as e:
        sync_state.finish_run(run_id, started_at, "failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ── Followers ──────────────────────────────────────────────────────────────

@router.get("/followers")
def list_followers(page: int = Query(1, ge=1), per_page: int = Query(30, ge=1, le=100), search: str = Query("")):
    return follower_service.get_current_followers(page=page, per_page=per_page, search=search)


@router.get("/followers/stats")
def stats():
    return follower_service.get_stats()


@router.get("/followers/growth")
def growth(days: int = Query(90, ge=7, le=365)):
    return follower_service.get_growth(days)


@router.get("/followers/unfollowed")
def unfollowed(page: int = Query(1, ge=1), per_page: int = Query(30, ge=1, le=100), search: str = Query("")):
    return follower_service.get_current_unfollowed(page=page, per_page=per_page, search=search)


@router.get("/followers/{login}/history")
def follower_history(login: str):
    return follower_service.get_follower_history(login)


# ── Following ──────────────────────────────────────────────────────────────

@router.get("/following")
def list_following(page: int = Query(1, ge=1), per_page: int = Query(30, ge=1, le=100), search: str = Query("")):
    return following_service.get_following(page=page, per_page=per_page, search=search)
