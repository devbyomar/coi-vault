import { describe, it, expect } from "vitest";
import { signUpSchema, signInSchema, createVendorSchema, createDocumentSchema } from "@/lib/validations";

describe("Validation Schemas", () => {
  describe("signUpSchema", () => {
    it("should validate a correct signup input", () => {
      const result = signUpSchema.safeParse({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        orgName: "Test Org",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = signUpSchema.safeParse({
        name: "",
        email: "test@example.com",
        password: "password123",
        orgName: "Test Org",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = signUpSchema.safeParse({
        name: "Test",
        email: "not-an-email",
        password: "password123",
        orgName: "Test Org",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = signUpSchema.safeParse({
        name: "Test",
        email: "test@example.com",
        password: "short",
        orgName: "Test Org",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty org name", () => {
      const result = signUpSchema.safeParse({
        name: "Test",
        email: "test@example.com",
        password: "password123",
        orgName: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("signInSchema", () => {
    it("should validate correct signin input", () => {
      const result = signInSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = signInSchema.safeParse({
        email: "invalid",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createVendorSchema", () => {
    it("should validate with just name", () => {
      const result = createVendorSchema.safeParse({
        name: "Test Vendor",
      });
      expect(result.success).toBe(true);
    });

    it("should validate with all fields", () => {
      const result = createVendorSchema.safeParse({
        name: "Test Vendor",
        email: "vendor@example.com",
        phone: "555-0101",
        company: "Test Corp",
        notes: "Some notes",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = createVendorSchema.safeParse({
        name: "",
      });
      expect(result.success).toBe(false);
    });

    it("should allow empty email", () => {
      const result = createVendorSchema.safeParse({
        name: "Test",
        email: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("createDocumentSchema", () => {
    it("should validate correct document input", () => {
      const result = createDocumentSchema.safeParse({
        title: "Test COI",
        type: "COI",
        url: "https://example.com/doc.pdf",
        expiryDate: "2026-12-31",
        vendorId: "vendor-123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid type", () => {
      const result = createDocumentSchema.safeParse({
        title: "Test",
        type: "INVALID",
        url: "https://example.com/doc.pdf",
        expiryDate: "2026-12-31",
        vendorId: "vendor-123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid URL", () => {
      const result = createDocumentSchema.safeParse({
        title: "Test",
        type: "COI",
        url: "not-a-url",
        expiryDate: "2026-12-31",
        vendorId: "vendor-123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid date", () => {
      const result = createDocumentSchema.safeParse({
        title: "Test",
        type: "COI",
        url: "https://example.com/doc.pdf",
        expiryDate: "not-a-date",
        vendorId: "vendor-123",
      });
      expect(result.success).toBe(false);
    });
  });
});
