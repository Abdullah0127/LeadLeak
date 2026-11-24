import { z } from "zod";

// WEBSITE URL VALIDATION
const websiteUrlSchema = z
  .string()
  .trim()
  .url("Please enter a valid website URL.")
  .max(2048, "Website URL is too long.")
  .refine((value) => {
    try {
      const url = new URL(value);

      return (
        ["http:", "https:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Only valid HTTP and HTTPS website URLs are allowed.");

// CREATE WEBSITE VALIDATION
export const createWebsiteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Website name must contain at least 2 characters.")
    .max(100, "Website name cannot exceed 100 characters.")
    .optional(),

  organizationId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid organization ID."),

  url: websiteUrlSchema,
});

// UPDATE WEBSITE VALIDATION
export const updateWebsiteSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Website name must contain at least 2 characters.")
      .max(100, "Website name cannot exceed 100 characters.")
      .optional(),

    url: websiteUrlSchema.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Please provide at least one field to update.",
  );
