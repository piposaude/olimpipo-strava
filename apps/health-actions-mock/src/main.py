from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="health-actions-mock")

registered: list[dict] = []


class RegisterActivityRequest(BaseModel):
    participant_id: str
    date: str
    duration_minutes: int
    source: str = "strava"
    strava_activity_id: str | None = None
    activity_type: str | None = None


@app.post("/v1/company/{company_id}/participants/activities/register")
def register_activity(company_id: str, body: RegisterActivityRequest):
    record = {
        "company_id": company_id,
        "participant_id": body.participant_id,
        "date": body.date,
        "duration_minutes": body.duration_minutes,
        "source": body.source,
        "strava_activity_id": body.strava_activity_id,
        "activity_type": body.activity_type,
        "registered_at": datetime.utcnow().isoformat(),
    }
    registered.append(record)
    print(f"[mock] registered activity: {record}")
    return {"status": "ok", "activity": record}


@app.get("/v1/company/{company_id}/participants/activities")
def list_activities(company_id: str):
    return [r for r in registered if r["company_id"] == company_id]


@app.get("/health")
def health():
    return {"status": "ok"}
