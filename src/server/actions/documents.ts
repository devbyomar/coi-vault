"use server";

import { prisma } from "@/lib/prisma";
import { createDocumentSchema, type CreateDocumentInput } from "@/lib/validations";
import { getCurrentOrg } from "@/lib/auth-utils";
import { canAddDocument } from "@/lib/plans";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function createDocument(input: CreateDocumentInput) {
  const { session, organization, subscription } = await getCurrentOrg();

  const parsed = createDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify vendor belongs to org
  const vendor = await prisma.vendor.findFirst({
    where: {
      id: parsed.data.vendorId,
      orgId: organization.id,
      deletedAt: null,
    },
  });

  if (!vendor) {
    return { error: "Vendor not found" };
  }

  // Check plan limits
  const docCount = await prisma.vendorDocument.count({
    where: {
      vendor: { orgId: organization.id, deletedAt: null },
      deletedAt: null,
    },
  });

  const plan = subscription?.plan ?? "FREE";
  if (!canAddDocument(plan, docCount)) {
    return { error: "You have reached your document limit. Please upgrade your plan." };
  }

  const document = await prisma.vendorDocument.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      url: parsed.data.url,
      expiryDate: new Date(parsed.data.expiryDate),
      vendorId: parsed.data.vendorId,
    },
  });

  await createAuditLog({
    action: "DOCUMENT_ADDED",
    orgId: organization.id,
    userId: session.user.id,
    details: `Document "${document.title}" added to vendor "${vendor.name}"`,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/vendors/${vendor.id}`);
  return { success: true, documentId: document.id };
}

export async function deleteDocument(documentId: string) {
  const { session, organization } = await getCurrentOrg();

  const document = await prisma.vendorDocument.findFirst({
    where: {
      id: documentId,
      vendor: { orgId: organization.id },
      deletedAt: null,
    },
    include: { vendor: true },
  });

  if (!document) {
    return { error: "Document not found" };
  }

  await prisma.vendorDocument.update({
    where: { id: documentId },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    action: "DOCUMENT_DELETED",
    orgId: organization.id,
    userId: session.user.id,
    details: `Document "${document.title}" deleted from vendor "${document.vendor.name}"`,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/vendors/${document.vendorId}`);
  return { success: true };
}
