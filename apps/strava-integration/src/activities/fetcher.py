import time
import httpx
from config import STRAVA_API_BASE
from auth import token_store
from auth.strava_oauth import refresh_access_token


def get_valid_access_token(participant_id: str) -> str:
    record = token_store.get_by_participant(participant_id)
    if not record:
        raise ValueError(f"no strava token for participant {participant_id}")

    if int(record["expires_at"]) - time.time() < 300:
        new_tokens = refresh_access_token(record["refresh_token"])
        token_store.update_tokens(
            participant_id,
            new_tokens["access_token"],
            new_tokens["refresh_token"],
            new_tokens["expires_at"],
        )
        return new_tokens["access_token"]

    return record["access_token"]


def fetch_recent_activities(participant_id: str, days_back: int = 7) -> list[dict]:
    token = get_valid_access_token(participant_id)
    after = int(time.time()) - days_back * 86400
    activities = []
    page = 1

    while True:
        resp = httpx.get(
            f"{STRAVA_API_BASE}/athlete/activities",
            headers={"Authorization": f"Bearer {token}"},
            params={"after": after, "per_page": 50, "page": page},
        )
        resp.raise_for_status()
        batch = resp.json()
        if not batch:
            break
        activities.extend(batch)
        page += 1

    print(f"[fetcher] fetched {len(activities)} activities for participant {participant_id}")
    for a in activities:
        print(f"  - {a.get('name')} | type={a.get('type')} | elapsed={a.get('elapsed_time')}s | date={a.get('start_date_local', '')[:10]}")
    return activities


def fetch_activity(participant_id: str, activity_id: int) -> dict:
    token = get_valid_access_token(participant_id)
    resp = httpx.get(
        f"{STRAVA_API_BASE}/activities/{activity_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    resp.raise_for_status()
    return resp.json()
