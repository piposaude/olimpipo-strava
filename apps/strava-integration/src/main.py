from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager
from auth import token_store
from auth.strava_oauth import build_authorization_url, exchange_code, decode_state
from activities.fetcher import fetch_recent_activities
from activities.registrar import register_activities
from webhook.handler import router as webhook_router


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
def callback(code: str = Query(...), state: str = Query(...)):
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

    return RedirectResponse(f"http://localhost:3000/connected?registered={len(registered)}")


@app.get("/health")
def health():
    return {"status": "ok"}
