import { notFound } from "next/navigation";
import { getVendor } from "@/server/actions/vendors";
import { getCurrentOrg } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpiryBadge } from "@/components/expiry-badge";
import { PLAN_LIMITS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AddDocumentButton } from "./add-document-button";
import { DeleteVendorButton } from "./delete-vendor-button";
import { DeleteDocumentButton } from "./delete-document-button";

interface Props {
  params: Promise<{ vendorId: string }>;
}

export default async function VendorDetailPage({ params }: Props) {
  const { vendorId } = await params;
  const { organization, subscription } = await getCurrentOrg();
  const vendor = await getVendor(vendorId);

  if (!vendor) {
    notFound();
  }

  const plan = subscription?.plan ?? "FREE";
  const limits = PLAN_LIMITS[plan];

  const totalDocs = await prisma.vendorDocument.count({
    where: {
      vendor: { orgId: organization.id, deletedAt: null },
      deletedAt: null,
    },
  });

  const canAddDoc = limits.maxDocuments === Infinity || totalDocs < limits.maxDocuments;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/vendors"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          ← Back to Vendors
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
            {vendor.company && <span>{vendor.company}</span>}
            {vendor.email && <span>· {vendor.email}</span>}
            {vendor.phone && <span>· {vendor.phone}</span>}
          </div>
          {vendor.notes && (
            <p className="mt-2 text-sm text-gray-500">{vendor.notes}</p>
          )}
        </div>
        <DeleteVendorButton vendorId={vendor.id} vendorName={vendor.name} />
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            <AddDocumentButton vendorId={vendor.id} disabled={!canAddDoc} />
          </div>
        </CardHeader>
        <CardContent>
          {vendor.documents.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No documents yet. Add a COI or other certificate.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {vendor.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {doc.title}
                      </p>
                      <Badge
                        variant={
                          doc.type === "COI"
                            ? "info"
                            : doc.type === "WSIB"
                            ? "success"
                            : "default"
                        }
                      >
                        {doc.type}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      <span>
                        Expires:{" "}
                        {new Date(doc.expiryDate).toLocaleDateString()}
                      </span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExpiryBadge expiryDate={doc.expiryDate} />
                    <DeleteDocumentButton
                      documentId={doc.id}
                      documentTitle={doc.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
