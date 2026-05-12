from fastapi import APIRouter, Query, HTTPException, Request
from config import STRAVA_VERIFY_TOKEN
from auth import token_store
from activities.fetcher import fetch_activity
from activities.registrar import register_activities

router = APIRouter()


@router.get("/webhook")
async def webhook_verify(
    hub_mode: str = Query(alias="hub.mode"),
    hub_challenge: str = Query(alias="hub.challenge"),
    hub_verify_token: str = Query(alias="hub.verify_token"),
):
    if hub_mode != "subscribe" or hub_verify_token != STRAVA_VERIFY_TOKEN:
        raise HTTPException(status_code=403, detail="verification failed")
    return {"hub.challenge": hub_challenge}


@router.post("/webhook")
async def webhook_event(request: Request):
    event = await request.json()

    if event.get("object_type") != "activity" or event.get("aspect_type") != "create":
        return {"status": "ignored"}

    strava_athlete_id = str(event.get("owner_id"))
    activity_id = event.get("object_id")

    record = token_store.get_by_athlete(strava_athlete_id)
    if not record:
        return {"status": "athlete_not_connected"}

    participant_id = record["participant_id"]
    activity = fetch_activity(participant_id, activity_id)
    results = register_activities(participant_id, [activity])

    return {"status": "processed", "registered": len(results)}
