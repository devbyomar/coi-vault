import React from "react";

export function ExpiryBadge({ expiryDate }: { expiryDate: Date }) {
  const now = new Date();
  const diffMs = new Date(expiryDate).getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        Expired
      </span>
    );
  }
  if (diffDays <= 7) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        {diffDays}d left
      </span>
    );
  }
  if (diffDays <= 14) {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
        {diffDays}d left
      </span>
    );
  }
  if (diffDays <= 30) {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
        {diffDays}d left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      {diffDays}d left
    </span>
  );
}

export function getExpiryStatus(expiryDate: Date): "expired" | "critical" | "warning" | "soon" | "ok" {
  const now = new Date();
  const diffMs = new Date(expiryDate).getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 7) return "critical";
  if (diffDays <= 14) return "warning";
  if (diffDays <= 30) return "soon";
  return "ok";
}
