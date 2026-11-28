# Contributing to JobPrep

Start with [a small contribution](#ways-to-contribute) or [run the web app locally](#getting-started-web-app).

> JobPrep is **source-available** (SPDX `LicenseRef-Source-Available-1.0`), not
> OSI open source. Contributions are welcome for personal/educational/research
> use; commercial use requires a separate license. By contributing you agree
> your contribution is licensed under the project [LICENSE](LICENSE.md).

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to contribute](#ways-to-contribute)
- [Repository layout](#repository-layout)
- [Getting started (web app)](#getting-started-web-app)
- [Chrome extension](#chrome-extension)
- [Checks to run before opening a PR](#checks-to-run-before-opening-a-pr)
- [Commit & PR conventions](#commit--pr-conventions)
- [Coding standards](#coding-standards)
- [Using AI tools](#using-ai-tools)
- [Review and what to expect](#review-and-what-to-expect)
- [Security and licensing](#security-and-licensing)

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). Report
unacceptable behavior to **contact@aliammari.dev**.

## Ways to contribute

Look for [good first issues](https://github.com/aliammari1/JobPrep/labels/good%20first%20issue)
or [help wanted issues](https://github.com/aliammari1/JobPrep/labels/help%20wanted).
If those lists are empty, pick a small change you can verify locally.

| First contribution | Where to start |
| --- | --- |
| Improve a setup step or product guide | [Engineering docs](docs/) or [Mintlify guides](docs-mintlify/) |
| Reproduce a keyboard or mobile navigation issue | [Navigation tests](tests/e2e/) |
| Document an API endpoint or correct a response example | [API routes](src/app/api/) and [OpenAPI generator](scripts/generate-openapi.ts) |
| Improve the extension's import instructions or an error message | [Chrome extension](chrome-extension/) |

Small fixes and docs improvements can go straight to a PR. If an issue already
exists, comment on it before starting so others can see that someone is working
on it. For larger changes, [open an issue](https://github.com/aliammari1/JobPrep/issues/new/choose)
to discuss scope first. If you're unsure where to start, ask in
[GitHub Discussions](https://github.com/aliammari1/JobPrep/discussions).

You can edit docs on GitHub without running the app. For Vitest, configure
`.env` and install dependencies as shown below. The unit suite runs without a
PostgreSQL server or provider credentials.

## Repository layout

```
src/app/                        # Next.js pages and API routes
src/components/                 # Shared and feature-specific components
src/lib/                        # Database, auth, AI, and other shared logic
prisma/                         # Database schema, migrations, and seed
tests/                          # Vitest and Playwright tests
chrome-extension/               # Manifest V3 LinkedIn-to-CV importer
docs/                           # Engineering guides and decisions
docs-mintlify/                   # Public product guides and API reference
```

## Getting started (web app)

### Prerequisites

- [Bun](https://bun.sh), using the version in `package.json` (1.4.3 in CI).
- [Node.js](https://nodejs.org/) 22.12+ in the 22.x LTS line, or 24.x, for Prisma and the typecheck command.
- Git and `openssl` to clone the repo and generate a local auth secret.
- Docker with Compose or an existing PostgreSQL instance. Compose runs PostgreSQL 16, matching CI.

### Setup

Fork [JobPrep](https://github.com/aliammari1/JobPrep/fork) if you plan to submit a PR.
For local exploration, you can clone the main repository directly.

```bash
git clone https://github.com/YOUR_USERNAME/JobPrep.git
cd JobPrep
test -f .env || cp .env.example .env
openssl rand -base64 32
```

Paste the generated value into `BETTER_AUTH_SECRET` in `.env`. The example
`DATABASE_URL` matches the Compose database. With your own PostgreSQL instance,
set `DATABASE_URL` to a database you can use for development and skip the Compose
command below. Configure `.env` before installing because the install runs Prisma
generation, which loads `DATABASE_URL`.

```bash
bun install --frozen-lockfile
docker compose up -d --wait db
bunx prisma migrate deploy
bun run dev
```

Open [localhost:3000](http://localhost:3000) or the URL printed by Next.js. To
try signed-in features, open `/sign-up` and use the verification link printed
in the dev server terminal when email credentials are unset. AI, LiveKit,
Stripe, and other integrations only need credentials when you're working on
the corresponding feature.

### Common setup problems

- **Prisma reports a missing `DATABASE_URL`.** Check that `.env` exists in the
  repository root and contains a URL before retrying the install.
- **PostgreSQL fails to start or Prisma can't connect.** Run `bun run db:logs`
  and check whether another service is using port `5432`. If you already have
  PostgreSQL running, you can point `.env` at a local development database there.
- **The server chose another port.** Use the URL printed in the terminal. If
  a feature builds links from `NEXT_PUBLIC_APP_URL`, update it to that URL.

Use `bun run db:down` to stop the Compose database and keep its data. To create
a migration after editing `prisma/schema.prisma`, use `bun run prisma:migrate`
against your development database.

## Chrome extension

The extension in `chrome-extension/` is **Manifest V3**, no build step.

1. Open `chrome://extensions/`, enable **Developer mode**.
2. **Load unpacked** → select the `chrome-extension/` folder.
3. After edits, click the reload icon on the extension card.

On a version tag (`v*`), CI zips the extension and attaches it to the GitHub
release (`.github/workflows/release.yml`). See
[`docs/CHROME_WEB_STORE.md`](docs/CHROME_WEB_STORE.md) for the publishing steps.

## Checks to run before opening a PR

Run the checks that cover your change. For web app code, start with these checks.

```bash
bun run check   # lint:ci + typecheck + test in one go
```

For a browser check against `bun run dev`, leave the server running and use a
second terminal. Set the base URL to the actual port if it differs from `3000`.

```bash
bunx playwright install chromium
PLAYWRIGHT_NO_SERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run test:e2e
```

Use `bun run build` for a production build check and `bun run test:coverage`
for a coverage report. See the [CI workflow](.github/workflows/ci.yml) for the
checks GitHub runs, including the Cloudflare Worker preview.

## Commit & PR conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) — enforced
on PR titles by `semantic-pr.yml` and consumed by **release-please** to generate
the changelog and version bumps.

```
<type>(<scope>): <subject>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.
**Scopes** (examples): `ai`, `interviews`, `cv`, `challenges`, `auth`, `db`,
`extension` (Chrome), `ui`.

```bash
feat(ai): add provider picker to the AI Coach
fix(cv): correct DOCX export spacing
chore(extension): update the manifest
```

### Pull request process

1. Branch from an up-to-date `main` (`feature/…`, `fix/…`, `docs/…`).
2. Keep the change focused: one concern per PR. Add or update tests for behavior changes.
3. Run the relevant [checks](#checks-to-run-before-opening-a-pr).
4. Open a PR with a Conventional Commit title and fill in the template, including what you verified. Link the issue with `Closes #123`.
5. Open a draft PR if you want early feedback. Mark it ready when CI is green.
6. CI must pass and a maintainer must approve. Address review comments with new commits; we squash on merge.

Do not edit generated files by hand (`openapi.json` is generated, `bun.lock` changes only through `bun install`). Never commit secrets, `.env` files, keystores, or personal data.

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

- Use the shared [AI generation functions](src/lib/ai/generate.ts) in feature
  code. Start with [`providers.ts`](src/lib/ai/providers.ts) for changes to
  provider configuration.

### Tests

- Put unit tests in `tests/lib/` and browser tests in `tests/e2e/`. Fix a bug by first adding a test that fails without the fix.
- Unit tests must not need a database, network, or provider keys. Mock the boundary instead.
- UI changes should keep keyboard use, focus order, and the accessibility checks in `tests/e2e/a11y.spec.ts` passing.

## Using AI tools

AI assistants are fine to use. You are still the author, so you are responsible for the result.

- Read and understand every line before you submit it, and run the checks yourself.
- Do not submit unreviewed bulk output, invented APIs, or drive-by refactors.
- Say in the PR description if a tool wrote a substantial part of it.
- Agents should follow [AGENTS.md](AGENTS.md).

## Review and what to expect

- A maintainer aims to give a first response within about a week. Ping the PR after that, politely.
- Reviews focus on correctness, scope, tests, security, and accessibility. Style is handled by Biome.
- We may close PRs that are out of scope, inactive for 30 days after feedback, or not discussed first for large changes. This is not a judgment of you.
- Maintenance and decision rules are in [GOVERNANCE.md](GOVERNANCE.md). Need help? See [SUPPORT.md](SUPPORT.md).

## Security and licensing

- Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md). Never open a public issue for one.
- JobPrep is source-available. By submitting a contribution you confirm you wrote it or have the right to submit it, and you license it under the project [LICENSE](LICENSE.md). Sign off commits with `git commit -s` if you can; it is encouraged, not required.

---

Thank you for contributing to JobPrep! 🚀
