from fastapi import FastAPI, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request

app = FastAPI(title="toro-mock")
templates = Jinja2Templates(directory="/app/src/templates")

STRAVA_INTEGRATION_URL = "http://localhost:8000"


@app.get("/", response_class=HTMLResponse)
def connect_page(
    request: Request,
    participant_id: str = Query(default="participante"),
    company_id: str = Query(default="pipo-hackathon"),
):
    connect_url = (
        f"{STRAVA_INTEGRATION_URL}/strava/connect"
        f"?participant_id={participant_id}&company_id={company_id}"
    )
    return templates.TemplateResponse("connect.html", {
        "request": request,
        "participant_id": participant_id,
        "company_id": company_id,
        "connect_url": connect_url,
    })


@app.get("/connected", response_class=HTMLResponse)
def success_page(request: Request, registered: int = 0):
    return templates.TemplateResponse("success.html", {
        "request": request,
        "registered": registered,
    })
