import { describe, expect, it } from "vitest";
import { instituteEmailSchema, instituteSelectionSchema } from "./onboarding";
import { OFFICIAL_INSTITUTES, isApprovedDomainForInstitute } from "../data/institutes";

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

  it("contains all 23 IITs and 31 NITs in the authoritative directory", () => {
    const iits = OFFICIAL_INSTITUTES.filter((i) => i.institute_type === "IIT");
    const nits = OFFICIAL_INSTITUTES.filter((i) => i.institute_type === "NIT");
    expect(iits.length).toBe(23);
    expect(nits.length).toBe(31);
    expect(OFFICIAL_INSTITUTES.length).toBe(54);
  });

  it("validates official domains accurately without trusting unapproved domains", () => {
    const iitBombay = OFFICIAL_INSTITUTES.find((i) => i.short_name === "IIT Bombay")!;
    const nitTrichy = OFFICIAL_INSTITUTES.find((i) => i.short_name === "NIT Trichy")!;

    expect(isApprovedDomainForInstitute(iitBombay.id, "student@iitb.ac.in")).toBe(true);
    expect(isApprovedDomainForInstitute(iitBombay.id, "student@cse.iitb.ac.in")).toBe(true);
    expect(isApprovedDomainForInstitute(iitBombay.id, "student@gmail.com")).toBe(false);

    expect(isApprovedDomainForInstitute(nitTrichy.id, "rollno@nitt.edu")).toBe(true);
    expect(isApprovedDomainForInstitute(nitTrichy.id, "fake@notnitt.edu")).toBe(false);
  });
});
