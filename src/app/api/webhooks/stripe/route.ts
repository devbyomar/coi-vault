import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { Plan, SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.orgId;
  if (!orgId || !session.subscription) return;

  const stripeSubscription = await getStripe().subscriptions.retrieve(
    session.subscription as string
  );

  const priceId = stripeSubscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  await prisma.subscription.update({
    where: { orgId },
    data: {
      plan,
      status: SubscriptionStatus.ACTIVE,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: session.customer as string,
      stripePriceId: priceId,
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
    },
  });

  await createAuditLog({
    action: "SUBSCRIPTION_UPDATED",
    orgId,
    details: `Subscription upgraded to ${plan}`,
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!sub) return;

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
  if (subscription.status === "past_due") status = SubscriptionStatus.PAST_DUE;
  if (subscription.status === "canceled") status = SubscriptionStatus.CANCELED;
  if (subscription.status === "trialing") status = SubscriptionStatus.TRIALING;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      plan,
      status,
      stripePriceId: priceId,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  await createAuditLog({
    action: "SUBSCRIPTION_UPDATED",
    orgId: sub.orgId,
    details: `Subscription updated to ${plan} (${status})`,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!sub) return;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      plan: Plan.FREE,
      status: SubscriptionStatus.CANCELED,
      cancelAtPeriodEnd: false,
    },
  });

  await createAuditLog({
    action: "SUBSCRIPTION_UPDATED",
    orgId: sub.orgId,
    details: "Subscription canceled, reverted to FREE plan",
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription;
  if (!subscriptionId) return;

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId as string },
  });
  if (!sub) return;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: SubscriptionStatus.PAST_DUE },
  });
}

function getPlanFromPriceId(priceId: string): Plan {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return Plan.PRO;
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) return Plan.TEAM;
  return Plan.FREE;
}
