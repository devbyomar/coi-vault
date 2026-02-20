import { describe, it, expect } from "vitest";
import { canAddVendor, canAddDocument, canAddSeat, getPlanLimits, PLAN_LIMITS } from "@/lib/plans";

describe("Plan Limits", () => {
  describe("FREE plan", () => {
    it("should allow up to 5 vendors", () => {
      expect(canAddVendor("FREE", 0)).toBe(true);
      expect(canAddVendor("FREE", 4)).toBe(true);
      expect(canAddVendor("FREE", 5)).toBe(false);
      expect(canAddVendor("FREE", 10)).toBe(false);
    });

    it("should allow up to 10 documents", () => {
      expect(canAddDocument("FREE", 0)).toBe(true);
      expect(canAddDocument("FREE", 9)).toBe(true);
      expect(canAddDocument("FREE", 10)).toBe(false);
    });

    it("should allow 1 seat", () => {
      expect(canAddSeat("FREE", 0)).toBe(true);
      expect(canAddSeat("FREE", 1)).toBe(false);
    });
  });

  describe("PRO plan", () => {
    it("should allow unlimited vendors", () => {
      expect(canAddVendor("PRO", 0)).toBe(true);
      expect(canAddVendor("PRO", 1000)).toBe(true);
    });

    it("should allow unlimited documents", () => {
      expect(canAddDocument("PRO", 0)).toBe(true);
      expect(canAddDocument("PRO", 10000)).toBe(true);
    });

    it("should allow 1 seat", () => {
      expect(canAddSeat("PRO", 0)).toBe(true);
      expect(canAddSeat("PRO", 1)).toBe(false);
    });
  });

  describe("TEAM plan", () => {
    it("should allow unlimited vendors", () => {
      expect(canAddVendor("TEAM", 0)).toBe(true);
      expect(canAddVendor("TEAM", 99999)).toBe(true);
    });

    it("should allow unlimited documents", () => {
      expect(canAddDocument("TEAM", 0)).toBe(true);
      expect(canAddDocument("TEAM", 99999)).toBe(true);
    });

    it("should allow up to 10 seats", () => {
      expect(canAddSeat("TEAM", 0)).toBe(true);
      expect(canAddSeat("TEAM", 9)).toBe(true);
      expect(canAddSeat("TEAM", 10)).toBe(false);
    });
  });

  describe("getPlanLimits", () => {
    it("should return correct limits for each plan", () => {
      expect(getPlanLimits("FREE")).toEqual(PLAN_LIMITS.FREE);
      expect(getPlanLimits("PRO")).toEqual(PLAN_LIMITS.PRO);
      expect(getPlanLimits("TEAM")).toEqual(PLAN_LIMITS.TEAM);
    });
  });
});
