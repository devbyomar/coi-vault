"use server";

import { prisma } from "@/lib/prisma";
import { createVendorSchema, type CreateVendorInput } from "@/lib/validations";
import { getCurrentOrg } from "@/lib/auth-utils";
import { canAddVendor } from "@/lib/plans";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function createVendor(input: CreateVendorInput) {
  const { session, organization, subscription } = await getCurrentOrg();

  const parsed = createVendorSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check plan limits
  const vendorCount = await prisma.vendor.count({
    where: { orgId: organization.id, deletedAt: null },
  });

  const plan = subscription?.plan ?? "FREE";
  if (!canAddVendor(plan, vendorCount)) {
    return { error: "You have reached your vendor limit. Please upgrade your plan." };
  }

  const vendor = await prisma.vendor.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      notes: parsed.data.notes || null,
      orgId: organization.id,
    },
  });

  await createAuditLog({
    action: "VENDOR_CREATED",
    orgId: organization.id,
    userId: session.user.id,
    details: `Vendor "${vendor.name}" created`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vendors");
  return { success: true, vendorId: vendor.id };
}

export async function getVendors() {
  const { organization } = await getCurrentOrg();

  return prisma.vendor.findMany({
    where: { orgId: organization.id, deletedAt: null },
    include: {
      documents: {
        where: { deletedAt: null },
        orderBy: { expiryDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVendor(vendorId: string) {
  const { organization } = await getCurrentOrg();

  const vendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      orgId: organization.id,
      deletedAt: null,
    },
    include: {
      documents: {
        where: { deletedAt: null },
        orderBy: { expiryDate: "asc" },
      },
    },
  });

  return vendor;
}

export async function deleteVendor(vendorId: string) {
  const { session, organization } = await getCurrentOrg();

  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, orgId: organization.id, deletedAt: null },
  });

  if (!vendor) {
    return { error: "Vendor not found" };
  }

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    action: "VENDOR_DELETED",
    orgId: organization.id,
    userId: session.user.id,
    details: `Vendor "${vendor.name}" deleted`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vendors");
  return { success: true };
}
