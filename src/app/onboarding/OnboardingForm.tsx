"use client";

import { useActionState, useState, useMemo } from "react";
import { completeOnboarding, type OnboardingState } from "./actions";

type Institute = {
  id: string;
  official_name: string;
  short_name: string;
  city: string;
  state: string;
  institute_type: "IIT" | "NIT";
};

const STUDY_YEARS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year / Dual Degree",
  "Postgraduate",
  "PhD",
];

const AVAILABLE_INTERESTS = [
  "Music",
  "Movies",
  "Sports",
  "Gaming",
  "Technology",
  "Photography",
  "Books",
  "Travel",
  "Fitness",
  "Art",
  "Startups",
  "Research",
  "Coding",
  "Dance",
];

const initialState: OnboardingState = {};

export function OnboardingForm({ institutes }: { institutes: Institute[] }) {
  const [state, formAction, pending] = useActionState(completeOnboarding, initialState);
  const [search, setSearch] = useState("");
  const [selectedInstitute, setSelectedInstitute] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("First Year");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const filteredInstitutes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return institutes;
    return institutes.filter(
      (inst) =>
        inst.official_name.toLowerCase().includes(q) ||
        inst.short_name.toLowerCase().includes(q) ||
        inst.city.toLowerCase().includes(q)
    );
  }, [institutes, search]);

  const iits = useMemo(
    () =>
      institutes.filter(
        (i) =>
          i.short_name.toUpperCase().startsWith("IIT") ||
          i.official_name.toLowerCase().startsWith("indian institute")
      ),
    [institutes]
  );

  const nits = useMemo(
    () =>
      institutes.filter(
        (i) =>
          i.short_name.toUpperCase().startsWith("NIT") ||
          i.official_name.toLowerCase().startsWith("national institute")
      ),
    [institutes]
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  return (
    <form action={formAction} className="onboarding-form" style={{ marginTop: 24 }}>
      {state.error && (
        <div className="form-error" role="alert" style={{ marginBottom: 18, padding: 12, background: "#fff1f0", border: "1px solid #f2c2bd", borderRadius: 8 }}>
          {state.error}
        </div>
      )}

      {/* 1. Required: Full Name */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="fullName" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
          Full name <span style={{ color: "var(--rose)" }}>*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="e.g. Arjun Shah"
          required
          minLength={2}
          maxLength={80}
          style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 9, background: "#fbf9f5", fontSize: 14 }}
        />
      </div>

      {/* 2. Required: Year of Study */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="studyYear" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
          Year of study <span style={{ color: "var(--rose)" }}>*</span>
        </label>
        <select
          id="studyYear"
          name="studyYear"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          required
          style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 9, background: "#fbf9f5", fontSize: 14 }}
        >
          {STUDY_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Required: Campus Selection */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <label htmlFor="institute-dropdown" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
            Campus (IIT / NIT) <span style={{ color: "var(--rose)" }}>*</span>
          </label>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>54 Official Institutes</span>
        </div>

        {/* Dropdown for selecting IITs and NITs */}
        <select
          id="institute-dropdown"
          name="instituteId"
          value={selectedInstitute}
          onChange={(e) => {
            setSelectedInstitute(e.target.value);
            setSearch("");
          }}
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid var(--line)",
            borderRadius: 9,
            background: "#ffffff",
            fontSize: 14,
            fontWeight: 500,
            color: selectedInstitute ? "var(--ink)" : "var(--muted)",
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          <option value="">Select your IIT or NIT campus...</option>
          <optgroup label="Indian Institutes of Technology (23 IITs)">
            {iits.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.short_name} — {inst.city}, {inst.state}
              </option>
            ))}
          </optgroup>
          <optgroup label="National Institutes of Technology (31 NITs)">
            {nits.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.short_name} — {inst.city}, {inst.state}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Quick Search & Filter */}
        <input
          id="search-institute"
          type="search"
          placeholder="Search IIT or NIT"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 9, background: "#fbf9f5", fontSize: 13, marginBottom: 8 }}
        />

        <div
          role="radiogroup"
          aria-label="Campus selection"
          tabIndex={0}
          style={{
            maxHeight: 220,
            overflowY: "auto",
            border: "1px solid var(--line)",
            borderRadius: 10,
            background: "var(--surface)",
            padding: 6,
          }}
        >
          {filteredInstitutes.length === 0 ? (
            <div style={{ padding: 14, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
              No campus found matching &quot;{search}&quot;.
            </div>
          ) : (
            filteredInstitutes.map((inst) => {
              const isSelected = selectedInstitute === inst.id;
              return (
                <div
                  key={inst.id}
                  onClick={() => setSelectedInstitute(inst.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: isSelected ? "#fcf1ee" : "transparent",
                    border: isSelected ? "1px solid #e8b3a8" : "1px solid transparent",
                    marginBottom: 4,
                  }}
                >
                  <div>
                    <strong style={{ display: "block", fontSize: 13, color: isSelected ? "var(--plum)" : "var(--ink)" }}>
                      {inst.official_name}
                    </strong>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {inst.short_name} · {inst.city}, {inst.state}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, color: isSelected ? "var(--rose)" : "var(--soft)" }}>
                    {isSelected ? "●" : "○"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Optional: Interests */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
            Interests <span style={{ fontWeight: 400, color: "var(--muted)" }}>(Optional)</span>
          </label>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Select what you enjoy</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {AVAILABLE_INTERESTS.map((interest) => {
            const isChecked = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: isChecked ? 700 : 500,
                  border: isChecked ? "1px solid var(--plum)" : "1px solid var(--line)",
                  background: isChecked ? "#f4e5e0" : "var(--surface)",
                  color: isChecked ? "var(--plum)" : "var(--muted)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {interest} {isChecked && "✓"}
              </button>
            );
          })}
        </div>
        {selectedInterests.map((interest) => (
          <input key={interest} type="hidden" name="interests" value={interest} />
        ))}
      </div>

      {/* 5. Optional: Description / Bio */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <label htmlFor="bio" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
            About you <span style={{ fontWeight: 400, color: "var(--muted)" }}>(Optional)</span>
          </label>
          <span style={{ fontSize: 11, color: "var(--soft)" }}>{bio.length} / 300</span>
        </div>
        <textarea
          id="bio"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 300))}
          maxLength={300}
          placeholder="A short note about your studies, passions, or campus interests..."
          rows={3}
          style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 9, background: "#fbf9f5", fontSize: 13, resize: "vertical" }}
        />
      </div>

      <button
        className="primary-button"
        type="submit"
        disabled={pending || !selectedInstitute}
        style={{ width: "100%", padding: "14px", fontSize: 14 }}
      >
        {pending ? "Saving profile…" : "Complete setup & enter campus"} <span>→</span>
      </button>
    </form>
  );
}
