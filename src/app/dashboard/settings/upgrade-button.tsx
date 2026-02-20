"use client";

import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/server/actions/billing";

export function UpgradeButton({
  plan,
  label,
  variant = "primary",
}: {
  plan: "PRO" | "TEAM";
  label: string;
  variant?: "primary" | "secondary";
}) {
  async function handleUpgrade() {
    await createCheckoutSession(plan);
  }

  return (
    <Button variant={variant} onClick={handleUpgrade}>
      {label}
    </Button>
  );
}
