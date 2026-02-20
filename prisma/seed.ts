import { PrismaClient, Role, Plan, SubscriptionStatus, DocumentType, AuditAction } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding COI Vault database...");

  // ── Create demo user ──────────────────────────────────────
  const passwordHash = await hash("demo1234", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@coivault.com" },
    update: {},
    create: {
      email: "demo@coivault.com",
      name: "Demo User",
      passwordHash,
    },
  });

  console.log("✅ Demo user created:", demoUser.email);

  // ── Create demo organization ──────────────────────────────
  const demoOrg = await prisma.organization.upsert({
    where: { id: "demo-org-001" },
    update: {},
    create: {
      id: "demo-org-001",
      name: "Acme Property Management",
    },
  });

  console.log("✅ Demo organization created:", demoOrg.name);

  // ── Create membership ─────────────────────────────────────
  await prisma.membership.upsert({
    where: {
      userId_orgId: {
        userId: demoUser.id,
        orgId: demoOrg.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      orgId: demoOrg.id,
      role: Role.OWNER,
    },
  });

  console.log("✅ Membership created (OWNER)");

  // ── Create subscription (FREE plan) ───────────────────────
  await prisma.subscription.upsert({
    where: { orgId: demoOrg.id },
    update: {},
    create: {
      orgId: demoOrg.id,
      plan: Plan.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  console.log("✅ Subscription created (FREE plan)");

  // ── Create sample vendors ─────────────────────────────────
  const vendor1 = await prisma.vendor.create({
    data: {
      name: "ABC Plumbing",
      email: "contact@abcplumbing.com",
      phone: "555-0101",
      company: "ABC Plumbing Co.",
      orgId: demoOrg.id,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: "XYZ Electrical",
      email: "info@xyzelectrical.com",
      phone: "555-0202",
      company: "XYZ Electrical Inc.",
      orgId: demoOrg.id,
    },
  });

  console.log("✅ Sample vendors created");

  // ── Create sample documents ───────────────────────────────
  const now = new Date();

  await prisma.vendorDocument.createMany({
    data: [
      {
        title: "General Liability COI",
        type: DocumentType.COI,
        url: "https://example.com/docs/abc-coi.pdf",
        expiryDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now (expiring soon)
        vendorId: vendor1.id,
      },
      {
        title: "WSIB Certificate",
        type: DocumentType.WSIB,
        url: "https://example.com/docs/abc-wsib.pdf",
        expiryDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
        vendorId: vendor1.id,
      },
      {
        title: "Professional Liability COI",
        type: DocumentType.COI,
        url: "https://example.com/docs/xyz-coi.pdf",
        expiryDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days
        vendorId: vendor2.id,
      },
    ],
  });

  console.log("✅ Sample documents created");

  // ── Create audit log entries ──────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        action: AuditAction.VENDOR_CREATED,
        details: `Vendor "${vendor1.name}" created`,
        userId: demoUser.id,
        orgId: demoOrg.id,
      },
      {
        action: AuditAction.VENDOR_CREATED,
        details: `Vendor "${vendor2.name}" created`,
        userId: demoUser.id,
        orgId: demoOrg.id,
      },
      {
        action: AuditAction.DOCUMENT_ADDED,
        details: "General Liability COI added to ABC Plumbing",
        userId: demoUser.id,
        orgId: demoOrg.id,
      },
    ],
  });

  console.log("✅ Audit logs created");
  console.log("\n🎉 Seed complete!");
  console.log("   Login: demo@coivault.com / demo1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
