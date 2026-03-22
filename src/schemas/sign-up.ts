import { z } from "zod";

// File validation code is adapted from https://stackoverflow.com/questions/72674930/zod-validator-validate-image
const MAX_FILE_SIZE = 5000000;

// Define a Zod Schema for the sign up form
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, {
        message: "Name must be at least 2 characters.",
      })
      .max(30, {
        message: "Name must be at most 30 characters.",
      }),
    phone: z.string().min(8),
    email: z.email({
      message: "The email you entered is invalid.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
    drivingLicence: z
      .any()
      .refine((file) => !file || file?.size <= MAX_FILE_SIZE, {
        message: "Image must be under 5MB.",
      }),
    profilePhoto: z
      .any()
      .refine((file) => !file || file?.size <= MAX_FILE_SIZE, {
        message: "Image must be under 5MB.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Export the inferred type
export type signupData = z.infer<typeof signupSchema>;
