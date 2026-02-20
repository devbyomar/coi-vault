import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import { ExpiryBadge } from "@/components/expiry-badge";
import { PLAN_DISPLAY } from "@/lib/plans";
import Link from "next/link";

export default async function DashboardPage() {
  const { organization, subscription } = await getCurrentOrg();

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [vendorCount, documentCount, expiringDocs] = await Promise.all([
    prisma.vendor.count({
      where: { orgId: organization.id, deletedAt: null },
    }),
    prisma.vendorDocument.count({
      where: {
        vendor: { orgId: organization.id, deletedAt: null },
        deletedAt: null,
      },
    }),
    prisma.vendorDocument.findMany({
      where: {
        vendor: { orgId: organization.id, deletedAt: null },
        deletedAt: null,
        expiryDate: {
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        vendor: { select: { name: true } },
      },
      orderBy: { expiryDate: "asc" },
      take: 10,
    }),
  ]);

  const plan = subscription?.plan ?? "FREE";
  const planInfo = PLAN_DISPLAY[plan];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">{organization.name}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Vendors</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {vendorCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Documents</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {documentCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
            <p className="mt-1 text-3xl font-bold text-orange-600">
              {expiringDocs.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Plan</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {planInfo.name}
            </p>
            <p className="text-sm text-gray-500">{planInfo.price}</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Documents Expiring Soon
          </h2>
          <Link
            href="/dashboard/vendors"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            View all vendors →
          </Link>
        </div>
        <CardContent>
          {expiringDocs.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No documents expiring in the next 30 days. 🎉
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {expiringDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doc.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doc.vendor.name} · Expires{" "}
                      {new Date(doc.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <ExpiryBadge expiryDate={doc.expiryDate} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
