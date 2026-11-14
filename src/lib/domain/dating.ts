export type DatingProfile = {
  id: string;
  dateOfBirth: string | null;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected" | "suspended";
  datingEnabled: boolean;
  datingVisibility: boolean;
};

export function ageOn(dateOfBirth: string, today = new Date()): number {
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const birthdayPassed = today.getUTCMonth() > birth.getUTCMonth() || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() >= birth.getUTCDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

export function isDatingEligible(profile: DatingProfile, today = new Date()): boolean {
  return profile.verificationStatus === "verified" && profile.datingEnabled && profile.datingVisibility && profile.dateOfBirth !== null && ageOn(profile.dateOfBirth, today) >= 18;
}

export function canonicalPair(first: string, second: string): [string, string] {
  if (first === second) throw new Error("A user cannot match with themselves.");
  return first < second ? [first, second] : [second, first];
}

export function canCreateMatch(first: DatingProfile, second: DatingProfile, today = new Date()): boolean {
  return first.id !== second.id && isDatingEligible(first, today) && isDatingEligible(second, today);
}
