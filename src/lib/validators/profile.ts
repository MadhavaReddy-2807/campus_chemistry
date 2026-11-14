import { z } from "zod";

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.]{3,24}$/),
  bio: z.string().trim().max(500),
  department: z.string().trim().max(120),
  degree: z.string().trim().max(120),
  studyYear: z.coerce.number().int().min(1).max(10),
});

export const privacyUpdateSchema = z.object({
  socialVisibility: z.enum(["public", "private"]),
  datingVisibility: z.boolean(),
  crossCampusVisibility: z.boolean(),
  messagePermission: z.enum(["nobody", "matches", "following", "everyone"]),
  activityVisibility: z.boolean(),
});
