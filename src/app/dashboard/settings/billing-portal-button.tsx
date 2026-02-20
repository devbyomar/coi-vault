"use client";

import { Button } from "@/components/ui/button";
import { createBillingPortalSession } from "@/server/actions/billing";

export function BillingPortalButton() {
  async function handleClick() {
    await createBillingPortalSession();
  }

  return (
    <Button variant="secondary" onClick={handleClick}>
      Manage Billing
    </Button>
  );
}
