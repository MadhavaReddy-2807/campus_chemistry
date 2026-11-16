import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createEvent } from "./actions";

export const instant = false;

export default async function CreateMeetupPage() {
  await connection();
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  const categories = [
    "Hackathon & Coding",
    "Music & Jamming",
    "Sports & Trekking",
    "Workshops & Talks",
    "Campus Social",
  ];

  return (
    <AppShell
      activeTab="events"
      user={
        currentUserProfile
          ? {
              name: currentUserProfile.display_name,
              username: currentUserProfile.username,
              avatar_url: currentUserProfile.avatar_url,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              campus: (currentUserProfile.institutes as any)?.short_name,
            }
          : undefined
      }
    >
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid var(--border-subtle, #e5e7eb)", padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
            <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
              Host a Campus Meetup
            </h1>
            <Link href="/meetups" style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "none" }}>
              Cancel
            </Link>
          </div>
          <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.88rem", color: "#64748b" }}>
            Create an event or meetup for students at your campus or across IITs/NITs.
          </p>

          <form action={createEvent} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Event Title <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                name="title"
                required
                maxLength={120}
                placeholder="e.g. Hostel 12 Jam Session / Midnight Hack"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                  Category <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  name="category"
                  required
                  defaultValue="Hackathon & Coding"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                    background: "#ffffff",
                  }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                  Capacity (Optional)
                </label>
                <input
                  name="capacity"
                  type="number"
                  min={1}
                  max={10000}
                  placeholder="e.g. 25"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                  Starts At <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  name="startsAt"
                  type="datetime-local"
                  required
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.88rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                  Ends At <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  name="endsAt"
                  type="datetime-local"
                  required
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.88rem",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Venue <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                name="venue"
                required
                maxLength={160}
                placeholder="e.g. SAC Amphitheatre / Library Seminar Hall 2"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Description <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                name="description"
                required
                maxLength={4000}
                rows={4}
                placeholder="What will attendees do? What should they bring?"
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
              <Link
                href="/meetups"
                className="secondary-button"
                style={{ padding: "0.6rem 1.25rem", fontSize: "0.88rem" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="primary-button"
                style={{ padding: "0.6rem 1.5rem", fontSize: "0.88rem" }}
              >
                Publish Meetup
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
