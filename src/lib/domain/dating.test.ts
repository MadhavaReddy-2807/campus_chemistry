import { describe, expect, it } from "vitest";
import { ageOn, canCreateMatch, canonicalPair, isDatingEligible } from "./dating";

const today = new Date("2027-02-07T00:00:00Z");
const eligible = (id: string) => ({ id, dateOfBirth: "2005-02-07", verificationStatus: "verified" as const, datingEnabled: true, datingVisibility: true });

describe("dating eligibility", () => {
  it("calculates a birthday boundary correctly", () => {
    expect(ageOn("2009-02-07", today)).toBe(18);
    expect(ageOn("2009-02-08", today)).toBe(17);
  });

  it("requires verification, visibility, opt-in, and age", () => {
    expect(isDatingEligible(eligible("a"), today)).toBe(true);
    expect(isDatingEligible({ ...eligible("b"), verificationStatus: "pending" }, today)).toBe(false);
    expect(isDatingEligible({ ...eligible("c"), datingEnabled: false }, today)).toBe(false);
    expect(isDatingEligible({ ...eligible("d"), dateOfBirth: "2010-01-01" }, today)).toBe(false);
  });

  it("canonicalizes reciprocal match pairs and rejects self matches", () => {
    expect(canonicalPair("z", "a")).toEqual(["a", "z"]);
    expect(() => canonicalPair("same", "same")).toThrow();
    expect(canCreateMatch(eligible("a"), eligible("b"), today)).toBe(true);
  });
});
