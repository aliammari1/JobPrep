import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import {
  processStripeWebhookEvent,
  verifyStripeWebhook,
} from "@/lib/stripe-webhook";

function createTransaction() {
  const processed = new Set<string>();
  return {
    processedWebhookEvent: {
      findUnique: async ({ where }: { where: { eventId: string } }) =>
        processed.has(where.eventId) ? { eventId: where.eventId } : null,
      create: async ({ data }: { data: { eventId: string } }) => {
        if (processed.has(data.eventId)) throw new Error("duplicate event");
        processed.add(data.eventId);
      },
    },
    processed,
  };
}

describe("processStripeWebhookEvent", () => {
  it("processes one successful delivery and ignores the same event on retry", async () => {
    const tx = createTransaction();
    let mutations = 0;
    const event = { id: "evt_success", type: "invoice.payment_succeeded" };

    await expect(
      processStripeWebhookEvent(tx, event, async () => {
        mutations += 1;
      }),
    ).resolves.toBe("processed");
    await expect(
      processStripeWebhookEvent(tx, event, async () => {
        mutations += 1;
      }),
    ).resolves.toBe("duplicate");

    expect(mutations).toBe(1);
  });

  it("does not record an event when processing fails, allowing Stripe to retry", async () => {
    const tx = createTransaction();
    const event = { id: "evt_retry", type: "invoice.payment_succeeded" };

    await expect(
      processStripeWebhookEvent(tx, event, async () => {
        throw new Error("database unavailable");
      }),
    ).rejects.toThrow("database unavailable");
    expect(tx.processed.has(event.id)).toBe(false);

    await expect(
      processStripeWebhookEvent(tx, event, async () => undefined),
    ).resolves.toBe("processed");
  });

  it("records unsupported events after safely handling them as a no-op", async () => {
    const tx = createTransaction();
    await expect(
      processStripeWebhookEvent(
        tx,
        { id: "evt_unknown", type: "unknown.event" },
        async () => undefined,
      ),
    ).resolves.toBe("processed");
  });

  it("rejects a malformed Stripe signature before processing", () => {
    const stripe = new Stripe("test-key");
    expect(() =>
      verifyStripeWebhook(stripe, '{"id":"evt_bad"}', "invalid", "whsec_test"),
    ).toThrow();
  });
});
