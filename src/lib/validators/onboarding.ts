import { z } from "zod";

export const instituteSelectionSchema = z.object({
  instituteId: z.string().uuid(),
});

export const instituteEmailSchema = z.object({
  instituteId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email().max(254),
});

export type InstituteSelectionState = { error?: string };
export type VerificationRequestState = { error?: string; success?: string };
