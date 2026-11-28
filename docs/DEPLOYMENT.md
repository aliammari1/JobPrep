# Deployment

## Web app on Cloudflare

The Next.js app deploys to Cloudflare via `@opennextjs/cloudflare`; PostgreSQL is
reached through **Hyperdrive** for pooling so the existing Prisma/Postgres
schema is preserved (D1/SQLite would be a large, risky port — see below).

Config: [`wrangler.jsonc`](../wrangler.jsonc) + [`open-next.config.ts`](../open-next.config.ts).
Deploy is **gated** behind `.github/workflows/deploy-cloudflare.yml` (runs only
when repo variable `ENABLE_CLOUDFLARE_DEPLOY=true` and the
`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets are set).

```bash
bun install --frozen-lockfile
bun run cf:build
bun run cf:deploy -- --keep-vars
```

**Why Hyperdrive, not D1:** D1 is SQLite. JobPrep's schema is Postgres-specific
(enums, rich relations) and Better-Auth uses the Postgres adapter, so a SQLite
port is high-risk. Hyperdrive pools connections to managed Postgres
(Neon/Supabase) and keeps the real schema. D1 is still fine for a greenfield demo.

Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) are set in
[`next.config.mjs`](../next.config.mjs) — no `vercel.json` is needed (removed).

---

## Interview integrations

Set `NEXT_PUBLIC_LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`
to enable LiveKit rooms. You can also set `LIVEKIT_URL` for server-side
requests. Keep the LiveKit API credentials on the server.

Mock interviews can use HeyGen when `HEYGEN_API_KEY` is configured. The
text-based mock interview uses the configured AI model provider.

## Private recording storage

The Worker uses the `RECORDINGS_BUCKET` binding in
[`wrangler.jsonc`](../wrangler.jsonc). Create the bucket in the deployment
account with `bunx wrangler r2 bucket create jobprep-recordings` and leave public
access disabled. For automated deploys, set the production environment's
`NEXT_PUBLIC_APP_URL` and, if using LiveKit rooms, `NEXT_PUBLIC_LIVEKIT_URL` as
GitHub variables. Set the live Better Auth server secret and URL in Cloudflare. New browser uploads accept WebM and MP4 up to 90 MiB per
recording to stay below the Workers Free request limit. Longer recordings can
be downloaded locally from the interview room. A successful upload attaches
the R2 object to the interview in PostgreSQL. The playback route authorizes
participants and serves byte ranges for seeking. A cron in
[`cloudflare-worker.mjs`](../cloudflare-worker.mjs) purges detached objects and
abandoned uploads, retrying failed deletions.

For a local R2 bucket, start development with `CLOUDFLARE_DEV=1 bun run dev`.
For a deployed instance, configure PostgreSQL through Hyperdrive and disable
query caching on that binding. Authorization and recording attachment lookups
need current PostgreSQL rows.

### Cut over an existing Appwrite installation

Apply the additive PostgreSQL migration with `bunx prisma migrate deploy` on
the direct PostgreSQL connection. Keep the previous deployment and Appwrite
project intact until the transfer is complete. Pause changes to legacy video
recordings and tables while you run the transfer. Use a PostgreSQL backup
taken immediately before the transfer for rollback.

Run `bun run migrate:appwrite` locally with these temporary credentials in the
process environment:

- `DATABASE_URL` for the existing JobPrep PostgreSQL database.
- `APPWRITE_ENDPOINT` (the API base URL ending in `/v1`),
  `APPWRITE_PROJECT_ID`, and a read-only `APPWRITE_API_KEY` with access to the
  project's tables, rows, buckets, and files.
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` for a
  bucket-scoped R2 token with read/write access. Set `R2_RECORDINGS_BUCKET` if
  you changed the bucket name in Wrangler.

The transfer imports interview recordings through the original file downloads,
compares the copied bytes, and updates the existing interview references. It
archives historical Appwrite tables, rows, and unattached files in the same
private R2 bucket under `legacy/appwrite/`. The old tables had no application
readers. Their IDs and contents are retained in the archive rather than mapped
to current Better Auth or interview records. Keep migration credentials out of
the Worker. Run the transfer again after correcting any failure. Source objects
remain in Appwrite throughout the transfer. Original interview URL mappings
are also retained under `legacy/appwrite/<project>/recording-references/`.
Keep writes paused until the new release is ready to receive traffic. The older
release cannot play recordings created by the new Worker.

After the transfer finishes, deploy the Worker and retire Appwrite separately.
The Worker, R2, and Hyperdrive can use Cloudflare's free allowances, subject to
the account's limits. PostgreSQL remains an external database behind Hyperdrive.
Cloudflare may require R2 activation and billing setup even for usage within
the free allowance.

## Environment

Copy `.env.example` to `.env`. `next build` succeeds with placeholder values when
CI supplies schema-valid placeholder values. Real features (DB, Stripe, LiveKit, AI
providers) require their respective keys.

### Code execution and analytics

- Set the server-side `DAYTONA_API_KEY` to run coding challenges with Daytona. Set `DAYTONA_SNAPSHOT` to a snapshot with Node.js 22.18+, Python 3, Go, GCC, and a JDK if the default snapshot lacks those runtimes. Each submission runs in a private, short-lived sandbox with outbound networking blocked. If Daytona is unconfigured, the route uses configured Judge0 or Piston.
- Set `NEXT_PUBLIC_POSTHOG_KEY` and, if needed, `NEXT_PUBLIC_POSTHOG_HOST` when building the app to enable anonymous pageviews. The Cloudflare deploy workflow reads them from GitHub Actions variables. The integration omits query strings and saved-interview IDs and disables session recording.

## Local development (Docker)

Postgres runs in Docker; everything else is SaaS/BYOK via `.env`:

```bash
cp .env.example .env   # once; .env is gitignored (a dev-ready one may exist)
bun run db:up          # start local Postgres (jobprep/jobprep @ 127.0.0.1:5432)
bunx prisma migrate deploy  # apply migrations (first run)
bun run dev            # start the app (http://localhost:3000)
bun run db:down        # stop Postgres (data persists in the pgdata volume)
```

`.env` matches this setup: `DATABASE_URL` / `POSTGRES_PRISMA_URL` point at the
composed DB. Only `DATABASE_URL` + `BETTER_AUTH_SECRET` are required to boot;
AI/Stripe/LiveKit keys are optional until you use those features.

## Database

```bash
bun run prisma:generate     # generate the client (runs on postinstall)
bun run prisma:migrate      # apply migrations (dev)
bun run prisma:seed         # seed demo data
```

Prisma 7: connection URLs live in `prisma.config.ts` (`DATABASE_URL`,
direct connection for migrations). The runtime (`src/lib/prisma.ts`) prefers
`POSTGRES_PRISMA_URL` (pooled) with `DATABASE_URL` as fallback. For
production, provision Hyperdrive for the direct PostgreSQL origin with
`bunx wrangler hyperdrive create jobprep-db --connection-string="$DATABASE_URL" --caching-disabled`.
Then uncomment the `HYPERDRIVE` binding in Wrangler and insert its
configuration ID. The Worker gets the pooled connection from the binding.
`prisma generate` and migrations use the direct `DATABASE_URL`.
