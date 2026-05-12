import time
import secrets
import httpx
from jose import jwt, JWTError
from urllib.parse import urlencode
from config import (
    STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI,
    STRAVA_AUTH_URL, STRAVA_TOKEN_URL,
    JWT_SECRET_KEY, JWT_ALGORITHM, STATE_TTL_SECONDS,
)


def build_authorization_url(participant_id: str, company_id: str) -> str:
    state = _encode_state(participant_id, company_id)
    params = {
        "client_id": STRAVA_CLIENT_ID,
        "redirect_uri": STRAVA_REDIRECT_URI,
        "response_type": "code",
        "approval_prompt": "auto",
        "scope": "activity:read_all,read",
        "state": state,
    }
    return f"{STRAVA_AUTH_URL}?{urlencode(params)}"


def exchange_code(code: str) -> dict:
    resp = httpx.post(STRAVA_TOKEN_URL, data={
        "client_id": STRAVA_CLIENT_ID,
        "client_secret": STRAVA_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
    })
    resp.raise_for_status()
    return resp.json()


def refresh_access_token(refresh_token: str) -> dict:
    resp = httpx.post(STRAVA_TOKEN_URL, data={
        "client_id": STRAVA_CLIENT_ID,
        "client_secret": STRAVA_CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    })
    resp.raise_for_status()
    return resp.json()


def decode_state(state: str) -> dict:
    try:
        payload = jwt.decode(state, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("invalid or expired state")


def _encode_state(participant_id: str, company_id: str) -> str:
    now = int(time.time())
    payload = {
        "participant_id": participant_id,
        "company_id": company_id,
        "nonce": secrets.token_hex(8),
        "iat": now,
        "exp": now + STATE_TTL_SECONDS,
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
