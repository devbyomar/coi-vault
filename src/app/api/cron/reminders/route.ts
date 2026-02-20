import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildExpiryReminderEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find documents expiring within 7 days
    const expiringDocs = await prisma.vendorDocument.findMany({
      where: {
        deletedAt: null,
        expiryDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
        vendor: {
          deletedAt: null,
          organization: {
            deletedAt: null,
          },
        },
      },
      include: {
        vendor: {
          include: {
            organization: {
              include: {
                memberships: {
                  where: { role: "OWNER" },
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    });

    // Group by organization
    const orgMap = new Map<
      string,
      {
        orgName: string;
        ownerEmails: string[];
        documents: { title: string; vendorName: string; expiryDate: Date }[];
      }
    >();

    for (const doc of expiringDocs) {
      const orgId = doc.vendor.orgId;
      if (!orgMap.has(orgId)) {
        const ownerEmails = doc.vendor.organization.memberships
          .map((m) => m.user.email)
          .filter(Boolean);
        orgMap.set(orgId, {
          orgName: doc.vendor.organization.name,
          ownerEmails,
          documents: [],
        });
      }
      orgMap.get(orgId)!.documents.push({
        title: doc.title,
        vendorName: doc.vendor.name,
        expiryDate: doc.expiryDate,
      });
    }

    // Send emails
    let emailsSent = 0;
    for (const [, org] of orgMap) {
      if (org.ownerEmails.length === 0) continue;

      const { subject, html } = buildExpiryReminderEmail(
        org.orgName,
        org.documents
      );

      for (const email of org.ownerEmails) {
        await sendEmail({ to: email, subject, html });
        emailsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      documentsExpiring: expiringDocs.length,
      organizationsNotified: orgMap.size,
      emailsSent,
    });
  } catch (error) {
    console.error("Cron reminder error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
