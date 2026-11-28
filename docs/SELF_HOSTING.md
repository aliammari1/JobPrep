# Self-hosting JobPrep

Run the whole app on your own machine or server with Docker. Personal, educational and research use is covered by the [license](../LICENSE.md); commercial hosting needs a separate license.

## 1. Configure

```bash
git clone https://github.com/aliammari1/JobPrep.git
cd JobPrep
cp .env.example .env
```

Set at least:

| Variable | Value |
| --- | --- |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Your public URL, e.g. `https://prep.example.com` (required in production) |
| `NEXT_PUBLIC_APP_URL` | Same public URL |

`DATABASE_URL` is overridden for you by Compose to point at the bundled PostgreSQL.

## 2. Pick an AI provider (optional)

The app runs without one, but AI features need one. See [AI and privacy](AI_AND_PRIVACY.md) for what each option sends where. To keep everything on your machine, use [Ollama](AI_AND_PRIVACY.md#fully-local-with-ollama).

## 3. Start

```bash
docker compose --profile app up -d --build
```

This builds the image, starts PostgreSQL 16, applies migrations, and serves the app on port 3000. Check `docker compose logs -f app` and `http://localhost:3000/api/health`.

## Operate

| Task | Command |
| --- | --- |
| Update | `git pull && docker compose --profile app up -d --build` |
| Stop (keep data) | `docker compose --profile app stop` |
| Back up the database | `docker compose exec db pg_dump -U jobprep jobprep > backup.sql` |
| Restore | `docker compose exec -T db psql -U jobprep jobprep < backup.sql` |

## Before exposing it to the internet

- Put it behind HTTPS (a reverse proxy such as Caddy or nginx). Set `BETTER_AUTH_URL` to the `https://` URL.
- Change the default PostgreSQL password in `docker-compose.yml` and do not publish port 5432.
- Configure email credentials, otherwise verification links only print to the server log.
- Review [SECURITY.md](../SECURITY.md) and keep the image updated.

For Cloudflare Workers deployment see [DEPLOYMENT.md](DEPLOYMENT.md).
