# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Hackathon-stage Strava → Olimpipo integration that replaces the manual WhatsApp + LLM screenshot-validation check-in flow with direct OAuth/webhook ingestion. `apps/strava-integration` is the only real service; `apps/health-actions-mock` and `apps/toro-mock` exist solely so the full flow can run locally without touching Pipo production infrastructure (Clojure `health-actions`, Keycloak/Firebase auth, real DynamoDB).

`README.md` contains the OAuth and webhook sequence diagrams, eligibility criteria, and the production-readiness gap list — read it before changing either flow.

## Tech stack note

Production `health-actions` and Toro are Clojure; this repo is Python/FastAPI. The boundary with `health-actions` is HTTP, so the language switch is intentional and doesn't apply outside this repo — don't carry Clojure patterns from other Pipo repos in.

## Running it

```bash
cp .env.example .env        # fill STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, JWT_SECRET_KEY
docker compose up --build
```

| Port | Service               | Notes                                                  |
| ---- | --------------------- | ------------------------------------------------------ |
| 3000 | `toro-mock`           | participant UI                                          |
| 8000 | `strava-integration`  | `/strava/connect`, `/strava/callback`, `/webhook`       |
| 8001 | `health-actions-mock` | in-memory Pipo API mock                                 |
| 8002 | `dynamodb-local`      | host port — container internally listens on 8000        |

`strava-integration` and `toro-mock` mount `src/` as a volume so `uvicorn --reload` picks up edits live. `health-actions-mock` does not mount — `docker compose up --build health-actions-mock` to pick up changes there.

End-to-end OAuth test: open `http://localhost:3000/?participant_id=<id>&company_id=<id>`, click "Conectar com Strava". Webhook smoke test needs ngrok — `scripts/register_webhook.sh <ngrok-url>` then `scripts/create_test_activity.sh <participant_id>`. Inspect what landed in the mock with `curl http://localhost:8001/v1/company/<company_id>/participants/activities`.

## Tests

No test suite is checked in yet. When you add tests for `apps/strava-integration`, layer them according to the hexagonal split below — core / logic functions should test pure, without mocking `boto3` or `httpx`.

## Backend architecture — hexagonal, non-negotiable

`apps/strava-integration/src/` is split so the **handler** orchestrates, the **core / logic repository** owns data work, and **adapters** do I/O. The `tech-lead` agent enforces this in every backend task design; new code must respect the split.

| Layer    | Responsibility                                          | Files today                                                                                              |
| -------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Handler  | FastAPI endpoint orchestration — input → core → adapter | `main.py`, `webhook/handler.py`                                                                          |
| Core     | Pure data treatment, decisions, filtering, validation   | `activities/eligibility.py` and anything else that performs no I/O                                       |
| Adapter  | HTTP, DynamoDB, JWT, side effects                       | `auth/strava_oauth.py`, `auth/token_store.py`, `activities/fetcher.py`, `activities/registrar.py`        |

Hard rules:

- Handlers contain no business logic — no `if`/filter/map over domain data. They wire inputs through pure functions and adapters and return a response.
- Adapters contain no business logic — no eligibility checks, no derivations. They make the call and return the result.
- Logic lives only in core. Pure functions, no `httpx`/`boto3`/`jwt` imports, testable without mocks.

If you find logic inside `main.py`, `webhook/handler.py`, `fetcher.py`, `registrar.py`, or `strava_oauth.py`, extract it to a core module before adding more behavior.

## Things that bit us already

- **`boto3` returns numbers as `Decimal`.** Cast `expires_at` to `int` before comparing to `time.time()` in `auth/token_store.py` / `get_valid_token` — see commit `ab0fcda`.
- **OAuth state is a signed JWT, not a session key.** 10-min TTL, payload `{participant_id, company_id, nonce, iat, exp}`. Multi-instance deploy is the reason — don't switch to a UUID-in-session scheme.
- **Strava access tokens live 6 hours.** `get_valid_token` refreshes when expiry is within 5 minutes; preserve that buffer when touching the token flow.
- **Webhook handshake is GET, ingestion is POST.** The same `/webhook` path serves both — Strava verifies the subscription with a GET (`hub.challenge` echo) before ever sending events.

## Eligibility config

Defined in `apps/strava-integration/src/config.py` — `MIN_ACTIVITY_DURATION_SECONDS` (env-overridable) and `ELIGIBLE_ACTIVITY_TYPES`. Plus a "one per participant per calendar day" rule applied in core. These mirror the manual WhatsApp validation; don't change them without an explicit product decision.

## Language conventions

- Conversation with the user: Portuguese.
- **Code, file names, commit messages, branch names, PR titles/bodies, issue titles/bodies, labels, specs, plans: English.** Enforced by both agents.

## Agents and `.claude/`

- `.claude/agents/tech-lead.md` — planning, issue authoring, architecture discussion. Writes specs in `.claude/specs/` and plans in `.claude/plans/`. Does not commit code. Encodes the hexagonal rule above.
- `.claude/agents/dev.md` — executes plans, opens PRs.
- `.claude/rules/nextjs-app.md` — Next.js layering rules from a sibling Pipo project; **not applicable to this Python repo**, kept as reference material.
- `.claude/design/` — design handoff bundle (HTML/CSS prototype in `design/project/Olimpipo.html`). Treat as design source for a future UI iteration, not as code to import.

Both agents stop and ask for configuration if these keys are missing — fill them in before the first planning or implementation session:

| Key                    | Used by                | Purpose                              |
| ---------------------- | ---------------------- | ------------------------------------ |
| `PROJECT_REPO`         | tech-lead, dev         | GitHub `owner/repo`                  |
| `PROJECT_BOARD_OWNER`  | tech-lead              | GitHub Projects board owner          |
| `PROJECT_BOARD_NUMBER` | tech-lead              | GitHub Projects board number         |
| `TASK_PREFIX`          | tech-lead, dev         | Issue ID prefix (e.g. `olimpipo-042`) |
| `WORKTREE_DIR`         | dev                    | Where worktrees live                 |
| `INSTALL_CMD`          | dev                    | Dependency install command           |

## Backlog

Tasks planned by `tech-lead` and waiting for `dev` to execute. Each entry points at the spec and plan in `.claude/specs/` and `.claude/plans/`.

| Task ID            | Area | Status | Title                                                  | Spec                                                                       | Plan                                                                       |
| ------------------ | ---- | ------ | ------------------------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `pipo-cuida-001`   | web  | Ready  | Bootstrap the pipo-cuida web app with the home screen | [design](.claude/specs/pipo-cuida-001-home-bootstrap-design.md)            | [plan](.claude/plans/pipo-cuida-001-home-bootstrap-plan.md)                |
| `pipo-cuida-002`   | web  | Ready  | Build the Olimpipo editions list page                  | [design](.claude/specs/pipo-cuida-002-olimpipo-editions-design.md)         | [plan](.claude/plans/pipo-cuida-002-olimpipo-editions-plan.md)             |
