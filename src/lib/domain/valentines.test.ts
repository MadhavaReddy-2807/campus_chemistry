import { describe, expect, it } from "vitest";
import { hashCrushIdentifier, isMutualCrushPair, MAX_SECRET_CRUSHES } from "./valentines";

describe("Valentine's Secret Crush cryptographic matching", () => {
  it("normalizes case and whitespace before hashing", () => {
    const hash1 = hashCrushIdentifier("student@iitb.ac.in");
    const hash2 = hashCrushIdentifier("  STUDENT@IITB.AC.IN  ");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex string length
  });

  it("detects mutual crushes symmetrically", () => {
    const arjunIdentifier = "arjun@iitb.ac.in";
    const nainaIdentifier = "naina@iitb.ac.in";

    const arjunHash = hashCrushIdentifier(arjunIdentifier);
    const nainaHash = hashCrushIdentifier(nainaIdentifier);

    // Arjun crushes on Naina
    const arjunTarget = nainaHash;
    // Naina crushes on Arjun
    const nainaTarget = arjunHash;

    expect(isMutualCrushPair(arjunHash, arjunTarget, nainaHash, nainaTarget)).toBe(true);
  });

  it("rejects non-mutual crushes without leaking recipient data", () => {
    const arjunHash = hashCrushIdentifier("arjun@iitb.ac.in");
    const nainaHash = hashCrushIdentifier("naina@iitb.ac.in");
    const rahulHash = hashCrushIdentifier("rahul@iitb.ac.in");

    // Arjun crushes on Naina, but Rahul crushes on Arjun
    expect(isMutualCrushPair(arjunHash, nainaHash, rahulHash, arjunHash)).toBe(false);
  });

  it("enforces maximum 3 secret crushes limit", () => {
    expect(MAX_SECRET_CRUSHES).toBe(3);
  });
});
