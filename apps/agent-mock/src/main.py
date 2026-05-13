import time
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from config import STRAVA_INTEGRATION_PUBLIC_URL, COMPANY_ID

app = FastAPI(title="agent-mock")

# In-memory store: participant_id → list of messages
_messages: dict[str, list[dict]] = {}

INTENTS: dict[str, str] = {
    "conectar strava": "strava_connect",
    "vincular strava": "strava_connect",
    "strava": "strava_connect",
    "olimpipo": "olimpipo_info",
}

OLIMPIPO_REPLY = (
    "🏆 *Olimpipo* é o desafio esportivo da Pipo! "
    "Você acumula pontos registrando atividades físicas ao longo do mês.\n\n"
    "Para conectar seu Strava e ter as atividades registradas automaticamente, "
    "envie: _conectar strava_"
)

FALLBACK_REPLY = (
    "Olá! 👋 Sou o agente do Pipo Cuida.\n\n"
    "Posso te ajudar a conectar sua conta do Strava ao Olimpipo. "
    "Tente enviar: _conectar strava_"
)


class ChatMessage(BaseModel):
    participant_id: str
    text: str


class Notification(BaseModel):
    participant_id: str
    registered_count: int


def _add(participant_id: str, role: str, text: str):
    _messages.setdefault(participant_id, []).append(
        {"role": role, "text": text, "ts": time.time()}
    )


def _detect_intent(text: str) -> str:
    lower = text.lower().strip()
    for keyword, intent in INTENTS.items():
        if keyword in lower:
            return intent
    return "fallback"


@app.post("/chat")
def chat(msg: ChatMessage):
    _add(msg.participant_id, "user", msg.text)

    intent = _detect_intent(msg.text)

    if intent == "strava_connect":
        url = (
            f"{STRAVA_INTEGRATION_PUBLIC_URL}/strava/connect"
            f"?participant_id={msg.participant_id}&company_id={COMPANY_ID}"
        )
        reply = (
            f"Para conectar sua conta do Strava ao Olimpipo, clique no link abaixo:\n\n"
            f"{url}\n\n"
            f"Após autorizar, suas atividades serão registradas automaticamente. 🏆"
        )
    elif intent == "olimpipo_info":
        reply = OLIMPIPO_REPLY
    else:
        reply = FALLBACK_REPLY

    _add(msg.participant_id, "agent", reply)
    return {"messages": _messages.get(msg.participant_id, [])}


@app.post("/notify")
def notify(notification: Notification):
    count = notification.registered_count
    if count > 0:
        plural = count > 1
        reply = (
            f"✅ Strava conectado com sucesso!\n\n"
            f"{count} atividade{'s' if plural else ''} dos últimos 90 dias "
            f"já {'foram' if plural else 'foi'} registrada{'s' if plural else ''}. "
            f"Continue se exercitando e boa sorte no ranking! 💪"
        )
    else:
        reply = (
            "✅ Strava conectado com sucesso!\n\n"
            "Suas próximas atividades serão registradas automaticamente no Olimpipo. 🏆"
        )
    _add(notification.participant_id, "agent", reply)
    return {"status": "ok"}


@app.get("/messages/{participant_id}")
def get_messages(participant_id: str):
    return _messages.get(participant_id, [])


@app.get("/health")
def health():
    return {"status": "ok"}


app.mount("/", StaticFiles(directory="/app/src/static", html=True), name="static")
