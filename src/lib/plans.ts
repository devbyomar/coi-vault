import { Plan } from "@prisma/client";

export interface PlanLimits {
  maxVendors: number;
  maxDocuments: number;
  maxSeats: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxVendors: 5,
    maxDocuments: 10,
    maxSeats: 1,
  },
  PRO: {
    maxVendors: Infinity,
    maxDocuments: Infinity,
    maxSeats: 1,
  },
  TEAM: {
    maxVendors: Infinity,
    maxDocuments: Infinity,
    maxSeats: 10,
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function canAddVendor(plan: Plan, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  return currentCount < limits.maxVendors;
}

export function canAddDocument(plan: Plan, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  return currentCount < limits.maxDocuments;
}

export function canAddSeat(plan: Plan, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  return currentCount < limits.maxSeats;
}

export const PLAN_DISPLAY: Record<Plan, { name: string; price: string; description: string }> = {
  FREE: {
    name: "Free",
    price: "$0/mo",
    description: "5 vendors, 10 documents, 1 seat",
  },
  PRO: {
    name: "Pro",
    price: "$29/mo",
    description: "Unlimited vendors & documents, 1 seat",
  },
  TEAM: {
    name: "Team",
    price: "$79/mo",
    description: "Unlimited vendors & documents, up to 10 seats",
  },
};
