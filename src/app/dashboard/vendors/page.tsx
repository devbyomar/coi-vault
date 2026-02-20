import { getVendors } from "@/server/actions/vendors";
import { getCurrentOrg } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import { ExpiryBadge } from "@/components/expiry-badge";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/lib/plans";
import Link from "next/link";
import { CreateVendorButton } from "./create-vendor-button";

export default async function VendorsPage() {
  const { subscription } = await getCurrentOrg();
  const vendors = await getVendors();
  const plan = subscription?.plan ?? "FREE";
  const limits = PLAN_LIMITS[plan];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="mt-1 text-sm text-gray-600">
            {vendors.length}
            {limits.maxVendors < Infinity ? ` / ${limits.maxVendors}` : ""}{" "}
            vendors
          </p>
        </div>
        <CreateVendorButton
          disabled={!isFinite(limits.maxVendors) ? false : vendors.length >= limits.maxVendors}
        />
      </div>

      {vendors.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">No vendors yet.</p>
            <p className="mt-1 text-sm text-gray-400">
              Add your first vendor to start tracking their COIs.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {vendors.map((vendor) => {
            const docCount = vendor.documents.length;
            const expiringSoon = vendor.documents.filter((d) => {
              const diff = new Date(d.expiryDate).getTime() - Date.now();
              return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
            });

            return (
              <Link
                key={vendor.id}
                href={`/dashboard/vendors/${vendor.id}`}
                className="block"
              >
                <Card className="hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {vendor.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {vendor.company || "No company"} · {vendor.email || "No email"}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="info">{docCount} doc{docCount !== 1 ? "s" : ""}</Badge>
                          {expiringSoon.length > 0 && (
                            <Badge variant="warning">
                              {expiringSoon.length} expiring soon
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {vendor.documents.slice(0, 2).map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 truncate max-w-[120px]">
                              {doc.title}
                            </span>
                            <ExpiryBadge expiryDate={doc.expiryDate} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
