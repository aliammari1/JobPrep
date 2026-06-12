# Deployment — the two-part split

JobPrep is **two deployable units** with very different runtime needs:

| Part | What it is | Runtime need | Target |
| --- | --- | --- | --- |
| **Web app** | Next.js 15 (SSR, API routes, React UI) | Stateless, request/response | **Cloudflare** (Pages/Workers via `@opennextjs/cloudflare`) |
| **Avatar agent** | Python LiveKit + Simli agent (`functions/`) | **Long-running** WebRTC session, persistent process | **A container host** + **LiveKit Cloud** for the realtime media plane |

> **Honest Cloudflare limit:** Workers run **JS/WASM on a request/response model**,
> not a long-lived Python process holding a WebRTC peer connection. The avatar
> agent therefore **cannot** run on Workers. Choosing the right primitive per
> workload — edge for the app, a container for the agent — is the whole point of
> this split.

---

## Part 1 — Web app on Cloudflare

The Next.js app deploys to Cloudflare via `@opennextjs/cloudflare`; PostgreSQL is
reached through **Hyperdrive** (pooled + cached) so the existing Prisma/Postgres
schema is preserved (D1/SQLite would be a large, risky port — see below).

Config: [`wrangler.jsonc`](../wrangler.jsonc) + [`open-next.config.ts`](../open-next.config.ts).
Deploy is **gated** behind `.github/workflows/deploy-cloudflare.yml` (runs only
when repo variable `ENABLE_CLOUDFLARE_DEPLOY=true` and the
`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets are set).

```bash
bun add -D @opennextjs/cloudflare
bunx @opennextjs/cloudflare build
bunx wrangler deploy
```

**Why Hyperdrive, not D1:** D1 is SQLite. JobPrep's schema is Postgres-specific
(enums, rich relations) and Better-Auth uses the Postgres adapter, so a SQLite
port is high-risk. Hyperdrive pools/caches connections to managed Postgres
(Neon/Supabase) and keeps the real schema. D1 is still fine for a greenfield demo.

Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) are set in
[`next.config.mjs`](../next.config.mjs) — no `vercel.json` is needed (removed).

---

## Part 2 — Python avatar agent on a container

The agent (`functions/LiveKit Avatar Agent/`) joins a LiveKit room, drives a Simli
avatar, and streams audio/video for the whole interview — a persistent process,
not a serverless function. Run it as a small always-on container alongside
**LiveKit Cloud** (or a self-hosted LiveKit SFU) for the actual media transport.

### Realtime infra — LiveKit Cloud (free to start)

LiveKit Cloud's **Build (free, no card)** tier includes **1,000 agent-session
minutes, 5,000 WebRTC minutes, and 50 GB transfer / month** — enough for demos
and light use; paid tiers start at $50/mo (Ship). Agent-session minutes are
~$0.01/min beyond the free allotment. Self-hosting the SFU removes per-minute
fees (you pay only for your VM). ([pricing](https://livekit.com/pricing),
[quotas](https://docs.livekit.io/deploy/admin/quotas-and-limits/))

The simplest agent host is **LiveKit Cloud's own agent runtime** — `lk agent
deploy` ships your existing Dockerfile to LiveKit's network with autoscaling,
secrets, and log forwarding, so the agent sits next to the media plane.
([agents deploy docs](https://docs.livekit.io/deploy/agents/))

### Container-host options (researched, 2026-current)

| Host | Free tier (2026) | Fit for a persistent agent | Verdict |
| --- | --- | --- | --- |
| **LiveKit Cloud agents** | within the LiveKit free allotment | First-class — co-located with media, `lk agent deploy` | **Recommended default** ([docs](https://docs.livekit.io/deploy/agents/)) |
| **Railway** | usage-based trial credit; ready **LiveKit template** | Good — but Railway is **TCP-only (no UDP)**, so run LiveKit in TCP mode | **Recommended cheap self-host** ([template](https://railway.com/deploy/livekit)) |
| **Render** | free web services exist but **spin down on idle** (~1 min cold start) | Poor on free; a **paid Background Worker** is the real path | Use paid worker if you want Render ([free-tier notes](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026)) |
| **Fly.io** | **free tier ended in 2026** — trial only (2 VM-hrs / 7 days), then pay-as-you-go | Technically capable (`fly.toml` example exists) but no longer free | Cheap, not free ([free-tier status](https://www.saaspricepulse.com/tools/flyio), [Fly LiveKit example](https://github.com/bekriebel/livekit-flydotio)) |
| **Koyeb** | free Starter tier **closed to new users** after the Mistral acquisition | N/A for new accounts | Skip for now ([free Docker hosts 2026](https://snapdeploy.dev/blog/free-docker-hosting-2026-platforms-compared)) |

LiveKit publishes provider templates (Dockerfiles + `fly.toml` / `render.yaml` /
ECS / Kubernetes) in [`livekit-examples/agent-deployment`](https://github.com/livekit-examples/agent-deployment)
(archived Apr 2026 — see the [current agents docs](https://docs.livekit.io/deploy/agents/)).

### Concrete deploy path (recommended)

```bash
# 1. Realtime plane: create a LiveKit Cloud project (free Build tier),
#    grab LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET.

# 2. Run/deploy the agent container:
cd "functions/LiveKit Avatar Agent"
uv sync --dev
uv run pytest -q                     # verify before shipping

# Option A — LiveKit Cloud agent runtime (simplest, co-located):
lk agent create                      # one-time, uses the local Dockerfile
lk agent deploy                      # ships to LiveKit's network

# Option B — Railway (cheap self-host; TCP-only):
#   use the Railway LiveKit template, then deploy this folder as a service
#   with LIVEKIT_* and SIMLI_* env vars set.
```

Set `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, and the `SIMLI_*`
keys as the host's secrets.

---

## Environment

Copy `.env.example` to `.env`. `next build` succeeds with placeholder values when
`SKIP_ENV_VALIDATION=1` (used by CI). Real features (DB, Stripe, LiveKit, AI
providers) require their respective keys.

## Database

```bash
bun run prisma:generate     # generate the client (runs on postinstall)
bun run prisma:migrate      # apply migrations (dev)
bun run prisma:seed         # seed demo data
```
