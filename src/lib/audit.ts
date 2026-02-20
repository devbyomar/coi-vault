import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

interface AuditLogInput {
  action: AuditAction;
  orgId: string;
  userId?: string;
  details?: string;
}

export async function createAuditLog({
  action,
  orgId,
  userId,
  details,
}: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        orgId,
        userId,
        details,
      },
    });
  } catch (error) {
    // Audit logging should never break the main flow
    console.error("Failed to create audit log:", error);
  }
}
