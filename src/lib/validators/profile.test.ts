import { describe, expect, it } from "vitest";
import { privacyUpdateSchema, profileUpdateSchema } from "./profile";

describe("profile validation", () => {
  it("accepts a bounded profile and coerces study year", () => {
    const result = profileUpdateSchema.safeParse({ displayName: "A Student", username: "a_student", bio: "Hello", department: "CSE", degree: "B.Tech", studyYear: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.studyYear).toBe(3);
  });

  it("rejects unsafe usernames and unsupported message permissions", () => {
    expect(profileUpdateSchema.safeParse({ displayName: "A", username: "Bad Name", bio: "", department: "", degree: "", studyYear: 1 }).success).toBe(false);
    expect(privacyUpdateSchema.safeParse({ socialVisibility: "public", datingVisibility: false, crossCampusVisibility: false, messagePermission: "random", activityVisibility: false }).success).toBe(false);
  });
});
