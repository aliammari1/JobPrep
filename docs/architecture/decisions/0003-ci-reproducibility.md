# Reproducible CI inputs

- Status: Accepted
- Date: 2026-09-17

## Context

The repository uses Bun for JavaScript dependencies and uv for the Python avatar agent. Floating runtime versions, dynamic dependency installation, and validation bypasses make CI results non-reproducible.

## Decision

Pin Bun in `packageManager` and CI, pin uv in CI, and install from `bun.lock` and `uv.lock` with frozen/locked modes. CI uses fake but schema-valid service values and keeps environment validation enabled. The full-repository Biome lint remains advisory while strict security-sensitive lint is blocking.

## Alternatives considered

- Use `latest` in CI: rejected because it can change a passing build without a repository change.
- Disable environment validation: rejected because it hides missing CI configuration.

## Consequences

Dependency and runtime updates require explicit commits. Existing lint debt remains visible while the blocking surface expands.

## Operational implications

Lint ratchet: Phase 1 covers critical security/server files; Phase 2 covers all API/server/lib files; Phase 3 covers all `src`; Phase 4 makes the full repository blocking.

## Cost implications

Pinned caches may need occasional refreshes, but avoid debugging failures caused by implicit updates.

## Revisit triggers

Revisit when the full-repository lint is clean or when runtime support windows require a new pinned baseline.
