"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteAccount } from "@/server/actions/billing";

export function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        "Are you absolutely sure? This will permanently delete your account, organization, and all data."
      )
    ) {
      return;
    }

    // Double confirm
    const typed = prompt('Type "DELETE" to confirm:');
    if (typed !== "DELETE") return;

    setLoading(true);
    try {
      await deleteAccount();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="danger" loading={loading} onClick={handleDelete}>
      Delete Account
    </Button>
  );
}
