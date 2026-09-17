# Cloudflare Workers deployment with existing PostgreSQL

- Status: Accepted
- Date: 2026-09-17

## Context

JobPrep is a Next.js application with a relational Prisma schema and Better Auth's PostgreSQL adapter. The target edge platform is Cloudflare Workers.

## Decision

Deploy the web application through OpenNext on Cloudflare Workers. Keep PostgreSQL as the system of record and introduce Cloudflare Hyperdrive for pooled database connectivity when the production binding is provisioned. Do not migrate the application to D1 in this upgrade branch.

## Alternatives considered

- Migrate immediately to D1: rejected because it would require a SQLite port of the existing relational schema and auth integration.
- Keep a Node-only deployment: rejected because it would not validate the intended Workers runtime.

## Consequences

Cloudflare builds and Worker previews are required CI gates. Code must remain compatible with the Workers runtime and configured Node compatibility surface. PostgreSQL operational ownership, backup, and egress costs remain until a separately scoped data migration is justified.

## Operational implications

Provision Hyperdrive and configure the `HYPERDRIVE` binding before production database traffic is sent through Workers. Keep runtime secrets in Cloudflare, and deploy with `--keep-vars` so they are not removed.

## Cost implications

Workers and Hyperdrive charges are separate from managed PostgreSQL charges. D1 cost savings do not justify an unplanned schema migration.

## Revisit triggers

Revisit when a dedicated Cloudflare API layer is introduced, when a new feature has an isolated SQLite-compatible data model, or when PostgreSQL latency/cost exceeds the value of keeping the existing schema.
