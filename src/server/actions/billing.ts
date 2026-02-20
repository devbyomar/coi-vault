"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/auth-utils";
import { createAuditLog } from "@/lib/audit";
import { getStripe, STRIPE_PLANS } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createCheckoutSession(plan: "PRO" | "TEAM") {
  const { session, organization, subscription } = await getCurrentOrg();

  if (!subscription) {
    return { error: "No subscription found" };
  }

  let customerId = subscription.stripeCustomerId;

  // Create Stripe customer if needed
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: session.user.email!,
      metadata: {
        orgId: organization.id,
        userId: session.user.id,
      },
    });
    customerId = customer.id;

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const priceId = STRIPE_PLANS[plan];
  if (!priceId) {
    return { error: "Invalid plan" };
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
    metadata: {
      orgId: organization.id,
    },
  });

  if (checkoutSession.url) {
    redirect(checkoutSession.url);
  }

  return { error: "Failed to create checkout session" };
}

export async function createBillingPortalSession() {
  const { subscription } = await getCurrentOrg();

  if (!subscription?.stripeCustomerId) {
    return { error: "No billing account found. Please subscribe to a plan first." };
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });

  if (portalSession.url) {
    redirect(portalSession.url);
  }

  return { error: "Failed to create billing portal session" };
}

export async function deleteAccount() {
  const { session, organization, membership } = await getCurrentOrg();

  if (membership.role !== "OWNER") {
    return { error: "Only the organization owner can delete the account" };
  }

  await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
    // Soft delete user
    await tx.user.update({
      where: { id: session.user.id },
      data: { deletedAt: new Date() },
    });

    // Soft delete organization
    await tx.organization.update({
      where: { id: organization.id },
      data: { deletedAt: new Date() },
    });
  });

  await createAuditLog({
    action: "ACCOUNT_DELETED",
    orgId: organization.id,
    userId: session.user.id,
    details: "Account and organization soft-deleted",
  });

  redirect("/");
}
