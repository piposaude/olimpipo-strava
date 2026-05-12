# olimpipo-strava

Integração Strava para o **Olimpipo** — a competição esportiva da Pipo Saúde.

Hoje os check-ins são feitos pelo WhatsApp: o participante manda uma foto de screenshot do Strava (ou do cronômetro do celular), e um agente de LLM valida a imagem. Este projeto substitui esse fluxo manual por uma integração direta com a API do Strava via OAuth 2.0, registrando atividades automaticamente no serviço interno `health-actions`.

---

## Contexto: o que é o Olimpipo

O Olimpipo é um *health-action* do tipo *challenge* oferecido pelo Pipo. Empresas clientes ativam o desafio para seus colaboradores durante 8 semanas. Participantes fazem check-ins de atividade física para acumular pontos e aparecer no ranking. O RH gerencia tudo via **Toro** (app web interno).

**Antes desta integração:**
```
Participante → screenshot Strava → WhatsApp → LLM valida imagem → health-actions registra atividade
```

**Com esta integração:**
```
Participante → conecta conta Strava (OAuth) → Strava envia webhook → health-actions registra atividade
```

---

## Estrutura do repositório

```
olimpipo-strava/
├── apps/
│   ├── strava-integration/      # Serviço principal: OAuth + ingestion de atividades
│   │   └── src/
│   │       ├── main.py                # Endpoints /strava/connect e /strava/callback
│   │       ├── config.py              # Variáveis de ambiente
│   │       ├── auth/
│   │       │   ├── strava_oauth.py    # Fluxo OAuth 2.0 (build URL, exchange, refresh)
│   │       │   └── token_store.py     # Persistência de tokens no DynamoDB
│   │       ├── activities/
│   │       │   ├── fetcher.py         # Pull de atividades com auto-refresh de token
│   │       │   ├── eligibility.py     # Filtra por tipo, duração mínima e 1/dia
│   │       │   └── registrar.py       # POST para o health-actions
│   │       └── webhook/
│   │           └── handler.py         # Recebe push events do Strava em background
│   ├── health-actions-mock/     # Mock da API interna Pipo (health-actions service)
│   │   └── src/
│   │       └── main.py          # FastAPI simulando os endpoints reais
│   └── toro-mock/               # Mock da UI do participante (página "Conectar Strava")
│       └── src/
│           ├── main.py
│           └── templates/
│               ├── connect.html     # Página com botão "Conectar com Strava"
│               └── success.html     # Página de sucesso pós-OAuth
├── scripts/
│   ├── register_webhook.sh      # Registra a subscription no Strava
│   └── create_test_activity.sh  # Cria atividade de teste via API Strava
├── docker-compose.yml
└── .env.example
```

### Por que Python/FastAPI?

O `health-actions` de produção e o Toro são Clojure. Para este hackathon, Python foi escolhido para o serviço novo porque:
- OAuth 2.0 flows e HTTP clients têm bibliotecas maduras (`authlib`, `httpx`)
- DynamoDB local via `boto3` sem infraestrutura adicional
- O repositório já usa Python no `checkin_image_validator_agent`

A interface com o `health-actions` de produção é via HTTP — a linguagem do cliente não importa.

---

## Arquitetura

### Visão geral

```
                    ┌─────────────────────────────────────────────┐
                    │              olimpipo-strava                │
                    │                                             │
  Participante ────►│  strava-integration   ──►  health-actions  │
  (browser)        │  (FastAPI)                 (mock / real)    │
                    │       │                                     │
                    │       ▼                                     │
                    │   DynamoDB                                  │
                    │   (tokens)                                  │
                    └─────────────┬───────────────────────────────┘
                                  │ OAuth + Webhook
                                  ▼
                            Strava API
```

### O que é mockado para rodar localmente

| Dependência de produção (GitLab/AWS) | Mock neste repositório               |
|--------------------------------------|--------------------------------------|
| `health-actions` service (EKS)       | `apps/health-actions-mock` (FastAPI) |
| DynamoDB (AWS)                       | `amazon/dynamodb-local` (Docker)     |
| AWS SSM / secrets component          | Variáveis de ambiente (`.env`)       |
| Auth Pipo (Keycloak/Firebase)        | `participant_id` fixo no state JWT   |
| Ranking engine                       | Absorvido pelo mock do health-actions|

---

## Fluxo de autenticação Strava (OAuth 2.0)

### Diagrama de sequência

```
Membro (Browser)          strava-integration             Strava API
        |                         |                           |
        | 1. GET /strava/connect  |                           |
        |  ?participant_id=xyz    |                           |
        |------------------------>|                           |
        |                         | 2. Gera state JWT:        |
        |                         |    {participant_id,       |
        |                         |     company_id,           |
        |                         |     nonce, exp: now+10m}  |
        |                         |    assinado com SECRET_KEY |
        |                         |                           |
        | 3. 302 → Strava Auth URL|                           |
        |    ?client_id=...       |                           |
        |    &redirect_uri=.../callback                       |
        |    &response_type=code  |                           |
        |    &scope=activity:read_all,read                    |
        |    &state=<JWT>         |                           |
        |<------------------------|                           |
        |                                                     |
        | 4. Usuário autoriza na UI do Strava                 |
        |---------------------------------------------------->|
        |                                                     |
        | 5. Strava redireciona para redirect_uri             |
        |    ?code=AUTH_CODE&state=<JWT>&scope=...            |
        |                                                     |
        | GET /strava/callback?code=xxx&state=<JWT>           |
        |------------------------>|                           |
        |                         | 6. Valida JWT do state    |
        |                         |    (assinatura + expiry)  |
        |                         |    → extrai participant_id|
        |                         |                           |
        |                         | 7. POST /oauth/token      |
        |                         |    {client_id,            |
        |                         |     client_secret,        |
        |                         |     code,                 |
        |                         |     grant_type:           |
        |                         |      authorization_code}  |
        |                         |-------------------------->|
        |                         |                           |
        |                         | 8. Resposta tokens:       |
        |                         |    {access_token,         |
        |                         |     refresh_token,        |
        |                         |     expires_at,  ← unix   |
        |                         |     athlete.id,           |
        |                         |     athlete.firstname}    |
        |                         |<--------------------------|
        |                         |                           |
        |                         | 9. Persiste no DynamoDB:  |
        |                         |    PK: participant_id     |
        |                         |    {strava_athlete_id,    |
        |                         |     access_token,         |
        |                         |     refresh_token,        |
        |                         |     expires_at}           |
        |                         |                           |
        |                         | 10. Busca atividades dos  |
        |                         |     últimos 7 dias        |
        |                         |  GET /athlete/activities  |
        |                         |-------------------------->|
        |                         |                           |
        |                         | 11. Lista de activities   |
        |                         |<--------------------------|
        |                         |                           |
        |                         | 12. Filtra elegíveis:     |
        |                         |     duration >= 20 min    |
        |                         |     type ∈ allowlist      |
        |                         |                           |
        |                         | 13. POST health-actions   |
        |                         |  /v1/company/{id}/        |
        |                         |  participants/activities/ |
        |                         |  register                 |
        |                         |  (para cada atividade)    |
        |                         |                           |
        | 14. 302 → /success      |                           |
        |<------------------------|                           |
```

### Decisões de design do OAuth

**State como JWT assinado** (não UUID em sessão):
- Funciona com múltiplas instâncias sem sessão compartilhada
- Payload: `{participant_id, company_id, nonce, iat, exp: now+10min}`
- Se o state expirar ou a assinatura for inválida, retorna 400

**Token refresh** — access token do Strava expira em 6 horas:
```python
def get_valid_token(participant_id):
    record = db.get(participant_id)
    if record.expires_at - time.time() < 300:  # 5 min de buffer
        new_tokens = strava.refresh(record.refresh_token)
        db.update(participant_id, new_tokens)
        return new_tokens.access_token
    return record.access_token
```

**Scope mínimo necessário:** `activity:read_all,read`
- `read` → dados básicos do atleta (para associar `athlete_id` ao participante)
- `activity:read_all` → lê atividades privadas também

---

## Fluxo de webhook (atividades em tempo real)

Em vez de polling, o Strava envia um POST quando o atleta cria uma nova atividade:

```
Strava → POST /webhook
         {
           "object_type": "activity",
           "aspect_type": "create",
           "object_id": 12345678,
           "owner_id": 987654,    ← strava athlete_id
           "event_time": 1716494400
         }

strava-integration:
  1. Recebe o evento
  2. Lookup: strava_athlete_id → participant_id (DynamoDB)
  3. GET /activities/{object_id} com token válido do participante
  4. Verifica elegibilidade (tipo + duração mínima)
  5. POST health-actions /register
```

**Validação do webhook (handshake inicial):**

O Strava faz um GET de verificação antes de ativar a subscription:
```
GET /webhook?hub.mode=subscribe&hub.challenge=XYZ&hub.verify_token=SEU_TOKEN
```
O endpoint precisa devolver:
```json
{ "hub.challenge": "XYZ" }
```

**Registro da subscription:**
```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=$STRAVA_CLIENT_ID \
  -d client_secret=$STRAVA_CLIENT_SECRET \
  -d callback_url=https://seu-servico.ngrok.io/webhook \
  -d verify_token=$STRAVA_VERIFY_TOKEN
```

---

## Elegibilidade de atividades

Para contar no Olimpipo, uma atividade Strava precisa atender:

| Critério         | Regra                                                              |
|------------------|--------------------------------------------------------------------|
| Duração mínima   | `elapsed_time >= 1200` segundos (20 minutos)                       |
| Tipo permitido   | `Run`, `Walk`, `Ride`, `Workout`, `WeightTraining`, `Swim`, `Yoga`, `Hike`, `Elliptical`, `StairStepper` |
| Uma por dia      | Apenas uma atividade elegível por participante por dia do calendário |

Esses critérios espelham o que o agente conversacional do WhatsApp já valida manualmente.

---

## Como rodar localmente

### Pré-requisitos

- Docker + Docker Compose
- `ngrok` com authtoken configurado (`ngrok config add-authtoken <token>`)
- Credenciais do app Strava: [strava.com/settings/api](https://www.strava.com/settings/api)

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/piposaude/olimpipo-strava.git
cd olimpipo-strava

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET e JWT_SECRET_KEY

# 3. Sobe toda a stack
docker compose up --build
```

Serviços disponíveis:

| Serviço | URL | Descrição |
|---|---|---|
| toro-mock | `http://localhost:3000` | UI do participante |
| strava-integration | `http://localhost:8000` | OAuth + webhook |
| health-actions-mock | `http://localhost:8001` | Mock da API Pipo |
| dynamodb-local | `localhost:8002` | Banco local |

### Testando o fluxo OAuth

Abra no browser (substitua os valores):
```
http://localhost:3000/?participant_id=joao&company_id=minha-empresa
```

Clique em "Conectar com Strava", autorize, e será redirecionado de volta com as atividades registradas.

### Testando o webhook (atividades em tempo real)

```bash
# Terminal 2 — expõe o serviço publicamente
ngrok http 8000

# Terminal 3 — registra a subscription no Strava (use a URL do ngrok)
./scripts/register_webhook.sh https://<ngrok-id>.ngrok.io

# Cria uma atividade de teste para disparar o evento
./scripts/create_test_activity.sh <participant_id>

# Acompanha os eventos chegando
docker logs -f olimpipo-strava-strava-integration-1
```

### Conferindo as atividades registradas

```bash
curl http://localhost:8001/v1/company/<company_id>/participants/activities
```

### Variáveis de ambiente

Veja `.env.example` para a lista completa. As obrigatórias:

| Variável | Descrição |
|---|---|
| `STRAVA_CLIENT_ID` | ID do app Strava |
| `STRAVA_CLIENT_SECRET` | Secret do app Strava |
| `STRAVA_VERIFY_TOKEN` | Token arbitrário para validação do webhook |
| `JWT_SECRET_KEY` | Chave para assinar o state JWT do OAuth |
| `HEALTH_ACTIONS_BASE_URL` | URL do health-actions (mock: `http://health-actions-mock:8001`) |
| `DYNAMODB_ENDPOINT_URL` | `http://dynamodb-local:8000` (dentro do Docker) |

---

## O que falta para produção

- Integrar a página "Conectar Strava" no Toro real (com autenticação do participante)
- Provisionar DynamoDB na AWS via Terraform
- Registrar webhook com URL fixa (não ngrok)
- Conectar no `health-actions` de produção (requer VPN + secrets AWS)
