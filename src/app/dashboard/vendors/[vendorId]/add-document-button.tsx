"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createDocument } from "@/server/actions/documents";

export function AddDocumentButton({
  vendorId,
  disabled,
}: {
  vendorId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"COI" | "WSIB" | "OTHER">("COI");
  const [url, setUrl] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createDocument({
        title,
        type,
        url,
        expiryDate,
        vendorId,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setTitle("");
        setType("COI");
        setUrl("");
        setExpiryDate("");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <Button variant="primary" size="sm" disabled>
        Document Limit Reached
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        + Add Document
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Document
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Input
                label="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="General Liability COI"
                required
              />

              <Select
                label="Type"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "COI" | "WSIB" | "OTHER")
                }
                options={[
                  { value: "COI", label: "Certificate of Insurance (COI)" },
                  { value: "WSIB", label: "WSIB Certificate" },
                  { value: "OTHER", label: "Other" },
                ]}
              />

              <Input
                label="Document URL *"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
              />

              <Input
                label="Expiry Date *"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Add Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
