# Stripe webhook idempotency records successful processing

- Status: Accepted
- Date: 2026-09-17

## Context

Stripe retries failed webhook deliveries and can deliver duplicate events. Recording an event id before its database work completes turns a transient failure into a permanently discarded event.

## Decision

Verify the raw signed request, run the event mutation and idempotency ledger write in one database transaction, and record the event only after the mutation succeeds. A duplicate idempotency key is acknowledged. Unsupported event types are safely acknowledged after being recorded.

## Alternatives considered

- Mark receipt before processing: rejected because retries after a failure would be discarded.
- Use a queue/outbox now: deferred because current webhook effects are database mutations; introduce an outbox before adding non-transactional external effects.

## Consequences

Database failures return non-2xx so Stripe retries. Concurrent duplicate deliveries may cause a unique-key conflict, which is acknowledged only as a duplicate.

## Operational implications

Monitor failed deliveries and retain the idempotency ledger according to Stripe replay and audit requirements. Do not add external side effects to the transaction without an outbox design.

## Cost implications

The ledger adds a small PostgreSQL storage and index cost.

## Revisit triggers

Revisit when webhook handlers start sending email, calling third-party systems, or use asynchronous event destinations.
