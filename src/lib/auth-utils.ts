import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  return session;
}

export async function requireOrgAccess(orgId: string) {
  const session = await requireAuth();

  const membership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId: session.user.id,
        orgId,
      },
    },
    include: {
      organization: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!membership || membership.organization.deletedAt) {
    redirect("/dashboard");
  }

  return {
    session,
    membership,
    organization: membership.organization,
    subscription: membership.organization.subscription,
  };
}

export async function getCurrentOrg() {
  const session = await requireAuth();

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      organization: { deletedAt: null },
    },
    include: {
      organization: {
        include: {
          subscription: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    redirect("/onboarding");
  }

  return {
    session,
    membership,
    organization: membership.organization,
    subscription: membership.organization.subscription,
  };
}
