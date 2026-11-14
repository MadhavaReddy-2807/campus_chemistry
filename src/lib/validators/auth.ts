import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(8).max(72);
export const authSchema = z.object({ email: emailSchema, password: passwordSchema });

export type AuthInput = z.infer<typeof authSchema>;
