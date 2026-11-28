# Repo rules for AI coding agents

Human contributors: see [CONTRIBUTING.md](CONTRIBUTING.md). Agents follow the same rules, plus these.

## Commands (Bun, not npm/yarn/pnpm)

```bash
bun install --frozen-lockfile
bun run check                                          # lint + typecheck + tests; run before finishing
bun run format                                         # Biome is the only linter/formatter
bun run openapi:generate                               # after changing API routes
```

## Rules

- Keep changes small and focused on the task. No drive-by refactors or reformatting.
- Reuse existing helpers. Call AI through `src/lib/ai/generate.ts`; provider config lives in `src/lib/ai/providers.ts`.
- Document new API routes with a `@swagger` JSDoc block, then regenerate `openapi.json`.
- Schema changes need a Prisma migration in `prisma/migrations/`.
- Add or update tests in `tests/lib/` or `tests/e2e/`. Unit tests must not need a database, network, or API keys.
- Keep UI keyboard-accessible and responsive down to phone width.
- Conventional Commit titles: `type(scope): subject`.

## Never

- Commit secrets, `.env*`, keystores (`*.keystore`, `*.jks`), APK/AAB files, or personal data.
- Edit `bun.lock` by hand, add dependencies without a reason, or weaken auth, rate limits, or validation.
- Disable tests, lint rules, or type checks to get a green build.
- Invent APIs or env vars: read the code and [`.env.example`](.env.example) first.
- Open public issues about security problems. Follow [SECURITY.md](SECURITY.md).
