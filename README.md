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
│   │   ├── src/
│   │   │   ├── main.py
│   │   │   ├── auth/
│   │   │   │   ├── strava_oauth.py    # Fluxo OAuth 2.0
│   │   │   │   └── token_store.py     # Persistência de tokens no DynamoDB
│   │   │   ├── activities/
│   │   │   │   ├── fetcher.py         # Pull de atividades via API Strava
│   │   │   │   └── eligibility.py     # Filtra atividades elegíveis (tipo + duração)
│   │   │   └── webhook/
│   │   │       └── handler.py         # Recebe push events do Strava
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── health-actions-mock/     # Mock da API interna Pipo (health-actions service)
│       ├── src/
│       │   └── main.py          # FastAPI simulando os endpoints reais
│       └── Dockerfile
├── infra/
│   └── local-dynamodb/          # DynamoDB local via Docker
├── docker-compose.yml           # Orquestra tudo localmente
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml
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
- Conta de desenvolvedor no Strava: [strava.com/settings/api](https://www.strava.com/settings/api)
- `ngrok` (para expor o webhook durante desenvolvimento)

### Setup

```bash
# 1. Clone e configure variáveis
cp .env.example .env
# Edite .env com suas credenciais Strava

# 2. Sobe a stack
docker compose up

# 3. Em outro terminal, exponha o webhook
ngrok http 8000

# 4. Registre o webhook no Strava (use a URL do ngrok)
./scripts/register_webhook.sh https://<ngrok-id>.ngrok.io/webhook
```

### Variáveis de ambiente

Veja `.env.example` para a lista completa. As obrigatórias:

| Variável                   | Descrição                                          |
|----------------------------|----------------------------------------------------|
| `STRAVA_CLIENT_ID`         | ID do app Strava                                   |
| `STRAVA_CLIENT_SECRET`     | Secret do app Strava                               |
| `STRAVA_VERIFY_TOKEN`      | Token arbitrário para validação do webhook         |
| `JWT_SECRET_KEY`           | Chave para assinar o state JWT                     |
| `HEALTH_ACTIONS_BASE_URL`  | URL do health-actions (mock local ou real)         |
| `DYNAMODB_ENDPOINT_URL`    | `http://localhost:8001` para DynamoDB local        |

---

## Próximos passos

- [ ] Implementar `GET /strava/connect` e `GET /strava/callback`
- [ ] Persistência de tokens no DynamoDB local
- [ ] Endpoint de webhook com handshake de validação
- [ ] Lógica de elegibilidade de atividades
- [ ] Mock do `health-actions` com os endpoints reais
- [ ] `docker-compose.yml` funcional
- [ ] Conectar no `health-actions` de produção (requer VPN + secrets reais)
