"use client";

import { useState } from "react";
import Link from "next/link";
import { updateStudentProfile } from "@/app/profile/actions";

type Interest = {
  id: string;
  name: string;
};

export function EditProfileForm({
  initialName,
  initialBio,
  initialYear,
  initialAvatarUrl,
  allInterests,
  selectedInterestIds,
}: {
  initialName: string;
  initialBio: string;
  initialYear: number;
  initialAvatarUrl: string;
  allInterests: Interest[];
  selectedInterestIds: string[];
}) {
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set(selectedInterestIds));
  const [submitting, setSubmitting] = useState(false);

  const toggleInterest = (id: string) => {
    const next = new Set(selectedInterests);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedInterests(next);
  };

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        try {
          // Append interests
          for (const id of selectedInterests) {
            formData.append("interests", id);
          }
          await updateStudentProfile(formData);
        } catch (err: unknown) {
          alert(err instanceof Error ? err.message : "Failed to update profile.");
          setSubmitting(false);
        }
      }}
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      {/* Avatar Preview & URL */}
      <div>
        <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
          Profile Picture
        </label>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "1.2rem", color: "#94a3b8" }}>👤</span>
            )}
          </div>
          <input
            name="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Image URL (https://...)"
            style={{
              flex: 1,
              padding: "0.6rem 0.8rem",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "0.88rem",
            }}
          />
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
          Full Name <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          name="displayName"
          type="text"
          required
          maxLength={80}
          defaultValue={initialName}
          style={{
            width: "100%",
            padding: "0.65rem 0.8rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "0.9rem",
          }}
        />
      </div>

      {/* Year of Study */}
      <div>
        <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
          Year of Study <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <select
          name="studyYear"
          defaultValue={initialYear}
          style={{
            width: "100%",
            padding: "0.65rem 0.8rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "0.9rem",
            background: "#ffffff",
          }}
        >
          <option value={1}>First Year</option>
          <option value={2}>Second Year</option>
          <option value={3}>Third Year</option>
          <option value={4}>Fourth Year</option>
          <option value={5}>Fifth Year / Dual Degree</option>
          <option value={6}>Postgraduate</option>
          <option value={7}>PhD</option>
        </select>
      </div>

      {/* Bio */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <label style={{ fontSize: "0.88rem", fontWeight: 600, color: "#374151" }}>
            Bio (Optional)
          </label>
          <span style={{ fontSize: "0.78rem", color: bio.length > 280 ? "#dc2626" : "#64748b" }}>
            {bio.length}/300
          </span>
        </div>
        <textarea
          name="bio"
          rows={3}
          maxLength={300}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short sentence about what you're working on or interested in..."
          style={{
            width: "100%",
            padding: "0.65rem 0.8rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "0.9rem",
            resize: "vertical",
          }}
        />
      </div>

      {/* Interests Chips */}
      <div>
        <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>
          Interests (Optional)
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {allInterests.map((interest) => {
            const isSelected = selectedInterests.has(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                style={{
                  background: isSelected ? "var(--primary-color, #9f4b59)" : "#f3f4f6",
                  color: isSelected ? "#ffffff" : "#374151",
                  border: "none",
                  borderRadius: "999px",
                  padding: "0.35rem 0.8rem",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {isSelected ? "✓ " : "+ "}
                {interest.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
        <Link
          href="/profile"
          className="secondary-button"
          style={{ padding: "0.6rem 1.25rem", fontSize: "0.88rem" }}
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="primary-button"
          style={{ padding: "0.6rem 1.5rem", fontSize: "0.88rem" }}
        >
          {submitting ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
