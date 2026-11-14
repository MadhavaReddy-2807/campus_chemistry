import { describe, expect, it } from "vitest";
import { instituteEmailSchema, instituteSelectionSchema } from "./onboarding";

describe("onboarding validation", () => {
  it("requires a UUID institute selection", () => {
    expect(instituteSelectionSchema.safeParse({ instituteId: "not-a-uuid" }).success).toBe(false);
    expect(instituteSelectionSchema.safeParse({ instituteId: "11111111-1111-4111-8111-111111111111" }).success).toBe(true);
  });

  it("normalizes valid institute email input", () => {
    const result = instituteEmailSchema.safeParse({ instituteId: "11111111-1111-4111-8111-111111111111", email: " Student@IITD.AC.IN " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("student@iitd.ac.in");
  });

  it("rejects malformed or oversized email input", () => {
    expect(instituteEmailSchema.safeParse({ instituteId: "11111111-1111-4111-8111-111111111111", email: "student-at-iitd" }).success).toBe(false);
    expect(instituteEmailSchema.safeParse({ instituteId: "11111111-1111-4111-8111-111111111111", email: `${"a".repeat(250)}@iitd.ac.in` }).success).toBe(false);
  });
});
