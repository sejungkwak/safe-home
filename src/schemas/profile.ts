import { z } from "zod";

const MAX_FILE_SIZE = 5000000;

export const profileSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters." })
      .max(30, { message: "Name must be at most 30 characters." }),
    phone: z.string().min(8),
    email: z.union([
      z.literal(""),
      z.email({ message: "The email you entered is invalid." }),
    ]),
    resetPassword: z
      .string()
      .refine((password) => password.length === 0 || password.length >= 6, {
        message: "Password must be at least 6 characters.",
      }),
    confirmResetPassword: z.string(),
    address: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
        address: z.string(),
      })
      .nullable()
      .optional(),
    vehicleReg: z.string(),
    vehicleTransmission: z.enum(["manual", "automatic"]),
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
  .refine(
    (data) =>
      !data.resetPassword || data.resetPassword === data.confirmResetPassword,
    {
      message: "Passwords do not match",
      path: ["confirmResetPassword"],
    },
  );

// Export the inferred type
export type ProfileData = z.infer<typeof profileSchema>;
