-- Stripe webhook idempotency ledger. The handler records this only after its
-- business mutation succeeds in the same transaction, preserving retries.
CREATE TABLE "processed_webhook_event" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'stripe',
    "type" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_webhook_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "processed_webhook_event_eventId_key" ON "processed_webhook_event"("eventId");
CREATE INDEX "processed_webhook_event_source_idx" ON "processed_webhook_event"("source");
