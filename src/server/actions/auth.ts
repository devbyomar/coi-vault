"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
import { Plan, Role, SubscriptionStatus } from "@prisma/client";

export async function signUp(input: SignUpInput) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password, orgName } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hash(password, 12);

  // Create user, org, membership, and subscription in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
      },
    });

    const org = await tx.organization.create({
      data: { name: orgName },
    });

    await tx.membership.create({
      data: {
        userId: user.id,
        orgId: org.id,
        role: Role.OWNER,
      },
    });

    await tx.subscription.create({
      data: {
        orgId: org.id,
        plan: Plan.FREE,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    return { user, org };
  });

  return { success: true, userId: result.user.id };
}
