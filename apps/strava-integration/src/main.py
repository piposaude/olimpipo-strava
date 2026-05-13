import os
import httpx
from fastapi import FastAPI, Query, HTTPException, BackgroundTasks
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager
from auth import token_store
from auth.strava_oauth import build_authorization_url, exchange_code, decode_state
from activities.fetcher import fetch_recent_activities
from activities.registrar import register_activities
from webhook.handler import router as webhook_router

AGENT_MOCK_URL = os.getenv("AGENT_MOCK_URL", "")


def _notify_agent(participant_id: str, registered_count: int):
    if not AGENT_MOCK_URL:
        return
    try:
        httpx.post(
            f"{AGENT_MOCK_URL}/notify",
            json={"participant_id": participant_id, "registered_count": registered_count},
            timeout=3,
        )
    except Exception:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    token_store.ensure_table_exists()
    yield


app = FastAPI(title="olimpipo-strava", lifespan=lifespan)
app.include_router(webhook_router)


@app.get("/strava/connect")
def connect(
    participant_id: str = Query(...),
    company_id: str = Query(...),
):
    url = build_authorization_url(participant_id, company_id)
    return RedirectResponse(url)


@app.get("/strava/callback")
def callback(code: str = Query(...), state: str = Query(...), background_tasks: BackgroundTasks = None):
    try:
        state_data = decode_state(state)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid or expired state")

    participant_id = state_data["participant_id"]
    company_id = state_data["company_id"]

    token_response = exchange_code(code)
    athlete = token_response.get("athlete", {})

    token_store.save(
        participant_id=participant_id,
        company_id=company_id,
        strava_athlete_id=str(athlete.get("id")),
        access_token=token_response["access_token"],
        refresh_token=token_response["refresh_token"],
        expires_at=token_response["expires_at"],
    )

    activities = fetch_recent_activities(participant_id, days_back=90)
    registered = register_activities(participant_id, activities)

    if background_tasks:
        background_tasks.add_task(_notify_agent, participant_id, len(registered))

    return RedirectResponse(f"http://localhost:5173/connected?registered={len(registered)}")


@app.get("/health")
def health():
    return {"status": "ok"}
