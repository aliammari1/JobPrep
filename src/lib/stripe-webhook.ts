import type Stripe from "stripe";

type StripeWebhookVerifier = {
  webhooks: {
    constructEvent: (
      payload: string,
      signature: string,
      secret: string,
    ) => Stripe.Event;
  };
};

type WebhookEvent = Pick<Stripe.Event, "id"> & { type: string };

/** The subset of a Prisma transaction used by the Stripe webhook. */
type WebhookTransaction = {
  processedWebhookEvent: {
    findUnique: (args: { where: { eventId: string } }) => Promise<unknown>;
    create: (args: {
      data: { eventId: string; source: string; type: string };
    }) => Promise<unknown>;
  };
};

/**
 * Runs the event mutation before recording its idempotency key. Call this from
 * the same database transaction as the event's business mutations: a failure
 * then rolls back both the mutation and the ledger entry, so Stripe can retry.
 */
export async function processStripeWebhookEvent(
  tx: WebhookTransaction,
  event: WebhookEvent,
  handleEvent: () => Promise<void>,
): Promise<"processed" | "duplicate"> {
  const existing = await tx.processedWebhookEvent.findUnique({
    where: { eventId: event.id },
  });
  if (existing) return "duplicate";

  await handleEvent();

  await tx.processedWebhookEvent.create({
    data: { eventId: event.id, source: "stripe", type: event.type },
  });
  return "processed";
}

/** Verify the raw Stripe payload before attempting any database mutation. */
export function verifyStripeWebhook(
  stripe: StripeWebhookVerifier,
  body: string,
  signature: string,
  secret: string,
): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, secret);
}
