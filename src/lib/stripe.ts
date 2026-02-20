import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

export const STRIPE_PLANS = {
  PRO: process.env.STRIPE_PRO_PRICE_ID ?? "",
  TEAM: process.env.STRIPE_TEAM_PRICE_ID ?? "",
} as const;
