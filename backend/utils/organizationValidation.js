import { z } from "zod";

// ORGANIZATION CREATION VALIDATION
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must contain at least 2 characters.")
    .max(100, "Organization name cannot exceed 100 characters."),

  type: z.enum(["business", "developer", "agency"], {
    error: "Please select a valid workspace type.",
  }),
});
