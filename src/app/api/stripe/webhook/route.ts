import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import {
  processStripeWebhookEvent,
  verifyStripeWebhook,
} from "@/lib/stripe-webhook";
import type Stripe from "stripe";
import { Prisma } from "@/generated/prisma";

type WebhookTransaction = Pick<
  Prisma.TransactionClient,
  "processedWebhookEvent" | "user" | "subscription" | "payment"
>;

// Disable body parsing for this route
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 },
      );
    }

    let event: Stripe.Event;

    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
      }
      event = verifyStripeWebhook(stripe, body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) =>
      processStripeWebhookEvent(tx, event, () => handleStripeEvent(tx, event)),
    );
    return NextResponse.json({
      received: true,
      duplicate: result === "duplicate" ? true : undefined,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleStripeEvent(tx: WebhookTransaction, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        tx,
        event.data.object as Stripe.Checkout.Session,
      );
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpdate(
        tx,
        event.data.object as Stripe.Subscription,
      );
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        tx,
        event.data.object as Stripe.Subscription,
      );
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(
        tx,
        event.data.object as Stripe.Invoice,
      );
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(tx, event.data.object as Stripe.Invoice);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutSessionCompleted(
  tx: WebhookTransaction,
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error("No userId in checkout session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await updateUserSubscription(tx, userId, subscription, customerId);
  }
}

async function handleSubscriptionUpdate(
  tx: WebhookTransaction,
  subscription: Stripe.Subscription,
) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    // Try to find user by customer ID
    const user = await tx.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });

    if (!user) {
      console.error("No user found for subscription");
      return;
    }

    await updateUserSubscription(
      tx,
      user.id,
      subscription,
      subscription.customer as string,
    );
  } else {
    await updateUserSubscription(
      tx,
      userId,
      subscription,
      subscription.customer as string,
    );
  }
}

async function handleSubscriptionDeleted(
  tx: WebhookTransaction,
  subscription: Stripe.Subscription,
) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    const user = await tx.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });

    if (!user) {
      console.error("No user found for subscription");
      return;
    }

    await cancelUserSubscription(tx, user.id, subscription.id);
  } else {
    await cancelUserSubscription(tx, userId, subscription.id);
  }
}

async function handleInvoicePaymentSucceeded(
  tx: WebhookTransaction,
  invoice: Stripe.Invoice,
) {
  const subscriptionId = (invoice as any).subscription as string | undefined;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    const user = await tx.user.findFirst({
      where: { stripeCustomerId: (invoice as any).customer as string },
    });

    if (!user) return;

    await recordPayment(tx, user.id, invoice);
  } else {
    await recordPayment(tx, userId, invoice);
  }
}

async function handleInvoicePaymentFailed(
  tx: WebhookTransaction,
  invoice: Stripe.Invoice,
) {
  const customerId = invoice.customer as string;

  const user = await tx.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  // Update subscription status to PAST_DUE
  await tx.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "PAST_DUE",
    },
  });
}

async function updateUserSubscription(
  tx: WebhookTransaction,
  userId: string,
  subscription: Stripe.Subscription,
  customerId: string,
) {
  const priceId = subscription.items.data[0]?.price.id;
  const productId = subscription.items.data[0]?.price.product as string;

  // Determine tier based on price ID
  let tier: "FREE" | "MONTHLY" | "YEARLY" = "FREE";

  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY) {
    tier = "MONTHLY";
  } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY) {
    tier = "YEARLY";
  }

  const status = subscription.status.toUpperCase() as
    | "ACTIVE"
    | "INACTIVE"
    | "PAST_DUE"
    | "CANCELED"
    | "TRIALING";

  // Update user
  await tx.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      subscriptionTier: tier,
      subscriptionStatus: status,
      currentPeriodEnd: new Date(
        ((subscription as any).current_period_end || 0) * 1000,
      ),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    },
  });

  // Upsert subscription record
  await tx.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeProductId: productId,
      tier,
      status,
      currentPeriodStart: new Date(
        ((subscription as any).current_period_start || 0) * 1000,
      ),
      currentPeriodEnd: new Date(
        ((subscription as any).current_period_end || 0) * 1000,
      ),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
      trialStart: (subscription as any).trial_start
        ? new Date((subscription as any).trial_start * 1000)
        : null,
      trialEnd: (subscription as any).trial_end
        ? new Date((subscription as any).trial_end * 1000)
        : null,
    },
    update: {
      stripePriceId: priceId,
      stripeProductId: productId,
      tier,
      status,
      currentPeriodStart: new Date(
        ((subscription as any).current_period_start || 0) * 1000,
      ),
      currentPeriodEnd: new Date(
        ((subscription as any).current_period_end || 0) * 1000,
      ),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
      canceledAt: (subscription as any).canceled_at
        ? new Date((subscription as any).canceled_at * 1000)
        : null,
    },
  });
}

async function cancelUserSubscription(
  tx: WebhookTransaction,
  userId: string,
  subscriptionId: string,
) {
  await tx.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: "FREE",
      subscriptionStatus: "CANCELED",
      cancelAtPeriodEnd: false,
    },
  });

  await tx.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
    },
  });
}

async function recordPayment(
  tx: WebhookTransaction,
  userId: string,
  invoice: Stripe.Invoice,
) {
  const paymentIntentId = (invoice as any).payment_intent as string | undefined;

  if (!paymentIntentId) return;

  await tx.payment.create({
    data: {
      userId,
      stripePaymentId:
        typeof paymentIntentId === "string" ? paymentIntentId : paymentIntentId,
      amount: (invoice as any).amount_paid || 0,
      currency: invoice.currency || "usd",
      status: invoice.status || "succeeded",
      description: invoice.description || undefined,
      receiptUrl: (invoice as any).hosted_invoice_url || undefined,
      invoiceUrl: (invoice as any).invoice_pdf || undefined,
    },
  });
}
