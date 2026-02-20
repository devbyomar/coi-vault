"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "@/server/actions/documents";

export function DeleteDocumentButton({
  documentId,
  documentTitle,
}: {
  documentId: string;
  documentTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${documentTitle}"?`)) return;

    setLoading(true);
    try {
      const result = await deleteDocument(documentId);
      if (result.success) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" loading={loading} onClick={handleDelete}>
      ✕
    </Button>
  );
}
