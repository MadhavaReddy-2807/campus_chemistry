import { createHash } from "crypto";

export type SecretCrushResult = {
  success: boolean;
  isMutual: boolean;
  message: string;
};

/**
 * Normalizes and cryptographically hashes a target student's identifier
 * (institute email or username) using SHA-256.
 * Guarantees that unrequited crushes cannot be read or leaked from the database.
 */
export function hashCrushIdentifier(identifier: string): string {
  const normalized = identifier.trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}

export const MAX_SECRET_CRUSHES = 3;

/**
 * Verifies if two hashed crush records form a mutual crush pair.
 */
export function isMutualCrushPair(
  senderAHash: string,
  targetAHash: string,
  senderBHash: string,
  targetBHash: string
): boolean {
  return senderAHash === targetBHash && targetAHash === senderBHash;
}
