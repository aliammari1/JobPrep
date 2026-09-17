# OpenNext is the production runtime gate

- Status: Accepted
- Date: 2026-09-17

## Context

`next build` verifies a Node-oriented Next.js build but does not bundle or run the result in Cloudflare Workers.

## Decision

Commit `@opennextjs/cloudflare` and Wrangler as development dependencies. Use the package scripts to build, preview, deploy, and upload. CI runs the OpenNext build and starts `opennextjs-cloudflare preview` for Playwright smoke tests.

## Alternatives considered

- Install OpenNext dynamically in CI: rejected because it bypasses the committed lockfile.
- Test only with `next start`: rejected as insufficient production-runtime coverage.

## Consequences

The Worker build can expose incompatibilities earlier. Preview tests run closer to deployment behavior, at the cost of a longer CI job.

## Operational implications

Maintain a current compatibility date, use the local CLI from `bun.lock`, and investigate every Worker build failure rather than accepting a successful Node-only build.

## Cost implications

This increases CI minutes but reduces the chance of a failed Cloudflare deployment.

## Revisit triggers

Revisit if OpenNext changes its runtime model or Cloudflare's native Next.js support replaces the adapter.
