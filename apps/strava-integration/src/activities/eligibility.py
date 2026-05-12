from datetime import datetime, timezone
from config import MIN_ACTIVITY_DURATION_SECONDS, ELIGIBLE_ACTIVITY_TYPES


def is_eligible(activity: dict) -> bool:
    return (
        activity.get("type") in ELIGIBLE_ACTIVITY_TYPES
        and activity.get("elapsed_time", 0) >= MIN_ACTIVITY_DURATION_SECONDS
    )


def filter_eligible(activities: list[dict]) -> list[dict]:
    eligible = [a for a in activities if is_eligible(a)]
    return _deduplicate_by_day(eligible)


def _deduplicate_by_day(activities: list[dict]) -> list[dict]:
    """Keep only the first eligible activity per calendar day."""
    seen_days: set[str] = set()
    result = []
    for activity in sorted(activities, key=lambda a: a.get("start_date", "")):
        day = _activity_day(activity)
        if day not in seen_days:
            seen_days.add(day)
            result.append(activity)
    return result


def _activity_day(activity: dict) -> str:
    start_date = activity.get("start_date_local") or activity.get("start_date", "")
    try:
        return datetime.fromisoformat(start_date.replace("Z", "+00:00")).date().isoformat()
    except (ValueError, AttributeError):
        return start_date[:10]
