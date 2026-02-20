import { getCurrentOrg } from "@/lib/auth-utils";
import { PLAN_DISPLAY, PLAN_LIMITS } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { UpgradeButton } from "./upgrade-button";
import { BillingPortalButton } from "./billing-portal-button";
import { DeleteAccountButton } from "./delete-account-button";

export default async function SettingsPage() {
  const { organization, subscription, membership } = await getCurrentOrg();

  const plan = subscription?.plan ?? "FREE";
  const planInfo = PLAN_DISPLAY[plan];
  const limits = PLAN_LIMITS[plan];

  const [vendorCount, docCount, memberCount, auditLogs] = await Promise.all([
    prisma.vendor.count({
      where: { orgId: organization.id, deletedAt: null },
    }),
    prisma.vendorDocument.count({
      where: {
        vendor: { orgId: organization.id, deletedAt: null },
        deletedAt: null,
      },
    }),
    prisma.membership.count({
      where: { orgId: organization.id },
    }),
    prisma.auditLog.findMany({
      where: { orgId: organization.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">{organization.name}</p>
      </div>

      {/* Billing */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Billing & Subscription
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {planInfo.name}
                </span>
                <Badge variant={plan === "FREE" ? "default" : "success"}>
                  {planInfo.price}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {planInfo.description}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Usage</p>
              <div className="mt-1 space-y-1 text-sm">
                <p>
                  Vendors: {vendorCount}
                  {limits.maxVendors < Infinity
                    ? ` / ${limits.maxVendors}`
                    : " (unlimited)"}
                </p>
                <p>
                  Documents: {docCount}
                  {limits.maxDocuments < Infinity
                    ? ` / ${limits.maxDocuments}`
                    : " (unlimited)"}
                </p>
                <p>
                  Seats: {memberCount}
                  {limits.maxSeats < Infinity
                    ? ` / ${limits.maxSeats}`
                    : " (unlimited)"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-3">
            {plan === "FREE" && (
              <>
                <UpgradeButton plan="PRO" label="Upgrade to Pro — $29/mo" />
                <UpgradeButton
                  plan="TEAM"
                  label="Upgrade to Team — $79/mo"
                  variant="secondary"
                />
              </>
            )}
            {plan !== "FREE" && <BillingPortalButton />}
          </div>
        </CardFooter>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              No activity yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="default">{log.action.replace(/_/g, " ")}</Badge>
                      {log.details && (
                        <p className="mt-1 text-sm text-gray-600">
                          {log.details}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                      {log.user && (
                        <p className="text-xs text-gray-400">
                          {log.user.name || log.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {membership.role === "OWNER" && (
        <Card className="border-red-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
