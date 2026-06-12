# Deployment

## Overview

| Workload | Target | Why |
| --- | --- | --- |
| Next.js app | **Cloudflare Workers/Pages** via `@opennextjs/cloudflare` | Edge-native, free tier |
| PostgreSQL | **Cloudflare Hyperdrive** -> managed Postgres (Neon/Supabase) | Keeps the Prisma/Postgres schema; pooled + cached |
| Python LiveKit avatar agent | **Small container/VM** (NOT Cloudflare Workers) | Long-running WebRTC session; Workers can't run it |

> **Honest limitation:** Cloudflare Workers run JS/WASM, not long-running Python
> with WebRTC. The avatar agent therefore stays on a container; only the Next.js
> app is deployed to Cloudflare.

## Why Hyperdrive (not D1)

D1 is SQLite. JobPrep's Prisma schema is Postgres-specific (enums, rich
relations) and Better-Auth's Prisma adapter is configured for `postgresql`.
Porting to D1/SQLite would be a large, risky migration. **Hyperdrive** pools and
caches connections to an existing managed Postgres, preserving the real schema
with minimal change. (D1 remains viable for a greenfield demo.)

## Cloudflare deploy (gated)

Config lives in `wrangler.jsonc` + `open-next.config.ts`. Deployment is **gated**
behind a manual workflow (`.github/workflows/deploy-cloudflare.yml`) that only
runs when:

- the repository variable `ENABLE_CLOUDFLARE_DEPLOY` is `true`, and
- secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set.

Manual local deploy:

```bash
bun add -D @opennextjs/cloudflare
bunx @opennextjs/cloudflare build
bunx wrangler deploy
```

## Environment

Copy `.env.example` to `.env` and fill in required values. `next build` succeeds
with placeholder values when `SKIP_ENV_VALIDATION=1` is set (used by CI). Real
features (DB, Stripe, LiveKit, AI providers) require their respective keys.

## Database

```bash
bun run prisma:generate     # generate the client (runs on postinstall)
bun run prisma:migrate      # apply migrations (dev)
bun run prisma:seed         # seed demo data
```

## Python avatar agent

```bash
cd "functions/LiveKit Avatar Agent"
uv sync --dev
uv run pytest -q
# Run/host on a container with LIVEKIT_* and SIMLI_* env set.
```
