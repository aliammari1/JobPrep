import Stripe from "stripe";

/**
 * Lazily-initialised Stripe client.
 *
 * The previous implementation threw at module-load time when
 * `STRIPE_SECRET_KEY` was absent. That made `next build` fail in CI (and any
 * environment without real Stripe credentials), because Next.js evaluates route
 * modules during the build. We now defer initialisation until the client is
 * actually used at request time, so the build succeeds with a dummy/empty key
 * while still failing loudly if a Stripe API call is attempted without a key.
 */
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined in environment variables. " +
        "Set it to enable billing features.",
    );
  }

  stripeClient = new Stripe(key, { typescript: true });
  return stripeClient;
}

// Proxy preserves the `stripe.foo.bar(...)` call-site ergonomics while keeping
// initialisation lazy. Accessing any property triggers `getStripe()`.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripe();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const STRIPE_CONFIG = {
  currency: "usd",
  billingPortalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/portal`,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
};
