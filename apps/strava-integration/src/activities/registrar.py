import httpx
from config import HEALTH_ACTIONS_BASE_URL, COMPANY_ID
from activities.eligibility import filter_eligible


def register_activities(participant_id: str, activities: list[dict]) -> list[dict]:
    eligible = filter_eligible(activities)
    results = []
    for activity in eligible:
        result = _register_one(participant_id, activity)
        results.append(result)
    return results


def _register_one(participant_id: str, activity: dict) -> dict:
    start_date = activity.get("start_date_local") or activity.get("start_date", "")
    date = start_date[:10]  # YYYY-MM-DD
    duration_minutes = activity["elapsed_time"] // 60

    resp = httpx.post(
        f"{HEALTH_ACTIONS_BASE_URL}/v1/company/{COMPANY_ID}/participants/activities/register",
        json={
            "participant_id": participant_id,
            "date": date,
            "duration_minutes": duration_minutes,
            "source": "strava",
            "strava_activity_id": str(activity["id"]),
            "activity_type": activity.get("type"),
        },
    )
    resp.raise_for_status()
    return {"activity_id": activity["id"], "date": date, "status": "registered"}
