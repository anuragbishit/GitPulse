import uuid
from urllib.parse import urlencode

import requests
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import RedirectResponse

from ..config import (
    FRONTEND_URL,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_OAUTH_REDIRECT_URI,
)
from ..services.github_service import (
    clear_active_github_credentials,
    fetch_my_profile,
    get_active_github_context,
    set_active_github_credentials,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
_SESSIONS: dict[str, dict[str, str]] = {}
_OAUTH_STATES: set[str] = set()


def _get_session(request: Request) -> dict[str, str] | None:
    session_id = request.cookies.get("gitpulse_session")
    if not session_id:
        return None
    session = _SESSIONS.get(session_id)
    if not session:
        return None
    set_active_github_credentials(session.get("username", ""), session.get("token", ""))
    return session


@router.get("/github")
def github_login():
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        return RedirectResponse(
            f"{FRONTEND_URL.rstrip('/')}/login?error=oauth_not_configured",
            status_code=307,
        )

    state = uuid.uuid4().hex
    _OAUTH_STATES.add(state)
    params = urlencode(
        {
            "client_id": GITHUB_CLIENT_ID,
            "redirect_uri": GITHUB_OAUTH_REDIRECT_URI,
            "scope": "read:user repo",
            "prompt": "select_account",
            "allow_signup": "true",
            "state": state,
        }
    )
    return RedirectResponse(f"https://github.com/login/oauth/authorize?{params}")


@router.get("/github/callback")
def github_callback(code: str = "", state: str = ""):
    if not code or state not in _OAUTH_STATES:
        raise HTTPException(status_code=400, detail="Invalid GitHub OAuth callback.")
    _OAUTH_STATES.discard(state)

    try:
        token_response = requests.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_OAUTH_REDIRECT_URI,
            },
            timeout=15,
        )
        token_response.raise_for_status()
        token = token_response.json().get("access_token", "")
        if not token:
            raise ValueError("GitHub did not return an access token.")

        set_active_github_credentials("", token)
        profile = fetch_my_profile()
        username = str(profile.get("login", "")).strip()
        if not username:
            raise ValueError("GitHub did not return a username.")
    except Exception as exc:  # pragma: no cover - external OAuth validation path
        clear_active_github_credentials()
        raise HTTPException(status_code=401, detail=f"GitHub login failed: {exc}") from exc

    session_id = uuid.uuid4().hex
    _SESSIONS[session_id] = {"username": username, "token": token}
    redirect = RedirectResponse(f"{FRONTEND_URL.rstrip('/')}/dashboard")
    redirect.set_cookie(
        key="gitpulse_session",
        value=session_id,
        httponly=True,
        samesite="none",
        secure=True,
        max_age=60 * 60 * 24 * 7,
    )
    return redirect

from pydantic import BaseModel

class LocalLoginRequest(BaseModel):
    username: str
    token: str

@router.post("/local")
def local_login(data: LocalLoginRequest, response: Response):
    try:
        set_active_github_credentials(data.username, data.token)
        profile = fetch_my_profile()
        login_username = str(profile.get("login", "")).strip()
        
        # Verify the username matches or just use the token
        if not login_username:
            raise ValueError("Invalid username or token")
            
        if login_username.lower() != data.username.lower():
            # If the user put a different username but a valid token, we could either error out or just use the token's username
            pass
            
    except Exception as exc:
        clear_active_github_credentials()
        error_msg = str(exc)
        if "401" in error_msg:
            error_msg = "401 Unauthorized. Please make sure you are using a Personal Access Token (PAT) instead of your GitHub password, as GitHub's API no longer supports passwords."
        raise HTTPException(status_code=401, detail=f"GitHub login failed: {error_msg}") from exc

    session_id = uuid.uuid4().hex
    _SESSIONS[session_id] = {"username": login_username, "token": data.token}
    
    response.set_cookie(
        key="gitpulse_session",
        value=session_id,
        httponly=True,
        samesite="none",
        secure=True,
        max_age=60 * 60 * 24 * 7,
    )
    return {"ok": True, "username": login_username}


@router.post("/logout")
def logout(response: Response, request: Request):
    session_id = request.cookies.get("gitpulse_session")
    if session_id and session_id in _SESSIONS:
        del _SESSIONS[session_id]

    clear_active_github_credentials()
    response.delete_cookie("gitpulse_session")
    return {"ok": True}


@router.get("/me")
def me(request: Request):
    session = _get_session(request)
    if not session:
        return {"authenticated": False}

    username, _ = get_active_github_context()
    return {
        "authenticated": True,
        "user": {
            "login": session.get("username") or username,
        },
    }

