import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

// Mock stripe
const mockStripeClient = {
  webhooks: {
    constructEvent: vi.fn(),
  },
  subscriptions: {
    retrieve: vi.fn(),
  },
};

vi.mock("@/lib/stripe", () => ({
  getStripe: () => mockStripeClient,
}));

describe("Stripe Webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject missing stripe signature", async () => {
    const request = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "content-type": "application/json",
      },
    });

    // Dynamically import to get fresh module
    const mod = await import("@/app/api/webhooks/stripe/route");

    // Can't call without setting env, but we test the type check
    const { NextRequest } = await import("next/server");
    const nextReq = new NextRequest(request);
    const response = await mod.POST(nextReq);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Missing signature");
  });

  it("should return 400 for invalid webhook signature", async () => {
    mockStripeClient.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    process.env.STRIPE_WEBHOOK_SECRET = "test_secret";

    const request = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "test-body",
      headers: {
        "content-type": "application/json",
        "stripe-signature": "invalid-sig",
      },
    });

    const { NextRequest } = await import("next/server");
    const nextReq = new NextRequest(request);

    const mod = await import("@/app/api/webhooks/stripe/route");
    const response = await mod.POST(nextReq);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid signature");

    delete process.env.STRIPE_WEBHOOK_SECRET;
  });
});
