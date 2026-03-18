import { z } from "zod";

// Define a Zod Schema for the sign up form
export const signinSchema = z.object({
  email: z.email({
    message: "The email you entered is invalid.",
  }),
  password: z.string(),
});

// Export the inferred type
export type signinData = z.infer<typeof signinSchema>;
