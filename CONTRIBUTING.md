# Contributing to JobPrep

Thanks for your interest in improving JobPrep! This guide reflects the project's
**actual** toolchain — **Bun + Biome + Vitest + Prisma** for the Next.js app, a
**uv + ruff + pytest** Python LiveKit avatar agent in `functions/`, and a
**Manifest V3 Chrome extension** in `chrome-extension/`.

> JobPrep is **source-available** (SPDX `LicenseRef-Source-Available-1.0`), not
> OSI open source. Contributions are welcome for personal/educational/research
> use; commercial use requires a separate license. By contributing you agree
> your contribution is licensed under the project [LICENSE](LICENSE.md).

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to contribute](#ways-to-contribute)
- [Repository layout](#repository-layout)
- [Getting started (web app)](#getting-started-web-app)
- [Python avatar agent](#python-avatar-agent)
- [Chrome extension](#chrome-extension)
- [Quality gates (run before you push)](#quality-gates-run-before-you-push)
- [Commit & PR conventions](#commit--pr-conventions)
- [Coding standards](#coding-standards)

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). Report
unacceptable behavior to **ammari.ali.0001@gmail.com**.

## Ways to contribute

- **Bugs / features**: open an issue first using the templates in
  `.github/ISSUE_TEMPLATE`. Look for `good first issue` and `help wanted`.
- **Code**: follow the workflow below. All PRs run CI (Biome, typecheck, Vitest,
  CodeQL, gitleaks, Trivy, the Python `ruff`/`pytest` job, and a semantic-PR
  title check).
- **Docs**: the Mintlify docs live in `docs-mintlify/`; deep dives in `docs/`.

## Repository layout

```
src/                         # Next.js 15 app (App Router, API routes, components)
prisma/                      # Prisma schema + seed
chrome-extension/            # Manifest V3 LinkedIn → CV importer
functions/LiveKit Avatar Agent/  # Python LiveKit + Simli avatar agent (uv)
docs/  docs-mintlify/        # Engineering docs / Mintlify site
tests/                       # Vitest unit + API tests; Playwright e2e
```

## Getting started (web app)

### Prerequisites

- **[Bun](https://bun.sh) 1.x** (package manager + runtime — this repo is Bun, not npm/pnpm)
- **PostgreSQL 14+**
- **Git**

### Setup

```bash
# Fork, then clone your fork
git clone https://github.com/YOUR_USERNAME/JobPrep.git
cd JobPrep
git remote add upstream https://github.com/aliammari1/JobPrep.git

# Install (runs `prisma generate` via postinstall)
bun install

# Environment
cp .env.example .env          # fill in keys; SKIP_ENV_VALIDATION=1 builds with placeholders

# Database
bun run prisma:migrate        # apply dev migrations
bun run prisma:seed           # optional demo data

# Dev server
bun run dev                   # http://localhost:3000
```

## Python avatar agent

The LiveKit/Simli avatar agent is a separate, long-running workload (it does
**not** run on Cloudflare Workers — see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)).
It uses **[uv](https://docs.astral.sh/uv/)**:

```bash
cd "functions/LiveKit Avatar Agent"
uv sync --dev
uv run ruff check . && uv run ruff format --check .
uv run pytest -q
```

## Chrome extension

The extension in `chrome-extension/` is **Manifest V3**, no build step.

1. Open `chrome://extensions/`, enable **Developer mode**.
2. **Load unpacked** → select the `chrome-extension/` folder.
3. After edits, click the reload icon on the extension card.

On a version tag (`v*`), CI zips the extension and attaches it to the GitHub
release (`.github/workflows/release.yml`). See
[`docs/CHROME_WEB_STORE.md`](docs/CHROME_WEB_STORE.md) for the publishing steps.

## Quality gates (run before you push)

These mirror CI exactly — green locally means green in CI.

```bash
bun run lint:ci      # Biome check (lint + format), blocking
bun run typecheck    # tsc --noEmit
bun run test         # Vitest unit + API tests
bun run test:coverage # with V8 coverage (uploaded to Codecov in CI)
bun run test:e2e     # Playwright (needs the app running / a built app)
bun run build        # next build (set SKIP_ENV_VALIDATION=1 without real keys)
```

For the Python agent: `uv run ruff check . && uv run pytest -q`.

## Commit & PR conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) — enforced
on PR titles by `semantic-pr.yml` and consumed by **release-please** to generate
the changelog and version bumps.

```
<type>(<scope>): <subject>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.
**Scopes** (examples): `ai`, `interviews`, `cv`, `challenges`, `auth`, `db`,
`agent` (Python), `extension` (Chrome), `ui`.

```bash
feat(ai): add provider picker to the AI Coach
fix(cv): correct DOCX export spacing
chore(agent): bump livekit-api
```

### Pull request process

1. Branch from an up-to-date `main` (`feature/…`, `fix/…`, `docs/…`).
2. Keep the change focused; add/adjust tests.
3. Run the [quality gates](#quality-gates-run-before-you-push).
4. Open a PR with a Conventional-Commit title; fill in the PR template.
5. CI must pass and at least one maintainer must approve.

## Coding standards

### TypeScript / React

- **Biome** is the single source of truth for lint **and** format — there is no
  ESLint/Prettier. Run `bun run format` to auto-fix; `bun run lint:ci` to verify.
- TypeScript for all new code; functional React components with hooks.
- Prefer `const`; meaningful names; small focused functions; JSDoc on public APIs.

### API routes & OpenAPI

- Document new routes with a `@swagger` JSDoc block above the handler —
  `next-swagger-doc` picks it up; regenerate with `bun run openapi:generate`.
  The interactive reference is served at `/api-docs`.

### AI providers

- The AI Coach is **provider-agnostic**. Add a provider in
  `src/lib/ai/providers.ts` (a ~3-line change) — don't hard-wire a vendor into
  feature code. Validate with `ollama:llama3.2` for the local/offline path.

### Python agent

- `ruff` for lint + format (`target-version = py39`), `pytest` for tests. Keep
  changes typed and covered.

---

Thank you for contributing to JobPrep! 🚀
