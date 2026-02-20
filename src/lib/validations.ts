import { z } from "zod";

// ─── Auth ───────────────────────────────────────────────────

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  orgName: z.string().min(1, "Organization name is required").max(200),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Vendor ─────────────────────────────────────────────────

export const createVendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required").max(200),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const updateVendorSchema = createVendorSchema.partial();

// ─── Vendor Document ────────────────────────────────────────

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  type: z.enum(["COI", "WSIB", "OTHER"]),
  url: z.string().url("Must be a valid URL"),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  vendorId: z.string().min(1, "Vendor ID is required"),
});

// ─── Organization ───────────────────────────────────────────

export const updateOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(200),
});

// ─── Types ──────────────────────────────────────────────────

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
